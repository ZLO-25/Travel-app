/**
 * Notion → Travel-app remote sync + local-wins merge
 */
(function (global) {
  'use strict';

  var REMOTE_PATH = 'data/remote.json';

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function ts(v) {
    if (!v) return 0;
    var t = Date.parse(v);
    return isNaN(t) ? 0 : t;
  }

  function localWins(localItem, remoteItem) {
    if (!localItem) return false;
    if (!remoteItem) return true;
    if (localItem.userEdited) return true;
    var lu = ts(localItem.updatedAt);
    var ru = ts(remoteItem.updatedAt);
    if (lu || ru) return lu >= ru;
    // No timestamps: keep local (user may have edited before sync existed)
    return true;
  }

  function fingerprint(kind, item) {
    if (!item) return '';
    switch (kind) {
      case 'todo':
        return 'todo:' + String(item.text || '').trim().toLowerCase();
      case 'booking':
        return 'booking:' + String(item.type || '') + '|' + String(item.title || '').trim().toLowerCase();
      case 'deadline':
        return 'deadline:' + String(item.label || '').trim().toLowerCase() + '|' + String(item.date || '');
      case 'day':
        return 'day:' + String(item.date || '');
      case 'block':
        return 'block:' + String(item.time || '') + '|' + String(item.text || '').trim().toLowerCase().slice(0, 80);
      case 'place':
        return 'place:' + String(item.name || '').trim().toLowerCase();
      case 'shop':
        return 'shop:' + String(item.text || '').trim().toLowerCase();
      case 'packCat':
        return 'packCat:' + String(item.category || '').trim().toLowerCase();
      case 'packItem':
        return 'packItem:' + String(item.text || '').trim().toLowerCase();
      case 'expense':
        return 'expense:' + String(item.item || '').trim().toLowerCase() + '|' + String(item.merchant || '').trim().toLowerCase();
      case 'todoGroup':
        return 'todoGroup:' + String(item.name || '').trim().toLowerCase();
      case 'journal':
        return 'journal:' + String(item.date || '') + '|' + String(item.title || '').trim().toLowerCase();
      default:
        return '';
    }
  }

  /**
   * Merge arrays by id, then by fingerprint for unmatched items.
   * Local wins on field conflicts when localWins(); remote-only added; local-only kept.
   */
  function mergeList(localArr, remoteArr, kind, nestMerge) {
    localArr = Array.isArray(localArr) ? localArr : [];
    remoteArr = Array.isArray(remoteArr) ? remoteArr : [];
    var byId = {};
    var usedLocal = {};
    var result = [];

    localArr.forEach(function (it) {
      if (it && it.id) byId[it.id] = it;
    });

    function findLocalMatch(remoteItem) {
      if (remoteItem.id && byId[remoteItem.id] && !usedLocal[remoteItem.id]) {
        return byId[remoteItem.id];
      }
      var fp = fingerprint(kind, remoteItem);
      if (!fp) return null;
      for (var i = 0; i < localArr.length; i++) {
        var loc = localArr[i];
        if (!loc || usedLocal[loc.id]) continue;
        if (fingerprint(kind, loc) === fp) return loc;
      }
      return null;
    }

    remoteArr.forEach(function (remoteItem) {
      if (!remoteItem) return;
      var loc = findLocalMatch(remoteItem);
      if (!loc) {
        result.push(clone(remoteItem));
        return;
      }
      usedLocal[loc.id] = true;
      var merged;
      if (localWins(loc, remoteItem)) {
        merged = clone(loc);
        // Keep stable remote id when fingerprint-matched with different ids
        if (remoteItem.id && loc.id !== remoteItem.id && !loc.userEdited) {
          // Prefer local id always to avoid breaking local references; fingerprint already linked
        }
      } else {
        merged = clone(remoteItem);
        merged.id = loc.id; // preserve local id
        if (loc.userEdited) merged.userEdited = true;
      }
      if (typeof nestMerge === 'function') {
        merged = nestMerge(merged, loc, remoteItem);
      }
      result.push(merged);
    });

    localArr.forEach(function (loc) {
      if (!loc) return;
      if (loc.id && usedLocal[loc.id]) return;
      // also skip if somehow matched without id mark
      var already = result.some(function (r) { return r.id === loc.id; });
      if (already) return;
      result.push(clone(loc));
    });

    return result;
  }

  function mergeTodoGroups(localGroups, remoteGroups) {
    return mergeList(localGroups, remoteGroups, 'todoGroup', function (merged, loc, rem) {
      var localItems = (loc && loc.items) || [];
      var remoteItems = (rem && rem.items) || [];
      // If group-level local wins, still merge items so new remote todos appear
      merged.items = mergeList(localItems, remoteItems, 'todo');
      if (localWins(loc, rem)) {
        merged.name = loc.name;
        if (loc.userEdited) merged.userEdited = true;
        if (loc.updatedAt) merged.updatedAt = loc.updatedAt;
      }
      return merged;
    });
  }

  function mergeDays(localDays, remoteDays) {
    return mergeList(localDays, remoteDays, 'day', function (merged, loc, rem) {
      var localBlocks = (loc && loc.blocks) || [];
      var remoteBlocks = (rem && rem.blocks) || [];
      merged.blocks = mergeList(localBlocks, remoteBlocks, 'block');
      if (localWins(loc, rem)) {
        merged.date = loc.date;
        merged.title = loc.title;
        if (loc.userEdited) merged.userEdited = true;
        if (loc.updatedAt) merged.updatedAt = loc.updatedAt;
      }
      return merged;
    });
  }

  function mergePacking(localPack, remotePack) {
    return mergeList(localPack, remotePack, 'packCat', function (merged, loc, rem) {
      var localItems = (loc && loc.items) || [];
      var remoteItems = (rem && rem.items) || [];
      merged.items = mergeList(localItems, remoteItems, 'packItem');
      if (localWins(loc, rem)) {
        merged.category = loc.category;
        if (loc.userEdited) merged.userEdited = true;
        if (loc.updatedAt) merged.updatedAt = loc.updatedAt;
      }
      return merged;
    });
  }

  var OLD_DANANG_TITLES = { '2026 峴港': true, '2026峴港': true };
  var NEW_DANANG_TITLE = '2026 11/5-11/10 峴港';

  function isOldDanangTitle(title) {
    return !!OLD_DANANG_TITLES[String(title || '').trim()];
  }

  function defaultMemories() {
    return {
      highlights: [],
      wouldReturn: null,
      overallRating: null,
      postTripNote: ''
    };
  }

  function mergeMemories(localMem, remoteMem) {
    localMem = localMem || defaultMemories();
    remoteMem = remoteMem || defaultMemories();
    // Trip-level memories: treat as a scalar blob with localWins via synthetic item
    var loc = {
      userEdited: !!(localMem && (localMem.userEdited || localMem._userEdited)),
      updatedAt: localMem.updatedAt,
      value: localMem
    };
    var rem = {
      userEdited: !!(remoteMem && (remoteMem.userEdited || remoteMem._userEdited)),
      updatedAt: remoteMem.updatedAt,
      value: remoteMem
    };
    if (localWins(loc, rem)) return clone(localMem);
    return clone(remoteMem);
  }

  function mergeTripScalars(localTrip, remoteTrip, out) {
    var fields = ['title', 'destination', 'startDate', 'endDate', 'notes', 'archived', 'goals'];
    var preferLocal = localWins(localTrip, remoteTrip);
    fields.forEach(function (f) {
      if (preferLocal) {
        if (localTrip[f] !== undefined) out[f] = clone(localTrip[f]);
        else if (remoteTrip[f] !== undefined) out[f] = clone(remoteTrip[f]);
      } else {
        if (remoteTrip[f] !== undefined) out[f] = clone(remoteTrip[f]);
        else if (localTrip[f] !== undefined) out[f] = clone(localTrip[f]);
      }
    });
    // One-time title migrate: old seed title without a custom rename → prefer remote new title
    var tripId = localTrip.id || remoteTrip.id;
    if (tripId === 'trip_danang_2026') {
      if (isOldDanangTitle(out.title)) {
        if (remoteTrip.title && !isOldDanangTitle(remoteTrip.title)) {
          out.title = remoteTrip.title;
        } else {
          out.title = NEW_DANANG_TITLE;
        }
      } else if (!localTrip.userEdited && remoteTrip.title && isOldDanangTitle(localTrip.title)) {
        out.title = remoteTrip.title;
      }
    }
    // memories: local wins
    out.memories = mergeMemories(localTrip.memories, remoteTrip.memories);
    // updatedAt: newer wins; tie → local
    var lu = ts(localTrip.updatedAt);
    var ru = ts(remoteTrip.updatedAt);
    if (lu > ru) out.updatedAt = localTrip.updatedAt;
    else if (ru > lu) out.updatedAt = remoteTrip.updatedAt;
    else out.updatedAt = localTrip.updatedAt || remoteTrip.updatedAt;
    if (localTrip.userEdited) out.userEdited = true;
    out.createdAt = localTrip.createdAt || remoteTrip.createdAt;
  }

  function mergeTrip(localTrip, remoteTrip) {
    if (!localTrip) return clone(remoteTrip);
    if (!remoteTrip) return clone(localTrip);
    var out = { id: localTrip.id || remoteTrip.id };
    mergeTripScalars(localTrip, remoteTrip, out);
    out.deadlines = mergeList(localTrip.deadlines, remoteTrip.deadlines, 'deadline');
    out.todoGroups = mergeTodoGroups(localTrip.todoGroups, remoteTrip.todoGroups);
    out.bookings = mergeList(localTrip.bookings, remoteTrip.bookings, 'booking');
    out.days = mergeDays(localTrip.days, remoteTrip.days);
    out.places = mergeList(localTrip.places, remoteTrip.places, 'place');
    out.shopping = mergeList(localTrip.shopping, remoteTrip.shopping, 'shop');
    out.packing = mergePacking(localTrip.packing, remoteTrip.packing);
    out.expenses = mergeList(localTrip.expenses, remoteTrip.expenses, 'expense');
    out.journal = mergeList(localTrip.journal, remoteTrip.journal, 'journal', function (merged, loc, rem) {
      // Photos: keep local photo list if local wins / has photos; never drop local photo refs
      if (localWins(loc, rem)) {
        merged.photos = clone((loc && loc.photos) || merged.photos || []);
      } else {
        var remPhotos = (rem && rem.photos) || [];
        var locPhotos = (loc && loc.photos) || [];
        merged.photos = remPhotos.length ? clone(remPhotos) : clone(locPhotos);
      }
      return merged;
    });
    // Structural routeMap: keep local if userEdited trip, else prefer remote if present, else local
    if (localTrip.userEdited && localTrip.routeMap) {
      out.routeMap = clone(localTrip.routeMap);
    } else if (remoteTrip.routeMap) {
      out.routeMap = clone(remoteTrip.routeMap);
    } else if (localTrip.routeMap) {
      out.routeMap = clone(localTrip.routeMap);
    }
    return out;
  }

  function mergeStates(localState, remoteState) {
    if (!remoteState || !Array.isArray(remoteState.trips)) {
      return localState ? clone(localState) : null;
    }
    if (!localState || !Array.isArray(localState.trips) || !localState.trips.length) {
      var fresh = clone(remoteState);
      fresh.syncedAt = new Date().toISOString();
      return fresh;
    }

    var localById = {};
    localState.trips.forEach(function (t) { if (t && t.id) localById[t.id] = t; });
    var used = {};
    var trips = [];

    remoteState.trips.forEach(function (rt) {
      if (!rt) return;
      var lt = localById[rt.id];
      if (lt) {
        used[lt.id] = true;
        trips.push(mergeTrip(lt, rt));
      } else {
        trips.push(clone(rt));
      }
    });
    localState.trips.forEach(function (lt) {
      if (!lt) return;
      if (lt.id && used[lt.id]) return;
      trips.push(clone(lt));
    });

    var out = {
      version: localState.version || remoteState.version || 1,
      activeTripId: localState.activeTripId || remoteState.activeTripId,
      trips: trips,
      syncedAt: new Date().toISOString()
    };
    if (remoteState.remoteSource) out.remoteSource = remoteState.remoteSource;
    if (remoteState.remoteSyncedAt) out.remoteSyncedAt = remoteState.remoteSyncedAt;
    // Ensure activeTripId still exists
    if (!trips.some(function (t) { return t.id === out.activeTripId; }) && trips[0]) {
      out.activeTripId = trips[0].id;
    }
    return out;
  }

  var FETCH_TIMEOUT_MS = 8000;

  function fetchRemote(opts) {
    opts = opts || {};
    var timeoutMs = opts.timeoutMs != null ? opts.timeoutMs : FETCH_TIMEOUT_MS;
    var url = REMOTE_PATH + (REMOTE_PATH.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;
    if (controller && timeoutMs > 0) {
      timer = setTimeout(function () {
        try { controller.abort(); } catch (e) {}
      }, timeoutMs);
    }
    var fetchOpts = {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    };
    if (controller) fetchOpts.signal = controller.signal;
    return fetch(url, fetchOpts).then(function (res) {
      if (!res.ok) throw new Error('remote ' + res.status);
      return res.json();
    }).then(function (data) {
      if (!data || !Array.isArray(data.trips)) throw new Error('invalid remote payload');
      return data;
    }).finally(function () {
      if (timer) clearTimeout(timer);
    });
  }

  /**
   * Load local, fetch remote, merge with local wins. Falls back to seed.
   */
  function loadMergedState(seedFactory) {
    var local = null;
    try {
      local = global.TravelStorage && TravelStorage.load();
    } catch (e) {
      local = null;
    }
    return fetchRemote().then(function (remote) {
      return mergeStates(local, remote);
    }).catch(function (err) {
      console.warn('remote sync skipped', err);
      if (local && Array.isArray(local.trips) && local.trips.length) return local;
      return seedFactory ? seedFactory() : (local || null);
    });
  }

  global.TravelSync = {
    REMOTE_PATH: REMOTE_PATH,
    fetchRemote: fetchRemote,
    mergeStates: mergeStates,
    mergeTrip: mergeTrip,
    mergeList: mergeList,
    localWins: localWins,
    loadMergedState: loadMergedState,
    fingerprint: fingerprint
  };
})(window);
