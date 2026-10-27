/**
 * Seed data & blank trip factory for Ryan's Travel App
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
      notes: '',
      archived: false,
      createdAt: now,
      updatedAt: now
    }, overrides || {});
  }

  function daNangTrip() {
    const now = new Date().toISOString();
    return {
      id: 'trip_danang_2026',
      title: '2026 峴港',
      destination: '越南 · 峴港（Da Nang）',
      startDate: '2026-11-05',
      endDate: '2026-11-10',
      goals: [
        '訂做樂福鞋',
        '買五指鞋',
        '五行山',
        '帝王洗頭',
        '買除疤膏',
        '放鬆度假'
      ],
      deadlines: [
        { id: uid('dl'), label: '回程接送預約（建議最晚）', date: '2026-11-02', note: '全鋒／桃園→台中' },
        { id: uid('dl'), label: '出發日', date: '2026-11-05', note: 'IT585' },
        { id: uid('dl'), label: '回程日', date: '2026-11-10', note: 'IT552 約 23:15 抵桃園' }
      ],
      todoGroups: [
        {
          id: uid('tg'),
          name: '這幾天先做',
          items: [
            { id: uid('td'), text: '看醫生拿常備藥（腸胃／止痛／感冒＋OK繃）', done: false, due: '急迫', note: '' },
            { id: uid('td'), text: '虎航加購回程託運（建議 15kg）', done: false, due: '出發前', note: 'PNR 見訂單' },
            { id: uid('td'), text: '預約 11/10 桃園→台中接送（全鋒）', done: false, due: '建議 11/2 前', note: 'IT552 23:15' }
          ]
        },
        {
          id: uid('tg'),
          name: '出發前到 11/4',
          items: [
            { id: uid('td'), text: '樂福鞋：決定規格、量腳、剪趾甲、拍照片', done: false, due: '', note: '' },
            { id: uid('td'), text: '換越南盾＋Grab 綁卡', done: false, due: '', note: '' },
            { id: uid('td'), text: '寫信 Royal Lotus（約 20:00 到、11/10 晚退房、鞋店送鞋請櫃台通知）', done: false, due: '', note: '' },
            { id: uid('td'), text: '印 e-Visa、貴賓室 QR 截圖', done: false, due: '', note: '' },
            { id: uid('td'), text: '台灣先裝好 eSIM', done: false, due: '', note: '' },
            { id: uid('td'), text: '核對護照資料與訂位一致', done: false, due: '', note: '' },
            { id: uid('td'), text: '問 Flow Store 五指鞋現貨', done: false, due: '', note: '' },
            { id: uid('td'), text: '打包', done: false, due: '', note: '' },
            { id: uid('td'), text: '11/4 線上報到選位', done: false, due: '2026-11-04', note: '' },
            { id: uid('td'), text: '看颱風／淹水資訊', done: false, due: '', note: '' },
            { id: uid('td'), text: '離線地圖＋飯店地址進 Grab', done: false, due: '', note: '' },
            { id: uid('td'), text: '確認富邦電子保單有沒有寄到信箱', done: false, due: '', note: '' }
          ]
        },
        {
          id: uid('tg'),
          name: '已完成／可參考',
          items: [
            { id: uid('td'), text: '投保旅平險（富邦）', done: true, due: '', note: '' },
            { id: uid('td'), text: '外交部出國登錄（網頁）', done: true, due: '', note: '峴港 11/5–11/10' },
            { id: uid('td'), text: 'LINE 出國登錄（月月抽資格）', done: true, due: '', note: '' }
          ]
        },
        {
          id: uid('tg'),
          name: '現地／之後',
          items: [
            { id: uid('td'), text: '查看 BLENDS、Waves 演出表', done: false, due: '', note: '' },
            { id: uid('td'), text: '買除疤膏、五指鞋、訂做樂福鞋', done: false, due: '', note: '' }
          ]
        }
      ],
      bookings: [
        {
          id: uid('bk'),
          type: 'flight',
          title: '去程 Tigerair IT585',
          detail: '台灣 → 峴港｜2026-11-05',
          ref: '',
          status: 'confirmed',
          note: ''
        },
        {
          id: uid('bk'),
          type: 'flight',
          title: '回程 Tigerair IT552',
          detail: '峴港 → 桃園｜2026-11-10｜約 23:15 抵桃',
          ref: '託運 PNR：N6D5RP／R5JVRS',
          status: 'confirmed',
          note: '回程託運待加購'
        },
        {
          id: uid('bk'),
          type: 'hotel',
          title: 'Royal Lotus',
          detail: '入住 2026-11-05～11/10（晚退房需求待信）',
          ref: '',
          status: 'confirmed',
          note: '約 20:00 抵達'
        },
        {
          id: uid('bk'),
          type: 'transfer',
          title: '回程接送 桃園→台中',
          detail: '建議全鋒｜配合 IT552',
          ref: '',
          status: 'todo',
          note: '建議 11/2 前預約'
        },
        {
          id: uid('bk'),
          type: 'insurance',
          title: '富邦旅平險',
          detail: '電子保單確認中',
          ref: '',
          status: 'confirmed',
          note: ''
        },
        {
          id: uid('bk'),
          type: 'visa',
          title: '越南 e-Visa',
          detail: '出發前列印／備電子檔',
          ref: '',
          status: 'confirmed',
          note: ''
        },
        {
          id: uid('bk'),
          type: 'esim',
          title: '越南 eSIM',
          detail: '台灣先安裝啟用',
          ref: '',
          status: 'todo',
          note: ''
        },
        {
          id: uid('bk'),
          type: 'lounge',
          title: '機場貴賓室',
          detail: 'QR 截圖備用',
          ref: '',
          status: 'todo',
          note: ''
        }
      ],
      days: [
        {
          id: uid('day'),
          date: '2026-11-05',
          title: '抵達峴港',
          blocks: [
            { id: uid('bl'), time: '下午／晚', text: 'IT585 抵達 → Grab／接駁到 Royal Lotus（約 20:00）', place: 'Royal Lotus' },
            { id: uid('bl'), time: '晚', text: '安頓、附近簡單用餐、休息', place: '' }
          ]
        },
        {
          id: uid('day'),
          date: '2026-11-06',
          title: '鞋與市區',
          blocks: [
            { id: uid('bl'), time: '白天', text: '樂福鞋店洽談／量腳（視預約）', place: '' },
            { id: uid('bl'), time: '彈性', text: 'Flow Store 問五指鞋；市區散步', place: '' }
          ]
        },
        {
          id: uid('day'),
          date: '2026-11-07',
          title: '五行山／放鬆',
          blocks: [
            { id: uid('bl'), time: '白天', text: '五行山（Marble Mountains）', place: '五行山' },
            { id: uid('bl'), time: '可選', text: '帝王洗頭或SPA', place: '' }
          ]
        },
        {
          id: uid('day'),
          date: '2026-11-08',
          title: '彈性日',
          blocks: [
            { id: uid('bl'), time: '整天', text: '購物（除疤膏等）、海灘或咖啡、視情況補鞋進度', place: '' }
          ]
        },
        {
          id: uid('day'),
          date: '2026-11-09',
          title: '彈性／夜生活',
          blocks: [
            { id: uid('bl'), time: '晚', text: 'BLENDS／Waves 演出表確認後決定', place: '' }
          ]
        },
        {
          id: uid('day'),
          date: '2026-11-10',
          title: '退房＋回程',
          blocks: [
            { id: uid('bl'), time: '白天', text: '晚退房（若飯店同意）／取鞋／最後採買', place: 'Royal Lotus' },
            { id: uid('bl'), time: '晚', text: '前往機場 → IT552 → 桃園 → 接送回台中', place: '' }
          ]
        }
      ],
      places: [
        { id: uid('pl'), name: 'Royal Lotus', category: '住宿', note: '飯店；約 20:00 到、晚退房需求', url: '', mapsUrl: '' },
        { id: uid('pl'), name: '五行山 Marble Mountains', category: '景點', note: '經典行程', url: '', mapsUrl: '' },
        { id: uid('pl'), name: '樂福鞋訂製店', category: '購物', note: '出發前量腳、規格、照片', url: '', mapsUrl: '' },
        { id: uid('pl'), name: 'Flow Store', category: '購物', note: '五指鞋現貨', url: '', mapsUrl: '' },
        { id: uid('pl'), name: '帝王洗頭', category: '體驗', note: '放鬆行程', url: '', mapsUrl: '' },
        { id: uid('pl'), name: 'BLENDS', category: '夜生活', note: '演出表待查', url: '', mapsUrl: '' },
        { id: uid('pl'), name: 'Waves', category: '夜生活', note: '演出表待查', url: '', mapsUrl: '' }
      ],
      shopping: [
        { id: uid('sh'), text: '訂做樂福鞋', done: false, note: '規格／尺寸事先決定' },
        { id: uid('sh'), text: '五指鞋', done: false, note: 'Flow Store' },
        { id: uid('sh'), text: '除疤膏', done: false, note: '' },
        { id: uid('sh'), text: '其他伴手／消耗品', done: false, note: '' }
      ],
      packing: [
        {
          id: uid('pk'),
          category: '證件與錢',
          items: [
            { id: uid('pi'), text: '護照', done: false },
            { id: uid('pi'), text: 'e-Visa 列印／電子檔', done: false },
            { id: uid('pi'), text: '信用卡／一些現金 VND', done: false },
            { id: uid('pi'), text: '保險與訂位資訊（截圖）', done: false }
          ]
        },
        {
          id: uid('pk'),
          category: '衣物',
          items: [
            { id: uid('pi'), text: '短袖／輕便長褲', done: false },
            { id: uid('pi'), text: '涼鞋或透氣鞋', done: false },
            { id: uid('pi'), text: '薄外套（機艙／晚上）', done: false },
            { id: uid('pi'), text: '內衣襪足夠天數', done: false }
          ]
        },
        {
          id: uid('pk'),
          category: '電子與旅用品',
          items: [
            { id: uid('pi'), text: '手機＋充電器／行動電源', done: false },
            { id: uid('pi'), text: 'eSIM（出發前裝好）', done: false },
            { id: uid('pi'), text: '轉接頭／充電線', done: false },
            { id: uid('pi'), text: '耳機', done: false }
          ]
        },
        {
          id: uid('pk'),
          category: '藥品與個人',
          items: [
            { id: uid('pi'), text: '常備藥（腸胃／止痛／感冒）', done: false },
            { id: uid('pi'), text: 'OK繃／小急救', done: false },
            { id: uid('pi'), text: '防曬／牙刷盥洗', done: false },
            { id: uid('pi'), text: '量腳資料／鞋款照片（給訂製店）', done: false }
          ]
        }
      ],
      expenses: [
        { id: uid('ex'), date: '2026-10-27', item: '機票（虎航去回）', merchant: 'Tigerair', amount: 0, currency: 'TWD', twd: 0, status: 'paid', card: '', note: '金額請自行補上' },
        { id: uid('ex'), date: '2026-10-27', item: '飯店 Royal Lotus', merchant: 'Booking／官網', amount: 0, currency: 'TWD', twd: 0, status: 'paid', card: '', note: '金額請自行補上' },
        { id: uid('ex'), date: '2026-10-28', item: '旅平險', merchant: '富邦', amount: 0, currency: 'TWD', twd: 0, status: 'paid', card: '', note: '' },
        { id: uid('ex'), date: '', item: '回程託運 15kg', merchant: 'Tigerair', amount: 0, currency: 'TWD', twd: 0, status: 'expected', card: '', note: '待加購' },
        { id: uid('ex'), date: '', item: '回程接送 桃園→台中', merchant: '全鋒等', amount: 0, currency: 'TWD', twd: 0, status: 'expected', card: '', note: '' },
        { id: uid('ex'), date: '', item: '樂福鞋訂做', merchant: '現地', amount: 0, currency: 'VND', twd: 0, status: 'expected', card: '', note: '' },
        { id: uid('ex'), date: '', item: '五指鞋／除疤膏等', merchant: '現地', amount: 0, currency: 'VND', twd: 0, status: 'expected', card: '', note: '' },
        { id: uid('ex'), date: '', item: '餐飲與交通（概估）', merchant: '現地', amount: 0, currency: 'VND', twd: 0, status: 'expected', card: '', note: '可依天數拆分' }
      ],
      notes: '峴港短假期：鞋、五行山、放鬆為主。\n\n提醒：\n- 敏感個資（護照號等）不要貼在此 App；需要時看實體文件或加密備註。\n- 資料存在這個瀏覽器的 localStorage；換手機／清資料前請先「匯出 JSON」。\n- 回程航班 IT552，接送與託運記得在出發前搞定。',
      archived: false,
      createdAt: now,
      updatedAt: now
    };
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
