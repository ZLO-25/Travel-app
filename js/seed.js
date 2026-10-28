/**
 * Seed data & blank trip factory for Ryan's Travel App
 * Da Nang trip uses stable ids aligned with data/remote.json for merge.
 */
(function (global) {
  'use strict';

  function uid(prefix) {
    return (prefix || 'id') + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function blankTrip(overrides) {
    const now = new Date().toISOString();
    return Object.assign({
      id: uid('trip'),
      title: '新旅程',
      destination: '',
      startDate: '',
      endDate: '',
      goals: [],
      deadlines: [],
      todoGroups: [
        { id: uid('tg'), name: '出發前', items: [] },
        { id: uid('tg'), name: '旅途中', items: [] },
        { id: uid('tg'), name: '回程後', items: [] }
      ],
      bookings: [],
      days: [],
      places: [],
      shopping: [],
      packing: [
        { id: uid('pk'), category: '證件與錢', items: [] },
        { id: uid('pk'), category: '衣物', items: [] },
        { id: uid('pk'), category: '電子與旅用品', items: [] },
        { id: uid('pk'), category: '藥品與個人', items: [] }
      ],
      expenses: [],
      journal: [],
      memories: {
        highlights: [],
        wouldReturn: null,
        overallRating: null,
        postTripNote: ''
      },
      notes: '',
      archived: false,
      createdAt: now,
      updatedAt: now
    }, overrides || {});
  }


  function detailScarCream() {
    return {
  "title": "除疤膏（Dermatix Ultra／Contractubex）",
  "summary": "首選 Dermatix Ultra 7g（約 VND 210,000／NT$250）；備案 Contractubex 10g（約 VND 164,500）。Long Châu 65 Nguyễn Văn Thoại（跟 Royal Lotus 同一條路）。",
  "tips": [
    "買哪一款：凸起偏硬癢痛 → Dermatix Ultra（矽膠）；新疤深紅/褐 → 兩款可、Contractubex 較便宜；不確定 → Dermatix Ultra 7g",
    "哪裡買：Long Châu 65 Nguyễn Văn Thoại；連鎖藥局（Long Châu／Pharmacity／An Khang）較可靠；營業約 06:00–23:00（以現場為準）",
    "驗貨：外盒封膜完整 → 管身鋁箔封口完好 → 盒上越南文標籤或登記號（Contractubex 10g：VN-23121-22）→ 批號效期與管身一致 → 要收據並拍盒子與批號",
    "使用：傷口完全癒合才能擦；先手臂內側測試；疤痕怕曬白天防曬；Dermatix 至少約 2 個月才見效",
    "台灣對照：倍舒痕 Dermatix 7g 約 NT$945（momo），越南約 NT$250 划算很多"
  ],
  "warnings": [
    "不要買：會安古城、韓市場、夜市、Grab 代買（仿冒／保存風險）",
    "痘疤凹洞型兩款效果有限",
    "店內價格以現場為準"
  ],
  "images": [
    {
      "src": "assets/details/dermatix-ultra-7g.webp",
      "alt": "Dermatix Ultra 7g 外盒與軟管",
      "caption": "Dermatix Ultra 7g（來源：Long Châu 商品圖）"
    },
    {
      "src": "assets/details/contractubex-10g.webp",
      "alt": "Contractubex 10g 外盒",
      "caption": "Contractubex 10g（來源：Long Châu 商品圖）"
    }
  ],
  "links": [
    {
      "label": "Long Châu 比較文",
      "url": "https://nhathuoclongchau.com.vn/bai-viet/so-sanh-kem-tri-seo-contractubex-va-dermatix-cai-nao-tot-hon-49098.html"
    },
    {
      "label": "Pharmacity Dermatix Ultra 7g",
      "url": "https://www.pharmacity.vn/gel-tri-seo-dermatix-ultra-7g.html"
    },
    {
      "label": "Long Châu 店（65 Nguyễn Văn Thoại）",
      "url": "https://nhathuoclongchau.com.vn/he-thong-cua-hang/65-nguyen-van-thoai-p-an-hai-dong-q-son-tra-tp-da-nang"
    }
  ]
};
  }

  function detailFiveFinger() {
    return {
  "title": "Vibram 五指鞋（KSO EVO）",
  "summary": "Flow Store（268 Dương Đình Nghệ）正品；KSO EVO 約 VND 3,599,000。週日公休，建議平日試穿 30–45 分。",
  "tips": [
    "先問現貨／尺寸再過去；可穿隱形襪或五指襪試",
    "試穿走一圈確認趾套長度與足弓；不適合就別硬買",
    "雨天路滑，五指鞋抓地好但仍小心積水"
  ],
  "warnings": [
    "週日公休",
    "價格以店內為準；慎選非授權通路仿品"
  ],
  "images": [
    {
      "src": "assets/details/vibram-kso-evo.webp",
      "alt": "Vibram FiveFingers KSO EVO 參考卡",
      "caption": "參考卡（非實品照片）· Flow Store 峴港"
    }
  ],
  "links": []
};
  }

  function detailLoafer() {
    return {
  "title": "會安訂做樂福鞋",
  "summary": "Friendly Shoe Shop；建議深棕便士樂福＋橡膠底。下單約 1–1.5 小時，旅期內試穿取鞋。",
  "tips": [
    "出發前決定規格、量腳、剪趾甲、拍參考照片",
    "Trần Phú 淹水時改其他分店；11/6 早上可查 Hội An ngập",
    "留足試穿與修改時間；最晚 11/9 取鞋付尾款"
  ],
  "warnings": [
    "雨季可能改店／延誤，別拖到最後一天才下單"
  ],
  "images": [],
  "links": []
};
  }

  function applyDetails(item, details, ts) {
    if (!item || !details) return;
    item.details = details;
    if (ts) item.updatedAt = ts;
  }

  /** Attach expandable detail panels to high-value Da Nang items (offline seed). */
  function enrichDanangDetails(trip) {
    if (!trip || trip.id !== 'trip_danang_2026') return trip;
    var ts = '2026-10-28T13:40:00+08:00';
    var scar = detailScarCream();
    var five = detailFiveFinger();
    var loafer = detailLoafer();
    (trip.shopping || []).forEach(function (item) {
      if (!item) return;
      if (item.id === 'sh_scar') applyDetails(item, scar, ts);
      else if (item.id === 'sh_fivefinger') applyDetails(item, five, ts);
      else if (item.id === 'sh_loafer') applyDetails(item, loafer, ts);
    });
    (trip.places || []).forEach(function (p) {
      if (!p) return;
      if (p.id === 'pl_long_chau') applyDetails(p, scar, ts);
      else if (p.id === 'pl_flow') applyDetails(p, five, ts);
      else if (p.id === 'pl_friendly_shoe') applyDetails(p, loafer, ts);
    });
    (trip.days || []).forEach(function (day) {
      (day.blocks || []).forEach(function (bl) {
        if (!bl) return;
        if (bl.id === 'bl_1105_3') applyDetails(bl, scar, ts);
        else if (bl.id === 'bl_1107_2') applyDetails(bl, five, ts);
      });
    });
    (trip.todoGroups || []).forEach(function (g) {
      (g.items || []).forEach(function (item) {
        if (!item) return;
        if (item.id === 'td_buy_onsite') applyDetails(item, scar, ts);
        else if (item.id === 'td_flow_stock') applyDetails(item, five, ts);
      });
    });
    return trip;
  }

  /** Offline fallback seed — stable ids match data/remote.json */
  function daNangTrip() {
    const now = new Date().toISOString();
    const trip = {
  "id": "trip_danang_2026",
  "title": "2026 11/5-11/10 峴港",
  "destination": "越南 · 峴港（Da Nang）",
  "startDate": "2026-11-05",
  "endDate": "2026-11-10",
  "goals": [
    "會安訂做樂福鞋（加分：高筒靴）",
    "Vibram 五指鞋（Flow Store）",
    "五行山地獄洞 Âm Phủ",
    "Luxury Barber 帝王洗頭（折價券）",
    "買除疤膏",
    "好好放鬆（按摩、除黑頭、吃好吃的）"
  ],
  "deadlines": [
    {
      "id": "dl_lounge_khh",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "label": "小港貴賓室預約截止",
      "date": "2026-10-28",
      "note": "滙豐 LoungeKey；已完成"
    },
    {
      "id": "dl_hotel_free_cancel",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "label": "Royal Lotus 免費取消截止",
      "date": "2026-10-30",
      "note": "越南時間 23:59"
    },
    {
      "id": "dl_return_transfer",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "label": "回程接送預約（建議最晚）",
      "date": "2026-11-02",
      "note": "全鋒／桃園→台中｜IT552"
    },
    {
      "id": "dl_dad_lounge",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "label": "峴港貴賓室預約截止",
      "date": "2026-11-02",
      "note": "已有 LoungeKey QR，確認據點即可"
    },
    {
      "id": "dl_checkin",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "label": "線上報到選位",
      "date": "2026-11-04",
      "note": "虎航"
    },
    {
      "id": "dl_depart",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "label": "出發日",
      "date": "2026-11-05",
      "note": "IT585 高雄 17:20"
    },
    {
      "id": "dl_return",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "label": "回程日",
      "date": "2026-11-10",
      "note": "IT552 約 23:15 抵桃園"
    }
  ],
  "todoGroups": [
    {
      "id": "tg_now",
      "name": "現在就做",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "td_visa",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "越南電子簽證（已核准；印紙本＋手機存檔）",
          "done": true,
          "due": "",
          "note": "效期 11/5–11/24；單次入境 Tourist"
        },
        {
          "id": "td_hotel_only",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "確認住宿只剩 Royal Lotus",
          "done": true,
          "due": "",
          "note": "其他 3 間已取消無扣款"
        },
        {
          "id": "td_card_confirm",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "確認機票用滙豐旅人無限卡付款",
          "done": true,
          "due": "",
          "note": "接送／貴賓室資格"
        },
        {
          "id": "td_baggage",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "虎航加購回程託運（建議 15kg）",
          "done": false,
          "due": "出發前",
          "note": "PNR：N6D5RP／R5JVRS；官網管理預訂約 NT$1,000"
        }
      ]
    },
    {
      "id": "tg_book_by_nov2",
      "name": "11/2 前完成預約",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "td_insurance",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "投保旅平險（富邦 C方案）",
          "done": true,
          "due": "",
          "note": "NT$985；交易序號 576109368868；電子保單已寄到"
        },
        {
          "id": "td_transfer_out",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "台中→小港接送（肯驛 U.First）",
          "done": true,
          "due": "",
          "note": "訂單 F15528953；11/5 09:00 西屯上車"
        },
        {
          "id": "td_transfer_back",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "預約 11/10 桃園→台中接送（全鋒）",
          "done": false,
          "due": "建議 11/2 前",
          "note": "IT552 23:15；可能夜間加價"
        },
        {
          "id": "td_lounge",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "貴賓室 QR code（LoungeKey）",
          "done": true,
          "due": "",
          "note": "已收到 2 張；記得截圖存手機"
        }
      ]
    },
    {
      "id": "tg_week_before",
      "name": "出發前一週",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "td_meds",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "常備藥（腸胃／止痛／感冒＋OK繃）",
          "done": false,
          "due": "急迫",
          "note": ""
        },
        {
          "id": "td_loafer_spec",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "樂福鞋：決定規格、量腳、剪趾甲、拍照片",
          "done": false,
          "due": "",
          "note": "深棕便士樂福＋橡膠底建議"
        },
        {
          "id": "td_esim",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "越南 eSIM（KKday）",
          "done": true,
          "due": "",
          "note": "訂單 26KK259044234；可先裝好"
        },
        {
          "id": "td_vnd_grab",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "換越南盾＋Grab 綁卡",
          "done": false,
          "due": "",
          "note": "五行山只收現金"
        },
        {
          "id": "td_hotel_email",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "寫信 Royal Lotus（約 20:00 到、11/10 晚退房、鞋店送鞋請櫃台通知）",
          "done": false,
          "due": "",
          "note": ""
        },
        {
          "id": "td_live_schedule",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "查看 BLENDS、Waves 演出表",
          "done": false,
          "due": "",
          "note": ""
        },
        {
          "id": "td_pack",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "打包",
          "done": false,
          "due": "",
          "note": ""
        },
        {
          "id": "td_flow_stock",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "問 Flow Store 五指鞋現貨",
          "done": false,
          "due": "",
          "note": "+84 878 268 468／Zalo"
        },
        {
          "id": "td_print_visa",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "印 e-Visa、貴賓室 QR 截圖",
          "done": false,
          "due": "",
          "note": ""
        },
        {
          "id": "td_passport_check",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "核對護照資料與訂位一致",
          "done": false,
          "due": "",
          "note": "勿在 App 貼護照號"
        }
      ]
    },
    {
      "id": "tg_1_2_days",
      "name": "出發前 1–2 天",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "td_checkin",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "11/4 線上報到選位",
          "done": false,
          "due": "2026-11-04",
          "note": ""
        },
        {
          "id": "td_weather",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "看颱風／淹水資訊",
          "done": false,
          "due": "",
          "note": "搜尋 Hội An ngập"
        },
        {
          "id": "td_offline_maps",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "離線地圖＋飯店地址進 Grab",
          "done": false,
          "due": "",
          "note": ""
        }
      ]
    },
    {
      "id": "tg_done",
      "name": "已完成／可參考",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "td_mofa",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "外交部出國登錄（網頁）",
          "done": true,
          "due": "",
          "note": "峴港 11/5–11/10"
        },
        {
          "id": "td_line_mofa",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "LINE 出國登錄（月月抽資格）",
          "done": true,
          "due": "",
          "note": ""
        }
      ]
    },
    {
      "id": "tg_onsite",
      "name": "現地／之後",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "td_buy_onsite",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "買除疤膏、五指鞋、訂做樂福鞋",
          "done": false,
          "due": "",
          "note": ""
        }
      ]
    }
  ],
  "bookings": [
    {
      "id": "bk_flight_out",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "flight",
      "title": "去程 Tigerair IT585",
      "detail": "高雄 KHH 17:20 → 峴港 DAD 19:00｜2026-11-05",
      "ref": "Trip.com 1616334893071825",
      "status": "confirmed",
      "note": ""
    },
    {
      "id": "bk_flight_back",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "flight",
      "title": "回程 Tigerair IT552",
      "detail": "峴港 DAD 19:50 → 桃園 T1 23:15｜2026-11-10",
      "ref": "PNR：N6D5RP／R5JVRS",
      "status": "confirmed",
      "note": "回程託運待加購"
    },
    {
      "id": "bk_baggage",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "other",
      "title": "回程託運 15kg",
      "detail": "虎航官網管理預訂加購（約 NT$1,000）",
      "ref": "PNR：N6D5RP／R5JVRS",
      "status": "todo",
      "note": "起飛前 4 小時截止"
    },
    {
      "id": "bk_hotel",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "hotel",
      "title": "Royal Lotus Hotel Danang",
      "detail": "入住 2026-11-05～11/10｜高級雙人房含早餐｜已付 TWD 5,890",
      "ref": "Booking.com",
      "status": "confirmed",
      "note": "約 20:00 抵達；晚退房需求待信；10/30 越南時間前可免費取消"
    },
    {
      "id": "bk_transfer_out",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "transfer",
      "title": "去程接送 台中→小港",
      "detail": "肯驛 U.First｜11/5 09:00 西屯上車｜高級轎車",
      "ref": "F15528953",
      "status": "confirmed",
      "note": "卡片權益免費"
    },
    {
      "id": "bk_transfer_back",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "transfer",
      "title": "回程接送 桃園→台中",
      "detail": "建議全鋒｜配合 IT552 23:15",
      "ref": "",
      "status": "todo",
      "note": "建議 11/2 前預約；夜間可能加價 NT$200"
    },
    {
      "id": "bk_insurance",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "insurance",
      "title": "富邦旅平險＋不便險 C方案",
      "detail": "11/5–11/10｜身故／失能 600萬｜快捷理賠 IT585／IT552",
      "ref": "576109368868",
      "status": "confirmed",
      "note": "保費 NT$985；電子保單已寄到"
    },
    {
      "id": "bk_visa",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "visa",
      "title": "越南 e-Visa",
      "detail": "單次入境｜效期 11/5–11/24｜Tourist｜已核准",
      "ref": "",
      "status": "confirmed",
      "note": "記得印 1–2 份紙本"
    },
    {
      "id": "bk_esim",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "esim",
      "title": "越南 eSIM（KKday Vinaphone）",
      "detail": "每日 6GB｜11/5 起用",
      "ref": "26KK259044234",
      "status": "confirmed",
      "note": "可台灣先安裝；落地切數據"
    },
    {
      "id": "bk_lounge",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "type": "lounge",
      "title": "機場貴賓室 LoungeKey",
      "detail": "2 張單次 QR｜效期至 2027/1/24",
      "ref": "HSBC-0087983-1／-2",
      "status": "confirmed",
      "note": "截圖存手機；用前確認據點"
    }
  ],
  "days": [
    {
      "id": "day_20261105",
      "date": "2026-11-05",
      "title": "高雄＋抵達峴港",
      "updatedAt": "2026-10-28T13:16:00+08:00",
      "blocks": [
        {
          "id": "bl_1105_1",
          "updatedAt": "2026-10-28T13:16:00+08:00",
          "userEdited": false,
          "time": "09:00",
          "text": "肯驛接送台中→高雄市區找朋友＋丹丹漢堡（訂單 F15528953）",
          "place": "高雄市區"
        },
        {
          "id": "bl_1105_4",
          "updatedAt": "2026-10-28T13:16:00+08:00",
          "userEdited": false,
          "time": "14:50",
          "text": "到小港機場報到、進入南苑貴賓室（登機前 2.5 小時；IT585 17:20 起飛）",
          "place": "小港機場"
        },
        {
          "id": "bl_1105_2",
          "updatedAt": "2026-10-28T13:16:00+08:00",
          "userEdited": false,
          "time": "19:00",
          "text": "峴港落地 → Grab 到 Royal Lotus（約 6 km／15–20 分）→ 安頓／按摩",
          "place": "Royal Lotus"
        },
        {
          "id": "bl_1105_3",
          "updatedAt": "2026-10-28T13:16:00+08:00",
          "userEdited": false,
          "time": "晚（擇日）",
          "text": "附近海鮮（Bé Mặn／Năm Đảnh）；順路 Long Châu 買除疤膏",
          "place": ""
        }
      ]
    },
    {
      "id": "day_20261106",
      "date": "2026-11-06",
      "title": "★ 任務日：五行山 → 會安",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "blocks": [
        {
          "id": "bl_1106_1",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "08:00",
          "text": "出發 → 08:20 五行山：先看地獄洞，再電梯上水山看玄空洞",
          "place": "五行山"
        },
        {
          "id": "bl_1106_2",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "12:00",
          "text": "會安午餐 → 13:30 Friendly Shoe Shop 樂福鞋下單（約 1–1.5 小時）",
          "place": "會安"
        },
        {
          "id": "bl_1106_3",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "15:00",
          "text": "古城散步、咖啡、購物；太累則五行山改 11/8",
          "place": "會安古城"
        }
      ]
    },
    {
      "id": "day_20261107",
      "date": "2026-11-07",
      "title": "★ 五指鞋＋Live bar",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "blocks": [
        {
          "id": "bl_1107_1",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "白天",
          "text": "睡飽、海邊散步",
          "place": ""
        },
        {
          "id": "bl_1107_2",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "下午",
          "text": "Flow Store 試穿五指鞋（約 30–45 分；週日公休）",
          "place": "Flow Store"
        },
        {
          "id": "bl_1107_3",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "晚",
          "text": "An Thuong live bar（週六最熱鬧）→ 按摩",
          "place": "An Thuong"
        }
      ]
    },
    {
      "id": "day_20261108",
      "date": "2026-11-08",
      "title": "留白",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "blocks": [
        {
          "id": "bl_1108_1",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "早上",
          "text": "Luxury Barber 帝王洗頭（週日忙，前一天預約）",
          "place": "Luxury Barber"
        },
        {
          "id": "bl_1108_2",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "白天",
          "text": "做臉／除黑頭；樂福鞋第一次試穿（店家送飯店）",
          "place": "Royal Lotus"
        },
        {
          "id": "bl_1108_3",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "晚",
          "text": "咖啡店看書 → omakase 或 CHAR Grill House",
          "place": ""
        }
      ]
    },
    {
      "id": "day_20261109",
      "date": "2026-11-09",
      "title": "留白",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "blocks": [
        {
          "id": "bl_1109_1",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "白天",
          "text": "按摩 → 午餐 buffet；樂福鞋最終試穿、付尾款、取鞋（最晚今晚）",
          "place": ""
        },
        {
          "id": "bl_1109_2",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "彈性",
          "text": "韓市場買伴手禮；選配遺產列車已移到之後再去",
          "place": ""
        }
      ]
    },
    {
      "id": "day_20261110",
      "date": "2026-11-10",
      "title": "退房＋回程",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "blocks": [
        {
          "id": "bl_1110_1",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "白天",
          "text": "申請晚退房 → 午餐、咖啡",
          "place": "Royal Lotus"
        },
        {
          "id": "bl_1110_2",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "17:00 前",
          "text": "到峴港機場：退稅（如有）→ 託運 → 貴賓室 → IT552",
          "place": "峴港機場"
        },
        {
          "id": "bl_1110_3",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "time": "23:15",
          "text": "桃園落地 → 滙豐接送回台中（約 02:00 到家）",
          "place": "桃園 T1"
        }
      ]
    }
  ],
  "places": [
    {
      "id": "pl_royal_lotus",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "Royal Lotus Hotel Danang",
      "category": "住宿",
      "note": "120A Nguyễn Văn Thoại；美溪約 5 分；泳池／健身房／早餐",
      "url": "",
      "mapsUrl": ""
    },
    {
      "id": "pl_marble",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "五行山 Marble Mountains＋地獄洞",
      "category": "景點",
      "note": "只收現金；地獄洞另票；07:00–17:30",
      "url": "",
      "mapsUrl": ""
    },
    {
      "id": "pl_friendly_shoe",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "Friendly Shoe Shop（會安）",
      "category": "購物",
      "note": "樂福鞋訂製；多個分店；Trần Phú 淹水時改分店",
      "url": "",
      "mapsUrl": ""
    },
    {
      "id": "pl_flow",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "Flow Store",
      "category": "購物",
      "note": "268 Dương Đình Nghệ；五指鞋正品；週日公休",
      "url": "https://flowstore.com.vn",
      "mapsUrl": ""
    },
    {
      "id": "pl_luxury_barber",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "Luxury Barber（帝王洗頭）",
      "category": "體驗",
      "note": "408 Võ Nguyên Giáp；帶折價券；週日先預約",
      "url": "",
      "mapsUrl": ""
    },
    {
      "id": "pl_long_chau",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "Long Châu 藥局",
      "category": "購物",
      "note": "65 Nguyễn Văn Thoại；除疤膏",
      "url": "",
      "mapsUrl": ""
    },
    {
      "id": "pl_blends",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "BLENDS Social Bar",
      "category": "夜生活",
      "note": "An Thuong；演出表待查",
      "url": "",
      "mapsUrl": ""
    },
    {
      "id": "pl_waves",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "Waves Rooftop",
      "category": "夜生活",
      "note": "An Thuong 頂樓；演出表待查",
      "url": "",
      "mapsUrl": ""
    },
    {
      "id": "pl_herbal_spa",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "Herbal Spa",
      "category": "體驗",
      "note": "201 Dương Đình Nghệ；四手按摩",
      "url": "",
      "mapsUrl": ""
    },
    {
      "id": "pl_charm_spa",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "name": "Charm Spa Grand",
      "category": "體驗",
      "note": "31 Nguyễn Văn Thoại；跟飯店同街",
      "url": "",
      "mapsUrl": ""
    }
  ],
  "shopping": [
    {
      "id": "sh_scar",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "text": "除疤膏 Dermatix Ultra／Contractubex",
      "done": false,
      "note": "Long Châu；Dermatix 7g 約 VND 210k"
    },
    {
      "id": "sh_fivefinger",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "text": "Vibram 五指鞋（KSO EVO 首選）",
      "done": false,
      "note": "Flow Store；約 VND 3,599,000"
    },
    {
      "id": "sh_loafer",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "text": "訂做樂福鞋",
      "done": false,
      "note": "Friendly Shoe Shop；規格／尺寸事先決定"
    },
    {
      "id": "sh_snacks",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "text": "伴手禮（咖啡、零食）",
      "done": false,
      "note": "韓市場／Lotte Mart；輕、好帶"
    },
    {
      "id": "sh_boots_optional",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "text": "高筒靴（選配，非必要）",
      "done": false,
      "note": "樂福鞋滿意且趕得及才訂"
    }
  ],
  "packing": [
    {
      "id": "pk_docs",
      "category": "證件與錢",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "pi_passport",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "護照",
          "done": false
        },
        {
          "id": "pi_evisa",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "e-Visa 列印／電子檔",
          "done": false
        },
        {
          "id": "pi_cards",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "長榮極致無限卡、旅人無限卡（實體卡）",
          "done": false
        },
        {
          "id": "pi_cash",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "美金／越南盾／台幣現金",
          "done": false
        },
        {
          "id": "pi_coupon",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "Luxury Barber 折價券",
          "done": false
        },
        {
          "id": "pi_insurance_info",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "保險與訂位資訊（截圖）",
          "done": false
        },
        {
          "id": "pi_lounge_qr",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "貴賓室 QR 截圖",
          "done": false
        }
      ]
    },
    {
      "id": "pk_clothes",
      "category": "衣物",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "pi_clothes_sets",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "輕便衣褲約 3 套（可丟）",
          "done": false
        },
        {
          "id": "pi_rain",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "輕便雨衣、薄外套",
          "done": false
        },
        {
          "id": "pi_sandals",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "止滑涼鞋／拖鞋、泳衣",
          "done": false
        },
        {
          "id": "pi_socks",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "隱形襪、五指襪",
          "done": false
        },
        {
          "id": "pi_towel",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "毛巾",
          "done": false
        },
        {
          "id": "pi_2002r",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "2002R（日常鞋）",
          "done": false
        }
      ]
    },
    {
      "id": "pk_electronics",
      "category": "電子與旅用品",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "pi_phone",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "手機＋充電線／耳機／Kindle",
          "done": false
        },
        {
          "id": "pi_powerbank",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "行動電源（只能手提）",
          "done": false
        },
        {
          "id": "pi_esim_pack",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "eSIM（出發前裝好）",
          "done": false
        },
        {
          "id": "pi_adapter",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "轉接頭（越南 A／C 型多半可用）",
          "done": false
        }
      ]
    },
    {
      "id": "pk_meds",
      "category": "藥品與個人",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "pi_meds",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "常備藥（腸胃／止痛／感冒）＋OK繃",
          "done": false
        },
        {
          "id": "pi_skincare",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "防曬、洗面乳、保濕、防蚊（液體≤100ml）",
          "done": false
        }
      ]
    },
    {
      "id": "pk_shoespecial",
      "category": "這趟特別要帶（鞋子）",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "items": [
        {
          "id": "pi_shoe_photos",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "樂福鞋款式照片＋規格備忘錄",
          "done": false
        },
        {
          "id": "pi_foot_measure",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "兩腳腳長紀錄（cm）",
          "done": false
        },
        {
          "id": "pi_bag",
          "updatedAt": "2026-10-28T10:04:05+08:00",
          "userEdited": false,
          "text": "折疊購物袋；防塵袋裝鞋",
          "done": false
        }
      ]
    }
  ],
  "expenses": [
    {
      "id": "ex_hotel",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-10-13",
      "item": "住宿 Royal Lotus 5 晚",
      "merchant": "Booking.com",
      "amount": 5890,
      "currency": "TWD",
      "twd": 5890,
      "status": "paid",
      "card": "滙豐旅人",
      "note": "10/30 越南時間前可免費取消"
    },
    {
      "id": "ex_flights",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-10-16",
      "item": "機票（虎航去回）",
      "merchant": "Trip.com",
      "amount": 6355,
      "currency": "TWD",
      "twd": 6355,
      "status": "paid",
      "card": "滙豐旅人",
      "note": "訂單 1616334893071825；不含託運"
    },
    {
      "id": "ex_esim",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-10-18",
      "item": "越南 eSIM",
      "merchant": "KKday",
      "amount": 248,
      "currency": "TWD",
      "twd": 248,
      "status": "paid",
      "card": "滙豐旅人",
      "note": "26KK259044234"
    },
    {
      "id": "ex_visa",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-10-18",
      "item": "越南 e-Visa",
      "merchant": "EVISAVIETNAM",
      "amount": 834,
      "currency": "TWD",
      "twd": 834,
      "status": "paid",
      "card": "滙豐旅人",
      "note": "帳單入帳 NT$834"
    },
    {
      "id": "ex_fx_fees",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-10-18",
      "item": "滙豐國外交易手續費（4 筆）",
      "merchant": "滙豐銀行",
      "amount": 242,
      "currency": "TWD",
      "twd": 242,
      "status": "paid",
      "card": "滙豐旅人",
      "note": "含已取消訂房手續費 46"
    },
    {
      "id": "ex_lounge",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-10-22",
      "item": "LoungeKey 貴賓室 2 組",
      "merchant": "滙豐權益",
      "amount": 0,
      "currency": "TWD",
      "twd": 0,
      "status": "paid",
      "card": "滙豐旅人權益",
      "note": "QR 已寄達"
    },
    {
      "id": "ex_insurance",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-10-28",
      "item": "旅平險＋不便險 C方案",
      "merchant": "富邦產險",
      "amount": 985,
      "currency": "TWD",
      "twd": 985,
      "status": "paid",
      "card": "LINE Pay→滙豐旅人",
      "note": "576109368868"
    },
    {
      "id": "ex_transfer_out",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-05",
      "item": "台中→小港接送",
      "merchant": "肯驛 U.First",
      "amount": 0,
      "currency": "TWD",
      "twd": 0,
      "status": "paid",
      "card": "國泰長榮極致權益",
      "note": "F15528953；免費"
    },
    {
      "id": "ex_baggage",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "",
      "item": "回程託運 15kg",
      "merchant": "台灣虎航",
      "amount": 1000,
      "currency": "TWD",
      "twd": 1000,
      "status": "expected",
      "card": "",
      "note": "待加購"
    },
    {
      "id": "ex_transfer_back",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-10",
      "item": "桃園→台中接送（夜間加價）",
      "merchant": "全鋒",
      "amount": 200,
      "currency": "TWD",
      "twd": 200,
      "status": "expected",
      "card": "滙豐旅人",
      "note": "尚未預約"
    },
    {
      "id": "ex_grab_arrive",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-05",
      "item": "機場→飯店 Grab",
      "merchant": "Grab",
      "amount": 100000,
      "currency": "VND",
      "twd": 125,
      "status": "expected",
      "card": "",
      "note": "估算"
    },
    {
      "id": "ex_seafood",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-05",
      "item": "海鮮晚餐",
      "merchant": "Năm Đảnh／Bé Mặn",
      "amount": 400000,
      "currency": "VND",
      "twd": 502,
      "status": "expected",
      "card": "",
      "note": "估算"
    },
    {
      "id": "ex_massage",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "",
      "item": "按摩約 4 次",
      "merchant": "Herbal／Charm 等",
      "amount": 2180000,
      "currency": "VND",
      "twd": 2735,
      "status": "expected",
      "card": "",
      "note": "估算"
    },
    {
      "id": "ex_scar",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "",
      "item": "除疤膏",
      "merchant": "Long Châu",
      "amount": 210000,
      "currency": "VND",
      "twd": 263,
      "status": "expected",
      "card": "",
      "note": ""
    },
    {
      "id": "ex_marble",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-06",
      "item": "五行山門票",
      "merchant": "五行山景區",
      "amount": 75000,
      "currency": "VND",
      "twd": 94,
      "status": "expected",
      "card": "現金",
      "note": "只收現金"
    },
    {
      "id": "ex_hoian_ticket",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-06",
      "item": "會安古城門票",
      "merchant": "售票亭",
      "amount": 120000,
      "currency": "VND",
      "twd": 151,
      "status": "expected",
      "card": "現金",
      "note": ""
    },
    {
      "id": "ex_grab_1106",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-06",
      "item": "五行山／會安交通",
      "merchant": "Grab",
      "amount": 730000,
      "currency": "VND",
      "twd": 916,
      "status": "expected",
      "card": "",
      "note": "估算"
    },
    {
      "id": "ex_loafer",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-06",
      "item": "樂福鞋訂做",
      "merchant": "Friendly Shoe Shop",
      "amount": 85,
      "currency": "USD",
      "twd": 2760,
      "status": "expected",
      "card": "",
      "note": "抓上限 USD 85"
    },
    {
      "id": "ex_fivefinger",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-07",
      "item": "Vibram 五指鞋 KSO EVO",
      "merchant": "Flow Store",
      "amount": 3599000,
      "currency": "VND",
      "twd": 4516,
      "status": "expected",
      "card": "",
      "note": ""
    },
    {
      "id": "ex_barber",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-08",
      "item": "Luxury Barber 帝王洗頭（用折價券）",
      "merchant": "Luxury Barber",
      "amount": 300000,
      "currency": "VND",
      "twd": 376,
      "status": "expected",
      "card": "",
      "note": "扣券後估算"
    },
    {
      "id": "ex_blackhead",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-08",
      "item": "做臉／除黑頭",
      "merchant": "Spa",
      "amount": 500000,
      "currency": "VND",
      "twd": 627,
      "status": "expected",
      "card": "",
      "note": "估算"
    },
    {
      "id": "ex_dinner_1108",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-08",
      "item": "晚餐 omakase",
      "merchant": "Sushi-Bê",
      "amount": 1400000,
      "currency": "VND",
      "twd": 1757,
      "status": "expected",
      "card": "",
      "note": ""
    },
    {
      "id": "ex_buffet",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-09",
      "item": "All Seasons buffet",
      "merchant": "All Seasons",
      "amount": 700000,
      "currency": "VND",
      "twd": 878,
      "status": "expected",
      "card": "",
      "note": ""
    },
    {
      "id": "ex_souvenirs",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "2026-11-09",
      "item": "伴手禮",
      "merchant": "韓市場／Lotte",
      "amount": 500000,
      "currency": "VND",
      "twd": 627,
      "status": "expected",
      "card": "",
      "note": ""
    },
    {
      "id": "ex_meals_misc",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "",
      "item": "日常午晚餐＋咖啡",
      "merchant": "在地餐廳",
      "amount": 1410000,
      "currency": "VND",
      "twd": 1769,
      "status": "expected",
      "card": "",
      "note": "估算"
    },
    {
      "id": "ex_grab_misc",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "",
      "item": "其餘 Grab（Flow／Barber／機場等）",
      "merchant": "Grab",
      "amount": 730000,
      "currency": "VND",
      "twd": 916,
      "status": "expected",
      "card": "",
      "note": "合併估算：1107+1108+1110 等"
    },
    {
      "id": "ex_boots_opt",
      "updatedAt": "2026-10-28T10:04:05+08:00",
      "userEdited": false,
      "date": "",
      "item": "高筒靴（選配）",
      "merchant": "Friendly Shoe Shop",
      "amount": 110,
      "currency": "USD",
      "twd": 3572,
      "status": "expected",
      "card": "",
      "note": "不計入主合計；選配"
    }
  ],
  "notes": "峴港短假期（Notion 同步）：鞋、五行山、放鬆為主。11 月雨季，每件事都有雨天備案。\n\n已付款合計約 NT$14,554；預期尚未付款約 NT$20,588；全程預估約 NT$35,142（含選配高筒靴約 38,714）。匯率參考：1 TWD ≈ 797 VND。\n\n提醒：\n- 敏感個資（護照號、完整地址、手機、驗證碼）不要貼在此 App。\n- 本機編輯優先於 Notion 同步；換裝置前請先「匯出 JSON」。\n- 回程 IT552；接送與託運記得出發前搞定。\n- 雨天：11/6 早上查 Hội An ngập；Flow Store 週日公休。\n\nNotion 來源頁最後更新：2026/10/28 10:06（台北）。",
  "archived": false,
  "createdAt": "2026-10-28T00:00:00+08:00",
  "updatedAt": "2026-10-28T10:04:05+08:00",
  "userEdited": false
};
    trip.routeMap = {
      "title": "主要動線",
      "note": "Grab／自駕估算；實際視路況與尖峰而異",
      "points": [
        {
          "id": "hotel",
          "label": "飯店",
          "sublabel": "Royal Lotus Hotel Danang",
          "lat": 16.0548,
          "lng": 108.2435
        },
        {
          "id": "marble",
          "label": "五行山",
          "sublabel": "Marble Mountains（Ngũ Hành Sơn）",
          "lat": 16.0039,
          "lng": 108.2635
        },
        {
          "id": "hoian",
          "label": "會安",
          "sublabel": "古城／日本橋一帶",
          "lat": 15.8777,
          "lng": 108.3287
        }
      ],
      "edges": [
        {
          "from": "hotel",
          "to": "marble",
          "distance": "約 8–10 km",
          "time": "15–25 分"
        },
        {
          "from": "marble",
          "to": "hoian",
          "distance": "約 18–20 km",
          "time": "30–40 分"
        },
        {
          "from": "hotel",
          "to": "hoian",
          "distance": "約 25–28 km",
          "time": "40–55 分"
        }
      ]
    };
    trip.journal = Array.isArray(trip.journal) ? trip.journal : [];
    trip.memories = trip.memories || {
      highlights: [],
      wouldReturn: null,
      overallRating: null,
      postTripNote: ''
    };
    enrichDanangDetails(trip);
    trip.updatedAt = now;
    trip.createdAt = trip.createdAt || now;
    return trip;
  }

  global.TravelSeed = {
    uid: uid,
    blankTrip: blankTrip,
    daNangTrip: daNangTrip,
    defaultState: function () {
      const trip = daNangTrip();
      return {
        version: 1,
        activeTripId: trip.id,
        trips: [trip]
      };
    }
  };
})(window);
