/**
 * IndexedDB photo store for journal entries (keeps localStorage lean).
 * Key: tripId|entryId|photoId
 */
(function (global) {
  'use strict';

  var DB_NAME = 'ryan_travel_photos_v1';
  var STORE = 'photos';
  var MAX_EDGE = 1280;
  var JPEG_Q = 0.72;
  var INLINE_WARN_BYTES = 450 * 1024;

  var dbPromise = null;
  var idbAvailable = null;

  function keyOf(tripId, entryId, photoId) {
    return String(tripId) + '|' + String(entryId) + '|' + String(photoId);
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    if (!global.indexedDB) {
      idbAvailable = false;
      return Promise.reject(new Error('no indexedDB'));
    }
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          var os = db.createObjectStore(STORE, { keyPath: 'key' });
          os.createIndex('byEntry', 'entryKey', { unique: false });
          os.createIndex('byTrip', 'tripId', { unique: false });
        }
      };
      req.onsuccess = function () {
        idbAvailable = true;
        resolve(req.result);
      };
      req.onerror = function () {
        idbAvailable = false;
        dbPromise = null;
        reject(req.error || new Error('idb open failed'));
      };
    });
    return dbPromise;
  }

  function probe() {
    return openDb().then(function () { return true; }).catch(function () { return false; });
  }

  function put(tripId, entryId, photoId, dataUrl, name) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({
          key: keyOf(tripId, entryId, photoId),
          tripId: tripId,
          entryId: entryId,
          photoId: photoId,
          entryKey: String(tripId) + '|' + String(entryId),
          name: name || '',
          dataUrl: dataUrl,
          updatedAt: new Date().toISOString()
        });
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function get(tripId, entryId, photoId) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readonly');
        var req = tx.objectStore(STORE).get(keyOf(tripId, entryId, photoId));
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function getAllForEntry(tripId, entryId) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readonly');
        var idx = tx.objectStore(STORE).index('byEntry');
        var req = idx.getAll(String(tripId) + '|' + String(entryId));
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { reject(req.error); };
      });
    }).catch(function () { return []; });
  }

  function remove(tripId, entryId, photoId) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(keyOf(tripId, entryId, photoId));
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error); };
      });
    }).catch(function () { return false; });
  }

  function removeEntry(tripId, entryId) {
    return getAllForEntry(tripId, entryId).then(function (rows) {
      return Promise.all(rows.map(function (r) {
        return remove(tripId, entryId, r.photoId);
      }));
    });
  }

  function compressBlob(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) {
        reject(new Error('不是圖片'));
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          var scale = 1;
          var maxEdge = Math.max(w, h);
          if (maxEdge > MAX_EDGE) scale = MAX_EDGE / maxEdge;
          var cw = Math.max(1, Math.round(w * scale));
          var ch = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, cw, ch);
          var dataUrl = canvas.toDataURL('image/jpeg', JPEG_Q);
          URL.revokeObjectURL(url);
          resolve({
            id: 'ph_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
            name: file.name || 'photo.jpg',
            dataUrl: dataUrl
          });
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('無法讀取圖片'));
      };
      img.src = url;
    });
  }

  function metaOnly(photos) {
    return (photos || []).map(function (p) {
      return { id: p.id, name: p.name || '' };
    });
  }

  function stripDataUrlsFromState(state) {
    if (!state || !Array.isArray(state.trips)) return state;
    state.trips.forEach(function (trip) {
      (trip.journal || []).forEach(function (entry) {
        if (!entry || !Array.isArray(entry.photos)) return;
        entry.photos = entry.photos.map(function (p) {
          if (!p) return p;
          var out = { id: p.id, name: p.name || '' };
          // Keep tiny inline only if marked
          if (p._inline && p.dataUrl) out.dataUrl = p.dataUrl;
          return out;
        });
      });
    });
    return state;
  }

  function embedPhotosInState(state) {
    if (!state || !Array.isArray(state.trips)) return Promise.resolve(state);
    var copy = JSON.parse(JSON.stringify(state));
    var jobs = [];
    copy.trips.forEach(function (trip) {
      (trip.journal || []).forEach(function (entry) {
        (entry.photos || []).forEach(function (p) {
          if (!p || !p.id) return;
          if (p.dataUrl) return;
          jobs.push(
            get(trip.id, entry.id, p.id).then(function (row) {
              if (row && row.dataUrl) p.dataUrl = row.dataUrl;
            }).catch(function () {})
          );
        });
      });
    });
    return Promise.all(jobs).then(function () { return copy; });
  }

  function savePhoto(tripId, entryId, photo) {
    if (!photo || !photo.id || !photo.dataUrl) return Promise.resolve(photo);
    return probe().then(function (ok) {
      if (ok) {
        return put(tripId, entryId, photo.id, photo.dataUrl, photo.name).then(function () {
          return { id: photo.id, name: photo.name || '' };
        });
      }
      // Fallback: keep compressed dataUrl inline (warn if large)
      var approx = photo.dataUrl.length;
      if (approx > INLINE_WARN_BYTES) {
        console.warn('inline photo large', approx);
      }
      return {
        id: photo.id,
        name: photo.name || '',
        dataUrl: photo.dataUrl,
        _inline: true
      };
    });
  }

  global.TravelPhotos = {
    DB_NAME: DB_NAME,
    probe: probe,
    put: put,
    get: get,
    getAllForEntry: getAllForEntry,
    remove: remove,
    removeEntry: removeEntry,
    compressBlob: compressBlob,
    metaOnly: metaOnly,
    stripDataUrlsFromState: stripDataUrlsFromState,
    embedPhotosInState: embedPhotosInState,
    savePhoto: savePhoto,
    INLINE_WARN_BYTES: INLINE_WARN_BYTES,
    isIdbAvailable: function () { return idbAvailable; }
  };
})(window);
