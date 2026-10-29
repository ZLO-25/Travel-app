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
  "summary": "主要目的：練足弓、健身。首選 KSO EVO（VND 3,599,000 ≈ NT$4,300），Flow Store（越南獨家經銷）正品；鞋底不到 5 mm，走路＋室內訓練都能穿。以重訓為主改選 Graspifier；重訓量大且預算夠可選 Groundsplay。",
  "tips": [
    "為什麼選走路也能穿的款：練足弓靠每天累積的穿著時間（走路、站著、在家），只在健身時穿太少；KSO EVO 兩種場合都能用",
    "型號對照（官網價，男款 EU 40–46）：\nKSO EVO ⭐首選｜3,599,000｜走路、室內訓練、入門\nGraspifier｜3,499,000｜重訓、功能性訓練（分段鞋底）\nGroundsplay｜4,899,000｜深蹲硬舉高強度（2026 新款，4.5 mm、綁帶）\nV-Run／Spidr Walk／Trailope｜4,899,000–4,999,000｜跑步／戶外越野，現在不需要",
    "試穿 1：先赤腳在店裡走 1–2 分鐘，讓腳放鬆（整體約 30–45 分鐘）",
    "試穿 2：不穿襪子試（除非打算配五趾襪）",
    "試穿 3：鬆開魔鬼氈／鞋帶，腳跟先放好，用手指把每根腳趾送進趾套；一格只放一趾，小趾最容易跑錯格",
    "試穿 4 合腳標準：最長腳趾剛好碰到趾套前端或差一點；腳趾不彎不擠，像第二層皮膚。腳會滑動＝太大（起水泡）；趾套前還有空間＝小一號；腳趾被擠彎＝大一號",
    "試穿 5 動作測試：硬地走 5 分鐘、深蹲 10 下、弓箭步、提踵、單腳站 30 秒（兩腳）、快速轉身；看後跟滑不滑、腳背綁帶壓不壓、縫線磨不磨",
    "試穿 6：兩款都試；同款至少試兩個尺寸；不同款尺寸可能不同",
    "試穿 7：問店家退換規則（官網收到 7 天內可換）、退稅、有沒有折扣",
    "導入 第 1–2 週：每天 15–30 分鐘走路或在家穿；健身先做低重量動作",
    "導入 第 3–4 週：每隔幾天增加 10–15 分鐘",
    "導入 1 個月後：感覺穩定才短距離慢跑（從 1 km 開始）",
    "11/1 剛跑完 29K：旅途中只穿短時間，不要穿去長時間逛街",
    "清洗：冷水手洗或洗衣機輕柔模式，自然風乾；不要烘乾、不要曬太陽",
    "店家 Flow Store：268 Dương Đình Nghệ, An Hải（離 Royal Lotus ~2.5 km，Grab 約 8 分）；週一至六 09:00–20:30、週日公休；電話 +84 878 268 468；先問現貨尺寸（有 45 號以上）；一雙超過 200 萬越盾可退稅，結帳前問「có hoàn thuế VAT không?」"
  ],
  "warnings": [
    "腳背、腳跟或阿基里斯腱痛到隔天還在 → 退回上一階段；腳背持續痛要特別小心（可能是壓力性骨折警訊）",
    "平常穿穩定鞋、扁平足或容易內倒 → 導入要更慢",
    "週日公休；價格以店內為準；只買授權通路（Flow Store），慎防仿品"
  ],
  "images": [
    {
      "src": "assets/details/vibram-flow-mens-lineup.webp",
      "alt": "Flow Store Vibram 男款選擇",
      "caption": "Flow Store 男款選擇（官網價 2026/10）"
    },
    {
      "src": "assets/details/vibram-kso-evo-product.webp",
      "alt": "Vibram KSO EVO 產品圖",
      "caption": "KSO EVO（首選）"
    },
    {
      "src": "assets/details/vibram-alt-models.webp",
      "alt": "Vibram 其他型號",
      "caption": "其他型號"
    },
    {
      "src": "assets/details/vibram-kso-evo.webp",
      "alt": "Vibram FiveFingers KSO EVO 參考卡",
      "caption": "參考卡（非實品照片）· Flow Store 峴港"
    }
  ],
  "links": [
    {
      "label": "Flow Store 官網",
      "url": "https://flowstore.com.vn"
    },
    {
      "label": "Vibram 尺寸／試穿指南",
      "url": "https://www.vibram.com/cn/en/sizing-guide-navigation/fitting-guide.html"
    }
  ]
};
  }

  function detailLoafer() {
    return {
  "title": "會安訂做樂福鞋（第一雙・休閒）",
  "summary": "Ryan 的第一雙樂福鞋，以日常休閒為主（牛仔褲、亞麻寬褲、短褲＋oversized 襯衫），要年輕乾淨、不要老派厚圓頭。Friendly／會安訂做通常可選皮底或橡膠底——請明確指定「薄型橡膠底／gum／city sole」（比厚膠底輕、仍防滑），並選中等修身、線條乾淨的深棕便士樂福。下單約 1–1.5 小時，旅期內試穿取鞋。",
  "tips": [
    "薄膠底：跟店家說要「薄型橡膠底／gum sole／city rubber」（低側緣、不要登山鞋那種厚 lug）；比全皮底更耐濕、比厚膠底更輕。若店內只有厚膠底，可問能否做薄一點或改 city sole／半膠組合底",
    "會安訂做（含 Friendly）一般可選皮底、橡膠底或組合；下單前請店家拿出底樣確認厚度與車縫（優先車縫／縫底，避免只貼膠）",
    "年輕不老氣：避免過圓、過厚、過長的「老派」鞋頭；選中等修身、略收尖但不尖頭的杏仁頭、apron 線條乾淨、車線少而整齊",
    "顏色：深巧克力棕仍最百搭；可問有無再深一點、接近黑的巧克力／espresso；同色系皮帶更好搭",
    "楦與內裡：第一雙休閒可選軟一點／輕內裡（或問有無較薄 lining），穿起來不要又硬又厚",
    "穿搭參考：窄管牛仔褲＋隱形襪；亞麻寬褲＋樂福；oversized 襯衫＋短褲＋樂福（見下方年輕向示意圖）",
    "跟師傅說清楚：深棕便士、薄橡膠底、中等修身休閒楦、日常走路——可秀手機裡「現代薄底」示意圖，並說不要老派厚圓頭",
    "出發前：決定規格、量腳（雙腳）、剪趾甲、拍腳／現有鞋內底照片",
    "新鞋磨合：先室內短時間穿、隱形襪／no-show socks；熱點貼防水膠布",
    "Trần Phú 淹水時改其他分店；11/6 早上可查 Hội An ngập",
    "留足試穿與修改時間；最晚 11/9 取鞋付尾款",
    "訂鞋時順便問小皮件：識別證皮套（深色牛皮＋紅線）能否同店做"
  ],
  "warnings": [
    "雨季可能改店／延誤，別拖到最後一天才下單",
    "第一雙勿追過尖／過硬正裝楦，也不要默認厚膠登山底——明確說「薄」",
    "圖為示意（非店內實品／無品牌授權），實際皮料、楦頭與底厚以店內為準"
  ],
  "images": [
    {
      "src": "assets/details/loafer-penny-brown-side.webp",
      "alt": "深棕便士樂福側視示意",
      "caption": "側視｜深棕便士樂福（示意圖・非實品）"
    },
    {
      "src": "assets/details/loafer-penny-brown-top.webp",
      "alt": "深棕便士樂福俯視示意",
      "caption": "俯視｜中等圓頭、penny 帶（示意圖）"
    },
    {
      "src": "assets/details/loafer-penny-brown-threequarter.webp",
      "alt": "深棕便士樂福三分之四角度示意",
      "caption": "3/4 角｜橡膠底側緣可見（示意圖）"
    },
    {
      "src": "assets/details/loafer-rubber-sole.webp",
      "alt": "樂福鞋橡膠大底示意",
      "caption": "橡膠大底｜第一雙優先（好走、耐濕）示意圖"
    },
    {
      "src": "assets/details/loafer-penny-strap-detail.webp",
      "alt": "便士帶細節特寫示意",
      "caption": "Penny 帶細節｜跟師傅對款用（示意圖）"
    },
    {
      "src": "assets/details/loafer-casual-jeans.webp",
      "alt": "牛仔褲搭配深棕樂福鞋示意",
      "caption": "休閒穿搭｜牛仔褲＋隱形襪（示意圖）"
    },
    {
      "src": "assets/details/loafer-casual-chinos.webp",
      "alt": "卡其褲搭配深棕樂福鞋示意",
      "caption": "休閒穿搭｜卡其／chino＋棉質襯衫（示意圖）"
    },
    {
      "src": "assets/details/loafer-casual-shorts.webp",
      "alt": "亞麻短褲搭配深棕樂福鞋示意",
      "caption": "夏日休閒｜亞麻短褲＋短袖（示意圖）"
    },
    {
      "src": "assets/details/loafer-thin-sole-closeup.webp",
      "alt": "薄型橡膠大底特寫示意",
      "caption": "薄膠底特寫｜city／gum 大底（示意圖・跟店家對底樣）"
    },
    {
      "src": "assets/details/loafer-thin-sole-edge.webp",
      "alt": "薄型橡膠底側緣厚度示意",
      "caption": "薄底側緣｜低側緣、不要厚 lug（示意圖）"
    },
    {
      "src": "assets/details/loafer-thin-sole-profile.webp",
      "alt": "薄底便士樂福側輪廓示意",
      "caption": "側輪廓｜薄底＋便士樂福（示意圖）"
    },
    {
      "src": "assets/details/loafer-modern-sleek-brown.webp",
      "alt": "現代修身深棕便士樂福示意",
      "caption": "現代款｜略收尖杏仁頭、線條乾淨（示意圖・較不老氣）"
    },
    {
      "src": "assets/details/loafer-modern-soft-casual.webp",
      "alt": "軟休閒感深棕便士樂福示意",
      "caption": "軟休閒感｜輕內裡氛圍、日常好穿（示意圖）"
    },
    {
      "src": "assets/details/loafer-casual-young-jeans.webp",
      "alt": "窄管牛仔褲搭配樂福鞋年輕穿搭示意",
      "caption": "年輕穿搭｜窄管牛仔褲＋薄底樂福（示意圖）"
    },
    {
      "src": "assets/details/loafer-casual-young-linen.webp",
      "alt": "亞麻寬褲搭配樂福鞋示意",
      "caption": "年輕穿搭｜亞麻寬褲＋樂福（示意圖）"
    },
    {
      "src": "assets/details/loafer-casual-young-shorts.webp",
      "alt": "oversized襯衫短褲搭配樂福鞋示意",
      "caption": "年輕穿搭｜oversized 襯衫＋短褲＋樂福（示意圖）"
    }
  ],
  "links": []
};
  }


  function detailIdBadge() {
    return {
  "title": "訂做識別證皮套（台積電紅黑配色）",
  "summary": "官方主色只有紅 #E60012＋黑 #000000（不是藍）。配色致敬即可，勿做未授權 Logo。兩大皮料方向：①真黑／近黑牛皮＋紅點綴（最貼標準配色，見款式 D–H）②深巧克力棕＋紅（較休閒、好配樂福鞋，見款式 A–C）。建議一次訂 2–3 個。",
  "tips": [
    "【皮料方向① 標準配色】真黑／近黑全粒面牛皮＋紅 #E60012 點綴；金屬五金建議槍色或黑色",
    "款式D 真黑直式＋頂部粗紅條＋槍色 D環（示意）",
    "款式E 真黑直式＋全周紅邊油、黑車線（示意）",
    "款式F 真黑橫式＋窗框紅對比車線（示意）",
    "款式G 黑對開外皮＋開合可見紅 #E60012 內裡（示意）",
    "款式H 真黑直式＋左側細紅直條（示意）",
    "【皮料方向② 休閒向】深巧克力棕＋紅：較好配樂福鞋；見款式 A–C",
    "款式A 直式雙面（最熱門）：深棕＋紅車線；正面透明窗、背面卡槽；頸繩 D環",
    "款式B 橫式：頂部紅皮條＋槍色夾",
    "款式C 對開皮夾式：近黑／深棕＋紅線＋掛繩；較厚但實用",
    "壓印：建議只壓姓名縮寫（如 OU），不要擅自做未授權的公司商標",
    "尺寸：先量員工證實際長寬（常見 CR80 約 85.6×54mm）；直式／橫式對應證件方向",
    "會安詢問：跟 Friendly Shoe Shop 訂樂福鞋時順便問小皮件；若不做可回台找 Pinkoi 手工皮件",
    "數量：建議 2 個同款直式＋可選 1 個橫式備援"
  ],
  "warnings": [
    "勿在皮套上仿製未授權的台積電 Logo／字樣（商標風險）；僅用紅 #E60012＋黑 #000000 配色致敬",
    "透明窗用耐磨 PVC／TPU，避免軟質易霧化材質",
    "門禁卡若有特殊厚度／感應，確認背面槽位不會擋感應"
  ],
  "images": [
    {
      "src": "assets/details/id-badge-vertical-red-stitch.webp",
      "alt": "款式A 直式雙面識別證皮套示意",
      "caption": "款式A｜直式雙面：深棕牛皮＋台積電紅車線（示意圖）"
    },
    {
      "src": "assets/details/id-badge-horizontal-red-bar.webp",
      "alt": "款式B 橫式識別證皮套示意",
      "caption": "款式B｜橫式：頂部紅皮條＋槍色夾（示意圖）"
    },
    {
      "src": "assets/details/id-badge-bifold-minimal.webp",
      "alt": "款式C 對開皮夾式識別證皮套示意",
      "caption": "款式C｜對開皮夾式：近黑＋紅線＋掛繩（示意圖）"
    },
    {
      "src": "assets/details/id-badge-d-black-red-topbar.webp",
      "alt": "款式D 真黑直式頂部紅條示意",
      "caption": "款式D｜標準配色：真黑＋頂部粗紅 #E60012＋槍色 D環（示意圖）"
    },
    {
      "src": "assets/details/id-badge-e-black-red-edgepaint.webp",
      "alt": "款式E 真黑全周紅邊油示意",
      "caption": "款式E｜標準配色：真黑＋全周紅邊油、黑車線（示意圖）"
    },
    {
      "src": "assets/details/id-badge-f-black-horizontal-red-stitch.webp",
      "alt": "款式F 真黑橫式紅窗線示意",
      "caption": "款式F｜標準配色：真黑橫式＋窗框紅對比車線（示意圖）"
    },
    {
      "src": "assets/details/id-badge-g-black-bifold-red-lining.webp",
      "alt": "款式G 黑對開紅內裡示意",
      "caption": "款式G｜標準配色：黑對開外皮＋紅 #E60012 內裡外露（示意圖）"
    },
    {
      "src": "assets/details/id-badge-h-black-side-red-stripe.webp",
      "alt": "款式H 真黑側紅細條示意",
      "caption": "款式H｜標準配色：真黑＋左側細紅直條（示意圖）"
    }
  ],
  "links": [
    {
      "label": "Pinkoi SEANCHY 直式識別證皮套（備援）",
      "url": "https://www.pinkoi.com/product/9uPZBCHX"
    },
    {
      "label": "Pinkoi SEANCHY 扣環款識別證皮套",
      "url": "https://www.pinkoi.com/product/mcbWArpj"
    },
    {
      "label": "Pinkoi SEANCHY 店舖",
      "url": "https://www.pinkoi.com/store/seanchy"
    }
  ]
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
    var ts = '2026-10-28T23:25:00+08:00';
    var scar = detailScarCream();
    var five = detailFiveFinger();
    var loafer = detailLoafer();
    var badge = detailIdBadge();
    (trip.shopping || []).forEach(function (item) {
      if (!item) return;
      if (item.id === 'sh_scar') applyDetails(item, scar, ts);
      else if (item.id === 'sh_fivefinger') applyDetails(item, five, ts);
      else if (item.id === 'sh_loafer') applyDetails(item, loafer, ts);
      else if (item.id === 'sh_id_badge') applyDetails(item, badge, ts);
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
      "updatedAt": "2026-10-29T11:50:00+08:00",
      "userEdited": false,
      "label": "回程接送預約（已完成）",
      "date": "2026-11-02",
      "note": "已訂 D3953684（全鋒）"
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
          "updatedAt": "2026-10-29T11:50:00+08:00",
          "userEdited": false,
          "text": "預約 11/10 桃園→台中接送（全鋒）",
          "done": true,
          "due": "建議 11/2 前",
          "note": "已訂 D3953684；夜間加成 NT$200 已付（匯豐••6401）"
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
          "note": "第一雙休閒：深棕便士樂福＋橡膠底"
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
      "detail": "高雄 KHH 17:20 → 峴港 DAD 19:00｜2026-11-05｜已付 TWD 6,355（去回合計，見花費）",
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
      "updatedAt": "2026-10-29T11:50:00+08:00",
      "userEdited": false,
      "type": "transfer",
      "title": "回程接送 桃園→台中",
      "detail": "全鋒｜IT552 桃園T1 23:15 → 台中西屯國安一路51號之8（6樓1）｜四人座",
      "ref": "D3953684",
      "status": "confirmed",
      "note": "匯豐旅人無限 V-LIMO 權益免車資；夜間加成 NT$200 已付。司機依實際落地時間，免費等候90分，之後 NT$300/時；延誤≥4小時視同取消退款。改/取消需24小時前撥 0800-860-929；帶身分證與卡"
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
          "updatedAt": "2026-10-29T11:50:00+08:00",
          "userEdited": false,
          "time": "23:15",
          "text": "桃園落地 → 全鋒接機回台中 D3953684（司機依實際落地、免費等90分；前1小時簡訊司機資料；帶身分證＋匯豐卡）",
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
      "text": "訂做樂福鞋（第一雙・休閒）",
      "done": false,
      "note": "Friendly Shoe Shop；深棕便士＋橡膠底；日常休閒為主"
    },
    {
      "id": "sh_id_badge",
      "updatedAt": "2026-10-28T18:30:00+08:00",
      "userEdited": false,
      "text": "訂做識別證皮套（多款紅黑示意）",
      "done": false,
      "note": "標準配色紅#E60012＋黑；跟樂福鞋同店詢問能否做"
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
      "note": "10/30 越南時間前可免費取消",
      "estimateTwd": 5890,
      "excludeFromEstimate": false
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
      "note": "訂單 1616334893071825；不含託運",
      "estimateTwd": 6355,
      "excludeFromEstimate": false
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
      "note": "26KK259044234",
      "estimateTwd": 248,
      "excludeFromEstimate": false
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
      "note": "帳單入帳 NT$834",
      "estimateTwd": 834,
      "excludeFromEstimate": false
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
      "note": "含已取消訂房手續費 46",
      "estimateTwd": 242,
      "excludeFromEstimate": false
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
      "note": "QR 已寄達",
      "estimateTwd": 0,
      "excludeFromEstimate": false
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
      "note": "576109368868",
      "estimateTwd": 985,
      "excludeFromEstimate": false
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
      "note": "F15528953；免費",
      "estimateTwd": 0,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_baggage",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "",
      "item": "回程託運 15kg",
      "merchant": "台灣虎航",
      "amount": 1000,
      "currency": "TWD",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "待加購",
      "estimateTwd": 1000,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_transfer_back",
      "updatedAt": "2026-10-29T11:50:00+08:00",
      "userEdited": false,
      "date": "2026-10-29",
      "item": "桃園→台中接送（夜間加價）",
      "merchant": "全鋒",
      "amount": 200,
      "currency": "TWD",
      "twd": 200,
      "status": "paid",
      "card": "匯豐••6401",
      "note": "D3953684；ECPay 綠界；車資權益免費",
      "estimateTwd": 200,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_grab_arrive",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-05",
      "item": "機場→飯店 Grab",
      "merchant": "Grab",
      "amount": 100000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "估算",
      "estimateTwd": 125,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_seafood",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-05",
      "item": "海鮮晚餐",
      "merchant": "Năm Đảnh／Bé Mặn",
      "amount": 400000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "估算",
      "estimateTwd": 502,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_massage",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "",
      "item": "按摩約 4 次",
      "merchant": "Herbal／Charm 等",
      "amount": 2180000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "估算",
      "estimateTwd": 2735,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_scar",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "",
      "item": "除疤膏",
      "merchant": "Long Châu",
      "amount": 210000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "",
      "estimateTwd": 263,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_marble",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-06",
      "item": "五行山門票",
      "merchant": "五行山景區",
      "amount": 75000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "現金",
      "note": "只收現金",
      "estimateTwd": 94,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_hoian_ticket",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-06",
      "item": "會安古城門票",
      "merchant": "售票亭",
      "amount": 120000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "現金",
      "note": "",
      "estimateTwd": 151,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_grab_1106",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-06",
      "item": "五行山／會安交通",
      "merchant": "Grab",
      "amount": 730000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "估算",
      "estimateTwd": 916,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_loafer",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-06",
      "item": "樂福鞋訂做",
      "merchant": "Friendly Shoe Shop",
      "amount": 85,
      "currency": "USD",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "抓上限 USD 85",
      "estimateTwd": 2760,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_fivefinger",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-07",
      "item": "Vibram 五指鞋 KSO EVO",
      "merchant": "Flow Store",
      "amount": 3599000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "",
      "estimateTwd": 4516,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_barber",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-08",
      "item": "Luxury Barber 帝王洗頭（用折價券）",
      "merchant": "Luxury Barber",
      "amount": 300000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "扣券後估算",
      "estimateTwd": 376,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_blackhead",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-08",
      "item": "做臉／除黑頭",
      "merchant": "Spa",
      "amount": 500000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "估算",
      "estimateTwd": 627,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_dinner_1108",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-08",
      "item": "晚餐 omakase",
      "merchant": "Sushi-Bê",
      "amount": 1400000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "",
      "estimateTwd": 1757,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_buffet",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-09",
      "item": "All Seasons buffet",
      "merchant": "All Seasons",
      "amount": 700000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "",
      "estimateTwd": 878,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_souvenirs",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "2026-11-09",
      "item": "伴手禮",
      "merchant": "韓市場／Lotte",
      "amount": 500000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "",
      "estimateTwd": 627,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_meals_misc",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "",
      "item": "日常午晚餐＋咖啡",
      "merchant": "在地餐廳",
      "amount": 1410000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "估算",
      "estimateTwd": 1769,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_grab_misc",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "",
      "item": "其餘 Grab（Flow／Barber／機場等）",
      "merchant": "Grab",
      "amount": 730000,
      "currency": "VND",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "合併估算：1107+1108+1110 等",
      "estimateTwd": 916,
      "excludeFromEstimate": false
    },
    {
      "id": "ex_boots_opt",
      "updatedAt": "2026-10-28T20:22:00+08:00",
      "userEdited": false,
      "date": "",
      "item": "高筒靴（選配）",
      "merchant": "Friendly Shoe Shop",
      "amount": 110,
      "currency": "USD",
      "twd": 0,
      "status": "expected",
      "card": "",
      "note": "不計入主合計；選配",
      "estimateTwd": 3572,
      "excludeFromEstimate": true
    }
  ],
  "notes": "峴港短假期（Notion 同步）：鞋、五行山、放鬆為主。11 月雨季，每件事都有雨天備案。\n\n已付款合計約 NT$14,754；預期尚未付款約 NT$20,388；全程預估約 NT$35,142（含選配高筒靴約 38,714）。匯率參考：1 TWD ≈ 797 VND。\n\n提醒：\n- 敏感個資（護照號、完整地址、手機、驗證碼）不要貼在此 App。\n- 本機編輯優先於 Notion 同步；換裝置前請先「匯出 JSON」。\n- 回程 IT552；接送與託運記得出發前搞定。\n- 雨天：11/6 早上查 Hội An ngập；Flow Store 週日公休。\n\nNotion 來源頁最後更新：2026/10/29 10:10（台北）。",
  "archived": false,
  "createdAt": "2026-10-28T00:00:00+08:00",
  "updatedAt": "2026-10-28T20:22:00+08:00",
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
