/**
 * Ryan Travel App — main UI & state
 */
(function () {
  'use strict';

  const uid = TravelSeed.uid;
  const VIEWS = [
    { id: 'overview', label: '總覽', ico: '☀️' },
    { id: 'todos', label: '待辦', ico: '✅' },
    { id: 'bookings', label: '訂單', ico: '🎫' },
    { id: 'itinerary', label: '行程', ico: '🗓️' },
    { id: 'journal', label: '紀錄', ico: '📔' },
    { id: 'places', label: '地點', ico: '📍' },
    { id: 'shopping', label: '購物', ico: '🛍️' },
    { id: 'packing', label: '打包', ico: '🎒' },
    { id: 'expenses', label: '花費', ico: '💳' },
    { id: 'notes', label: '筆記', ico: '📝' }
  ];
  const PRIMARY_NAV = ['overview', 'todos', 'bookings', 'itinerary'];
  const MORE_NAV = ['journal', 'places', 'shopping', 'packing', 'expenses', 'notes'];
  const MOODS = [
    { id: 'great', label: '超棒', emoji: '🤩' },
    { id: 'good', label: '不錯', emoji: '😊' },
    { id: 'ok', label: '普通', emoji: '😐' },
    { id: 'tired', label: '累', emoji: '😫' },
    { id: 'bad', label: '糟糕', emoji: '😞' }
  ];
  const NEW_DANANG_TITLE = '2026 11/5-11/10 峴港';
  const OLD_DANANG_TITLES = { '2026 峴港': true, '2026峴港': true };

  const BOOKING_TYPES = [
    { value: 'flight', label: '航班', ico: '✈️' },
    { value: 'hotel', label: '住宿', ico: '🏨' },
    { value: 'transfer', label: '接送', ico: '🚗' },
    { value: 'insurance', label: '保險', ico: '🛡️' },
    { value: 'visa', label: '簽證', ico: '🛂' },
    { value: 'esim', label: 'eSIM', ico: '📶' },
    { value: 'lounge', label: '貴賓室', ico: '🛋️' },
    { value: 'other', label: '其他', ico: '📌' }
  ];
  const STATUS_LABEL = { confirmed: '已確認', todo: '待辦', cancelled: '取消' };
  const EXP_STATUS = { paid: '已付', expected: '預計' };

  let state = null;
  let currentView = 'overview';
  let saveTimer = null;

  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.from((root || document).querySelectorAll(sel)); };

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function persist(immediate) {
    const run = function () {
      TravelStorage.save(state);
    };
    if (immediate) {
      clearTimeout(saveTimer);
      run();
      return;
    }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(run, 180);
  }

  function activeTrip() {
    return state.trips.find(function (t) { return t.id === state.activeTripId; }) || state.trips[0];
  }

  function touchTrip(trip) {
    if (!trip) return;
    trip.updatedAt = new Date().toISOString();
    trip.userEdited = true;
  }

  /** Mark a list item so Notion→app sync keeps the local edit (local wins). */
  function touchItem(item) {
    if (!item) return;
    item.updatedAt = new Date().toISOString();
    item.userEdited = true;
  }

  function parseDate(s) {
    if (!s) return null;
    const d = new Date(s + 'T12:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  function fmtDate(s) {
    const d = parseDate(s);
    if (!d) return s || '—';
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  }

  function daysBetween(a, b) {
    const ms = 24 * 60 * 60 * 1000;
    return Math.round((b.setHours(12,0,0,0) - a.setHours(12,0,0,0)) / ms);
  }

  function countdownParts(startDate) {
    const start = parseDate(startDate);
    if (!start) return null;
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    const startCopy = new Date(start);
    let diff = Math.floor((startCopy - now) / (24 * 60 * 60 * 1000));
    if (diff < 0) {
      const end = parseDate(activeTrip().endDate);
      if (end && now <= end) return { during: true, day: Math.floor((now - start) / (24*60*60*1000)) + 1 };
      return { past: true };
    }
    const days = diff;
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    return { days: days, weeks: weeks, remDays: remDays, hours: 0, mins: 0 };
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Escape, then turn http(s) URLs into tappable links (stops click bubbling to cards). */
  function linkifyHtml(s) {
    return escapeHtml(s).replace(/https?:\/\/[^\s<>"）｜，、；。（]+/g, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">' + u + '</a>';
    });
  }


  /* ---------- Expandable details (compact chip → dialog) ---------- */
  var detailOpener = null;
  var detailSwipe = null;

  function hasDetails(obj) {
    return !!(obj && obj.details && (obj.details.title || obj.details.summary ||
      (obj.details.tips && obj.details.tips.length) ||
      (obj.details.images && obj.details.images.length)));
  }

  function detailThumbOf(details) {
    var imgs = details && details.images;
    if (!imgs || !imgs.length) return '';
    var src = imgs[0].src || '';
    if (!src) return '';
    if (src.indexOf('/thumbs/') >= 0) return src;
    var slash = src.lastIndexOf('/');
    if (slash < 0) return 'assets/details/thumbs/' + src;
    return src.slice(0, slash + 1) + 'thumbs/' + src.slice(slash + 1);
  }

  function detailChipHtml(details, kind, id, dayId) {
    if (!details) return '';
    var label = '查看詳情：' + String(details.title || '更多').replace(/[<>&"]/g, '');
    var thumb = detailThumbOf(details);
    var extra = dayId ? (' data-day="' + escapeHtml(dayId) + '"') : '';
    if (thumb) {
      return '<button type="button" class="detail-chip" data-action="open-detail" data-kind="' +
        escapeHtml(kind) + '" data-id="' + escapeHtml(id) + '"' + extra +
        ' aria-label="' + escapeHtml(label) + '">' +
        '<img src="' + escapeHtml(thumb) + '" alt="" width="40" height="40" loading="lazy" decoding="async">' +
        '</button>';
    }
    return '<button type="button" class="detail-chip detail-chip-info" data-action="open-detail" data-kind="' +
      escapeHtml(kind) + '" data-id="' + escapeHtml(id) + '"' + extra +
      ' aria-label="' + escapeHtml(label) + '">ℹ️</button>';
  }

  function lookupDetails(kind, id, dayId) {
    var trip = activeTrip();
    if (!trip || !id) return null;
    if (kind === 'shop') {
      var s = (trip.shopping || []).find(function (x) { return x.id === id; });
      return s && s.details ? s.details : null;
    }
    if (kind === 'place') {
      var p = (trip.places || []).find(function (x) { return x.id === id; });
      return p && p.details ? p.details : null;
    }
    if (kind === 'booking') {
      var bk = (trip.bookings || []).find(function (x) { return x.id === id; });
      return bk && bk.details ? bk.details : null;
    }
    if (kind === 'todo') {
      var groups = trip.todoGroups || [];
      for (var i = 0; i < groups.length; i++) {
        var items = groups[i].items || [];
        for (var j = 0; j < items.length; j++) {
          if (items[j].id === id) return items[j].details || null;
        }
      }
      return null;
    }
    if (kind === 'block') {
      var day = (trip.days || []).find(function (d) { return d.id === dayId; });
      if (!day) {
        // fallback scan
        for (var d = 0; d < (trip.days || []).length; d++) {
          var bls = trip.days[d].blocks || [];
          for (var b = 0; b < bls.length; b++) {
            if (bls[b].id === id) return bls[b].details || null;
          }
        }
        return null;
      }
      var block = (day.blocks || []).find(function (x) { return x.id === id; });
      return block && block.details ? block.details : null;
    }
    return null;
  }

  function listHtml(items, className) {
    if (!items || !items.length) return '';
    var html = '<div class="detail-section' + (className ? ' ' + className : '') + '">';
    if (className === 'warn') html += '<h4>注意</h4>';
    else html += '<h4>重點</h4>';
    html += '<ul>';
    items.forEach(function (t) {
      html += '<li>' + linkifyHtml(t) + '</li>';
    });
    html += '</ul></div>';
    return html;
  }

  function renderDetailBody(details) {
    var html = '';
    if (details.summary) html += '<p class="detail-summary">' + linkifyHtml(details.summary) + '</p>';
    html += listHtml(details.tips, '');
    html += listHtml(details.warnings, 'warn');
    if (details.images && details.images.length) {
      html += '<div class="detail-section"><h4>圖片</h4><div class="detail-gallery">';
      details.images.forEach(function (img, idx) {
        html += '<button type="button" data-action="open-lightbox" data-idx="' + idx + '" aria-label="' +
          escapeHtml(img.alt || img.caption || '放大圖片') + '">' +
          '<img src="' + escapeHtml(img.src) + '" alt="' + escapeHtml(img.alt || '') + '" loading="lazy" decoding="async">' +
          (img.caption ? '<span class="cap">' + escapeHtml(img.caption) + '</span>' : '') +
          '</button>';
      });
      html += '</div></div>';
    }
    if (details.links && details.links.length) {
      html += '<div class="detail-section"><h4>連結</h4><div class="detail-links">';
      details.links.forEach(function (lnk) {
        if (!lnk || !lnk.url) return;
        html += '<a href="' + escapeHtml(lnk.url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(lnk.label || lnk.url) + '</a>';
      });
      html += '</div></div>';
    }
    return html || '<p class="muted">尚無更多說明</p>';
  }

  function closeDetailDialog() {
    var dlg = $('#detailDialog');
    if (dlg && dlg.open) {
      try { dlg.close(); } catch (e) { dlg.removeAttribute('open'); }
    }
    detailSwipe = null;
    var opener = detailOpener;
    detailOpener = null;
    if (opener && typeof opener.focus === 'function') {
      try { opener.focus(); } catch (e) {}
    }
  }

  function openDetail(details, openerEl) {
    if (!details) return;
    var dlg = $('#detailDialog');
    var body = $('#detailBody');
    var title = $('#detailTitle');
    if (!dlg || !body || !title) return;
    detailOpener = openerEl || document.activeElement;
    title.textContent = details.title || '詳情';
    body.innerHTML = renderDetailBody(details);
    // stash for lightbox
    dlg._details = details;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
    var closeBtn = dlg.querySelector('.detail-close');
    if (closeBtn) {
      try { closeBtn.focus(); } catch (e) {}
    }
  }

  function openLightbox(details, idx) {
    var imgMeta = details && details.images && details.images[idx];
    if (!imgMeta) return;
    var dlg = $('#lightboxDialog');
    var img = $('#lightboxImg');
    var cap = $('#lightboxCaption');
    if (!dlg || !img) return;
    img.src = imgMeta.src;
    img.alt = imgMeta.alt || '';
    if (cap) cap.textContent = imgMeta.caption || imgMeta.alt || '';
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  }

  function closeLightbox() {
    var dlg = $('#lightboxDialog');
    if (dlg && dlg.open) {
      try { dlg.close(); } catch (e) { dlg.removeAttribute('open'); }
    }
    var img = $('#lightboxImg');
    if (img) img.removeAttribute('src');
  }

  function bindDetailGestures() {
    if (bindDetailGestures._done) return;
    bindDetailGestures._done = true;
    var dlg = $('#detailDialog');
    var sheet = $('#detailSheet');
    var lb = $('#lightboxDialog');
    if (dlg) {
      dlg.addEventListener('cancel', function (e) {
        // Esc — native; ensure focus restore via close handler
        e.preventDefault();
        closeDetailDialog();
      });
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) closeDetailDialog();
      });
    }
    if (lb) {
      lb.addEventListener('cancel', function (e) {
        e.preventDefault();
        closeLightbox();
      });
      lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.id === 'lightboxCaption' || e.target.classList.contains('lightbox-figure')) {
          closeLightbox();
        }
      });
    }
    if (sheet) {
      var onStart = function (e) {
        if (window.matchMedia && window.matchMedia('(min-width: 641px)').matches) return;
        var t = e.touches && e.touches[0];
        if (!t) return;
        // only from grab / toolbar
        if (!e.target.closest('.detail-grab, .detail-toolbar')) return;
        detailSwipe = { y0: t.clientY, dy: 0 };
      };
      var onMove = function (e) {
        if (!detailSwipe) return;
        var t = e.touches && e.touches[0];
        if (!t) return;
        detailSwipe.dy = t.clientY - detailSwipe.y0;
        if (detailSwipe.dy > 0) {
          sheet.style.transform = 'translateX(-50%) translateY(' + detailSwipe.dy + 'px)';
          if (e.cancelable) e.preventDefault();
        }
      };
      var onEnd = function () {
        if (!detailSwipe) return;
        var dy = detailSwipe.dy || 0;
        detailSwipe = null;
        sheet.style.transform = '';
        if (dy > 96) closeDetailDialog();
      };
      sheet.addEventListener('touchstart', onStart, { passive: true });
      sheet.addEventListener('touchmove', onMove, { passive: false });
      sheet.addEventListener('touchend', onEnd);
      sheet.addEventListener('touchcancel', onEnd);
    }
  }

  function bookingIco(type) {
    const t = BOOKING_TYPES.find(function (x) { return x.value === type; });
    return t ? t.ico : '📌';
  }

  /* ---------- Render shell ---------- */
  function defaultMemories() {
    return { highlights: [], wouldReturn: null, overallRating: null, postTripNote: '' };
  }

  function ensureTripShape(trip) {
    if (!trip) return trip;
    if (!Array.isArray(trip.journal)) trip.journal = [];
    if (!trip.memories || typeof trip.memories !== 'object') trip.memories = defaultMemories();
    if (!Array.isArray(trip.memories.highlights)) trip.memories.highlights = [];
    if (trip.id === 'trip_danang_2026' && OLD_DANANG_TITLES[String(trip.title || '').trim()]) {
      trip.title = NEW_DANANG_TITLE;
    }
    if (window.TravelSync && typeof TravelSync.sanitizeExpenses === 'function') {
      trip.expenses = TravelSync.sanitizeExpenses(trip.expenses);
    }
    (trip.expenses || []).forEach(function (e) {
      if (!e) return;
      if (e.status === 'paid') {
        if (e.estimateTwd == null || e.estimateTwd === '') e.estimateTwd = Number(e.twd) || 0;
      } else {
        // expected: move any leftover actual into estimate, then clear actual
        if (e.estimateTwd == null || e.estimateTwd === '') {
          e.estimateTwd = Number(e.twd) || 0;
        }
        e.twd = 0;
      }
      if (e.excludeFromEstimate == null) e.excludeFromEstimate = false;
    });
    return trip;
  }

  function ensureValidState(recoveredOnce) {
    if (!state || !Array.isArray(state.trips) || !state.trips.length) {
      console.warn('empty trips — recovering from seed');
      state = TravelSeed.defaultState();
      (state.trips || []).forEach(ensureTripShape);
      return true;
    }
    state.trips.forEach(ensureTripShape);
    if (!state.trips.some(function (t) { return t && t.id === state.activeTripId; })) {
      state.activeTripId = state.trips[0].id;
    }
    return !!recoveredOnce;
  }

  function tripPhase(trip) {
    const start = parseDate(trip.startDate);
    const end = parseDate(trip.endDate);
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    if (start && now < start) return { id: 'before', label: '出發前', cls: 'phase-before' };
    if (end && now > end) return { id: 'after', label: '旅後', cls: 'phase-after' };
    if (start && end && now >= start && now <= end) return { id: 'during', label: '旅途中', cls: 'phase-during' };
    if (start && !end && now >= start) return { id: 'during', label: '旅途中', cls: 'phase-during' };
    return { id: 'before', label: '出發前', cls: 'phase-before' };
  }

  function moodMeta(id) {
    return MOODS.find(function (m) { return m.id === id; }) || null;
  }

  function starsHtml(n) {
    n = Number(n) || 0;
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
    return s;
  }

  function syncTripSelectLabel() {
    const label = $('#tripSelectLabel');
    const sel = $('#tripSelect');
    if (!label) return;
    const trip = activeTrip();
    const title = trip ? (trip.title || trip.id) : '（無旅程）';
    label.textContent = title;
    const optCount = sel ? sel.options.length : 0;
    const firstVal = sel && sel.options[0] ? sel.options[0].value : '';
    // Show fallback text if select still has no real options
    label.hidden = !(optCount === 0 || (optCount === 1 && !firstVal));
  }

  function renderTripSelect() {
    const sel = $('#tripSelect');
    if (!sel) return;
    ensureValidState(false);
    let trips = (state.trips || []).filter(function (t) { return t && !t.archived; });
    let archived = (state.trips || []).filter(function (t) { return t && t.archived; });
    // If filter wiped options but trips exist (e.g. bad archived flags), still show all
    if (!trips.length && !archived.length && state.trips && state.trips.length) {
      trips = state.trips.slice();
      archived = [];
    }
    if (!trips.length && !archived.length) {
      ensureValidState(true);
      TravelStorage.save(state);
      trips = (state.trips || []).filter(function (t) { return t && !t.archived; });
      archived = (state.trips || []).filter(function (t) { return t && t.archived; });
      if (!trips.length && state.trips && state.trips.length) {
        trips = state.trips.slice();
        archived = [];
      }
    }
    let html = '';
    trips.forEach(function (t) {
      html += '<option value="' + escapeHtml(t.id) + '"' + (t.id === state.activeTripId ? ' selected' : '') + '>' + escapeHtml(t.title || t.id) + '</option>';
    });
    if (archived.length) {
      html += '<optgroup label="已封存">';
      archived.forEach(function (t) {
        html += '<option value="' + escapeHtml(t.id) + '"' + (t.id === state.activeTripId ? ' selected' : '') + '>' + escapeHtml(t.title || t.id) + '（封存）</option>';
      });
      html += '</optgroup>';
    }
    if (!html) {
      // Last-resort seed recovery — never leave select empty
      console.warn('renderTripSelect: forcing seed recovery');
      state = TravelSeed.defaultState();
      TravelStorage.save(state);
      const t0 = state.trips[0];
      html = '<option value="' + escapeHtml(t0.id) + '" selected>' + escapeHtml(t0.title || t0.id) + '</option>';
    }
    sel.innerHTML = html;
    if (sel.options.length < 1) {
      console.error('renderTripSelect: assert failed — 0 options');
    }
    try { sel.value = state.activeTripId; } catch (e) {}
    syncTripSelectLabel();
    updateDataStamp();
  }

  function fmtDataStamp(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Taipei',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(d);
      const get = function (type) {
        const p = parts.find(function (x) { return x.type === type; });
        return p ? p.value : '';
      };
      let hour = get('hour');
      if (hour === '24') hour = '00';
      return '更新 ' + get('month') + '/' + get('day') + ' ' + hour + ':' + get('minute');
    } catch (e) {
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return '更新 ' + m + '/' + day + ' ' + hh + ':' + mm;
    }
  }

  function updateDataStamp() {
    const el = $('#dataStamp');
    if (!el || !state) return;
    const trip = activeTrip();
    const iso = state.remoteSyncedAt || state.syncedAt || (trip && trip.updatedAt) || null;
    const text = fmtDataStamp(iso);
    if (text) {
      el.textContent = text;
      el.hidden = false;
      el.title = iso || '';
    } else {
      el.textContent = '';
      el.hidden = true;
    }
  }

  function setView(id) {
    currentView = id;
    $$('.panel').forEach(function (p) { p.classList.toggle('active', p.dataset.view === id); });
    $$('.nav-item, .more-menu button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === id);
    });
    $('#moreMenu').classList.remove('open');
    renderView();
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
  }

  function renderView() {
    const trip = activeTrip();
    if (!trip) return;
    const map = {
      overview: renderOverview,
      todos: renderTodos,
      bookings: renderBookings,
      itinerary: renderItinerary,
      journal: renderJournal,
      places: renderPlaces,
      shopping: renderShopping,
      packing: renderPacking,
      expenses: renderExpenses,
      notes: renderNotes
    };
    (map[currentView] || renderOverview)(trip);
  }

  /* ---------- Overview ---------- */
  function renderOverview(trip) {
    const el = $('#view-overview');
    const cd = countdownParts(trip.startDate);
    let cdHtml = '';
    if (!cd) {
      cdHtml = '<p class="muted">設定出發日後顯示倒數</p>';
    } else if (cd.past) {
      cdHtml = '<p class="pill">旅程已結束</p>';
    } else if (cd.during) {
      cdHtml = '<p class="pill accent">旅途中 · 第 ' + cd.day + ' 天</p>';
    } else {
      cdHtml = '<div class="countdown">' +
        '<div class="cell"><div class="num">' + cd.days + '</div><div class="label">天</div></div>' +
        '<div class="cell"><div class="num">' + cd.weeks + '</div><div class="label">週</div></div>' +
        '<div class="cell"><div class="num">' + cd.remDays + '</div><div class="label">餘天</div></div>' +
        '<div class="cell"><div class="num">' + (trip.startDate ? trip.startDate.slice(5).replace('-', '/') : '—') + '</div><div class="label">出發</div></div>' +
        '</div>';
    }

    const openTodos = (trip.todoGroups || []).reduce(function (n, g) {
      return n + (g.items || []).filter(function (i) { return !i.done; }).length;
    }, 0);
    const doneTodos = (trip.todoGroups || []).reduce(function (n, g) {
      return n + (g.items || []).filter(function (i) { return i.done; }).length;
    }, 0);
    const totalTodos = openTodos + doneTodos;
    const pct = totalTodos ? Math.round(doneTodos / totalTodos * 100) : 0;

    const deadlines = (trip.deadlines || []).slice().sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });

    el.innerHTML =
      '<div class="card">' +
        '<div class="row" style="justify-content:space-between">' +
          '<div><h2 style="margin:0">' + escapeHtml(trip.title) + '</h2>' +
          '<div class="muted">' + escapeHtml(trip.destination || '目的地未填') + '</div></div>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="edit-trip-meta">編輯</button>' +
        '</div>' +
        '<div class="row" style="margin-top:10px">' +
          '<span class="pill">' + fmtDate(trip.startDate) + ' → ' + fmtDate(trip.endDate) + '</span>' +
          (trip.archived ? '<span class="pill warn">已封存</span>' : '') +
        '</div>' +
        cdHtml +
        '<div class="muted">待辦進度 ' + doneTodos + ' / ' + totalTodos + '（' + pct + '%）</div>' +
        '<div class="progress-bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="muted" style="margin-top:8px">未完成待辦：' + openTodos + ' 項</div>' +
      '</div>' +
      '<div class="card">' +
        '<h3>目標</h3>' +
        (trip.goals && trip.goals.length
          ? '<div class="goals">' + trip.goals.map(function (g) { return '<span class="goal-chip">' + escapeHtml(g) + '</span>'; }).join('') + '</div>'
          : '<p class="muted">尚無目標</p>') +
        '<button type="button" class="btn btn-ghost btn-sm" style="margin-top:10px" data-action="edit-goals">編輯目標</button>' +
      '</div>' +
      '<div class="card">' +
        '<div class="row" style="justify-content:space-between"><h3 style="margin:0">關鍵期限</h3>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="add-deadline">＋ 新增</button></div>' +
        (deadlines.length ? deadlines.map(function (d) {
          return '<div class="check-item"><div class="body"><strong>' + escapeHtml(d.label) + '</strong>' +
            '<div class="faint">' + fmtDate(d.date) + (d.note ? ' · ' + escapeHtml(d.note) : '') + '</div></div>' +
            '<div class="actions"><button type="button" class="icon-btn" data-action="edit-deadline" data-id="' + d.id + '" aria-label="編輯">✏️</button>' +
            '<button type="button" class="icon-btn" data-action="del-deadline" data-id="' + d.id + '" aria-label="刪除">🗑️</button></div></div>';
        }).join('') : '<p class="muted">尚無期限</p>') +
      '</div>' +
      journalOverviewTeaser(trip) +
      '<div class="card">' +
        '<h3>旅程管理</h3>' +
        '<div class="row">' +
          '<button type="button" class="btn btn-primary btn-sm" data-action="new-blank">＋ 新旅程模板</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="rename-trip">重新命名</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="toggle-archive">' + (trip.archived ? '取消封存' : '封存') + '</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-action="delete-trip">刪除旅程</button>' +
        '</div>' +
        '<div class="row" style="margin-top:10px">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="export">匯出 JSON</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="lock">上鎖</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="import">匯入 JSON</button>' +
        '</div>' +
        '<p class="faint" style="margin-top:10px">資料存在本機瀏覽器；開啟時會拉取 Notion 同步檔並以「本機編輯優先」合併。換裝置前請先匯出備份。</p>' +
      '</div>';
  }

  /* ---------- Todos ---------- */
  function renderTodos(trip) {
    const el = $('#view-todos');
    let html = '<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">待辦</h2>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="add-todo-group">＋ 群組</button></div></div>';

    (trip.todoGroups || []).forEach(function (g) {
      html += '<div class="card"><div class="group-title"><span contenteditable="false">' + escapeHtml(g.name) +
        '</span><div class="row">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="rename-group" data-gid="' + g.id + '">改名</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="add-todo" data-gid="' + g.id + '">＋ 項目</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="del-group" data-gid="' + g.id + '">刪群組</button>' +
        '</div></div>';
      if (!g.items || !g.items.length) html += '<p class="muted">尚無項目</p>';
      (g.items || []).forEach(function (item) {
        html += '<div class="check-item' + (item.done ? ' done' : '') + '">' +
          '<input type="checkbox" ' + (item.done ? 'checked' : '') + ' data-action="toggle-todo" data-gid="' + g.id + '" data-id="' + item.id + '" aria-label="完成">' +
          '<div class="body"><div>' + escapeHtml(item.text) + '</div>' +
          ((item.due || item.note) ? '<div class="faint">' + (item.due ? escapeHtml(item.due) : '') + (item.due && item.note ? ' · ' : '') + (item.note ? escapeHtml(item.note) : '') + '</div>' : '') +
          '</div><div class="actions">' +
          (hasDetails(item) ? detailChipHtml(item.details, 'todo', item.id) : '') +
          '<button type="button" class="icon-btn" data-action="edit-todo" data-gid="' + g.id + '" data-id="' + item.id + '" aria-label="編輯">✏️</button>' +
          '<button type="button" class="icon-btn" data-action="del-todo" data-gid="' + g.id + '" data-id="' + item.id + '" aria-label="刪除">🗑️</button>' +
          '</div></div>';
      });
      html += '</div>';
    });
    el.innerHTML = html;
  }

  /* ---------- Bookings ---------- */
  function renderBookings(trip) {
    const el = $('#view-bookings');
    let html = '<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">訂單</h2>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="add-booking">＋ 新增</button></div>';
    if (!(trip.bookings || []).length) html += '<p class="muted">尚無訂單</p>';
    (trip.bookings || []).forEach(function (b) {
      html += '<div class="booking">' +
        '<div class="type-icon" aria-hidden="true">' + bookingIco(b.type) + '</div>' +
        '<div><strong>' + escapeHtml(b.title) + '</strong>' +
        '<div class="muted">' + escapeHtml(b.detail || '') + '</div>' +
        (b.ref ? '<div class="faint">代號／備註：' + escapeHtml(b.ref) + '</div>' : '') +
        (b.note ? '<div class="faint">' + linkifyHtml(b.note) + '</div>' : '') +
        '</div><div class="stack" style="align-items:flex-end">' +
        '<span class="badge ' + escapeHtml(b.status || 'todo') + '">' + escapeHtml(STATUS_LABEL[b.status] || b.status) + '</span>' +
        '<div class="actions">' + (hasDetails(b) ? detailChipHtml(b.details, 'booking', b.id) : '') +
        '<button type="button" class="icon-btn" data-action="edit-booking" data-id="' + b.id + '" aria-label="編輯">✏️</button>' +
        '<button type="button" class="icon-btn" data-action="del-booking" data-id="' + b.id + '" aria-label="刪除">🗑️</button></div>' +
        '</div></div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  /* ---------- Itinerary ---------- */
  function renderItinerary(trip) {
    const el = $('#view-itinerary');
    let html = '<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">行程</h2>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="add-day">＋ 一天</button></div>' +
      '<p class="faint" style="margin:8px 0 0">拖 ⠿ 可調整順序或移到其他天</p></div>';
    const days = (trip.days || []).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    if (!days.length) html += '<div class="card"><p class="muted">尚無行程日</p></div>';
    days.forEach(function (day) {
      html += '<div class="card day-card" data-day-drop="' + day.id + '"><div class="day-head"><div><strong>' + fmtDate(day.date) + '</strong> · ' + escapeHtml(day.title || '') +
        '</div><div class="row">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="edit-day" data-id="' + day.id + '">編輯日</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="add-block" data-id="' + day.id + '">＋ 區塊</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="del-day" data-id="' + day.id + '">刪日</button>' +
        '</div></div>';
      (day.blocks || []).forEach(function (bl) {
        html += '<div class="block-row" draggable="true" data-block-id="' + bl.id + '" data-day-id="' + day.id + '">' +
          '<span class="drag-handle" title="拖曳換日／排序" aria-hidden="true">⠿</span>' +
          '<div class="time">' + escapeHtml(bl.time || '—') + '</div>' +
          '<div>' + escapeHtml(bl.text || '') + (bl.place ? '<div class="faint">📍 ' + escapeHtml(bl.place) + '</div>' : '') + '</div>' +
          '<div class="actions">' +
          (hasDetails(bl) ? detailChipHtml(bl.details, 'block', bl.id, day.id) : '') +
          '<button type="button" class="icon-btn" data-action="edit-block" data-day="' + day.id + '" data-id="' + bl.id + '" aria-label="編輯">✏️</button>' +
          '<button type="button" class="icon-btn" data-action="del-block" data-day="' + day.id + '" data-id="' + bl.id + '" aria-label="刪除">🗑️</button></div></div>';
      });
      html += '<div class="block-drop-zone" data-day-drop="' + day.id + '" aria-hidden="true"></div></div>';
    });
    el.innerHTML = html;
  }

  /** Move / reorder an itinerary block; persists + re-renders. */
  function moveItineraryBlock(fromDayId, blockId, toDayId, beforeBlockId) {
    const trip = activeTrip();
    if (!trip || !blockId || !toDayId) return false;
    const fromDay = (trip.days || []).find(function (d) { return d.id === fromDayId; });
    const toDay = (trip.days || []).find(function (d) { return d.id === toDayId; });
    if (!fromDay || !toDay) return false;
    fromDay.blocks = fromDay.blocks || [];
    const idx = fromDay.blocks.findIndex(function (b) { return b.id === blockId; });
    if (idx < 0) return false;
    // Compute insert index before mutating (same-day: account for removal)
    toDay.blocks = toDay.blocks || [];
    var insertAt = toDay.blocks.length;
    if (beforeBlockId) {
      var bi = toDay.blocks.findIndex(function (b) { return b.id === beforeBlockId; });
      if (bi >= 0) insertAt = bi;
    }
    if (fromDayId === toDayId) {
      if (insertAt > idx) insertAt -= 1; // removed item shifts later indices
      if (insertAt === idx) return false; // same position
    }
    const block = fromDay.blocks.splice(idx, 1)[0];
    toDay.blocks.splice(insertAt, 0, block);
    touchItem(block);
    touchItem(fromDay);
    touchItem(toDay);
    touchTrip(trip);
    persist(true);
    renderView();
    toast(fromDayId === toDayId ? '已調整順序' : '已移到其他天');
    return true;
  }

  var itineraryDrag = null;

  function clearItineraryDragUI() {
    $$('.day-card.drag-over, .block-row.drag-over-before, .block-row.drag-over-after, .block-row.dragging').forEach(function (el) {
      el.classList.remove('drag-over', 'drag-over-before', 'drag-over-after', 'dragging');
    });
  }

  function onItineraryDragStart(e) {
    const row = e.target.closest && e.target.closest('#view-itinerary .block-row[draggable="true"]');
    if (!row) return;
    if (e.target.closest && e.target.closest('button, a, input, textarea, select')) {
      e.preventDefault();
      return;
    }
    itineraryDrag = { blockId: row.dataset.blockId, fromDayId: row.dataset.dayId };
    row.classList.add('dragging');
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', row.dataset.blockId || '');
    } catch (err) {}
  }

  function onItineraryDragEnd() {
    itineraryDrag = null;
    clearItineraryDragUI();
  }

  function onItineraryDragOver(e) {
    if (!itineraryDrag) return;
    const view = e.target.closest && e.target.closest('#view-itinerary');
    if (!view) return;
    const dayCard = e.target.closest('.day-card');
    if (!dayCard) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
    clearItineraryDragUI();
    if (itineraryDrag) {
      const dragging = view.querySelector('.block-row[data-block-id="' + itineraryDrag.blockId + '"]');
      if (dragging) dragging.classList.add('dragging');
    }
    dayCard.classList.add('drag-over');
    const overRow = e.target.closest('.block-row[data-block-id]');
    if (overRow && overRow.dataset.blockId !== itineraryDrag.blockId) {
      const rect = overRow.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) overRow.classList.add('drag-over-before');
      else overRow.classList.add('drag-over-after');
    }
  }

  function onItineraryDrop(e) {
    if (!itineraryDrag) return;
    const view = e.target.closest && e.target.closest('#view-itinerary');
    if (!view) return;
    const dayCard = e.target.closest('.day-card');
    if (!dayCard) return;
    e.preventDefault();
    const toDayId = dayCard.getAttribute('data-day-drop');
    const fromDayId = itineraryDrag.fromDayId;
    const blockId = itineraryDrag.blockId;
    var beforeBlockId = null;
    const overRow = e.target.closest('.block-row[data-block-id]');
    if (overRow && overRow.dataset.blockId === blockId) {
      itineraryDrag = null;
      clearItineraryDragUI();
      return;
    }
    if (overRow && overRow.dataset.blockId !== blockId) {
      const rect = overRow.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        beforeBlockId = overRow.dataset.blockId;
      } else {
        // insert after: find next sibling block in same day
        var next = overRow.nextElementSibling;
        while (next && !next.classList.contains('block-row')) next = next.nextElementSibling;
        beforeBlockId = next && next.dataset.blockId ? next.dataset.blockId : null;
      }
    }
    itineraryDrag = null;
    clearItineraryDragUI();
    moveItineraryBlock(fromDayId, blockId, toDayId, beforeBlockId);
  }


  /* ---------- Shopping / Packing / Expenses DnD ---------- */
  var listDrag = null; // { kind: 'shop'|'pack'|'expense', id, fromCatId? }

  function clearListDragUI() {
    $$('.check-item.drag-over-before, .check-item.drag-over-after, .check-item.dragging, .pack-cat-card.drag-over, .expense-row.drag-over-before, .expense-row.drag-over-after, .expense-row.dragging').forEach(function (el) {
      el.classList.remove('drag-over-before', 'drag-over-after', 'dragging', 'drag-over');
    });
  }

  function reorderArrayById(arr, id, beforeId) {
    if (!arr || !id) return false;
    var idx = arr.findIndex(function (x) { return x && x.id === id; });
    if (idx < 0) return false;
    var insertAt = arr.length;
    if (beforeId) {
      var bi = arr.findIndex(function (x) { return x && x.id === beforeId; });
      if (bi >= 0) insertAt = bi;
    }
    if (insertAt > idx) insertAt -= 1;
    if (insertAt === idx) return false;
    var item = arr.splice(idx, 1)[0];
    arr.splice(insertAt, 0, item);
    return item;
  }

  function moveShopItem(itemId, beforeId) {
    var trip = activeTrip();
    if (!trip) return;
    trip.shopping = trip.shopping || [];
    var item = reorderArrayById(trip.shopping, itemId, beforeId);
    if (!item) return;
    touchItem(item);
    touchTrip(trip);
    persist(true);
    renderView();
    toast('已調整順序');
  }

  function movePackItem(fromCatId, itemId, toCatId, beforeId) {
    var trip = activeTrip();
    if (!trip || !itemId || !toCatId) return;
    var fromCat = (trip.packing || []).find(function (c) { return c.id === fromCatId; });
    var toCat = (trip.packing || []).find(function (c) { return c.id === toCatId; });
    if (!fromCat || !toCat) return;
    fromCat.items = fromCat.items || [];
    toCat.items = toCat.items || [];
    var idx = fromCat.items.findIndex(function (x) { return x.id === itemId; });
    if (idx < 0) return;
    var insertAt = toCat.items.length;
    if (beforeId) {
      var bi = toCat.items.findIndex(function (x) { return x.id === beforeId; });
      if (bi >= 0) insertAt = bi;
    }
    if (fromCatId === toCatId) {
      if (insertAt > idx) insertAt -= 1;
      if (insertAt === idx) return;
    }
    var item = fromCat.items.splice(idx, 1)[0];
    toCat.items.splice(insertAt, 0, item);
    touchItem(item);
    touchItem(fromCat);
    touchItem(toCat);
    touchTrip(trip);
    persist(true);
    renderView();
    toast(fromCatId === toCatId ? '已調整順序' : '已移到其他分類');
  }

  function moveExpenseItem(itemId, beforeId) {
    var trip = activeTrip();
    if (!trip) return;
    trip.expenses = trip.expenses || [];
    var item = reorderArrayById(trip.expenses, itemId, beforeId);
    if (!item) return;
    touchItem(item);
    touchTrip(trip);
    persist(true);
    renderView();
    toast('已調整順序');
  }

  function onListDragStart(e) {
    if (e.target.closest && e.target.closest('button, a, input, textarea, select')) {
      e.preventDefault();
      return;
    }
    var shopRow = e.target.closest && e.target.closest('#view-shopping .check-item[draggable="true"]');
    if (shopRow) {
      listDrag = { kind: 'shop', id: shopRow.dataset.shopId };
      shopRow.classList.add('dragging');
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', listDrag.id || ''); } catch (err) {}
      return;
    }
    var packRow = e.target.closest && e.target.closest('#view-packing .check-item[draggable="true"]');
    if (packRow) {
      listDrag = { kind: 'pack', id: packRow.dataset.packId, fromCatId: packRow.dataset.packCid };
      packRow.classList.add('dragging');
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', listDrag.id || ''); } catch (err) {}
      return;
    }
    var expRow = e.target.closest && e.target.closest('#view-expenses tr.expense-row[draggable="true"]');
    if (expRow) {
      listDrag = { kind: 'expense', id: expRow.dataset.expenseId };
      expRow.classList.add('dragging');
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', listDrag.id || ''); } catch (err) {}
    }
  }

  function onListDragEnd() {
    listDrag = null;
    clearListDragUI();
  }

  function onListDragOver(e) {
    if (!listDrag) return;
    if (listDrag.kind === 'shop') {
      var view = e.target.closest && e.target.closest('#view-shopping');
      if (!view) return;
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
      clearListDragUI();
      var dragging = view.querySelector('.check-item[data-shop-id="' + listDrag.id + '"]');
      if (dragging) dragging.classList.add('dragging');
      var over = e.target.closest('.check-item[data-shop-id]');
      if (over && over.dataset.shopId !== listDrag.id) {
        var rect = over.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) over.classList.add('drag-over-before');
        else over.classList.add('drag-over-after');
      }
      return;
    }
    if (listDrag.kind === 'pack') {
      var pview = e.target.closest && e.target.closest('#view-packing');
      if (!pview) return;
      var catCard = e.target.closest('.pack-cat-card');
      if (!catCard) return;
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
      clearListDragUI();
      var pdrag = pview.querySelector('.check-item[data-pack-id="' + listDrag.id + '"]');
      if (pdrag) pdrag.classList.add('dragging');
      catCard.classList.add('drag-over');
      var pover = e.target.closest('.check-item[data-pack-id]');
      if (pover && pover.dataset.packId !== listDrag.id) {
        var prect = pover.getBoundingClientRect();
        if (e.clientY < prect.top + prect.height / 2) pover.classList.add('drag-over-before');
        else pover.classList.add('drag-over-after');
      }
      return;
    }
    if (listDrag.kind === 'expense') {
      var eview = e.target.closest && e.target.closest('#view-expenses');
      if (!eview) return;
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
      clearListDragUI();
      var edrag = eview.querySelector('tr.expense-row[data-expense-id="' + listDrag.id + '"]');
      if (edrag) edrag.classList.add('dragging');
      var eover = e.target.closest('tr.expense-row[data-expense-id]');
      if (eover && eover.dataset.expenseId !== listDrag.id) {
        var erect = eover.getBoundingClientRect();
        if (e.clientY < erect.top + erect.height / 2) eover.classList.add('drag-over-before');
        else eover.classList.add('drag-over-after');
      }
    }
  }

  function onListDrop(e) {
    if (!listDrag) return;
    if (listDrag.kind === 'shop') {
      var view = e.target.closest && e.target.closest('#view-shopping');
      if (!view) return;
      e.preventDefault();
      var over = e.target.closest('.check-item[data-shop-id]');
      var beforeId = null;
      if (over && over.dataset.shopId !== listDrag.id) {
        var rect = over.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) beforeId = over.dataset.shopId;
        else {
          var next = over.nextElementSibling;
          while (next && !next.classList.contains('check-item')) next = next.nextElementSibling;
          beforeId = next && next.dataset.shopId ? next.dataset.shopId : null;
        }
      } else if (over && over.dataset.shopId === listDrag.id) {
        listDrag = null; clearListDragUI(); return;
      }
      var id = listDrag.id;
      listDrag = null; clearListDragUI();
      moveShopItem(id, beforeId);
      return;
    }
    if (listDrag.kind === 'pack') {
      var pview = e.target.closest && e.target.closest('#view-packing');
      if (!pview) return;
      var catCard = e.target.closest('.pack-cat-card');
      if (!catCard) return;
      e.preventDefault();
      var toCatId = catCard.getAttribute('data-pack-drop');
      var fromCatId = listDrag.fromCatId;
      var itemId = listDrag.id;
      var beforeId = null;
      var pover = e.target.closest('.check-item[data-pack-id]');
      if (pover && pover.dataset.packId === itemId) {
        listDrag = null; clearListDragUI(); return;
      }
      if (pover && pover.dataset.packId !== itemId) {
        var prect = pover.getBoundingClientRect();
        if (e.clientY < prect.top + prect.height / 2) beforeId = pover.dataset.packId;
        else {
          var pnext = pover.nextElementSibling;
          while (pnext && !pnext.classList.contains('check-item')) pnext = pnext.nextElementSibling;
          beforeId = pnext && pnext.dataset.packId ? pnext.dataset.packId : null;
        }
      }
      listDrag = null; clearListDragUI();
      movePackItem(fromCatId, itemId, toCatId, beforeId);
      return;
    }
    if (listDrag.kind === 'expense') {
      var eview = e.target.closest && e.target.closest('#view-expenses');
      if (!eview) return;
      e.preventDefault();
      var eover = e.target.closest('tr.expense-row[data-expense-id]');
      var beforeId = null;
      if (eover && eover.dataset.expenseId !== listDrag.id) {
        var erect = eover.getBoundingClientRect();
        if (e.clientY < erect.top + erect.height / 2) beforeId = eover.dataset.expenseId;
        else {
          var enext = eover.nextElementSibling;
          while (enext && !enext.classList.contains('expense-row')) enext = enext.nextElementSibling;
          beforeId = enext && enext.dataset.expenseId ? enext.dataset.expenseId : null;
        }
      } else if (eover && eover.dataset.expenseId === listDrag.id) {
        listDrag = null; clearListDragUI(); return;
      }
      var eid = listDrag.id;
      listDrag = null; clearListDragUI();
      moveExpenseItem(eid, beforeId);
    }
  }


  /* ---------- Places / route map (Leaflet + timeline) ---------- */
  const ROUTE_COLORS = { hotel: '#e76f51', marble: '#2a9d8f', hoian: '#f4a261' };
  const ROUTE_ORDER = ['hotel', 'marble', 'hoian'];
  let routeLeafletMap = null;
  let leafletLoadPromise = null;

  function destroyRouteLeaflet() {
    if (routeLeafletMap) {
      try { routeLeafletMap.remove(); } catch (e) {}
      routeLeafletMap = null;
    }
  }

  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletLoadPromise) return leafletLoadPromise;
    leafletLoadPromise = new Promise(function (resolve, reject) {
      var cssHref = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
      if (!document.querySelector('link[data-leaflet]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        link.setAttribute('data-leaflet', '1');
        document.head.appendChild(link);
      }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
      s.async = true;
      s.onload = function () {
        if (window.L) resolve(window.L);
        else {
          leafletLoadPromise = null;
          reject(new Error('Leaflet missing after load'));
        }
      };
      s.onerror = function () {
        leafletLoadPromise = null;
        reject(new Error('Leaflet failed to load'));
      };
      document.head.appendChild(s);
    });
    return leafletLoadPromise;
  }

  function pointById(routeMap, id) {
    return (routeMap.points || []).find(function (p) { return p.id === id; });
  }

  function edgeBetween(routeMap, fromId, toId) {
    return (routeMap.edges || []).find(function (e) {
      return e.from === fromId && e.to === toId;
    }) || (routeMap.edges || []).find(function (e) {
      return e.from === toId && e.to === fromId;
    });
  }

  function gmapsDirUrl(a, b) {
    if (!a || !b) return '';
    return 'https://www.google.com/maps/dir/?api=1&origin=' +
      encodeURIComponent(a.lat + ',' + a.lng) +
      '&destination=' + encodeURIComponent(b.lat + ',' + b.lng) +
      '&travelmode=driving';
  }

  function renderRouteTimeline(routeMap) {
    if (!routeMap || !routeMap.points || !routeMap.points.length) return '';
    const byId = {};
    routeMap.points.forEach(function (p) { byId[p.id] = p; });
    const order = ROUTE_ORDER.filter(function (id) { return byId[id]; });
    // Fall back to given order if custom ids
    const stops = order.length ? order.map(function (id) { return byId[id]; })
      : routeMap.points.slice();
    let html = '<div class="route-timeline" role="list">';
    stops.forEach(function (stop, idx) {
      const num = idx + 1;
      const color = ROUTE_COLORS[stop.id] || '#e76f51';
      html += '<div class="route-stop" role="listitem">' +
        '<div class="route-stop-rail"><span class="route-bubble" style="background:' + color + '">' + num + '</span>' +
        (idx < stops.length - 1 ? '<span class="route-rail-line" aria-hidden="true"></span>' : '') +
        '</div>' +
        '<div class="route-stop-body">' +
        '<div class="route-stop-title">' + escapeHtml(stop.label || stop.id) + '</div>' +
        (stop.sublabel ? '<div class="route-stop-sub">' + escapeHtml(stop.sublabel) + '</div>' : '') +
        '</div></div>';
      if (idx < stops.length - 1) {
        const next = stops[idx + 1];
        const edge = edgeBetween(routeMap, stop.id, next.id);
        const dist = edge ? edge.distance : '';
        const time = edge ? edge.time : '';
        const maps = gmapsDirUrl(stop, next);
        html += '<div class="route-leg">' +
          '<div class="route-leg-chip">' +
          '<span class="route-leg-ico" aria-hidden="true">🚗</span>' +
          '<span>' + escapeHtml((dist || '') + (dist && time ? ' · ' : '') + (time || '車程')) + '</span>' +
          (maps ? '<a class="route-leg-link" href="' + escapeHtml(maps) + '" target="_blank" rel="noopener">地圖</a>' : '') +
          '</div></div>';
      }
    });
    // Secondary direct hotel → hoian
    const hotel = byId.hotel;
    const hoian = byId.hoian;
    const direct = edgeBetween(routeMap, 'hotel', 'hoian');
    if (hotel && hoian && direct) {
      const maps = gmapsDirUrl(hotel, hoian);
      html += '<div class="route-alt">' +
        '<div class="route-alt-label">直達備援</div>' +
        '<div class="route-alt-chip">' +
        escapeHtml(hotel.label) + ' → ' + escapeHtml(hoian.label) +
        '<span class="route-alt-meta">' + escapeHtml((direct.distance || '') +
          (direct.distance && direct.time ? ' · ' : '') + (direct.time || '')) + '</span>' +
        (maps ? '<a class="route-leg-link" href="' + escapeHtml(maps) + '" target="_blank" rel="noopener">地圖</a>' : '') +
        '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function mountRouteLeaflet(routeMap) {
    const host = $('#routeLeaflet');
    if (!host || !routeMap || !routeMap.points || routeMap.points.length < 1) return;
    destroyRouteLeaflet();
    loadLeaflet().then(function (L) {
      const el = $('#routeLeaflet');
      if (!el || currentView !== 'places') return;
      const points = routeMap.points.filter(function (p) {
        return p && isFinite(Number(p.lat)) && isFinite(Number(p.lng));
      });
      if (!points.length) return;
      const map = L.map(el, {
        scrollWheelZoom: false,
        attributionControl: true
      });
      routeLeafletMap = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      }).addTo(map);

      const latLngs = [];
      const orderIds = ROUTE_ORDER.filter(function (id) {
        return points.some(function (p) { return p.id === id; });
      });
      const ordered = orderIds.length
        ? orderIds.map(function (id) { return points.find(function (p) { return p.id === id; }); }).filter(Boolean)
        : points;

      ordered.forEach(function (p, idx) {
        const color = ROUTE_COLORS[p.id] || '#e76f51';
        const ll = L.latLng(Number(p.lat), Number(p.lng));
        latLngs.push(ll);
        const icon = L.divIcon({
          className: 'route-marker-wrap',
          html: '<div class="route-marker" style="background:' + color + '">' + (idx + 1) + '</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14]
        });
        L.marker(ll, { icon: icon }).addTo(map).bindPopup(
          '<strong>' + escapeHtml(p.label || p.id) + '</strong>' +
          (p.sublabel ? '<br><span style="color:#6b5b4e">' + escapeHtml(p.sublabel) + '</span>' : '')
        );
      });

      // Main path polyline
      if (latLngs.length >= 2) {
        L.polyline(latLngs, {
          color: '#2a9d8f',
          weight: 4,
          opacity: 0.85,
          lineJoin: 'round'
        }).addTo(map);
      }
      // Dashed direct hotel→hoian
      const hotel = pointById(routeMap, 'hotel');
      const hoian = pointById(routeMap, 'hoian');
      if (hotel && hoian) {
        L.polyline(
          [[Number(hotel.lat), Number(hotel.lng)], [Number(hoian.lat), Number(hoian.lng)]],
          { color: '#f4a261', weight: 3, opacity: 0.7, dashArray: '8 6' }
        ).addTo(map);
      }

      map.fitBounds(L.latLngBounds(latLngs).pad(0.18));
      setTimeout(function () { try { map.invalidateSize(); } catch (e) {} }, 80);
      const fb = $('#routeMapFallback');
      if (fb) fb.hidden = true;
    }).catch(function (err) {
      console.warn('Leaflet unavailable', err);
      const fb = $('#routeMapFallback');
      if (fb) fb.hidden = false;
    });
  }

  function renderPlaces(trip) {
    const el = $('#view-places');
    destroyRouteLeaflet();
    let html = '';
    if (trip.routeMap && trip.routeMap.points && trip.routeMap.points.length) {
      html += '<div class="card route-card">' +
        '<div class="row" style="justify-content:space-between;align-items:flex-start">' +
        '<div><h2 style="margin:0">' + escapeHtml(trip.routeMap.title || '主要動線') + '</h2>' +
        '<div class="faint">飯店 · 五行山 · 會安 — 地圖與車程</div></div></div>' +
        '<div id="routeLeaflet" class="route-leaflet" aria-label="主要動線地圖"></div>' +
        '<div id="routeMapFallback" class="route-map-fallback" hidden>' +
        '<p class="muted">地圖載入失敗，仍可看下方動線與 Google 地圖連結。</p></div>' +
        renderRouteTimeline(trip.routeMap) +
        (trip.routeMap.note ? '<p class="faint" style="margin-top:10px">' + escapeHtml(trip.routeMap.note) + '</p>' : '') +
        '</div>';
    }
    html += '<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">地點</h2>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="add-place">＋ 新增</button></div>';
    if (!(trip.places || []).length) html += '<p class="muted">尚無地點</p>';
    (trip.places || []).forEach(function (p) {
      html += '<div class="check-item"><div class="body"><strong>' + escapeHtml(p.name) + '</strong>' +
        (p.category ? ' <span class="pill">' + escapeHtml(p.category) + '</span>' : '') +
        (p.note ? '<div class="muted">' + escapeHtml(p.note) + '</div>' : '') +
        '<div class="row" style="margin-top:4px">' +
        (p.url ? '<a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener">連結</a>' : '') +
        (p.mapsUrl ? '<a href="' + escapeHtml(p.mapsUrl) + '" target="_blank" rel="noopener">地圖</a>' : '') +
        '</div></div><div class="actions">' +
        (hasDetails(p) ? detailChipHtml(p.details, 'place', p.id) : '') +
        '<button type="button" class="icon-btn" data-action="edit-place" data-id="' + p.id + '" aria-label="編輯">✏️</button>' +
        '<button type="button" class="icon-btn" data-action="del-place" data-id="' + p.id + '" aria-label="刪除">🗑️</button>' +
        '</div></div>';
    });
    html += '</div>';
    el.innerHTML = html;
    if (trip.routeMap && trip.routeMap.points && trip.routeMap.points.length) {
      mountRouteLeaflet(trip.routeMap);
    }
  }

  /* ---------- Shopping ---------- */
  function renderShopping(trip) {
    const el = $('#view-shopping');
    let html = '<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">購物</h2>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="add-shop">＋ 新增</button></div>' +
      '<p class="faint" style="margin:8px 0 0">拖 ⠿ 可調整順序</p>';
    if (!(trip.shopping || []).length) html += '<p class="muted">尚無購物項目</p>';
    (trip.shopping || []).forEach(function (item) {
      html += '<div class="check-item' + (item.done ? ' done' : '') + '" draggable="true" data-shop-id="' + item.id + '">' +
        '<span class="drag-handle" title="拖曳排序" aria-hidden="true">⠿</span>' +
        '<input type="checkbox" ' + (item.done ? 'checked' : '') + ' data-action="toggle-shop" data-id="' + item.id + '" aria-label="完成">' +
        '<div class="body"><div>' + escapeHtml(item.text) + '</div>' +
        (item.note ? '<div class="faint">' + escapeHtml(item.note) + '</div>' : '') +
        '</div><div class="actions">' +
        (hasDetails(item) ? detailChipHtml(item.details, 'shop', item.id) : '') +
        '<button type="button" class="icon-btn" data-action="edit-shop" data-id="' + item.id + '" aria-label="編輯">✏️</button>' +
        '<button type="button" class="icon-btn" data-action="del-shop" data-id="' + item.id + '" aria-label="刪除">🗑️</button>' +
        '</div></div>';
    });
    html += '</div>';
    el.innerHTML = html;
  }

  /* ---------- Packing ---------- */
  function renderPacking(trip) {
    const el = $('#view-packing');
    let html = '<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">打包</h2>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="add-pack-cat">＋ 分類</button></div>' +
      '<p class="faint" style="margin:8px 0 0">拖 ⠿ 可調整順序，或拖到其他分類</p></div>';
    (trip.packing || []).forEach(function (cat) {
      const done = (cat.items || []).filter(function (i) { return i.done; }).length;
      const total = (cat.items || []).length;
      html += '<div class="card pack-cat-card" data-pack-drop="' + cat.id + '"><div class="group-title"><span>' + escapeHtml(cat.category) +
        ' <span class="faint">' + done + '/' + total + '</span></span><div class="row">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="rename-pack-cat" data-cid="' + cat.id + '">改名</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="add-pack-item" data-cid="' + cat.id + '">＋ 項目</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="del-pack-cat" data-cid="' + cat.id + '">刪分類</button>' +
        '</div></div>';
      (cat.items || []).forEach(function (item) {
        html += '<div class="check-item' + (item.done ? ' done' : '') + '" draggable="true" data-pack-id="' + item.id + '" data-pack-cid="' + cat.id + '">' +
          '<span class="drag-handle" title="拖曳排序／換分類" aria-hidden="true">⠿</span>' +
          '<input type="checkbox" ' + (item.done ? 'checked' : '') + ' data-action="toggle-pack" data-cid="' + cat.id + '" data-id="' + item.id + '" aria-label="完成">' +
          '<div class="body">' + escapeHtml(item.text) + '</div>' +
          '<div class="actions"><button type="button" class="icon-btn" data-action="edit-pack" data-cid="' + cat.id + '" data-id="' + item.id + '" aria-label="編輯">✏️</button>' +
          '<button type="button" class="icon-btn" data-action="del-pack" data-cid="' + cat.id + '" data-id="' + item.id + '" aria-label="刪除">🗑️</button></div></div>';
      });
      html += '<div class="pack-drop-zone" data-pack-drop="' + cat.id + '" aria-hidden="true"></div></div>';
    });
    el.innerHTML = html;
  }

  /* ---------- Expenses ---------- */
  const EXP_FILTER_KEY = 'ryan-travel-expense-filter';
  const EXP_FILTERS = [['all', '全部'], ['paid', '已付款'], ['expected', '預計'], ['excluded', '不計入合計']];
  let expenseFilter = (function () { try { return localStorage.getItem(EXP_FILTER_KEY) || 'all'; } catch (_) { return 'all'; } })();
  function expenseMatchesFilter(e) {
    if (expenseFilter === 'paid') return e.status === 'paid';
    if (expenseFilter === 'expected') return e.status !== 'paid';
    if (expenseFilter === 'excluded') return !!e.excludeFromEstimate;
    return true;
  }

  function renderExpenses(trip) {
    ensureTripShape(trip);
    const el = $('#view-expenses');
    const list = trip.expenses || [];
    let paid = 0, estimateTotal = 0, unpaidEstimate = 0, excludedN = 0;
    list.forEach(function (e) {
      if (e.status === 'paid' && !e.excludeFromEstimate) paid += Number(e.twd) || 0;
      if (e.excludeFromEstimate) excludedN += 1;
      else {
        estimateTotal += Number(e.estimateTwd) || 0;
        if (e.status !== 'paid') unpaidEstimate += Number(e.estimateTwd) || 0;
      }
    });
    let html = '<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">花費</h2>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="add-expense">＋ 新增</button></div>' +
      '<p class="faint" style="margin:8px 0 0">拖 ⠿ 可調整順序</p>' +
      '<div class="totals"><div class="total-box"><div class="faint">已付（TWD）</div><div class="amt">' + paid.toLocaleString('zh-TW') + '</div></div>' +
      '<div class="total-box"><div class="faint">總預估（TWD）</div><div class="amt">' + estimateTotal.toLocaleString('zh-TW') + '</div></div></div>' +
      '<p class="faint" style="margin-top:8px">已付＝已付實際；總預估＝各列預估加總；預計列沒有實際金額。尚未付預估 ' + unpaidEstimate.toLocaleString('zh-TW') + '。</p>' +
      (excludedN ? '<p class="faint" style="margin-top:4px">已排除 ' + excludedN + ' 筆不計入合計</p>' : '') +
      '<p class="faint" style="margin-top:4px">按 👁 不計入已付與總預估（列仍顯示）。</p></div>';
    const shown = list.filter(expenseMatchesFilter);
    html += '<div class="expense-filter" role="group" aria-label="篩選花費">' + EXP_FILTERS.map(function (f) {
      return '<button type="button" class="filter-chip' + (expenseFilter === f[0] ? ' active' : '') + '" data-action="expense-filter" data-filter="' + f[0] + '" aria-pressed="' + (expenseFilter === f[0]) + '">' + f[1] + '</button>';
    }).join('') + (expenseFilter !== 'all' ? '<span class="faint expense-filter-count">顯示 ' + shown.length + '／' + list.length + '</span>' : '') + '</div>';
    html += '<div class="card expense-scroll"><table class="expense-table"><thead><tr>' +
      '<th class="th-drag"></th><th>日期</th><th>項目</th><th>狀態</th><th class="col-amt-desk">原幣</th><th class="col-amt-desk">實際TWD</th><th class="col-amt-desk">預估TWD</th><th>計入</th><th></th></tr></thead><tbody>';
    if (!list.length) html += '<tr><td colspan="9" class="muted">尚無花費</td></tr>';
    else if (!shown.length) html += '<tr><td colspan="9" class="muted">此篩選尚無花費</td></tr>';
    shown.forEach(function (e) {
      const excl = !!e.excludeFromEstimate;
      const isPaid = e.status === 'paid';
      const twdDisp = isPaid ? (Number(e.twd) || 0).toLocaleString('zh-TW') : '—';
      const estDisp = (Number(e.estimateTwd) || 0).toLocaleString('zh-TW');
      html += '<tr class="expense-row' + (excl ? ' expense-excluded' : '') + '" draggable="true" data-expense-id="' + e.id + '">' +
        '<td class="td-drag"><span class="drag-handle" title="拖曳排序" aria-hidden="true">⠿</span></td>' +
        '<td>' + escapeHtml(e.date || '—') + '</td><td><strong>' + escapeHtml(e.item) + '</strong>' +
        (e.merchant ? '<div class="faint">' + escapeHtml(e.merchant) + '</div>' : '') +
        (e.note ? '<div class="faint">' + escapeHtml(e.note) + '</div>' : '') +
        (excl ? '<div><span class="pill warn">不計入合計</span></div>' : '') +
        '<div class="expense-amt-inline faint">實際 ' + twdDisp +
        ' · 預估 ' + estDisp +
        (e.amount != null ? (' · 原幣 ' + escapeHtml(String(e.amount)) + ' ' + escapeHtml(e.currency || '')) : '') + '</div>' +
        '</td><td><span class="pill ' + (isPaid ? 'ok' : 'warn') + '">' + escapeHtml(EXP_STATUS[e.status] || e.status) + '</span></td>' +
        '<td class="col-amt-desk">' + (e.amount != null ? escapeHtml(String(e.amount)) + ' ' + escapeHtml(e.currency || '') : '—') + '</td>' +
        '<td class="col-amt-desk">' + twdDisp + '</td>' +
        '<td class="col-amt-desk">' + estDisp + '</td>' +
        '<td><button type="button" class="icon-btn" data-action="toggle-expense-estimate" data-id="' + e.id + '" title="' +
        (excl ? '改為計入合計' : '不計入已付與總預估') + '" aria-label="' + (excl ? '計入' : '不計入') + '">' +
        (excl ? '👁‍🗨' : '👁') + '</button></td>' +
        '<td><button type="button" class="icon-btn" data-action="edit-expense" data-id="' + e.id + '" aria-label="編輯">✏️</button>' +
        '<button type="button" class="icon-btn" data-action="del-expense" data-id="' + e.id + '" aria-label="刪除">🗑️</button></td></tr>';
    });
    html += '</tbody></table></div>';
    el.innerHTML = html;
  }

  function journalOverviewTeaser(trip) {
    ensureTripShape(trip);
    const phase = tripPhase(trip);
    const count = (trip.journal || []).length;
    if (!count && phase.id !== 'after') return '';
    return '<div class="card journal-teaser">' +
      '<div class="row" style="justify-content:space-between;align-items:center">' +
      '<div><h3 style="margin:0">📔 旅後紀錄</h3>' +
      '<div class="faint">' + (count ? ('已有 ' + count + ' 則紀錄') : '旅程已結束，開始寫下回憶吧') + '</div></div>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="nav" data-view="journal">打開紀錄</button>' +
      '</div></div>';
  }

  function journalStats(trip) {
    const entries = trip.journal || [];
    let photos = 0;
    let ratingSum = 0;
    let ratingN = 0;
    entries.forEach(function (e) {
      photos += (e.photos || []).length;
      if (e.rating != null && e.rating !== '') {
        ratingSum += Number(e.rating) || 0;
        ratingN += 1;
      }
    });
    let paid = 0;
    (trip.expenses || []).forEach(function (ex) {
      if (ex.status === 'paid' && !ex.excludeFromEstimate) paid += Number(ex.twd) || 0;
    });
    return {
      count: entries.length,
      photos: photos,
      avgRating: ratingN ? (ratingSum / ratingN) : null,
      paid: paid
    };
  }

  function renderJournal(trip) {
    ensureTripShape(trip);
    const el = $('#view-journal');
    const phase = tripPhase(trip);
    const stats = journalStats(trip);
    const mem = trip.memories || defaultMemories();
    const entries = (trip.journal || []).slice().sort(function (a, b) {
      const d = String(b.date || '').localeCompare(String(a.date || ''));
      if (d) return d;
      return String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''));
    });

    let html = '<div class="card">' +
      '<div class="row" style="justify-content:space-between;align-items:flex-start">' +
      '<div><h2 style="margin:0">📔 紀錄</h2>' +
      '<div class="faint">旅途中與旅後的日記、心情與照片</div></div>' +
      '<span class="phase-badge ' + phase.cls + '">' + escapeHtml(phase.label) + '</span>' +
      '</div>' +
      '<div class="journal-stats">' +
      '<div class="jstat"><div class="jstat-n">' + stats.count + '</div><div class="jstat-l">則紀錄</div></div>' +
      '<div class="jstat"><div class="jstat-n">' + stats.photos + '</div><div class="jstat-l">張照片</div></div>' +
      '<div class="jstat"><div class="jstat-n">' + (stats.avgRating != null ? stats.avgRating.toFixed(1) : '—') + '</div><div class="jstat-l">平均星等</div></div>' +
      '<div class="jstat"><div class="jstat-n">' + stats.paid.toLocaleString('zh-TW') + '</div><div class="jstat-l">已付 TWD</div></div>' +
      '</div>' +
      '<div class="row" style="margin-top:12px">' +
      '<button type="button" class="btn btn-primary btn-sm" data-action="add-journal">＋ 新增紀錄</button>' +
      '</div></div>';

    html += '<div class="card">' +
      '<div class="row" style="justify-content:space-between"><h3 style="margin:0">旅後總結</h3>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="edit-memories">編輯</button></div>' +
      '<div class="row" style="margin-top:8px;gap:8px;flex-wrap:wrap">' +
      '<span class="pill">' + (mem.overallRating ? ('整體 ' + starsHtml(mem.overallRating)) : '尚未評分') + '</span>' +
      '<span class="pill">' + (mem.wouldReturn === true ? '會再來 ✓' : (mem.wouldReturn === false ? '暫時不想再來' : '是否再訪：未填')) + '</span>' +
      '</div>';
    if (mem.highlights && mem.highlights.length) {
      html += '<ul class="journal-highlights">' + mem.highlights.map(function (h) {
        return '<li>' + escapeHtml(h) + '</li>';
      }).join('') + '</ul>';
    } else {
      html += '<p class="muted" style="margin-top:8px">尚無亮點摘要</p>';
    }
    if (mem.postTripNote) {
      html += '<p class="journal-wrapup">' + escapeHtml(mem.postTripNote) + '</p>';
    }
    html += '</div>';

    if (!entries.length) {
      html += '<div class="card"><p class="muted">還沒有紀錄。旅途中就能寫；結束後當旅遊回憶冊繼續用。</p></div>';
    } else {
      entries.forEach(function (entry) {
        const mood = moodMeta(entry.mood);
        html += '<div class="card journal-entry" data-action="edit-journal" data-id="' + escapeHtml(entry.id) + '" role="button" tabindex="0">' +
          '<div class="row" style="justify-content:space-between;align-items:flex-start">' +
          '<div><div class="journal-date">' + escapeHtml(fmtDate(entry.date)) +
          (mood ? (' <span class="mood-chip" title="' + escapeHtml(mood.label) + '">' + mood.emoji + '</span>') : '') +
          '</div>' +
          '<strong class="journal-title">' + escapeHtml(entry.title || '（無標題）') + '</strong></div>' +
          (entry.rating ? '<span class="journal-stars" aria-label="評分">' + starsHtml(entry.rating) + '</span>' : '') +
          '</div>';
        if (entry.placeName) html += '<div class="faint" style="margin-top:4px">📍 ' + escapeHtml(entry.placeName) + '</div>';
        if (entry.body) {
          const preview = String(entry.body).trim().slice(0, 120);
          html += '<p class="journal-preview">' + escapeHtml(preview) + (entry.body.length > 120 ? '…' : '') + '</p>';
        }
        if (entry.tags && entry.tags.length) {
          html += '<div class="tag-row">' + entry.tags.map(function (tg) {
            return '<span class="tag-pill">' + escapeHtml(tg) + '</span>';
          }).join('') + '</div>';
        }
        if (entry.photos && entry.photos.length) {
          html += '<div class="photo-strip" data-photo-entry="' + escapeHtml(entry.id) + '">';
          entry.photos.forEach(function (ph) {
            html += '<div class="photo-thumb" data-photo-id="' + escapeHtml(ph.id) + '" data-entry-id="' + escapeHtml(entry.id) + '">' +
              (ph.dataUrl ? '<img src="' + ph.dataUrl + '" alt="">' : '<span class="photo-ph">📷</span>') +
              '</div>';
          });
          html += '</div>';
        }
        html += '</div>';
      });
    }
    el.innerHTML = html;
    hydrateJournalThumbs(trip);
  }

  function hydrateJournalThumbs(trip) {
    if (!window.TravelPhotos) return;
    const nodes = $$('.photo-thumb[data-photo-id]');
    nodes.forEach(function (node) {
      if (node.querySelector('img')) return;
      const entryId = node.getAttribute('data-entry-id');
      const photoId = node.getAttribute('data-photo-id');
      TravelPhotos.get(trip.id, entryId, photoId).then(function (row) {
        if (!row || !row.dataUrl) return;
        if (!node.isConnected) return;
        node.innerHTML = '<img src="' + row.dataUrl + '" alt="">';
      }).catch(function () {});
    });
  }

  function openJournalModal(trip, existing) {
    ensureTripShape(trip);
    const entry = existing || null;
    const moodOpts = '<option value="">（不選）</option>' + MOODS.map(function (m) {
      return '<option value="' + m.id + '"' + ((entry && entry.mood) === m.id ? ' selected' : '') + '>' + m.emoji + ' ' + m.label + '</option>';
    }).join('');
    const ratingOpts = '<option value="">（不評）</option>' + [1, 2, 3, 4, 5].map(function (n) {
      return '<option value="' + n + '"' + (String(entry && entry.rating) === String(n) ? ' selected' : '') + '>' + starsHtml(n) + ' ' + n + '</option>';
    }).join('');
    const today = new Date();
    const ymd = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    const draftPhotos = (entry && entry.photos) ? entry.photos.map(function (p) {
      return { id: p.id, name: p.name || '', dataUrl: p.dataUrl || null, _pending: false };
    }) : [];

    openModal(entry ? '編輯紀錄' : '新增紀錄',
      field('日期', 'date', entry ? entry.date : ymd, 'date') +
      field('標題', 'title', entry ? entry.title : '') +
      field('內文', 'body', entry ? entry.body : '', 'textarea') +
      field('心情', 'mood', moodOpts, 'select') +
      field('標籤（逗號分隔）', 'tags', entry && entry.tags ? entry.tags.join(', ') : '') +
      field('地點', 'placeName', entry ? entry.placeName : '') +
      field('評分', 'rating', ratingOpts, 'select') +
      '<div class="field"><label>照片</label>' +
      '<div id="journalPhotoPreview" class="photo-strip edit"></div>' +
      '<input type="file" id="f_photos" accept="image/*" multiple class="input">' +
      '<p class="faint" id="journalPhotoHint">會壓縮後存到本機（IndexedDB）；匯出 JSON 時一併帶出。</p></div>',
      function () {
        const title = val('title').trim();
        const body = val('body');
        if (!title && !body && !draftPhotos.length) { toast('請至少填標題、內文或照片'); return false; }
        const tags = val('tags').split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
        const ratingRaw = val('rating');
        const data = {
          date: val('date') || ymd,
          title: title || (val('date') || ymd) + ' 紀錄',
          body: body,
          mood: val('mood') || null,
          tags: tags,
          placeName: val('placeName').trim(),
          rating: ratingRaw ? Number(ratingRaw) : null
        };
        // Persist photos asynchronously then finish
        const targetId = entry ? entry.id : uid('jn');
        const savePhotos = Promise.all(draftPhotos.map(function (ph) {
          if (!ph) return null;
          if (ph.dataUrl && window.TravelPhotos) {
            return TravelPhotos.savePhoto(trip.id, targetId, ph);
          }
          return Promise.resolve({ id: ph.id, name: ph.name || '' });
        })).then(function (saved) {
          data.photos = (saved || []).filter(Boolean);
          data.updatedAt = new Date().toISOString();
          data.userEdited = true;
          if (entry) {
            Object.assign(entry, data);
            touchItem(entry);
          } else {
            data.id = targetId;
            data.createdAt = data.updatedAt;
            trip.journal = trip.journal || [];
            trip.journal.push(data);
            touchItem(data);
          }
          touchTrip(trip);
          persist(true);
          renderView();
          toast(entry ? '紀錄已更新' : '紀錄已新增');
        }).catch(function (err) {
          console.warn(err);
          toast('照片儲存失敗，仍會存文字');
          data.photos = draftPhotos.map(function (ph) { return { id: ph.id, name: ph.name || '', dataUrl: ph.dataUrl, _inline: !!ph.dataUrl }; });
          data.updatedAt = new Date().toISOString();
          data.userEdited = true;
          if (entry) Object.assign(entry, data);
          else { data.id = targetId; data.createdAt = data.updatedAt; trip.journal.push(data); }
          touchTrip(trip); persist(true); renderView();
        });
        // Keep modal open until async done — return false and close manually after
        savePhotos.finally(function () {
          const backdrop = $('#modalBackdrop');
          if (backdrop) backdrop.classList.remove('open');
          const ms = $('#modalSave');
          const mc = $('#modalCancel');
          const md = $('#modalDelete');
          if (ms) ms.onclick = null;
          if (mc) mc.onclick = null;
          if (md) { md.onclick = null; md.hidden = true; }
          renderTripSelect();
        });
        return false;
      },
      entry ? {
        onDelete: function () {
          const id = entry.id;
          trip.journal = (trip.journal || []).filter(function (j) { return j.id !== id; });
          if (window.TravelPhotos) TravelPhotos.removeEntry(trip.id, id);
          touchTrip(trip);
          toast('已刪除紀錄');
        }
      } : null
    );

    function paintPreview() {
      const box = $('#journalPhotoPreview');
      if (!box) return;
      box.innerHTML = draftPhotos.map(function (ph, idx) {
        const src = ph.dataUrl ? '<img src="' + ph.dataUrl + '" alt="">' : '<span class="photo-ph">📷</span>';
        return '<div class="photo-thumb">' + src +
          '<button type="button" class="photo-x" data-rm-photo="' + idx + '" aria-label="移除">×</button></div>';
      }).join('');
      // hydrate missing
      draftPhotos.forEach(function (ph, idx) {
        if (ph.dataUrl || !entry) return;
        if (!window.TravelPhotos) return;
        TravelPhotos.get(trip.id, entry.id, ph.id).then(function (row) {
          if (row && row.dataUrl) {
            ph.dataUrl = row.dataUrl;
            paintPreview();
          }
        }).catch(function () {});
      });
    }
    paintPreview();

    const fileInput = $('#f_photos');
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        const files = Array.from(fileInput.files || []);
        if (!files.length) return;
        const hint = $('#journalPhotoHint');
        if (hint) hint.textContent = '壓縮中…';
        Promise.all(files.map(function (f) {
          return TravelPhotos.compressBlob(f);
        })).then(function (compressed) {
          compressed.forEach(function (c) { draftPhotos.push(c); });
          paintPreview();
          if (hint) {
            const inline = !(TravelPhotos.isIdbAvailable && TravelPhotos.isIdbAvailable());
            hint.textContent = inline
              ? '此裝置無 IndexedDB，照片會壓縮後內嵌（請少放幾張）。'
              : '已壓縮；儲存後寫入 IndexedDB。';
          }
          fileInput.value = '';
        }).catch(function (err) {
          toast('照片處理失敗：' + (err.message || err));
          if (hint) hint.textContent = '照片處理失敗';
        });
      });
    }
    const previewHost = $('#journalPhotoPreview');
    if (previewHost) {
      previewHost.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-rm-photo]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-rm-photo'));
        const removed = draftPhotos.splice(idx, 1)[0];
        if (removed && entry && window.TravelPhotos) {
          TravelPhotos.remove(trip.id, entry.id, removed.id);
        }
        paintPreview();
      });
    }
  }

  /* ---------- Notes ---------- */
  function renderNotes(trip) {
    const el = $('#view-notes');
    el.innerHTML = '<div class="card"><h2>筆記</h2>' +
      '<textarea class="textarea" id="notesArea" placeholder="自由筆記、日記、提醒…">' + escapeHtml(trip.notes || '') + '</textarea>' +
      '<p class="faint" style="margin-top:8px">離開欄位即自動儲存</p></div>';
    const area = $('#notesArea');
    area.addEventListener('change', function () {
      trip.notes = area.value;
      touchTrip(trip);
      persist();
      toast('筆記已儲存');
    });
    area.addEventListener('input', function () {
      trip.notes = area.value;
      touchTrip(trip);
      persist();
    });
  }

  /* ---------- Modal helpers ---------- */
  function openModal(title, fieldsHtml, onSave, opts) {
    opts = opts || {};
    const backdrop = $('#modalBackdrop');
    $('#modalTitle').textContent = title;
    $('#modalFields').innerHTML = fieldsHtml;
    backdrop.classList.add('open');
    const first = $('#modalFields input, #modalFields select, #modalFields textarea');
    if (first) setTimeout(function () { first.focus(); }, 50);

    function cleanup() {
      backdrop.classList.remove('open');
      $('#modalSave').onclick = null;
      $('#modalCancel').onclick = null;
      $('#modalDelete').onclick = null;
      $('#modalDelete').hidden = true;
    }
    $('#modalCancel').onclick = function () { cleanup(); };
    $('#modalSave').onclick = function () {
      const ok = onSave();
      if (ok !== false) { cleanup(); persist(); renderView(); renderTripSelect(); }
    };
    if (opts.onDelete) {
      $('#modalDelete').hidden = false;
      $('#modalDelete').onclick = function () {
        if (confirm(opts.deleteConfirm || '確定刪除？')) {
          opts.onDelete();
          cleanup();
          persist(true);
          renderView();
          renderTripSelect();
        }
      };
    } else {
      $('#modalDelete').hidden = true;
    }
  }

  function field(label, name, value, type) {
    type = type || 'text';
    if (type === 'textarea') {
      return '<div class="field"><label for="f_' + name + '">' + label + '</label><textarea class="textarea" id="f_' + name + '">' + escapeHtml(value || '') + '</textarea></div>';
    }
    if (type === 'select') {
      return '<div class="field"><label for="f_' + name + '">' + label + '</label><select class="select" id="f_' + name + '">' + value + '</select></div>';
    }
    return '<div class="field"><label for="f_' + name + '">' + label + '</label><input class="input" id="f_' + name + '" type="' + type + '" value="' + escapeHtml(value || '') + '"></div>';
  }
  function val(name) { return ($('#f_' + name) || {}).value || ''; }

  /* ---------- Actions ---------- */
  function onClick(e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    // checkboxes: only process on change to avoid double-toggle
    if (t.matches && t.matches('input[type="checkbox"]') && e.type === 'click') return;
    const action = t.dataset.action;
    const trip = activeTrip();

    if (action === 'nav') {
      setView(t.dataset.view);
      return;
    }
    if (action === 'more') {
      $('#moreMenu').classList.toggle('open');
      return;
    }
    if (action === 'open-detail') {
      var details = lookupDetails(t.dataset.kind, t.dataset.id, t.dataset.day);
      openDetail(details, t);
      return;
    }
    if (action === 'close-detail') {
      closeDetailDialog();
      return;
    }
    if (action === 'open-lightbox') {
      var host = $('#detailDialog');
      var d = host && host._details;
      openLightbox(d, parseInt(t.dataset.idx, 10) || 0);
      return;
    }
    if (action === 'close-lightbox') {
      closeLightbox();
      return;
    }

    if (action === 'edit-trip-meta') {
      openModal('編輯旅程', field('標題', 'title', trip.title) + field('目的地', 'dest', trip.destination) + field('出發日', 'start', trip.startDate, 'date') + field('回程日', 'end', trip.endDate, 'date'), function () {
        trip.title = val('title').trim() || trip.title;
        trip.destination = val('dest').trim();
        trip.startDate = val('start');
        trip.endDate = val('end');
        touchTrip(trip);
        toast('已更新');
      });
      return;
    }
    if (action === 'edit-goals') {
      openModal('編輯目標', field('目標（一行一個）', 'goals', (trip.goals || []).join('\n'), 'textarea'), function () {
        trip.goals = val('goals').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        touchTrip(trip);
        toast('目標已更新');
      });
      return;
    }
    if (action === 'add-deadline' || action === 'edit-deadline') {
      const existing = action === 'edit-deadline' ? (trip.deadlines || []).find(function (d) { return d.id === t.dataset.id; }) : null;
      openModal(existing ? '編輯期限' : '新增期限',
        field('名稱', 'label', existing ? existing.label : '') + field('日期', 'date', existing ? existing.date : '', 'date') + field('備註', 'note', existing ? existing.note : ''),
        function () {
          if (!val('label').trim()) { toast('請填名稱'); return false; }
          if (existing) {
            existing.label = val('label').trim();
            existing.date = val('date');
            existing.note = val('note').trim();
            touchItem(existing);
          } else {
            trip.deadlines = trip.deadlines || [];
            var nd = { id: uid('dl'), label: val('label').trim(), date: val('date'), note: val('note').trim() };
            touchItem(nd);
            trip.deadlines.push(nd);
          }
          touchTrip(trip);
        },
        existing ? { onDelete: function () { trip.deadlines = trip.deadlines.filter(function (d) { return d.id !== existing.id; }); touchTrip(trip); toast('已刪除'); } } : null
      );
      return;
    }
    if (action === 'del-deadline') {
      if (!confirm('刪除此期限？')) return;
      trip.deadlines = (trip.deadlines || []).filter(function (d) { return d.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView(); toast('已刪除');
      return;
    }
    if (action === 'new-blank') {
      const blank = TravelSeed.blankTrip({ title: '新旅程' });
      state.trips.push(blank);
      state.activeTripId = blank.id;
      persist(true); renderTripSelect(); setView('overview'); toast('已建立空白旅程');
      return;
    }
    if (action === 'rename-trip') {
      openModal('重新命名', field('標題', 'title', trip.title), function () {
        trip.title = val('title').trim() || trip.title;
        touchTrip(trip); toast('已重新命名');
      });
      return;
    }
    if (action === 'toggle-archive') {
      trip.archived = !trip.archived;
      touchTrip(trip); persist(true); renderTripSelect(); renderView();
      toast(trip.archived ? '已封存' : '已取消封存');
      return;
    }
    if (action === 'delete-trip') {
      if (state.trips.length <= 1) { toast('至少保留一個旅程'); return; }
      if (!confirm('確定刪除「' + trip.title + '」？此動作無法復原（除非你有匯出備份）。')) return;
      state.trips = state.trips.filter(function (x) { return x.id !== trip.id; });
      state.activeTripId = state.trips[0].id;
      persist(true); renderTripSelect(); setView('overview'); toast('已刪除旅程');
      return;
    }
    if (action === 'export') {
      const name = 'travel-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      toast('準備匯出…');
      const done = function (json) {
        TravelStorage.download(name, json);
        toast('已匯出');
      };
      if (TravelStorage.exportJsonAsync) {
        TravelStorage.exportJsonAsync(state).then(done).catch(function () {
          done(TravelStorage.exportJson(state));
        });
      } else {
        done(TravelStorage.exportJson(state));
      }
      return;
    }
    if (action === 'lock') {
      if (window.TravelAuth) TravelAuth.lock();
      return;
    }
    if (action === 'import') {
      const imp = $('#importFile');
      if (imp) imp.click();
      else toast('找不到匯入元件');
      return;
    }

    /* journal / memories */
    if (action === 'add-journal') {
      openJournalModal(trip, null);
      return;
    }
    if (action === 'edit-journal') {
      const jn = (trip.journal || []).find(function (x) { return x.id === t.dataset.id; });
      if (!jn) return;
      openJournalModal(trip, jn);
      return;
    }
    if (action === 'edit-memories') {
      ensureTripShape(trip);
      const mem = trip.memories || defaultMemories();
      const wrOpts = [
        '<option value=""' + (mem.wouldReturn == null ? ' selected' : '') + '>未填</option>',
        '<option value="yes"' + (mem.wouldReturn === true ? ' selected' : '') + '>會再來</option>',
        '<option value="no"' + (mem.wouldReturn === false ? ' selected' : '') + '>暫時不想</option>'
      ].join('');
      const ratingOpts = '<option value="">（不評）</option>' + [1, 2, 3, 4, 5].map(function (n) {
        return '<option value="' + n + '"' + (String(mem.overallRating) === String(n) ? ' selected' : '') + '>' + starsHtml(n) + ' ' + n + '</option>';
      }).join('');
      openModal('旅後總結',
        field('整體評分', 'overallRating', ratingOpts, 'select') +
        field('還會再來嗎', 'wouldReturn', wrOpts, 'select') +
        field('亮點（一行一個）', 'highlights', (mem.highlights || []).join('\n'), 'textarea') +
        field('總結短語', 'postTripNote', mem.postTripNote || '', 'textarea'),
        function () {
          const wr = val('wouldReturn');
          trip.memories = {
            highlights: val('highlights').split('\n').map(function (s) { return s.trim(); }).filter(Boolean),
            wouldReturn: wr === 'yes' ? true : (wr === 'no' ? false : null),
            overallRating: val('overallRating') ? Number(val('overallRating')) : null,
            postTripNote: val('postTripNote').trim(),
            updatedAt: new Date().toISOString(),
            userEdited: true
          };
          touchTrip(trip);
          toast('旅後總結已更新');
        }
      );
      return;
    }

    /* todos */
    if (action === 'add-todo-group') {
      openModal('新增群組', field('群組名稱', 'name', ''), function () {
        const name = val('name').trim();
        if (!name) { toast('請填名稱'); return false; }
        trip.todoGroups = trip.todoGroups || [];
        var ng = { id: uid('tg'), name: name, items: [] };
        touchItem(ng);
        trip.todoGroups.push(ng);
        touchTrip(trip); toast('已新增群組');
      });
      return;
    }
    if (action === 'rename-group') {
      const g = trip.todoGroups.find(function (x) { return x.id === t.dataset.gid; });
      if (!g) return;
      openModal('群組改名', field('名稱', 'name', g.name), function () {
        g.name = val('name').trim() || g.name; touchItem(g); touchTrip(trip);
      });
      return;
    }
    if (action === 'del-group') {
      if (!confirm('刪除此群組與所有項目？')) return;
      trip.todoGroups = trip.todoGroups.filter(function (x) { return x.id !== t.dataset.gid; });
      touchTrip(trip); persist(true); renderView();
      return;
    }
    if (action === 'add-todo' || action === 'edit-todo') {
      const g = trip.todoGroups.find(function (x) { return x.id === t.dataset.gid; });
      if (!g) return;
      const item = action === 'edit-todo' ? g.items.find(function (i) { return i.id === t.dataset.id; }) : null;
      openModal(item ? '編輯待辦' : '新增待辦',
        field('內容', 'text', item ? item.text : '') + field('期限提示', 'due', item ? item.due : '') + field('備註', 'note', item ? item.note : ''),
        function () {
          if (!val('text').trim()) { toast('請填內容'); return false; }
          if (item) {
            item.text = val('text').trim(); item.due = val('due').trim(); item.note = val('note').trim();
            touchItem(item);
          } else {
            var nt = { id: uid('td'), text: val('text').trim(), done: false, due: val('due').trim(), note: val('note').trim() };
            touchItem(nt);
            g.items.push(nt);
          }
          touchTrip(trip);
        },
        item ? { onDelete: function () { g.items = g.items.filter(function (i) { return i.id !== item.id; }); touchTrip(trip); } } : null
      );
      return;
    }
    if (action === 'toggle-todo') {
      const g = trip.todoGroups.find(function (x) { return x.id === t.dataset.gid; });
      const item = g && g.items.find(function (i) { return i.id === t.dataset.id; });
      if (item) { item.done = !!t.checked; touchItem(item); touchTrip(trip); persist(); renderView(); }
      return;
    }
    if (action === 'del-todo') {
      const g = trip.todoGroups.find(function (x) { return x.id === t.dataset.gid; });
      if (!g) return;
      g.items = g.items.filter(function (i) { return i.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView();
      return;
    }

    /* bookings */
    if (action === 'add-booking' || action === 'edit-booking') {
      const b = action === 'edit-booking' ? trip.bookings.find(function (x) { return x.id === t.dataset.id; }) : null;
      const opts = BOOKING_TYPES.map(function (x) {
        return '<option value="' + x.value + '"' + ((b ? b.type : 'flight') === x.value ? ' selected' : '') + '>' + x.ico + ' ' + x.label + '</option>';
      }).join('');
      const st = ['confirmed', 'todo', 'cancelled'].map(function (s) {
        return '<option value="' + s + '"' + ((b ? b.status : 'todo') === s ? ' selected' : '') + '>' + STATUS_LABEL[s] + '</option>';
      }).join('');
      openModal(b ? '編輯訂單' : '新增訂單',
        field('類型', 'type', opts, 'select') + field('標題', 'title', b ? b.title : '') + field('詳情', 'detail', b ? b.detail : '', 'textarea') +
        field('代號／PNR', 'ref', b ? b.ref : '') + field('狀態', 'status', st, 'select') + field('備註', 'note', b ? b.note : ''),
        function () {
          if (!val('title').trim()) { toast('請填標題'); return false; }
          const data = { type: val('type'), title: val('title').trim(), detail: val('detail').trim(), ref: val('ref').trim(), status: val('status'), note: val('note').trim() };
          if (b) { Object.assign(b, data); touchItem(b); }
          else { data.id = uid('bk'); touchItem(data); trip.bookings = trip.bookings || []; trip.bookings.push(data); }
          touchTrip(trip);
        },
        b ? { onDelete: function () { trip.bookings = trip.bookings.filter(function (x) { return x.id !== b.id; }); touchTrip(trip); } } : null
      );
      return;
    }
    if (action === 'del-booking') {
      trip.bookings = trip.bookings.filter(function (x) { return x.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView();
      return;
    }

    /* itinerary */
    if (action === 'add-day' || action === 'edit-day') {
      const day = action === 'edit-day' ? trip.days.find(function (d) { return d.id === t.dataset.id; }) : null;
      openModal(day ? '編輯行程日' : '新增一天',
        field('日期', 'date', day ? day.date : '', 'date') + field('標題', 'title', day ? day.title : ''),
        function () {
          if (day) { day.date = val('date'); day.title = val('title').trim(); touchItem(day); }
          else {
            trip.days = trip.days || [];
            var nday = { id: uid('day'), date: val('date'), title: val('title').trim(), blocks: [] };
            touchItem(nday);
            trip.days.push(nday);
          }
          touchTrip(trip);
        },
        day ? { onDelete: function () { trip.days = trip.days.filter(function (d) { return d.id !== day.id; }); touchTrip(trip); } } : null
      );
      return;
    }
    if (action === 'del-day') {
      if (!confirm('刪除此日？')) return;
      trip.days = trip.days.filter(function (d) { return d.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView();
      return;
    }
    if (action === 'add-block' || action === 'edit-block') {
      const day = trip.days.find(function (d) { return d.id === (t.dataset.day || t.dataset.id); });
      if (!day) return;
      const bl = action === 'edit-block' ? (day.blocks || []).find(function (b) { return b.id === t.dataset.id; }) : null;
      const dayId = day.id;
      openModal(bl ? '編輯區塊' : '新增區塊',
        field('時間', 'time', bl ? bl.time : '') + field('內容', 'text', bl ? bl.text : '', 'textarea') + field('地點', 'place', bl ? bl.place : ''),
        function () {
          if (!val('text').trim()) { toast('請填內容'); return false; }
          if (bl) { bl.time = val('time').trim(); bl.text = val('text').trim(); bl.place = val('place').trim(); touchItem(bl); }
          else {
            day.blocks = day.blocks || [];
            var nb = { id: uid('bl'), time: val('time').trim(), text: val('text').trim(), place: val('place').trim() };
            touchItem(nb);
            day.blocks.push(nb);
          }
          touchTrip(trip);
        },
        bl ? { onDelete: function () {
          const d = trip.days.find(function (x) { return x.id === dayId; });
          if (d) d.blocks = d.blocks.filter(function (b) { return b.id !== bl.id; });
          touchTrip(trip);
        } } : null
      );
      return;
    }
    if (action === 'del-block') {
      const day = trip.days.find(function (d) { return d.id === t.dataset.day; });
      if (!day) return;
      day.blocks = day.blocks.filter(function (b) { return b.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView();
      return;
    }

    /* places */
    if (action === 'add-place' || action === 'edit-place') {
      const p = action === 'edit-place' ? trip.places.find(function (x) { return x.id === t.dataset.id; }) : null;
      openModal(p ? '編輯地點' : '新增地點',
        field('名稱', 'name', p ? p.name : '') + field('分類', 'category', p ? p.category : '') + field('備註', 'note', p ? p.note : '', 'textarea') +
        field('連結 URL', 'url', p ? p.url : '') + field('地圖 URL', 'mapsUrl', p ? p.mapsUrl : ''),
        function () {
          if (!val('name').trim()) { toast('請填名稱'); return false; }
          const data = { name: val('name').trim(), category: val('category').trim(), note: val('note').trim(), url: val('url').trim(), mapsUrl: val('mapsUrl').trim() };
          if (p) { Object.assign(p, data); touchItem(p); }
          else { data.id = uid('pl'); touchItem(data); trip.places = trip.places || []; trip.places.push(data); }
          touchTrip(trip);
        },
        p ? { onDelete: function () { trip.places = trip.places.filter(function (x) { return x.id !== p.id; }); touchTrip(trip); } } : null
      );
      return;
    }
    if (action === 'del-place') {
      trip.places = trip.places.filter(function (x) { return x.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView();
      return;
    }

    /* shopping */
    if (action === 'add-shop' || action === 'edit-shop') {
      const item = action === 'edit-shop' ? trip.shopping.find(function (x) { return x.id === t.dataset.id; }) : null;
      openModal(item ? '編輯購物' : '新增購物',
        field('項目', 'text', item ? item.text : '') + field('備註', 'note', item ? item.note : ''),
        function () {
          if (!val('text').trim()) { toast('請填項目'); return false; }
          if (item) { item.text = val('text').trim(); item.note = val('note').trim(); touchItem(item); }
          else {
            var ns = { id: uid('sh'), text: val('text').trim(), done: false, note: val('note').trim() };
            touchItem(ns);
            trip.shopping = trip.shopping || [];
            trip.shopping.push(ns);
          }
          touchTrip(trip);
        },
        item ? { onDelete: function () { trip.shopping = trip.shopping.filter(function (x) { return x.id !== item.id; }); touchTrip(trip); } } : null
      );
      return;
    }
    if (action === 'toggle-shop') {
      const item = trip.shopping.find(function (x) { return x.id === t.dataset.id; });
      if (item) { item.done = !!t.checked; touchItem(item); touchTrip(trip); persist(); renderView(); }
      return;
    }
    if (action === 'del-shop') {
      trip.shopping = trip.shopping.filter(function (x) { return x.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView();
      return;
    }

    /* packing */
    if (action === 'add-pack-cat') {
      openModal('新增打包分類', field('分類名稱', 'name', ''), function () {
        const name = val('name').trim();
        if (!name) { toast('請填名稱'); return false; }
        trip.packing = trip.packing || [];
        var npc = { id: uid('pk'), category: name, items: [] };
        touchItem(npc);
        trip.packing.push(npc);
        touchTrip(trip);
      });
      return;
    }
    if (action === 'rename-pack-cat') {
      const cat = trip.packing.find(function (c) { return c.id === t.dataset.cid; });
      if (!cat) return;
      openModal('分類改名', field('名稱', 'name', cat.category), function () {
        cat.category = val('name').trim() || cat.category; touchItem(cat); touchTrip(trip);
      });
      return;
    }
    if (action === 'del-pack-cat') {
      if (!confirm('刪除此分類？')) return;
      trip.packing = trip.packing.filter(function (c) { return c.id !== t.dataset.cid; });
      touchTrip(trip); persist(true); renderView();
      return;
    }
    if (action === 'add-pack-item' || action === 'edit-pack') {
      const cat = trip.packing.find(function (c) { return c.id === t.dataset.cid; });
      if (!cat) return;
      const item = action === 'edit-pack' ? cat.items.find(function (i) { return i.id === t.dataset.id; }) : null;
      openModal(item ? '編輯打包項目' : '新增打包項目', field('項目', 'text', item ? item.text : ''), function () {
        if (!val('text').trim()) { toast('請填項目'); return false; }
        if (item) { item.text = val('text').trim(); touchItem(item); }
        else {
          cat.items = cat.items || [];
          var npi = { id: uid('pi'), text: val('text').trim(), done: false };
          touchItem(npi);
          cat.items.push(npi);
        }
        touchTrip(trip);
      }, item ? { onDelete: function () { cat.items = cat.items.filter(function (i) { return i.id !== item.id; }); touchTrip(trip); } } : null);
      return;
    }
    if (action === 'toggle-pack') {
      const cat = trip.packing.find(function (c) { return c.id === t.dataset.cid; });
      const item = cat && cat.items.find(function (i) { return i.id === t.dataset.id; });
      if (item) { item.done = !!t.checked; touchItem(item); touchTrip(trip); persist(); renderView(); }
      return;
    }
    if (action === 'del-pack') {
      const cat = trip.packing.find(function (c) { return c.id === t.dataset.cid; });
      if (!cat) return;
      cat.items = cat.items.filter(function (i) { return i.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView();
      return;
    }

    /* expenses */
    if (action === 'add-expense' || action === 'edit-expense') {
      const ex = action === 'edit-expense' ? trip.expenses.find(function (x) { return x.id === t.dataset.id; }) : null;
      const curStatus = ex ? ex.status : 'expected';
      const st = ['paid', 'expected'].map(function (s) {
        return '<option value="' + s + '"' + (curStatus === s ? ' selected' : '') + '>' + EXP_STATUS[s] + '</option>';
      }).join('');
      const estDefault = ex ? (ex.estimateTwd != null ? ex.estimateTwd : (ex.status === 'paid' ? ex.twd : 0)) : '0';
      const twdDefault = (ex && ex.status === 'paid') ? (ex.twd != null ? ex.twd : 0) : '';
      openModal(ex ? '編輯花費' : '新增花費',
        field('日期', 'date', ex ? ex.date : '', 'date') + field('項目', 'item', ex ? ex.item : '') + field('商家', 'merchant', ex ? ex.merchant : '') +
        field('金額（原幣／規劃）', 'amount', ex ? ex.amount : '0', 'number') + field('幣別', 'currency', ex ? ex.currency : 'TWD') +
        '<div class="field"><label for="f_twd">實際 TWD</label><input class="input" id="f_twd" type="number" value="' +
        escapeHtml(String(twdDefault)) + '" placeholder="已付後再填"></div>' +
        field('預估 TWD', 'estimateTwd', estDefault, 'number') +
        field('狀態', 'status', st, 'select') +
        field('卡別／付款', 'card', ex ? ex.card : '') + field('備註', 'note', ex ? ex.note : '') +
        '<div class="field"><label class="check-label"><input type="checkbox" id="f_excludeFromEstimate"' +
        (ex && ex.excludeFromEstimate ? ' checked' : '') + '> 不計入已付與總預估</label></div>' +
        '<p class="faint" style="margin:0">預計＝只有預估、沒有實際；改成已付時若實際空白會帶入預估。</p>',
        function () {
          if (!val('item').trim()) { toast('請填項目'); return false; }
          const exclEl = $('#f_excludeFromEstimate');
          const status = val('status');
          let twd = Number(val('twd'));
          if (!Number.isFinite(twd)) twd = 0;
          let estimateTwd = Number(val('estimateTwd'));
          if (!Number.isFinite(estimateTwd)) estimateTwd = 0;
          if (status === 'expected') {
            twd = 0;
          } else if (status === 'paid') {
            // switching expected→paid with empty actual: default from estimate
            if ((!val('twd') || !Number(val('twd'))) && estimateTwd > 0) twd = estimateTwd;
            if (!estimateTwd && twd) estimateTwd = twd;
          }
          const data = {
            date: val('date'), item: val('item').trim(), merchant: val('merchant').trim(),
            amount: Number(val('amount')) || 0, currency: val('currency').trim() || 'TWD',
            twd: twd,
            estimateTwd: estimateTwd,
            excludeFromEstimate: !!(exclEl && exclEl.checked),
            status: status, card: val('card').trim(), note: val('note').trim()
          };
          if (ex) { Object.assign(ex, data); touchItem(ex); }
          else { data.id = uid('ex'); touchItem(data); trip.expenses = trip.expenses || []; trip.expenses.push(data); }
          touchTrip(trip);
        },
        ex ? { onDelete: function () { trip.expenses = trip.expenses.filter(function (x) { return x.id !== ex.id; }); touchTrip(trip); } } : null
      );
      // live: when status flips to expected, clear actual field display
      const statusEl = $('#f_status');
      const twdEl = $('#f_twd');
      if (statusEl && twdEl) {
        statusEl.addEventListener('change', function () {
          if (statusEl.value === 'expected') {
            twdEl.value = '';
            twdEl.placeholder = '已付後再填';
          } else if (!twdEl.value) {
            const est = Number(($('#f_estimateTwd') || {}).value) || 0;
            if (est) twdEl.value = String(est);
          }
        });
      }
      return;
    }
    if (action === 'expense-filter') {
      expenseFilter = t.dataset.filter || 'all';
      try { localStorage.setItem(EXP_FILTER_KEY, expenseFilter); } catch (_) {}
      renderView();
      return;
    }
    if (action === 'toggle-expense-estimate') {
      const ex = trip.expenses.find(function (x) { return x.id === t.dataset.id; });
      if (!ex) return;
      ex.excludeFromEstimate = !ex.excludeFromEstimate;
      touchItem(ex); touchTrip(trip); persist(true); renderView();
      toast(ex.excludeFromEstimate ? '已不計入合計' : '已計入合計');
      return;
    }
    if (action === 'del-expense') {
      trip.expenses = trip.expenses.filter(function (x) { return x.id !== t.dataset.id; });
      touchTrip(trip); persist(true); renderView();
      return;
    }
  }

  function bind() {
    if (bind._doc) return;
    bind._doc = true;
    document.addEventListener('click', onClick);
    document.addEventListener('dragstart', function (e) {
      onItineraryDragStart(e);
      onListDragStart(e);
    });
    document.addEventListener('dragend', function (e) {
      onItineraryDragEnd(e);
      onListDragEnd(e);
    });
    document.addEventListener('dragover', function (e) {
      onItineraryDragOver(e);
      onListDragOver(e);
    });
    document.addEventListener('drop', function (e) {
      onItineraryDrop(e);
      onListDrop(e);
    });
    document.addEventListener('dragleave', function (e) {
      if (itineraryDrag) {
        const card = e.target.closest && e.target.closest('.day-card');
        if (card && !card.contains(e.relatedTarget)) card.classList.remove('drag-over');
      }
      if (listDrag && listDrag.kind === 'pack') {
        const pcard = e.target.closest && e.target.closest('.pack-cat-card');
        if (pcard && !pcard.contains(e.relatedTarget)) pcard.classList.remove('drag-over');
      }
    });
    document.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'tripSelect') {
        state.activeTripId = e.target.value;
        persist(true);
        syncTripSelectLabel();
        updateDataStamp();
        renderView();
        toast('已切換旅程');
      }
      if (e.target && e.target.matches('input[type=checkbox][data-action]')) {
        /* toggles handled in click for some browsers; also handle change */
        onClick(e);
      }
    });
    const importEl = $('#importFile');
    if (importEl && !importEl.__bound) {
      importEl.__bound = true;
      importEl.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const data = TravelStorage.importJson(String(reader.result));
            if (!confirm('匯入會覆蓋目前本機所有旅程資料，確定？')) return;
            state = data;
            ensureValidState(false);
            const restore = (window.TravelPhotos && TravelPhotos.savePhoto)
              ? Promise.all((state.trips || []).map(function (trip) {
                  return Promise.all((trip.journal || []).map(function (entry) {
                    return Promise.all((entry.photos || []).map(function (ph) {
                      if (!ph || !ph.dataUrl) return null;
                      return TravelPhotos.savePhoto(trip.id, entry.id, ph).then(function (meta) {
                        // replace with meta (no dataUrl in state)
                        Object.keys(ph).forEach(function (k) { delete ph[k]; });
                        Object.assign(ph, meta);
                      });
                    }));
                  }));
                }))
              : Promise.resolve();
            restore.then(function () {
              TravelStorage.save(state);
              renderTripSelect();
              setView('overview');
              toast('匯入成功');
            }).catch(function (err) {
              console.warn(err);
              TravelStorage.save(state);
              renderTripSelect();
              setView('overview');
              toast('匯入成功（部分照片未寫入）');
            });
          } catch (err) {
            toast('匯入失敗：' + (err.message || err));
          }
          e.target.value = '';
        };
        reader.readAsText(file, 'utf-8');
      });
    }
    const backdrop = $('#modalBackdrop');
    if (backdrop && !backdrop.__bound) {
      backdrop.__bound = true;
      backdrop.addEventListener('click', function (e) {
        if (e.target.id === 'modalBackdrop') {
          $('#modalBackdrop').classList.remove('open');
        }
      });
    }
    if (!bind._keys) {
      bind._keys = true;
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          const lb = $('#lightboxDialog');
          if (lb && lb.open) { closeLightbox(); return; }
          const dd = $('#detailDialog');
          if (dd && dd.open) { closeDetailDialog(); return; }
          const mb = $('#modalBackdrop');
          if (mb) mb.classList.remove('open');
        }
      });
    }
  }

  function buildNav() {
    const nav = $('#bottomNav');
    let html = '';
    PRIMARY_NAV.forEach(function (id) {
      const v = VIEWS.find(function (x) { return x.id === id; });
      html += '<button type="button" class="nav-item" data-action="nav" data-view="' + id + '"><span class="ico" aria-hidden="true">' + v.ico + '</span><span>' + v.label + '</span></button>';
    });
    html += '<div class="nav-more-wrap"><button type="button" class="nav-item" data-action="more" aria-haspopup="true"><span class="ico" aria-hidden="true">⋯</span><span>更多</span></button>';
    html += '<div class="more-menu" id="moreMenu">';
    MORE_NAV.forEach(function (id) {
      const v = VIEWS.find(function (x) { return x.id === id; });
      html += '<button type="button" data-action="nav" data-view="' + id + '">' + v.ico + ' ' + v.label + '</button>';
    });
    html += '</div></div>';
    nav.innerHTML = html;
  }

  function startUi() {
    buildNav();
    // Paint trip select BEFORE bind so a bind error cannot leave dropdown empty
    ensureValidState(false);
    renderTripSelect();
    const hash = (location.hash || '').replace(/^#/, '');
    const start = VIEWS.some(function (v) { return v.id === hash; }) ? hash : 'overview';
    setView(start);
    updateDataStamp();
    try {
      bind();
    } catch (err) {
      console.error('bind failed (UI already painted)', err);
    }

    if ('serviceWorker' in navigator) {
      const swUrl = new URL('sw.js', location.href).pathname;
      navigator.serviceWorker.register(swUrl).catch(function (err) {
        console.warn('SW register failed', err);
      });
    }
  }

  function applyMergedState(merged, opts) {
    opts = opts || {};
    if (!merged || !Array.isArray(merged.trips) || !merged.trips.length) return false;
    state = merged;
    ensureValidState(false);
    TravelStorage.save(state);
    renderTripSelect();
    renderView();
    updateDataStamp();
    if (opts.toastRemote) toast('已載入雲端行程資料');
    return true;
  }

  function bootApp() {
    // Sync-first paint: never wait on network for #tripSelect options
    var hadLocal = false;
    var local = null;
    try { local = TravelStorage.load(); } catch (e) { local = null; }
    if (local && Array.isArray(local.trips) && local.trips.length) {
      state = local;
      hadLocal = true;
    } else {
      state = TravelSeed.defaultState();
      TravelStorage.save(state);
    }
    ensureValidState(false);
    if (!state.trips || !state.trips.length) {
      state = TravelSeed.defaultState();
      TravelStorage.save(state);
    } else if (hadLocal) {
      // Persist one-time cleanup (drop leftover「金額請自行補上」placeholders)
      TravelStorage.save(state);
    }
    startUi();

    // Background Notion remote merge (8s timeout inside fetchRemote)
    if (window.TravelSync && TravelSync.loadMergedState) {
      TravelSync.loadMergedState(TravelSeed.defaultState).then(function (merged) {
        applyMergedState(merged, { toastRemote: !hadLocal && !!(merged && merged.syncedAt) });
      }).catch(function (err) {
        console.warn('background sync failed', err);
      });
    }
  }

  function init() {
    if (window.TravelAuth && TravelAuth.requireUnlock) {
      TravelAuth.requireUnlock(bootApp);
    } else {
      bootApp();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
