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
    var idRemap = {};
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
      // Fingerprint match with a different id: adopt the stable remote id so the
      // pair stays linked after Notion edits the text (root cause of duplicates).
      // Journal keeps local ids (photos in IndexedDB are keyed by entry).
      var adoptId = loc.id;
      if (kind !== 'journal' && remoteItem.id && loc.id !== remoteItem.id && !byId[remoteItem.id]) {
        adoptId = remoteItem.id;
      }
      if (localWins(loc, remoteItem)) {
        merged = clone(loc);
      } else {
        merged = clone(remoteItem);
        if (loc.userEdited) merged.userEdited = true;
      }
      merged.id = adoptId;
      if (adoptId !== loc.id) idRemap[loc.id] = adoptId;
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

    // Prefer local array order (preserves DnD reorder). Remote-only items append.
    if (localArr.length) {
      var byId = {};
      var byFp = {};
      result.forEach(function (it) {
        if (!it) return;
        if (it.id) byId[it.id] = it;
        var fp = fingerprint(kind, it);
        if (fp) byFp[fp] = it;
      });
      var ordered = [];
      var seen = {};
      function mark(it) {
        var k = it.id ? ('id:' + it.id) : ('fp:' + fingerprint(kind, it));
        if (seen[k]) return false;
        seen[k] = true;
        return true;
      }
      localArr.forEach(function (loc) {
        if (!loc) return;
        var m = null;
        if (loc.id && idRemap[loc.id] && byId[idRemap[loc.id]]) m = byId[idRemap[loc.id]];
        else if (loc.id && byId[loc.id]) m = byId[loc.id];
        else {
          var fp = fingerprint(kind, loc);
          if (fp && byFp[fp]) m = byFp[fp];
        }
        if (m && mark(m)) ordered.push(m);
      });
      result.forEach(function (it) {
        if (!it) return;
        if (mark(it)) ordered.push(it);
      });
      return ordered;
    }

    return result;
  }


  /**
   * Merge optional `details` panels.
   * - If local.userEdited: keep local details (including absence).
   * - Else prefer remote details when present.
   * - Never wipe local-only details when remote has none.
   */
  function mergeDetailsField(merged, loc, rem) {
    loc = loc || {};
    rem = rem || {};
    var locD = loc.details;
    var remD = rem.details;
    // If user edited AND already has local details, keep them.
    // If user only toggled/edited other fields (no local details), still accept remote details.
    if (loc.userEdited && locD) {
      merged.details = clone(locD);
      return merged;
    }
    if (remD) {
      merged.details = clone(remD);
    } else if (locD) {
      merged.details = clone(locD);
    }
    return merged;
  }

  function withDetailsMerge(merged, loc, rem) {
    return mergeDetailsField(merged, loc, rem);
  }

  /**
   * Remote children that already live in a *different* local container
   * (user drag-moved a block to another day / todo to another group) must not
   * be re-added to their remote container, or they show up twice.
   */
  function filterCrossContainer(localContainers, childKey, kind, thisLocal, remoteChildren) {
    var ids = {};
    var fps = {};
    (localContainers || []).forEach(function (c) {
      if (!c || c === thisLocal) return;
      (c[childKey] || []).forEach(function (it) {
        if (!it) return;
        if (it.id) ids[it.id] = true;
        var fp = fingerprint(kind, it);
        if (fp) fps[fp] = true;
      });
    });
    var mine = (thisLocal && thisLocal[childKey]) || [];
    return (remoteChildren || []).filter(function (rit) {
      if (!rit) return false;
      var fp = fingerprint(kind, rit);
      var inThis = mine.some(function (li) {
        return li && ((rit.id && li.id === rit.id) || fingerprint(kind, li) === fp);
      });
      if (inThis) return true;
      if (rit.id && ids[rit.id]) return false;
      if (fp && fps[fp]) return false;
      return true;
    });
  }

  function mergeTodoGroups(localGroups, remoteGroups) {
    return mergeList(localGroups, remoteGroups, 'todoGroup', function (merged, loc, rem) {
      var localItems = (loc && loc.items) || [];
      var remoteItems = filterCrossContainer(localGroups, 'items', 'todo', loc, (rem && rem.items) || []);
      // If group-level local wins, still merge items so new remote todos appear
      merged.items = mergeList(localItems, remoteItems, 'todo', withDetailsMerge);
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
      var remoteBlocks = filterCrossContainer(localDays, 'blocks', 'block', loc, (rem && rem.blocks) || []);
      merged.blocks = mergeList(localBlocks, remoteBlocks, 'block', withDetailsMerge);
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
    // Track items that already live in some local category (cross-cat DnD).
    var localItemIds = {};
    var localItemFps = {};
    (localPack || []).forEach(function (cat) {
      (cat.items || []).forEach(function (it) {
        if (!it) return;
        if (it.id) localItemIds[it.id] = true;
        var fp = fingerprint('packItem', it);
        if (fp) localItemFps[fp] = true;
      });
    });
    return mergeList(localPack, remotePack, 'packCat', function (merged, loc, rem) {
      var localItems = (loc && loc.items) || [];
      var remoteItems = (rem && rem.items) || [];
      var filteredRemote = remoteItems.filter(function (rit) {
        if (!rit) return false;
        var inThis = localItems.some(function (li) {
          if (!li) return false;
          if (rit.id && li.id === rit.id) return true;
          return fingerprint('packItem', li) === fingerprint('packItem', rit);
        });
        if (inThis) return true;
        if (rit.id && localItemIds[rit.id]) return false;
        var fp = fingerprint('packItem', rit);
        if (fp && localItemFps[fp]) return false;
        return true;
      });
      merged.items = mergeList(localItems, filteredRemote, 'packItem');
      if (localWins(loc, rem)) {
        merged.category = loc.category;
        if (loc.userEdited) merged.userEdited = true;
        if (loc.updatedAt) merged.updatedAt = loc.updatedAt;
      }
      return merged;
    });
  }

  /* ---------- Duplicate cleanup (one-time + every load; idempotent) ---------- */

  /**
   * Old-seed / old-Notion texts (random ids from the first app version) mapped
   * to the stable remote id that replaced them. Key = fingerprint().
   */
  var LEGACY_ALIASES = {
      "booking:hotel|royal lotus": "bk_hotel",
      "booking:insurance|富邦旅平險": "bk_insurance",
      "booking:esim|越南 esim": "bk_esim",
      "booking:lounge|機場貴賓室": "bk_lounge",
      "deadline:回程接送預約（建議最晚）|2026-11-02": "dl_return_transfer",
      "todoGroup:這幾天先做": "tg_now",
      "todo:看醫生拿常備藥（腸胃／止痛／感冒＋ok繃）": "td_meds",
      "todoGroup:出發前到 11/4": "tg_week_before",
      "todo:台灣先裝好 esim": "td_esim",
      "todo:投保旅平險（富邦）": "td_insurance",
      "block:下午／晚|it585 抵達 → grab／接駁到 royal lotus（約 20:00）": "bl_1105_2",
      "block:晚|安頓、附近簡單用餐、休息": "bl_1105_2",
      "block:白天|樂福鞋店洽談／量腳（視預約）": "bl_1106_2",
      "block:彈性|flow store 問五指鞋；市區散步": "bl_1107_2",
      "block:白天|五行山（marble mountains）": "bl_1106_1",
      "block:可選|帝王洗頭或spa": "bl_1108_1",
      "block:整天|購物（除疤膏等）、海灘或咖啡、視情況補鞋進度": "bl_1108_2",
      "block:晚|blends／waves 演出表確認後決定": "bl_1107_3",
      "block:白天|晚退房（若飯店同意）／取鞋／最後採買": "bl_1110_1",
      "block:晚|前往機場 → it552 → 桃園 → 接送回台中": "bl_1110_3",
      "place:royal lotus": "pl_royal_lotus",
      "place:五行山 marble mountains": "pl_marble",
      "place:樂福鞋訂製店": "pl_friendly_shoe",
      "place:帝王洗頭": "pl_luxury_barber",
      "place:blends": "pl_blends",
      "place:waves": "pl_waves",
      "shop:訂做樂福鞋": "sh_loafer",
      "shop:五指鞋": "sh_fivefinger",
      "shop:除疤膏": "sh_scar",
      "shop:其他伴手／消耗品": "sh_snacks",
      "packItem:信用卡／一些現金 vnd": "pi_cash",
      "packItem:短袖／輕便長褲": "pi_clothes_sets",
      "packItem:涼鞋或透氣鞋": "pi_sandals",
      "packItem:薄外套（機艙／晚上）": "pi_rain",
      "packItem:手機＋充電器／行動電源": "pi_phone",
      "packItem:轉接頭／充電線": "pi_adapter",
      "packItem:耳機": "pi_phone",
      "packItem:常備藥（腸胃／止痛／感冒）": "pi_meds",
      "packItem:ok繃／小急救": "pi_meds",
      "packItem:防曬／牙刷盥洗": "pi_skincare",
      "packItem:量腳資料／鞋款照片（給訂製店）": "pi_foot_measure",
      "expense:機票（虎航去回）|tigerair": "ex_flights",
      "expense:飯店 royal lotus|booking／官網": "ex_hotel",
      "expense:旅平險|富邦": "ex_insurance",
      "expense:回程託運 15kg|tigerair": "ex_baggage",
      "expense:回程接送 桃園→台中|全鋒等": "ex_transfer_back",
      "expense:樂福鞋訂做|現地": "ex_loafer",
      "expense:五指鞋／除疤膏等|現地": "ex_fivefinger",
      "expense:餐飲與交通（概估）|現地": "ex_meals_misc",
      "block:23:15|桃園落地 → 滙豐接送回台中（約 02:00 到家）": "bl_1110_3",
      "block:09:00|肯驛接送台中→小港 → 報到、南苑貴賓室 → it585 17:20 起飛": "bl_1105_1",
      "shop:訂做識別證皮套（台積電紅＋深色牛皮）": "sh_id_badge"
  };

  var FLAT_KINDS = { booking: 'bookings', deadline: 'deadlines', place: 'places', shop: 'shopping', expense: 'expenses' };
  var NESTED_KINDS = {
    todo: { list: 'todoGroups', parentKind: 'todoGroup', child: 'items' },
    block: { list: 'days', parentKind: 'day', child: 'blocks' },
    packItem: { list: 'packing', parentKind: 'packCat', child: 'items' }
  };

  function richness(it) {
    if (!it) return -1;
    var n = 0;
    Object.keys(it).forEach(function (k) {
      var v = it[k];
      if (v === '' || v == null || v === false) return;
      if (Array.isArray(v) && !v.length) return;
      n += 1;
    });
    if (it.details) n += 5;
    if (it.userEdited) n += 100;
    return n;
  }

  /** Pick the record to keep; fold the other's user state into it. */
  function foldDuplicate(keep, drop) {
    var winner = richness(drop) > richness(keep) ? drop : keep;
    var loser = winner === keep ? drop : keep;
    var out = clone(winner);
    out.id = keep.id;
    if (loser.userEdited && !winner.userEdited) {
      if ('done' in loser) out.done = loser.done;
      out.userEdited = true;
    } else if (loser.userEdited && 'done' in loser && loser.done && !out.done) {
      out.done = true;
    }
    if (!out.details && loser.details) out.details = clone(loser.details);
    if (!out.note && loser.note) out.note = loser.note;
    return out;
  }

  function dedupeArray(arr, kind, useFp, seenIds) {
    var out = [];
    var byFp = {};
    seenIds = seenIds || {};
    (arr || []).forEach(function (it) {
      if (!it) return;
      if (it.id && seenIds[it.id]) {
        var hit = seenIds[it.id];
        var idx = hit.arr.indexOf(hit.item);
        var merged = foldDuplicate(hit.item, it);
        if (idx >= 0) hit.arr[idx] = merged;
        seenIds[it.id] = { arr: hit.arr, item: merged };
        return;
      }
      var fp = useFp ? fingerprint(kind, it) : '';
      if (fp && byFp[fp]) {
        var prev = byFp[fp];
        var i2 = out.indexOf(prev);
        var m2 = foldDuplicate(prev, it);
        out[i2] = m2;
        byFp[fp] = m2;
        if (m2.id) seenIds[m2.id] = { arr: out, item: m2 };
        return;
      }
      out.push(it);
      if (fp) byFp[fp] = it;
      if (it.id) seenIds[it.id] = { arr: out, item: it };
    });
    return out;
  }

  /** Same-id / same-key containers (two "11/5" days, two groups with one name): union children. */
  function dedupeContainers(list, kind, childKey) {
    var out = [];
    var byKey = {};
    (list || []).forEach(function (c) {
      if (!c) return;
      var k1 = c.id ? 'id:' + c.id : '';
      var k2 = fingerprint(kind, c);
      var prev = (k1 && byKey[k1]) || (k2 && byKey[k2]);
      if (prev) {
        prev[childKey] = (prev[childKey] || []).concat(c[childKey] || []);
        if (c.userEdited && !prev.userEdited) prev.userEdited = true;
        return;
      }
      out.push(c);
      if (k1) byKey[k1] = c;
      if (k2) byKey[k2] = c;
    });
    return out;
  }

  /** Collapse same-id / same-fingerprint duplicates inside one trip. */
  function dedupeTrip(trip) {
    if (!trip) return trip;
    Object.keys(FLAT_KINDS).forEach(function (kind) {
      var key = FLAT_KINDS[kind];
      if (!Array.isArray(trip[key])) return;
      // expenses: same item+merchant can be legit (two Grab rides) → id only
      trip[key] = dedupeArray(trip[key], kind, kind !== 'expense');
    });
    Object.keys(NESTED_KINDS).forEach(function (kind) {
      var cfg = NESTED_KINDS[kind];
      if (!Array.isArray(trip[cfg.list])) return;
      trip[cfg.list] = dedupeContainers(trip[cfg.list], cfg.parentKind, cfg.child);
      var seen = {};
      var fpSeen = {};
      trip[cfg.list].forEach(function (c) {
        c[cfg.child] = dedupeArray(c[cfg.child] || [], kind, true, seen);
        // todos / packing: same text in two containers is a duplicate too
        if (kind === 'block') return;
        c[cfg.child] = c[cfg.child].filter(function (it) {
          var fp = fingerprint(kind, it);
          if (!fp) return true;
          if (fpSeen[fp] && fpSeen[fp] !== it) {
            var o = fpSeen[fp];
            if (it.userEdited && !o.userEdited && 'done' in it) { o.done = it.done; o.userEdited = true; }
            return false;
          }
          fpSeen[fp] = it;
          return true;
        });
      });
    });
    if (Array.isArray(trip.journal)) trip.journal = dedupeArray(trip.journal, 'journal', false);
    return trip;
  }

  function indexRemote(remoteTrip) {
    var idx = { ids: {}, fps: {}, parentOf: {} };
    function add(kind, it, parentId) {
      if (!it || !it.id) return;
      idx.ids[kind + '|' + it.id] = true;
      var fp = fingerprint(kind, it);
      if (fp && !idx.fps[fp]) idx.fps[fp] = it.id;
      if (parentId) idx.parentOf[kind + '|' + it.id] = parentId;
    }
    Object.keys(FLAT_KINDS).forEach(function (kind) {
      (remoteTrip[FLAT_KINDS[kind]] || []).forEach(function (it) { add(kind, it); });
    });
    Object.keys(NESTED_KINDS).forEach(function (kind) {
      var cfg = NESTED_KINDS[kind];
      (remoteTrip[cfg.list] || []).forEach(function (c) {
        add(cfg.parentKind, c);
        (c[cfg.child] || []).forEach(function (it) { add(kind, it, c.id); });
      });
    });
    return idx;
  }

  function resolveAlias(idx, kind, it) {
    if (!it) return null;
    if (it.id && idx.ids[kind + '|' + it.id]) return null; // already canonical
    var fp = fingerprint(kind, it);
    if (!fp) return null;
    if (idx.fps[fp]) return { id: idx.fps[fp], how: 'fp' };
    var legacy = LEGACY_ALIASES[fp];
    if (legacy && idx.ids[kind + '|' + legacy]) return { id: legacy, how: 'legacy' };
    return null;
  }

  function moneyOf(e) {
    return (Number(e && e.twd) || 0) + (Number(e && e.amount) || 0) + (Number(e && e.estimateTwd) || 0);
  }

  /**
   * Before merging, rewrite local items that are really copies of a remote item
   * (old random id, or old seed text) onto the stable remote id. Copies that can't
   * simply be re-id'd are dropped and their user state (done/checked) is carried
   * onto the remote record after the merge. Returns { trip, carry }.
   */
  function canonicalizeLocalTrip(localTrip, remoteTrip) {
    var trip = clone(localTrip);
    var idx = indexRemote(remoteTrip);
    var carry = {};

    function addCarry(kind, id, it) {
      if (!it || !it.userEdited || !('done' in it)) return;
      var k = kind + '|' + id;
      if (!carry[k]) carry[k] = { done: !!it.done };
      else carry[k].done = carry[k].done && !!it.done;
    }

    // Containers (days / todo groups / packing categories) first
    Object.keys(NESTED_KINDS).forEach(function (kind) {
      var cfg = NESTED_KINDS[kind];
      var list = trip[cfg.list];
      if (!Array.isArray(list)) return;
      var out = [];
      list.forEach(function (c) {
        if (!c) return;
        var r = resolveAlias(idx, cfg.parentKind, c);
        if (!r) { out.push(c); return; }
        var target = out.find(function (o) { return o.id === r.id; }) ||
          list.find(function (o) { return o && o !== c && o.id === r.id; });
        if (target) {
          target[cfg.child] = (target[cfg.child] || []).concat(c[cfg.child] || []);
          if (out.indexOf(target) < 0 && list.indexOf(target) < 0) out.push(target);
          return;
        }
        c.id = r.id;
        if (r.how === 'legacy' && !c.userEdited) delete c.updatedAt; // let remote name win
        out.push(c);
      });
      trip[cfg.list] = out;
    });

    function localIdsOf(kind) {
      var ids = {};
      if (FLAT_KINDS[kind]) {
        (trip[FLAT_KINDS[kind]] || []).forEach(function (it) { if (it && it.id) ids[it.id] = true; });
      } else {
        var cfg = NESTED_KINDS[kind];
        (trip[cfg.list] || []).forEach(function (c) {
          (c[cfg.child] || []).forEach(function (it) { if (it && it.id) ids[it.id] = true; });
        });
      }
      return ids;
    }

    function processList(kind, arr, containerId) {
      var ids = present[kind];
      return (arr || []).filter(function (it) {
        if (!it) return false;
        var r = resolveAlias(idx, kind, it);
        if (!r) return true;
        // Keep user-entered money rows rather than lose them
        if (kind === 'expense' && it.userEdited && moneyOf(it) > 0) return true;
        var sameContainer = !NESTED_KINDS[kind] || idx.parentOf[kind + '|' + r.id] === containerId;
        if (r.how === 'fp' && !ids[r.id] && sameContainer) {
          delete ids[it.id];
          it.id = r.id;
          ids[r.id] = true;
          return true;
        }
        addCarry(kind, r.id, it);
        return false;
      });
    }

    var present = {};
    Object.keys(FLAT_KINDS).concat(Object.keys(NESTED_KINDS)).forEach(function (k) { present[k] = localIdsOf(k); });
    Object.keys(FLAT_KINDS).forEach(function (kind) {
      var key = FLAT_KINDS[kind];
      if (Array.isArray(trip[key])) trip[key] = processList(kind, trip[key]);
    });
    Object.keys(NESTED_KINDS).forEach(function (kind) {
      var cfg = NESTED_KINDS[kind];
      (trip[cfg.list] || []).forEach(function (c) {
        c[cfg.child] = processList(kind, c[cfg.child], c.id);
      });
    });
    return { trip: dedupeTrip(trip), carry: carry };
  }

  function applyCarry(trip, carry) {
    if (!trip || !carry) return trip;
    var now = new Date().toISOString();
    function touch(kind, it) {
      var c = it && it.id && carry[kind + '|' + it.id];
      if (!c || it.userEdited) return;
      if (!!it.done === c.done) return;
      it.done = c.done;
      it.userEdited = true;
      it.updatedAt = now;
    }
    Object.keys(FLAT_KINDS).forEach(function (kind) {
      (trip[FLAT_KINDS[kind]] || []).forEach(function (it) { touch(kind, it); });
    });
    Object.keys(NESTED_KINDS).forEach(function (kind) {
      var cfg = NESTED_KINDS[kind];
      (trip[cfg.list] || []).forEach(function (c) {
        (c[cfg.child] || []).forEach(function (it) { touch(kind, it); });
      });
    });
    return trip;
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


  var PLACEHOLDER_NOTE = '金額請自行補上';

  function expenseMoneyEmpty(e) {
    if (!e) return true;
    return (Number(e.twd) || 0) === 0 && (Number(e.amount) || 0) === 0 && (Number(e.estimateTwd) || 0) === 0;
  }

  function isPlaceholderNote(e) {
    return !!(e && String(e.note || '').indexOf(PLACEHOLDER_NOTE) >= 0);
  }

  function isJunkPlaceholderExpense(e) {
    return isPlaceholderNote(e);
  }

  function remoteHasPositiveTwd(rem) {
    return !!(rem && ((Number(rem.twd) || 0) > 0 || (Number(rem.estimateTwd) || 0) > 0 || (Number(rem.amount) || 0) > 0));
  }

  function copyRemoteMoneyFields(merged, rem) {
    if (!merged || !rem) return;
    if (rem.twd != null) merged.twd = rem.twd;
    if (rem.amount != null) merged.amount = rem.amount;
    if (rem.currency != null) merged.currency = rem.currency;
    var estEmpty = merged.estimateTwd == null || merged.estimateTwd === '' || Number(merged.estimateTwd) === 0;
    if (estEmpty) {
      if (rem.estimateTwd != null && Number(rem.estimateTwd) > 0) merged.estimateTwd = rem.estimateTwd;
      else if ((Number(rem.twd) || 0) > 0) merged.estimateTwd = rem.twd;
    }
    if (isPlaceholderNote(merged)) {
      if (rem.note != null && String(rem.note).indexOf(PLACEHOLDER_NOTE) < 0) merged.note = rem.note;
      else merged.note = rem.note || '';
      if (rem.merchant) merged.merchant = rem.merchant;
      if (rem.date) merged.date = rem.date;
      if (rem.item) merged.item = rem.item;
    }
  }

  /** When localWins (e.g. eye toggle) but money is empty / placeholder, take remote money. */
  function repairMergedExpenseMoney(merged, loc, rem) {
    if (!merged || !remoteHasPositiveTwd(rem)) return merged;
    if (!(isPlaceholderNote(merged) || expenseMoneyEmpty(merged))) return merged;
    copyRemoteMoneyFields(merged, rem);
    return merged;
  }

  function normalizeExpenseItem(item) {
    return String(item || '').replace(/\s+/g, '').toLowerCase();
  }

  function expenseNearDedupeKey(e) {
    var n = normalizeExpenseItem(e && e.item);
    if (!n) return null;
    if (n.indexOf('機票') >= 0 && n.indexOf('虎航') >= 0) return 'flight:tigerair';
    if (n.indexOf('royallotus') >= 0 && (n.indexOf('飯店') >= 0 || n.indexOf('住宿') >= 0 || n.indexOf('hotel') >= 0)) {
      return 'hotel:royallotus';
    }
    return null;
  }

  function expenseRichness(e) {
    var score = 0;
    if (!e) return -999;
    if (e.id === 'ex_flights' || e.id === 'ex_hotel') score += 50;
    if ((Number(e.twd) || 0) > 0) score += 100;
    if ((Number(e.amount) || 0) > 0) score += 20;
    if ((Number(e.estimateTwd) || 0) > 0) score += 10;
    if (e.note && !isPlaceholderNote(e)) score += 5;
    if (isPlaceholderNote(e)) score -= 50;
    if (expenseMoneyEmpty(e)) score -= 20;
    return score;
  }

  function itemsNearDuplicate(a, b) {
    if (!a || !b) return false;
    var keyA = expenseNearDedupeKey(a);
    var keyB = expenseNearDedupeKey(b);
    if (keyA && keyB && keyA === keyB) return true;
    var na = normalizeExpenseItem(a.item);
    var nb = normalizeExpenseItem(b.item);
    if (!na || !nb) return false;
    if (na === nb) return true;
    if (na.indexOf(nb) >= 0 || nb.indexOf(na) >= 0) return true;
    return false;
  }

  /**
   * Drop seed leftover placeholders (「金額請自行補上」) and collapse
   * zero-amount near-duplicates of the real ex_flights / ex_hotel rows.
   */
  function normalizeExpenseStatusMoney(e) {
    if (!e) return e;
    if (e.status === 'paid') {
      if (e.estimateTwd == null || e.estimateTwd === '') {
        e.estimateTwd = Number(e.twd) || 0;
      }
      if (e.excludeFromEstimate == null) e.excludeFromEstimate = false;
      return e;
    }
    // expected (or any non-paid): never store actual TWD
    var est = e.estimateTwd;
    var estEmpty = est == null || est === '';
    if (estEmpty) {
      var prev = Number(e.twd) || 0;
      e.estimateTwd = prev;
    } else {
      e.estimateTwd = Number(est) || 0;
    }
    e.twd = 0;
    if (e.excludeFromEstimate == null) e.excludeFromEstimate = false;
    return e;
  }

  function sanitizeExpenses(list) {
    list = Array.isArray(list) ? list.filter(Boolean) : [];
    var withoutJunk = list.filter(function (e) {
      return !isJunkPlaceholderExpense(e);
    });

    var out = [];
    withoutJunk.forEach(function (e) {
      var dupIdx = -1;
      for (var i = 0; i < out.length; i++) {
        if (itemsNearDuplicate(out[i], e)) {
          var keyA = expenseNearDedupeKey(out[i]);
          var keyB = expenseNearDedupeKey(e);
          // Conservative: only auto-collapse known flight/hotel pairs,
          // or exact/substring item match when one side is zero-money.
          if ((keyA && keyB && keyA === keyB) || expenseMoneyEmpty(out[i]) || expenseMoneyEmpty(e) || isPlaceholderNote(out[i]) || isPlaceholderNote(e)) {
            dupIdx = i;
            break;
          }
        }
      }
      if (dupIdx < 0) {
        out.push(e);
        return;
      }
      var keep = out[dupIdx];
      var challenger = e;
      var winner = expenseRichness(challenger) > expenseRichness(keep) ? challenger : keep;
      var loser = winner === keep ? challenger : keep;
      // Only drop when loser is zero-amount or placeholder
      if (!(expenseMoneyEmpty(loser) || isPlaceholderNote(loser))) {
        out.push(e);
        return;
      }
      out[dupIdx] = winner;
    });
    out.forEach(normalizeExpenseStatusMoney);
    return out;
  }

  function mergeTrip(localTrip, remoteTrip) {
    if (!localTrip) return clone(remoteTrip);
    if (!remoteTrip) return dedupeTrip(clone(localTrip));
    var prep = canonicalizeLocalTrip(localTrip, remoteTrip);
    localTrip = prep.trip;
    var out = { id: localTrip.id || remoteTrip.id };
    mergeTripScalars(localTrip, remoteTrip, out);
    out.deadlines = mergeList(localTrip.deadlines, remoteTrip.deadlines, 'deadline');
    out.todoGroups = mergeTodoGroups(localTrip.todoGroups, remoteTrip.todoGroups);
    out.bookings = mergeList(localTrip.bookings, remoteTrip.bookings, 'booking', withDetailsMerge);
    out.days = mergeDays(localTrip.days, remoteTrip.days);
    out.places = mergeList(localTrip.places, remoteTrip.places, 'place', withDetailsMerge);
    out.shopping = mergeList(localTrip.shopping, remoteTrip.shopping, 'shop', withDetailsMerge);
    out.packing = mergePacking(localTrip.packing, remoteTrip.packing);
    out.expenses = mergeList(localTrip.expenses, remoteTrip.expenses, 'expense', function (merged, loc, rem) {
      loc = loc || {};
      rem = rem || {};
      if (localWins(loc, rem)) {
        if (loc.estimateTwd != null) merged.estimateTwd = loc.estimateTwd;
        if (loc.excludeFromEstimate != null) merged.excludeFromEstimate = !!loc.excludeFromEstimate;
        // Eye-toggle / userEdited can make localWins while money is still empty seed junk.
        repairMergedExpenseMoney(merged, loc, rem);
      } else {
        if (merged.estimateTwd == null && loc.estimateTwd != null) merged.estimateTwd = loc.estimateTwd;
        if (merged.excludeFromEstimate == null && loc.excludeFromEstimate != null) {
          merged.excludeFromEstimate = !!loc.excludeFromEstimate;
        }
      }
      if (merged.estimateTwd == null) merged.estimateTwd = Number(merged.twd) || 0;
      if (merged.excludeFromEstimate == null) merged.excludeFromEstimate = false;
      return merged;
    });
    out.expenses = sanitizeExpenses(out.expenses);
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
    applyCarry(out, prep.carry);
    return dedupeTrip(out);
  }

  function mergeStates(localState, remoteState) {
    if (!remoteState || !Array.isArray(remoteState.trips)) {
      if (!localState) return null;
      var localOnly = clone(localState);
      (localOnly.trips || []).forEach(function (t) {
        if (t) { dedupeTrip(t); t.expenses = sanitizeExpenses(t.expenses); }
      });
      return localOnly;
    }
    if (!localState || !Array.isArray(localState.trips) || !localState.trips.length) {
      var fresh = clone(remoteState);
      (fresh.trips || []).forEach(function (t) {
        if (t) t.expenses = sanitizeExpenses(t.expenses);
      });
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
      trips.push(dedupeTrip(clone(lt)));
    });

    trips.forEach(function (t) {
      if (t) t.expenses = sanitizeExpenses(t.expenses);
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
      if (local && Array.isArray(local.trips) && local.trips.length) {
        (local.trips || []).forEach(function (t) {
          if (t) { dedupeTrip(t); t.expenses = sanitizeExpenses(t.expenses); }
        });
        return local;
      }
      return seedFactory ? seedFactory() : (local || null);
    });
  }

  global.TravelSync = {
    REMOTE_PATH: REMOTE_PATH,
    fetchRemote: fetchRemote,
    mergeStates: mergeStates,
    mergeTrip: mergeTrip,
    mergeList: mergeList,
    mergeDetailsField: mergeDetailsField,
    localWins: localWins,
    loadMergedState: loadMergedState,
    fingerprint: fingerprint,
    dedupeTrip: dedupeTrip,
    canonicalizeLocalTrip: canonicalizeLocalTrip,
    sanitizeExpenses: sanitizeExpenses,
    isJunkPlaceholderExpense: isJunkPlaceholderExpense
  };
})(window);
