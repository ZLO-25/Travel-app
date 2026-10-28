/**
 * localStorage persistence + import/export
 */
(function (global) {
  'use strict';

  const KEY = 'ryan_travel_app_v1';

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.trips)) return null;
      return data;
    } catch (e) {
      console.warn('load failed', e);
      return null;
    }
  }

  function prepareForSave(state) {
    const copy = JSON.parse(JSON.stringify(state));
    copy.updatedAt = new Date().toISOString();
    if (global.TravelPhotos && TravelPhotos.stripDataUrlsFromState) {
      TravelPhotos.stripDataUrlsFromState(copy);
    }
    return copy;
  }

  function save(state) {
    const copy = prepareForSave(state);
    try {
      localStorage.setItem(KEY, JSON.stringify(copy));
    } catch (e) {
      console.warn('save failed (quota?)', e);
      // Retry after stripping any remaining dataUrls aggressively
      try {
        if (copy.trips) {
          copy.trips.forEach(function (t) {
            (t.journal || []).forEach(function (j) {
              if (j && j.photos) {
                j.photos = j.photos.map(function (p) {
                  return p ? { id: p.id, name: p.name || '' } : p;
                });
              }
            });
          });
        }
        localStorage.setItem(KEY, JSON.stringify(copy));
      } catch (e2) {
        console.error('save failed after strip', e2);
        throw e2;
      }
    }
    return copy;
  }

  function exportJson(state) {
    return JSON.stringify(state, null, 2);
  }

  function exportJsonAsync(state) {
    if (global.TravelPhotos && TravelPhotos.embedPhotosInState) {
      return TravelPhotos.embedPhotosInState(state).then(function (embedded) {
        return JSON.stringify(embedded, null, 2);
      });
    }
    return Promise.resolve(exportJson(state));
  }

  function importJson(text) {
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.trips)) {
      throw new Error('格式不正確：需要含 trips 陣列的備份');
    }
    if (!data.version) data.version = 1;
    if (!data.activeTripId && data.trips[0]) data.activeTripId = data.trips[0].id;
    return data;
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  global.TravelStorage = {
    KEY: KEY,
    load: load,
    save: save,
    exportJson: exportJson,
    exportJsonAsync: exportJsonAsync,
    importJson: importJson,
    download: download
  };
})(window);
