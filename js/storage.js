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

  function save(state) {
    const copy = JSON.parse(JSON.stringify(state));
    copy.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(copy));
    return copy;
  }

  function exportJson(state) {
    return JSON.stringify(state, null, 2);
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
    importJson: importJson,
    download: download
  };
})(window);
