/* ============================================================
   Барилгын Нягтлан · Construction Accountant — frontend (cloud)
   Talks to the FastAPI backend. Bilingual (МН/EN), Tögrög (₮).
   ============================================================ */
'use strict';
(function () {
  const API = (window.CA_CONFIG && window.CA_CONFIG.API_BASE) || '/api';

  /* ---------- Session ---------- */
  let token = localStorage.getItem('ca_token') || '';
  let user = null;
  let lang = localStorage.getItem('ca_lang') || 'both';

  /* ---------- i18n ---------- */
  const STR = {
    nav_dashboard: ['Хяналт', 'Dashboard'], nav_materials: ['Материал', 'Materials'],
    nav_stocktake: ['Тооллого', 'Stocktaking'], nav_ledger: ['Орлого/Зарлага', 'Income & Expense'],
    nav_loans: ['Зээл', 'Loans'], nav_settings: ['Тохиргоо', 'Settings'],
    add: ['Нэмэх', 'Add'], edit: ['Засах', 'Edit'], delete: ['Устгах', 'Delete'], save: ['Хадгалах', 'Save'],
    cancel: ['Болих', 'Cancel'], search: ['Хайх', 'Search'], month: ['Сар', 'Month'], all: ['Бүгд', 'All'],
    total: ['Нийт', 'Total'], date: ['Огноо', 'Date'], amount: ['Дүн', 'Amount'], category: ['Ангилал', 'Category'],
    note: ['Тэмдэглэл', 'Note'], name: ['Нэр', 'Name'], actions: ['Үйлдэл', 'Actions'], qty: ['Тоо хэмжээ', 'Quantity'],
    loading: ['Уншиж байна...', 'Loading...'],

    dash_title: ['Хяналтын самбар', 'Dashboard'], this_month: ['Энэ сар', 'This month'],
    income: ['Орлого', 'Income'], expense: ['Зарлага', 'Expense'], net: ['Цэвэр', 'Net'],
    materials_count: ['Материал', 'Materials'], stock_count: ['Тооллогын бичлэг', 'Stock entries'],
    low_stock: ['Дуусаж буй материал', 'Low stock'], upcoming_loans: ['Удахгүй төлөх зээл', 'Upcoming loan payments'],
    no_alerts: ['Анхаарах зүйл алга', 'All clear'], active_loans: ['Идэвхтэй зээл', 'Active loans'],

    mat_title: ['Материал', 'Materials'], mat_sub: ['Үнэ, нийлүүлэгчээр хайх', 'Search by price & supplier'],
    unit: ['Нэгж', 'Unit'], unit_price: ['Нэгж үнэ', 'Unit price'], min_stock: ['Доод хязгаар', 'Min level'],
    supplier: ['Нийлүүлэгч', 'Supplier'], description: ['Тайлбар', 'Description'],
    add_material: ['Материал нэмэх', 'Add material'], edit_material: ['Материал засах', 'Edit material'],
    search_materials: ['Материал хайх...', 'Search materials...'], all_categories: ['Бүх ангилал', 'All categories'],
    min_price: ['Үнэ ≥', 'Price ≥'], max_price: ['Үнэ ≤', 'Price ≤'], no_materials: ['Материал алга', 'No materials yet'],
    image: ['Зураг', 'Image'], find_image: ['Зураг хайх', 'Find image'], img_url_ph: ['эсвэл зургийн URL', 'or paste image URL'],
    searching_img: ['Зураг хайж байна...', 'Searching images...'], pick_image: ['Тохирох зургийг дарж сонгоно уу', 'Tap an image to pick it'],
    no_image: ['Зураг олдсонгүй', 'No image found'],

    st_title: ['Сарын тооллого', 'Monthly stocktaking'], st_sub: ['Сар бүрийн үлдэгдлийг бүртгэх', 'Record monthly stock counts'],
    add_count: ['Тоолол нэмэх', 'Add count'], export_excel: ['Excel татах', 'Export Excel'],
    select_material: ['Материал сонгох', 'Select material'], no_stock: ['Тооллого алга', 'No counts yet'],
    counted_qty: ['Тоолсон тоо', 'Counted quantity'],

    led_title: ['Орлого ба Зарлага', 'Income & Expense'], led_sub: ['Мөнгөн гүйлгээ', 'Cash flow'],
    add_txn: ['Гүйлгээ нэмэх', 'Add entry'], type: ['Төрөл', 'Type'], income_t: ['Орлого', 'Income'],
    outcome_t: ['Зарлага', 'Expense'], no_txns: ['Гүйлгээ алга', 'No entries'], by_category: ['Ангиллаар', 'By category'],
    buy_material: ['Материал худалдан авалт', 'Material purchase'], none_opt: ['Сонгохгүй', 'None'],

    loan_title: ['Зээлийн сануулга', 'Loan reminders'], loan_sub: ['Төлбөрийн хугацааг хянах', 'Track payment due dates'],
    add_loan: ['Зээл нэмэх', 'Add loan'], loan_name: ['Зээлдүүлэгч (компани/банк)', 'Lender (company/bank)'], principal: ['Үлдэгдэл дүн', 'Balance'],
    rate: ['Хүү (%)', 'Rate (%)'], pay_amount: ['Төлөлт бүр', 'Per payment'], freq: ['Давтамж', 'Frequency'],
    monthly: ['Сар бүр', 'Monthly'], weekly: ['7 хоног бүр', 'Weekly'], start_date: ['Эхэлсэн', 'Start'],
    next_pay: ['Дараагийн төлбөр', 'Next payment'], status: ['Төлөв', 'Status'], active: ['Идэвхтэй', 'Active'],
    paid: ['Төлсөн', 'Paid'], overdue: ['Хугацаа хэтэрсэн', 'Overdue'], due_soon: ['Удахгүй', 'Due soon'],
    make_payment: ['Төлбөр хийх', 'Make payment'], mark_paid: ['Дууссан гэж тэмдэглэх', 'Mark as paid'],
    no_loans: ['Зээл алга', 'No loans yet'],

    set_title: ['Тохиргоо', 'Settings'], profile: ['Профайл', 'Profile'], company: ['Байгууллага', 'Company'],
    email: ['Имэйл', 'Email'], language: ['Хэл', 'Language'], logout: ['Гарах', 'Log out'],
    lang_mn: ['Монгол', 'Mongolian'], lang_en: ['Англи', 'English'], lang_both: ['Хоёулаа', 'Both'],
    account: ['Бүртгэл', 'Account'], synced: ['Үүлэнд синк хийгдсэн', 'Synced to cloud'],
    login: ['Нэвтрэх', 'Login'], register: ['Бүртгүүлэх', 'Register'], password: ['Нууц үг', 'Password'],
    nav_convert: ['Импорт', 'Import'], conv_title: ['Excel рүү хөрвүүлэх', 'Convert to Excel'],
    conv_sub: ['CSV, TSV, JSON, текст файлыг .xlsx болгох', 'Turn CSV, TSV, JSON or text into .xlsx'],
    conv_drop: ['Файлаа энд чирж тавь', 'Drag & drop your file here'],
    conv_choose: ['Файл сонгох', 'Choose file'],
    conv_paste: ['Эсвэл хүснэгт буулгах', 'Or paste a table'],
    conv_paste_ph: ['Excel/Sheets-ээс хууласан хүснэгт эсвэл CSV-г энд буулгана уу...', 'Paste a table copied from Excel/Sheets, or CSV here...'],
    conv_paste_btn: ['Буулгасныг хөрвүүлэх', 'Convert pasted'],
    conv_formats: ['Дэмждэг: CSV, TSV, JSON, TXT (зураг/PDF биш)', 'Supported: CSV, TSV, JSON, TXT (not images/PDF)'],
    conv_done: ['амжилттай татагдлаа', 'downloaded'], conv_empty: ['Эхлээд өгөгдөл оруулна уу', 'Enter some data first'],
    imp_title: ['Файл импортлох', 'Import a file'], imp_sub: ['Excel/CSV-г бичилтэд оруулах', 'Add Excel/CSV into your records'],
    imp_kind: ['Юу импортлох вэ?', 'What are you importing?'], imp_ledger: ['Орлого/Зарлага', 'Income/Expense'],
    imp_materials: ['Материал', 'Materials'], imp_template: ['Загвар татах', 'Get template'],
    imp_choose: ['Файл сонгох', 'Choose file'], imp_preview: ['Урьдчилан харах', 'Preview'],
    imp_import_n: ['мөр оруулах', 'rows — Import'], imp_done: ['мөр орлоо', 'rows imported'],
    imp_or_convert: ['Эсвэл зүгээр Excel болгох (хадгалахгүй):', 'Or just convert a file to Excel (no import):'],
    report_download: ['Сарын Excel татах', 'Download month Excel'], report_month: ['Тайлант сар', 'Report month'],
    imp_no_type: ['"Төрөл" багана алга — бүгд Орлого болж орно. Хэрэв материалын жагсаалт бол дээрээс "📦 Материал" сонгоно уу.', 'No "Type" column found — everything will be Income. If this is a materials list, pick "📦 Materials" above.']
  };
  function T(key) { const e = STR[key]; if (!e) return key; if (lang === 'mn') return e[0]; if (lang === 'en') return e[1]; return e[0] + ' / ' + e[1]; }

  const UNITS = [['ш', 'ширхэг', 'pcs'], ['кг', 'кг', 'kg'], ['тонн', 'тонн', 'ton'], ['м', 'метр', 'm'],
    ['м²', 'кв.м', 'm²'], ['м³', 'куб.м', 'm³'], ['уут', 'уут', 'bag'], ['литр', 'литр', 'L'],
    ['хайрцаг', 'хайрцаг', 'box'], ['багц', 'багц', 'set'], ['рулон', 'рулон', 'roll']];
  function unitLabel(v) { const u = UNITS.find(x => x[0] === v); if (!u) return v || ''; return lang === 'en' ? u[2] : lang === 'mn' ? u[1] : u[1] + '/' + u[2]; }
  const MAT_CATS = ['Цемент / Cement', 'Тоосго / Brick', 'Төмөр / Steel', 'Мод / Wood', 'Дулаалга / Insulation', 'Цахилгаан / Electrical', 'Сантехник / Plumbing', 'Замаск / Putty', 'Шпаклёвк / Plaster', 'Будаг / Paint', 'Засал / Finishing', 'Багаж / Tools', 'Бусад / Other'];
  const INCOME_CATS = ['Борлуулалт / Sales', 'Урьдчилгаа / Advance', 'Зээл авсан / Loan in', 'Бусад / Other'];
  const OUTCOME_CATS = ['Материал / Materials', 'Цалин / Salary', 'Түрээс / Rent', 'Тээвэр / Transport', 'Татвар / Tax', 'Зээл төлсөн / Loan payment', 'Бусад / Other'];

  /* ---------- Material image search (Wikipedia API, no key needed) ---------- */
  // Value's FIRST word is the head material noun (required to appear in image titles).
  const MAT_TERMS = {
    'цемент': 'cement bag', 'тоосго': 'brick wall', 'улаан тоосго': 'brick wall red', 'арматур': 'rebar steel bar',
    'төмөр': 'steel bar metal', 'элс': 'sand construction pile', 'дайрга': 'gravel crushed stone',
    'хайрга': 'gravel stones', 'мод': 'lumber timber wood', 'банз': 'plank board wood', 'фанер': 'plywood sheet',
    'осб': 'osb board', 'гипс': 'drywall gypsum board', 'гипсэн хавтан': 'drywall sheet', 'шохой': 'lime powder',
    'будаг': 'paint can bucket', 'хадаас': 'nails steel', 'шураг': 'screws', 'бетон': 'concrete', 'блок': 'block concrete',
    'хөөсөнцөр': 'styrofoam insulation foam', 'дулаалга': 'insulation material', 'шил': 'glass sheet', 'цонх': 'window frame',
    'хаалга': 'door', 'хавтан': 'tile ceramic', 'плита': 'tile floor ceramic', 'керамик': 'ceramic tile',
    'хоолой': 'pipe pvc plumbing', 'утас': 'wire electrical', 'кабель': 'cable electrical', 'розетка': 'socket power outlet',
    'силикон': 'silicone sealant', 'наалт': 'glue adhesive', 'шавар': 'mortar', 'замаск': 'spackle wall putty',
    'шпаклевк': 'spackle wall', 'шпаклёвк': 'spackle wall', 'сэнс': 'fan ventilation', 'унитаз': 'toilet',
    'ванн': 'bathtub', 'угаалтуур': 'sink basin'
  };
  function termFor(name) {
    const k = name.trim().toLowerCase();
    if (MAT_TERMS[k]) return { q: MAT_TERMS[k], recognized: true };
    for (const key in MAT_TERMS) if (k.includes(key)) return { q: MAT_TERMS[key], recognized: true };
    return { q: k, recognized: false };
  }
  // Openverse — openly-licensed real photos (best for product shots).
  async function openverseImages(query) {
    try {
      const u = 'https://api.openverse.org/v1/images/?q=' + encodeURIComponent(query) + '&page_size=12&category=photograph';
      const r = await fetch(u); if (!r.ok) return [];
      const j = await r.json();
      return (j.results || []).map(x => ({ title: x.title || '', url: x.thumbnail || x.url })).filter(x => x.url);
    } catch (e) { return []; }
  }
  // Wikimedia Commons photo files (fallback / extra coverage).
  async function commonsImages(query) {
    try {
      const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
        '&generator=search&gsrnamespace=6&gsrlimit=14&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + query) +
        '&prop=imageinfo&iiprop=url&iiurlwidth=640';
      const r = await fetch(u); const j = await r.json();
      const pages = (j.query && j.query.pages) ? Object.values(j.query.pages) : [];
      pages.sort((a, b) => (a.index || 0) - (b.index || 0));
      return pages.map(p => ({ title: (p.title || '').replace('File:', ''), url: p.imageinfo && p.imageinfo[0] && p.imageinfo[0].thumburl })).filter(x => x.url);
    } catch (e) { return []; }
  }
  function kwScore(title, kws) { const t = (title || '').toLowerCase(); let s = 0; for (const k of kws) if (k && t.includes(k)) s++; return s; }
  // Titles with these words are usually places/art/people, not the material — demote them.
  const NEG_WORDS = ['beach', 'town', 'city', 'village', 'church', 'cathedral', 'painting', 'drawing', 'sketch',
    'exhibition', 'gallery', 'portrait', 'map', 'logo', 'flag', 'seal', 'coat of arms', 'astronaut', 'navy',
    'soldier', 'military', 'cartoon', 'toy', 'museum', 'sunset', 'hill', 'street', 'house', 'building art', 'mural'];
  function negScore(title) { const t = (title || '').toLowerCase(); let n = 0; for (const k of NEG_WORDS) if (t.includes(k)) n++; return n; }
  // Query both sources, require the HEAD material word in the title, then rank by total
  // keyword match. Broadens to the head word alone if too few hits.
  async function searchMaterialImages(name) {
    const { q } = termFor(name);
    const query = q;
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const head = words[0] || query.toLowerCase();
    const kws = [...new Set(words.filter(w => w.length > 2).flatMap(w => (w.endsWith('s') ? [w, w.slice(0, -1)] : [w])))];
    async function gather(qy) {
      const [ov, cm] = await Promise.all([openverseImages(qy), commonsImages(qy)]);
      const seen = new Set(), arr = [];
      ov.forEach((x, i) => { if (x.url && !seen.has(x.url)) { seen.add(x.url); arr.push({ title: x.title, url: x.url, src: 0, idx: i }); } });
      cm.forEach((x, i) => { if (x.url && !seen.has(x.url)) { seen.add(x.url); arr.push({ title: x.title, url: x.url, src: 1, idx: i }); } });
      return arr;
    }
    let all = await gather(query);
    let onTopic = all.filter(x => (x.title || '').toLowerCase().includes(head));
    if (onTopic.length < 3) {
      const seen = new Set(all.map(x => x.url));
      (await gather(head)).forEach(x => { if (!seen.has(x.url)) { seen.add(x.url); all.push(x); } });
      onTopic = all.filter(x => (x.title || '').toLowerCase().includes(head));
    }
    const pool = onTopic.length ? onTopic : all;
    pool.forEach(x => x.eff = kwScore(x.title, kws) * 2 - negScore(x.title));
    pool.sort((a, b) => b.eff - a.eff || a.src - b.src || a.idx - b.idx);
    return pool.slice(0, 12).map(x => x.url);
  }
  // Exact category pictures (shown when searching + as the default material thumbnail).
  const CATEGORY_IMAGES = {
    cement: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Energetically_Modified_Cement_%28EMC%29_Lule%C3%A5_Sweden_08_2020.jpg/640px-Energetically_Modified_Cement_%28EMC%29_Lule%C3%A5_Sweden_08_2020.jpg',
    brick: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Ivy_Hedera_Red_Brick_Wall_2892px.jpg/640px-Ivy_Hedera_Red_Brick_Wall_2892px.jpg',
    steel: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Rusty_rebar_nets.jpg/640px-Rusty_rebar_nets.jpg',
    wood: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Stacked_wood_planks_%28Unsplash%29.jpg/640px-Stacked_wood_planks_%28Unsplash%29.jpg',
    electrical: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Cable-lacing-harness-mockup.jpg/640px-Cable-lacing-harness-mockup.jpg',
    insulation: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Polyisocyanurate_insulation_boards.jpg/640px-Polyisocyanurate_insulation_boards.jpg',
    plumbing: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/PVC_plumbing_fittings_in_Awka.jpg/640px-PVC_plumbing_fittings_in_Awka.jpg',
    putty: '',
    plaster: '',
    paint: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Farm-Fresh_table_paint_can.png',
    finishing: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Orange_terracotta_ceramic_scuffed_tile_pattern_floor_texture.jpg/640px-Orange_terracotta_ceramic_scuffed_tile_pattern_floor_texture.jpg',
    tools: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Woodworking_hand_tools_on_timber_planks_01.jpg/640px-Woodworking_hand_tools_on_timber_planks_01.jpg',
    other: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Gravel_Stones.jpg/640px-Gravel_Stones.jpg'
  };
  const CAT_KEYS = {
    cement: ['cement', 'цемент', 'tsement', 'семент', 'sement'],
    brick: ['brick', 'тоосго', 'toosgo', 'toosog'],
    steel: ['steel', 'rebar', 'metal', 'iron', 'төмөр', 'tumur', 'tomor', 'tömör', 'арматур', 'armatur'],
    wood: ['wood', 'timber', 'lumber', 'plank', 'мод', 'банз', 'banz'],
    electrical: ['electric', 'cable', 'wire', 'цахилгаан', 'tsahilgaan', 'кабель', 'утас', 'розетка'],
    insulation: ['insulation', 'дулаалга', 'dulaalga', 'duudlaga'],
    plumbing: ['plumb', 'pipe', 'sanitary', 'сантехник', 'santehnik', 'хоолой', 'hooloi'],
    putty: ['putty', 'замаск', 'zamask', 'zamaasag', 'zamasag'],
    plaster: ['plaster', 'shpaklevk', 'шпаклевк', 'шпаклёвк', 'gypsum', 'гипс', 'gips'],
    paint: ['paint', 'будаг', 'budag'],
    finishing: ['finish', 'засал', 'zasal'],
    tools: ['tool', 'багаж', 'bagaj'],
    other: ['other', 'бусад', 'busad']
  };
  function categoryFor(text) {
    const t = (text || '').toLowerCase();
    for (const cat in CAT_KEYS) for (const k of CAT_KEYS[cat]) if (k && t.includes(k)) return cat;
    return null;
  }
  function catImageFor(text) { const c = categoryFor(text); return c ? CATEGORY_IMAGES[c] : ''; }
  // Resize a chosen photo to a small JPEG data-URL so it stores cleanly in the DB.
  function fileToDataURL(file, maxW, cb) {
    const fr = new FileReader();
    fr.onerror = () => cb('');
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => cb('');
      img.onload = () => {
        const s = Math.min(1, maxW / img.width), w = Math.round(img.width * s), h = Math.round(img.height * s);
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        try { cb(cv.toDataURL('image/jpeg', 0.72)); } catch (e) { cb(''); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  function matThumb(m) {
    const url = m.image_url || catImageFor((m.name || '') + ' ' + (m.category || ''));
    return url
      ? `<img class="mat-thumb zoomable" src="${esc(url)}" referrerpolicy="no-referrer" loading="lazy" title="${esc(m.name)}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'mat-thumb ph',textContent:'📦'}))">`
      : `<span class="mat-thumb ph">📦</span>`;
  }
  /* ---------- Lightbox (click image to enlarge) ---------- */
  let lightboxEl;
  function openLightbox(src) {
    if (!lightboxEl) {
      lightboxEl = document.createElement('div'); lightboxEl.id = 'lightbox';
      lightboxEl.innerHTML = '<img referrerpolicy="no-referrer"><span class="lb-close">✕</span>';
      lightboxEl.addEventListener('click', () => lightboxEl.classList.remove('show'));
      document.body.appendChild(lightboxEl);
    }
    lightboxEl.querySelector('img').src = src;
    lightboxEl.classList.add('show');
  }
  document.addEventListener('click', e => {
    const img = e.target.closest && e.target.closest('img.zoomable');
    if (img && img.src) { e.stopPropagation(); openLightbox(img.src); }
  });

  /* ---------- Helpers ---------- */
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const app = $('#app');
  function pad(n) { return String(n).padStart(2, '0'); }
  function todayISO() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function thisMonthVal() { return todayISO().slice(0, 7); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function num(v) { const n = parseFloat(String(v).replace(/[^\d.\-]/g, '')); return isNaN(n) ? 0 : n; }
  function fmtMoney(n) { n = Math.round(num(n)); const neg = n < 0; return (neg ? '−' : '') + Math.abs(n).toLocaleString('en-US') + '₮'; }
  function fmtQty(n) { n = num(n); return Number.isInteger(n) ? String(n) : n.toFixed(2); }
  function daysBetween(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }
  function option(v, l, sel) { return `<option value="${esc(v)}"${v === sel ? ' selected' : ''}>${esc(l)}</option>`; }
  function datalist(id, items) { return `<datalist id="${id}">${items.map(i => `<option value="${esc(i)}">`).join('')}</datalist>`; }

  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2800); }
  function setLoading() { app.innerHTML = `<div class="loading"><div class="spinner"></div>${T('loading')}</div>`; }

  function openModal(title, html, onMount) { $('#modalTitle').textContent = title; $('#modalBody').innerHTML = html; $('#modal').classList.remove('hidden'); if (onMount) onMount($('#modalBody')); }
  function closeModal() { $('#modal').classList.add('hidden'); $('#modalBody').innerHTML = ''; }
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });

  /* ---------- "Server is waking up" overlay (free-tier cold start) ----------
     The free hosting plan puts the server to sleep after ~15 min of no use; the
     next request then takes ~30–50s to wake it. If any request runs longer than
     the threshold below, show a friendly overlay so the wait doesn't look like a
     frozen or broken app. It hides automatically once the server responds. */
  let _wakeInflight = 0, _wakeTimer = null;
  const WAKE_THRESHOLD_MS = 3000;
  function _ensureWakeEl() {
    let el = document.getElementById('wakingOverlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'wakingOverlay';
      el.innerHTML =
        '<div class="waking-box">' +
          '<div class="waking-spin"></div>' +
          '<div class="waking-title">Сервер сэрж байна…</div>' +
          '<div class="waking-title-en">Waking up the server…</div>' +
          '<div class="waking-sub">Үнэгүй сервер амарч байсан тул эхний ачаалал 30–50 секунд үргэлжилж магадгүй. Түр хүлээнэ үү.<br>' +
          'The free server was asleep — this first load can take about 30–50 seconds. Please wait.</div>' +
        '</div>';
      document.body.appendChild(el);
    }
    return el;
  }
  function _wakeStart() {
    _wakeInflight++;
    if (_wakeTimer === null) {
      _wakeTimer = setTimeout(function () {
        if (_wakeInflight > 0) _ensureWakeEl().classList.add('show');
      }, WAKE_THRESHOLD_MS);
    }
  }
  function _wakeEnd() {
    _wakeInflight = Math.max(0, _wakeInflight - 1);
    if (_wakeInflight === 0) {
      if (_wakeTimer !== null) { clearTimeout(_wakeTimer); _wakeTimer = null; }
      const el = document.getElementById('wakingOverlay');
      if (el) el.classList.remove('show');
    }
  }

  /* ---------- API client ---------- */
  async function api(path, opts = {}) {
    const o = { method: opts.method || 'GET', headers: Object.assign({}, opts.headers || {}) };
    if (opts.body !== undefined) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(opts.body); }
    if (token) o.headers['Authorization'] = 'Bearer ' + token;
    _wakeStart();
    try {
      let res;
      try { res = await fetch(API + path, o); }
      catch (e) { $('#cloudDot').className = 'cloud-dot off'; throw new Error(lang === 'en' ? 'Cannot reach server' : 'Сервер холбогдсонгүй'); }
      $('#cloudDot').className = 'cloud-dot ok';
      if (res.status === 401) { doLogout(); throw new Error('unauthorized'); }
      if (opts.raw) return res;
      let data = null; try { data = await res.json(); } catch (e) { }
      if (!res.ok) { const d = data && data.detail; throw new Error(typeof d === 'string' ? d : ('Error ' + res.status)); }
      return data;
    } finally {
      _wakeEnd();
    }
  }

  /* ============================================================
     AUTH
     ============================================================ */
  let authMode = 'login';
  function showAuth() { $('#authView').classList.remove('hidden'); $('#appShell').classList.add('hidden'); }
  function showApp() {
    $('#authView').classList.add('hidden'); $('#appShell').classList.remove('hidden');
    $('#brandName').textContent = (user && user.company) || 'Барилгын Нягтлан';
    $('#avatar').textContent = (user && user.name ? user.name[0] : '?').toUpperCase();
    applyStaticI18n();
    if (!location.hash) location.hash = '#/dashboard';
    render();
  }
  function setAuthMode(m) {
    authMode = m;
    $('#tabLogin').classList.toggle('active', m === 'login');
    $('#tabRegister').classList.toggle('active', m === 'register');
    $('#regNameField').classList.toggle('hidden', m !== 'register');
    $('#regCodeField').classList.toggle('hidden', m !== 'register');
    $('#authSubmit').textContent = m === 'login' ? 'Нэвтрэх / Login' : 'Бүртгүүлэх / Register';
    $('#authErr').textContent = '';
  }
  $('#tabLogin').onclick = () => setAuthMode('login');
  $('#tabRegister').onclick = () => setAuthMode('register');
  $('#authSubmit').onclick = submitAuth;
  ['authEmail', 'authPass', 'authName'].forEach(id => { const el = $('#' + id); if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(); }); });

  async function submitAuth() {
    const email = $('#authEmail').value.trim(), pass = $('#authPass').value, name = $('#authName').value.trim();
    $('#authErr').textContent = '';
    if (!email || !pass) { $('#authErr').textContent = lang === 'en' ? 'Email and password required' : 'Имэйл, нууц үг оруулна уу'; return; }
    if (authMode === 'register' && !name) { $('#authErr').textContent = lang === 'en' ? 'Name required' : 'Нэрээ оруулна уу'; return; }
    $('#authSubmit').disabled = true;
    try {
      const path = authMode === 'login' ? '/auth/login' : '/auth/register';
      const body = authMode === 'login' ? { email, password: pass } : { email, password: pass, name, invite_code: ($('#authCode') ? $('#authCode').value.trim() : '') };
      const data = await api(path, { method: 'POST', body });
      token = data.token; user = data.user;
      localStorage.setItem('ca_token', token); localStorage.setItem('ca_user', JSON.stringify(user));
      showApp();
    } catch (e) { $('#authErr').textContent = e.message; }
    finally { $('#authSubmit').disabled = false; }
  }
  function doLogout() {
    token = ''; user = null; localStorage.removeItem('ca_token'); localStorage.removeItem('ca_user');
    $('#authPass').value = ''; showAuth();
  }

  /* ---------- Router ---------- */
  const ROUTES = { dashboard: viewDashboard, materials: viewMaterials, stocktake: viewStocktake, ledger: viewLedger, loans: viewLoans, convert: viewConvert, settings: viewSettings };
  function currentRoute() { return location.hash.replace('#/', '') || 'dashboard'; }
  function render() {
    const r = currentRoute(); const fn = ROUTES[r] || viewDashboard;
    $$('.navlink').forEach(a => a.classList.toggle('active', a.dataset.route === r));
    window.scrollTo(0, 0); closeSidebar();
    fn().catch(e => { if (e.message !== 'unauthorized') { app.innerHTML = `<div class="card empty"><span class="big">⚠️</span>${esc(e.message)}</div>`; } });
  }
  window.addEventListener('hashchange', render);
  function applyStaticI18n() { $$('[data-t]').forEach(el => el.textContent = T(el.dataset.t)); }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  async function viewDashboard() {
    setLoading();
    const [stats, upcoming, mats, stock] = await Promise.all([
      api('/dashboard'), api('/loans/upcoming?days=14'), api('/materials'), api('/stock')
    ]);
    // compute low stock from latest entry per material
    const latest = {};
    stock.forEach(s => { const c = latest[s.material_id]; if (!c || s.date > c.date) latest[s.material_id] = { date: s.date, qty: s.quantity }; });
    const low = mats.filter(m => num(m.min_stock) > 0 && latest[m.material_id] && latest[m.material_id].qty <= num(m.min_stock))
      .map(m => ({ name: m.name, unit: m.unit, qty: latest[m.material_id].qty, min: m.min_stock }));
    const net = stats.monthly_income - stats.monthly_outcome;

    app.innerHTML = `
      <div class="page-head"><div><h2>${T('dash_title')}</h2><div class="sub">${esc((user && user.company) || '')} · ${thisMonthVal()}</div></div>
        <div class="head-actions"><input type="month" id="dashMonth" value="${thisMonthVal()}" style="width:auto"><button class="btn accent" id="dlMonth">⬇️ ${T('report_download')}</button></div></div>
      <div class="grid kpis">
        <div class="card kpi green"><div class="label">${T('income')} · ${T('this_month')}</div><div class="value">${fmtMoney(stats.monthly_income)}</div></div>
        <div class="card kpi red"><div class="label">${T('expense')} · ${T('this_month')}</div><div class="value">${fmtMoney(stats.monthly_outcome)}</div></div>
        <div class="card kpi ${net >= 0 ? 'green' : 'red'}"><div class="label">${T('net')} · ${T('this_month')}</div><div class="value">${fmtMoney(net)}</div></div>
        <div class="card kpi blue"><div class="label">${T('active_loans')}</div><div class="value">${stats.active_loans}</div></div>
        <div class="card kpi blue"><div class="label">${T('materials_count')}</div><div class="value">${stats.total_materials}</div></div>
        <div class="card kpi blue"><div class="label">${T('stock_count')}</div><div class="value">${stats.total_stock_entries}</div></div>
      </div>
      <div class="grid dash-grid mt">
        <div class="card">
          <div class="section-title"><h3>🔔 ${T('upcoming_loans')}</h3></div>
          ${upcoming.length ? upcoming.map(loanAlertRow).join('') : `<div class="alert info">✓ ${T('no_alerts')}</div>`}
        </div>
        <div class="card">
          <div class="section-title"><h3>📦 ${T('low_stock')}</h3></div>
          ${low.length ? low.map(x => `<div class="alert warn">⚠️ <b>${esc(x.name)}</b> — ${fmtQty(x.qty)} ${esc(unitLabel(x.unit))} (${T('min_stock')}: ${fmtQty(x.min)})</div>`).join('') : `<div class="alert info">✓ ${T('no_alerts')}</div>`}
        </div>
      </div>`;
    const dl = $('#dlMonth'); if (dl) dl.onclick = () => downloadMonthlyReport($('#dashMonth').value);
  }
  function downloadMonthlyReport(ym) {
    const [y, mo] = (ym || thisMonthVal()).split('-');
    fetch(API + `/report/monthly?month=${+mo}&year=${+y}`, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => { if (res.status === 401) { doLogout(); throw new Error('unauthorized'); } if (!res.ok) throw new Error('Error ' + res.status); return res.blob(); })
      .then(blob => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `report_${y}-${mo}.xlsx`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('📊 Excel ✓');
      }).catch(e => { if (e.message !== 'unauthorized') toast(e.message); });
  }
  function loanAlertRow(l) {
    const today = todayISO();
    const overdue = l.next_payment_date < today;
    return `<div class="alert ${overdue ? 'danger' : 'warn'}">🏦 <div><b>${esc(l.name)}</b> — ${fmtMoney(l.payment_amount)} <br>
      <span class="muted">${T('next_pay')}: ${esc(l.next_payment_date)} · ${overdue ? T('overdue') : T('due_soon')}</span></div></div>`;
  }

  /* ============================================================
     MATERIALS
     ============================================================ */
  let matFilter = { search: '', category: '', supplier: '', min_price: '', max_price: '' };
  async function viewMaterials() {
    const catData = await api('/materials/categories');
    const cats = catData.categories;
    app.innerHTML = `
      <div class="page-head"><div><h2>${T('mat_title')}</h2><div class="sub">${T('mat_sub')}</div></div>
        <div class="head-actions"><button class="btn primary" id="addMat">＋ ${T('add_material')}</button></div></div>
      <div class="toolbar">
        <div class="search"><input id="mSearch" placeholder="${T('search_materials')}" value="${esc(matFilter.search)}"></div>
        <select id="mCat"><option value="">${T('all_categories')}</option>${cats.map(c => option(c, c, matFilter.category)).join('')}</select>
        <input id="mSup" placeholder="${T('supplier')}" value="${esc(matFilter.supplier)}" style="width:130px">
        <input id="mMin" inputmode="numeric" placeholder="${T('min_price')}" value="${matFilter.min_price}" style="width:100px">
        <input id="mMax" inputmode="numeric" placeholder="${T('max_price')}" value="${matFilter.max_price}" style="width:100px">
      </div>
      <div id="matSearchPic" class="search-pic hidden"></div>
      <div id="matResults"><div class="loading"><div class="spinner"></div></div></div>`;
    $('#addMat').onclick = () => materialForm();
    const deb = (fn) => { let t; return () => { clearTimeout(t); t = setTimeout(fn, 300); }; };
    $('#mSearch').oninput = deb(loadMatTable);
    $('#mSearch').addEventListener('input', updateSearchPic);
    $('#mSup').oninput = deb(loadMatTable);
    $('#mMin').oninput = deb(loadMatTable);
    $('#mMax').oninput = deb(loadMatTable);
    $('#mCat').onchange = loadMatTable;
    await loadMatTable();
    updateSearchPic();
  }
  // Show the exact category picture for whatever material is being searched.
  function updateSearchPic() {
    const box = $('#matSearchPic'); if (!box) return;
    const term = ($('#mSearch') ? $('#mSearch').value : '').trim();
    const url = term ? catImageFor(term) : '';
    if (!url) { box.classList.add('hidden'); box.innerHTML = ''; return; }
    box.classList.remove('hidden');
    box.innerHTML = `<img class="zoomable" src="${esc(url)}" referrerpolicy="no-referrer" onerror="this.closest('.search-pic').classList.add('hidden')"><span class="muted">🔍 <b>${esc(term)}</b></span>`;
  }
  // Re-renders only the results table (keeps toolbar + search focus while typing).
  let matSeq = 0;
  async function loadMatTable() {
    if ($('#mSearch')) matFilter.search = $('#mSearch').value;
    if ($('#mSup')) matFilter.supplier = $('#mSup').value;
    if ($('#mCat')) matFilter.category = $('#mCat').value;
    matFilter.min_price = ($('#mMin') && $('#mMin').value) ? num($('#mMin').value) : '';
    matFilter.max_price = ($('#mMax') && $('#mMax').value) ? num($('#mMax').value) : '';
    const params = new URLSearchParams();
    Object.entries(matFilter).forEach(([k, v]) => { if (v !== '' && v != null) params.set(k, v); });
    if (!$('#matResults')) return;
    const seq = ++matSeq;
    const list = await api('/materials?' + params.toString());
    const box = $('#matResults');
    if (seq !== matSeq || !box) return; // a newer request superseded this one
    box.innerHTML = list.length ? `<div class="card table-wrap"><table>
        <thead><tr><th>${T('image')}</th><th>${T('name')}</th><th>${T('category')}</th><th>${T('unit')}</th><th class="num">${T('unit_price')}</th><th class="num">${T('min_stock')}</th><th>${T('supplier')}</th><th></th></tr></thead>
        <tbody>${list.map(m => `<tr>
          <td>${matThumb(m)}</td>
          <td><b>${esc(m.name)}</b>${m.description ? `<br><span class="muted" style="font-size:.8rem">${esc(m.description)}</span>` : ''}</td>
          <td>${esc(m.category || '-')}</td><td>${esc(unitLabel(m.unit))}</td>
          <td class="num">${fmtMoney(m.price)}</td><td class="num">${fmtQty(m.min_stock)}</td><td>${esc(m.supplier || '-')}</td>
          <td><div class="row-actions"><button class="btn sm" data-edit="${m.material_id}">✎</button><button class="btn sm danger" data-del="${m.material_id}">✕</button></div></td>
        </tr>`).join('')}</tbody></table></div>` : `<div class="card empty"><span class="big">📦</span>${T('no_materials')}</div>`;
    box.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => materialForm(list.find(m => m.material_id === b.dataset.edit)));
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (confirm(T('delete') + '?')) { await api('/materials/' + b.dataset.del, { method: 'DELETE' }); toast(T('delete')); loadMatTable(); } });
  }
  function materialForm(m) {
    const e = m || { material_id: '', name: '', category: '', supplier: '', price: '', unit: 'ш', min_stock: '', description: '', image_url: '' };
    let chosenImg = e.image_url || '';
    openModal(m ? T('edit_material') : T('add_material'), `
      ${datalist('catList', MAT_CATS)}
      <div class="field"><label>${T('name')} *</label><input id="f_name" value="${esc(e.name)}"></div>
      <div class="form-row">
        <div class="field"><label>${T('category')}</label><input id="f_cat" list="catList" value="${esc(e.category)}"></div>
        <div class="field"><label>${T('unit')}</label><select id="f_unit">${UNITS.map(u => option(u[0], lang === 'en' ? u[2] : u[1], e.unit)).join('')}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('unit_price')} (₮)</label><input id="f_price" inputmode="numeric" value="${e.price}"></div>
        <div class="field"><label>${T('min_stock')}</label><input id="f_min" inputmode="decimal" value="${e.min_stock}"></div>
      </div>
      <div class="field"><label>${T('supplier')}</label><input id="f_sup" value="${esc(e.supplier)}"></div>
      <div class="field"><label>${T('description')}</label><input id="f_desc" value="${esc(e.description)}"></div>
      <div class="field">
        <label>📷 Зураг / Photo</label>
        <div id="imgPreview" class="mat-img-preview">${chosenImg ? `<img src="${esc(chosenImg)}" referrerpolicy="no-referrer">` : '📦'}</div>
        <div style="display:flex; gap:.5rem; flex-wrap:wrap">
          <button type="button" class="btn sm" id="pickPhoto">📷 Өөрийн зураг нэмэх / Add your photo</button>
          <button type="button" class="btn sm ghost" id="clearPhoto">✕ Арилгах / Remove</button>
        </div>
        <input type="file" id="f_photo" accept="image/*" hidden>
        <div class="hint">Утас/компьютероосоо зураг оруулна. Хоосон бол ангиллын зураг гарна. / Upload from your device; if empty, the category picture shows.</div>
      </div>
      <div class="modal-actions"><button class="btn ghost" id="f_cancel">${T('cancel')}</button><button class="btn primary" id="f_save">${T('save')}</button></div>`,
      body => {
        const preview = body.querySelector('#imgPreview'), fileInput = body.querySelector('#f_photo');
        const render = () => { preview.innerHTML = chosenImg ? `<img src="${esc(chosenImg)}" referrerpolicy="no-referrer">` : '📦'; };
        body.querySelector('#pickPhoto').onclick = () => fileInput.click();
        fileInput.onchange = () => { const f = fileInput.files[0]; if (!f) return; fileToDataURL(f, 480, (d) => { if (d) { chosenImg = d; render(); } else toast('⚠️ Зураг'); }); };
        body.querySelector('#clearPhoto').onclick = () => { chosenImg = ''; render(); };
        body.querySelector('#f_cancel').onclick = closeModal;
        body.querySelector('#f_save').onclick = async () => {
          const name = body.querySelector('#f_name').value.trim();
          if (!name) { toast(T('name') + ' *'); return; }
          const payload = { name, category: body.querySelector('#f_cat').value.trim(), supplier: body.querySelector('#f_sup').value.trim(), price: num(body.querySelector('#f_price').value), unit: body.querySelector('#f_unit').value, min_stock: num(body.querySelector('#f_min').value), description: body.querySelector('#f_desc').value.trim(), image_url: chosenImg };
          try { await api(e.material_id ? '/materials/' + e.material_id : '/materials', { method: e.material_id ? 'PUT' : 'POST', body: payload }); closeModal(); toast(T('save')); viewMaterials(); }
          catch (err) { toast(err.message); }
        };
      });
  }

  /* ============================================================
     STOCKTAKING (stock entries)
     ============================================================ */
  let stMonth = thisMonthVal();
  async function viewStocktake() {
    setLoading();
    const [y, mo] = stMonth.split('-');
    const entries = await api(`/stock?month=${+mo}&year=${+y}`);
    app.innerHTML = `
      <div class="page-head"><div><h2>${T('st_title')}</h2><div class="sub">${T('st_sub')}</div></div>
        <div class="head-actions">
          <button class="btn" id="exportBtn">⬇️ ${T('export_excel')}</button>
          <button class="btn primary" id="addCount">＋ ${T('add_count')}</button>
        </div></div>
      <div class="toolbar"><input type="month" id="stMonth" value="${stMonth}"></div>
      ${entries.length ? `<div class="card table-wrap"><table>
        <thead><tr><th>${T('date')}</th><th>${T('name')}</th><th>${T('unit')}</th><th class="num">${T('qty')}</th><th></th></tr></thead>
        <tbody>${entries.map(s => `<tr>
          <td class="nowrap">${esc(s.date)}</td><td><b>${esc(s.material_name)}</b></td><td>${esc(unitLabel(s.unit))}</td>
          <td class="num">${fmtQty(s.quantity)}</td>
          <td><div class="row-actions"><button class="btn sm danger" data-del="${s.entry_id}">✕</button></div></td>
        </tr>`).join('')}</tbody></table></div>` : `<div class="card empty"><span class="big">📋</span>${T('no_stock')}</div>`}`;
    $('#stMonth').onchange = e => { stMonth = e.target.value || thisMonthVal(); viewStocktake(); };
    $('#addCount').onclick = stockForm;
    $('#exportBtn').onclick = async () => {
      try {
        const res = await api(`/stock/export?month=${+mo}&year=${+y}`, { raw: true });
        const blob = await res.blob(); const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = `stocktaking_${y}_${mo}.xlsx`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('Excel ✓');
      } catch (err) { toast(err.message); }
    };
    $$('[data-del]').forEach(b => b.onclick = async () => { if (confirm(T('delete') + '?')) { await api('/stock/' + b.dataset.del, { method: 'DELETE' }); viewStocktake(); } });
  }
  async function stockForm() {
    const mats = await api('/materials');
    if (!mats.length) { toast(T('no_materials')); return; }
    openModal(T('add_count'), `
      <div class="field"><label>${T('select_material')}</label><select id="f_mat">${mats.map(m => option(m.material_id, m.name, '')).join('')}</select></div>
      <div class="form-row">
        <div class="field"><label>${T('counted_qty')} *</label><input id="f_qty" inputmode="decimal" autofocus></div>
        <div class="field"><label>${T('date')}</label><input type="date" id="f_date" value="${todayISO()}"></div>
      </div>
      <div class="modal-actions"><button class="btn ghost" id="f_cancel">${T('cancel')}</button><button class="btn primary" id="f_save">${T('save')}</button></div>`,
      body => {
        body.querySelector('#f_cancel').onclick = closeModal;
        body.querySelector('#f_save').onclick = async () => {
          const q = num(body.querySelector('#f_qty').value);
          if (!q) { toast(T('qty') + ' *'); return; }
          try { await api('/stock', { method: 'POST', body: { material_id: body.querySelector('#f_mat').value, quantity: q, date: body.querySelector('#f_date').value || todayISO() } }); closeModal(); toast(T('save')); viewStocktake(); }
          catch (err) { toast(err.message); }
        };
      });
  }

  /* ============================================================
     LEDGER (transactions)
     ============================================================ */
  let ledFilter = { month: thisMonthVal(), type: '', category: '' };
  async function viewLedger() {
    setLoading();
    const [y, mo] = ledFilter.month.split('-');
    const start = `${y}-${mo}-01`;
    const end = (+mo === 12) ? `${+y + 1}-01-01` : `${y}-${pad(+mo + 1)}-01`;
    const params = new URLSearchParams({ start_date: start, end_date: end });
    if (ledFilter.type) params.set('type', ledFilter.type);
    if (ledFilter.category) params.set('category', ledFilter.category);
    const [list, summary] = await Promise.all([api('/transactions?' + params.toString()), api(`/transactions/summary?month=${+mo}&year=${+y}`)]);
    const cats = [...new Set([...Object.keys(summary.income_by_category), ...Object.keys(summary.outcome_by_category)])];
    app.innerHTML = `
      <div class="page-head"><div><h2>${T('led_title')}</h2><div class="sub">${T('led_sub')}</div></div>
        <div class="head-actions"><button class="btn primary" id="addTxn">＋ ${T('add_txn')}</button></div></div>
      <div class="toolbar">
        <input type="month" id="lMonth" value="${ledFilter.month}">
        <select id="lType"><option value="">${T('all')}</option>${option('income', T('income_t'), ledFilter.type)}${option('outcome', T('outcome_t'), ledFilter.type)}</select>
        <select id="lCat"><option value="">${T('all_categories')}</option>${cats.map(c => option(c, c, ledFilter.category)).join('')}</select>
      </div>
      <div class="grid kpis">
        <div class="card kpi green"><div class="label">${T('income')}</div><div class="value">${fmtMoney(summary.total_income)}</div></div>
        <div class="card kpi red"><div class="label">${T('expense')}</div><div class="value">${fmtMoney(summary.total_outcome)}</div></div>
        <div class="card kpi ${summary.net >= 0 ? 'green' : 'red'}"><div class="label">${T('net')}</div><div class="value">${fmtMoney(summary.net)}</div></div>
      </div>
      ${list.length ? `<div class="card table-wrap mt"><table>
        <thead><tr><th>${T('date')}</th><th>${T('type')}</th><th>${T('category')}</th><th>${T('description')}</th><th class="num">${T('amount')}</th><th></th></tr></thead>
        <tbody>${list.map(t => `<tr>
          <td class="nowrap">${esc(t.date)}</td>
          <td><span class="pill ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? T('income_t') : T('outcome_t')}</span></td>
          <td>${esc(t.category || '-')}</td>
          <td>${esc(t.description || '-')}${(t.quantity && t.unit_price) ? `<br><span class="muted" style="font-size:.8rem">${esc(t.material_name || '')} ${fmtQty(t.quantity)} × ${fmtMoney(t.unit_price)}</span>` : ''}</td>
          <td class="num ${t.type === 'income' ? 'amt-income' : 'amt-expense'}">${t.type === 'income' ? '+' : '−'}${fmtMoney(t.amount)}</td>
          <td><div class="row-actions"><button class="btn sm danger" data-del="${t.transaction_id}">✕</button></div></td>
        </tr>`).join('')}</tbody></table></div>` : `<div class="card empty mt"><span class="big">💰</span>${T('no_txns')}</div>`}
      ${cats.length ? `<div class="card mt"><div class="section-title"><h3>${T('by_category')}</h3></div>
        <div class="breakdown">${Object.entries(summary.outcome_by_category).map(([k, v]) => `<div class="row"><span class="cat">${esc(k)}</span><span class="amt-expense">−${fmtMoney(v)}</span></div>`).join('')}
        ${Object.entries(summary.income_by_category).map(([k, v]) => `<div class="row"><span class="cat">${esc(k)}</span><span class="amt-income">+${fmtMoney(v)}</span></div>`).join('')}</div></div>` : ''}`;
    $('#addTxn').onclick = () => txnForm();
    $('#lMonth').onchange = e => { ledFilter.month = e.target.value || thisMonthVal(); viewLedger(); };
    $('#lType').onchange = e => { ledFilter.type = e.target.value; viewLedger(); };
    $('#lCat').onchange = e => { ledFilter.category = e.target.value; viewLedger(); };
    $$('[data-del]').forEach(b => b.onclick = async () => { if (confirm(T('delete') + '?')) { await api('/transactions/' + b.dataset.del, { method: 'DELETE' }); viewLedger(); } });
  }
  async function txnForm() {
    let mats = [];
    try { mats = await api('/materials'); } catch (e) { }
    openModal(T('add_txn'), `
      <datalist id="txnCat"></datalist>
      <div class="form-row">
        <div class="field"><label>${T('type')}</label><select id="f_type">${option('outcome', T('outcome_t'), 'outcome')}${option('income', T('income_t'), '')}</select></div>
        <div class="field"><label>${T('date')}</label><input type="date" id="f_date" value="${todayISO()}"></div>
      </div>
      <div class="field" id="matWrap"><label>📦 ${T('buy_material')}</label>
        <select id="f_mat"><option value="">— ${T('none_opt')} —</option>${mats.map(m => option(m.material_id, `${m.name} (${fmtMoney(m.price)}/${unitLabel(m.unit)})`, '')).join('')}</select>
      </div>
      <div class="form-row hidden" id="qpRow">
        <div class="field"><label>${T('unit_price')} (₮)</label><input id="f_uprice" inputmode="numeric"></div>
        <div class="field"><label>${T('qty')}</label><input id="f_qty" inputmode="decimal"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('amount')} (₮) *</label><input id="f_amount" inputmode="numeric"></div>
        <div class="field"><label>${T('category')}</label><input id="f_cat" list="txnCat"></div>
      </div>
      <div class="field"><label>${T('description')}</label><input id="f_desc"></div>
      <div class="hint" id="qpHint"></div>
      <div class="modal-actions"><button class="btn ghost" id="f_cancel">${T('cancel')}</button><button class="btn primary" id="f_save">${T('save')}</button></div>`,
      body => {
        const typeSel = body.querySelector('#f_type'), dl = body.querySelector('#txnCat');
        const matWrap = body.querySelector('#matWrap'), matSel = body.querySelector('#f_mat'), qpRow = body.querySelector('#qpRow');
        const uprice = body.querySelector('#f_uprice'), qty = body.querySelector('#f_qty');
        const amount = body.querySelector('#f_amount'), cat = body.querySelector('#f_cat'), desc = body.querySelector('#f_desc'), hint = body.querySelector('#qpHint');
        function fillCats() { dl.innerHTML = (typeSel.value === 'income' ? INCOME_CATS : OUTCOME_CATS).map(c => `<option value="${esc(c)}">`).join(''); }
        function recompute() {
          const u = num(uprice.value), q = num(qty.value);
          if (u && q) { amount.value = Math.round(u * q); hint.textContent = `${fmtQty(q)} × ${fmtMoney(u)} = ${fmtMoney(u * q)}`; }
          else hint.textContent = '';
        }
        function onType() {
          fillCats();
          const isOut = typeSel.value === 'outcome';
          matWrap.classList.toggle('hidden', !isOut || !mats.length);
          if (!isOut) { matSel.value = ''; qpRow.classList.add('hidden'); }
        }
        matSel.onchange = () => {
          const m = mats.find(x => x.material_id === matSel.value);
          if (m) { qpRow.classList.remove('hidden'); uprice.value = m.price || ''; if (!cat.value) cat.value = 'Материал / Materials'; if (!desc.value) desc.value = m.name; recompute(); }
          else { qpRow.classList.add('hidden'); }
        };
        uprice.oninput = recompute; qty.oninput = recompute;
        typeSel.onchange = onType; onType();
        body.querySelector('#f_cancel').onclick = closeModal;
        body.querySelector('#f_save').onclick = async () => {
          const amt = num(amount.value);
          if (!amt) { toast(T('amount') + ' *'); return; }
          const payload = { type: typeSel.value, amount: amt, category: cat.value.trim(), description: desc.value.trim(), date: body.querySelector('#f_date').value || todayISO() };
          if (typeSel.value === 'outcome' && matSel.value) { payload.material_id = matSel.value; payload.quantity = num(qty.value) || null; payload.unit_price = num(uprice.value) || null; }
          try { await api('/transactions', { method: 'POST', body: payload }); closeModal(); toast(T('save')); viewLedger(); }
          catch (err) { toast(err.message); }
        };
      });
  }

  /* ============================================================
     LOANS
     ============================================================ */
  async function viewLoans() {
    setLoading();
    const loans = await api('/loans');
    app.innerHTML = `
      <div class="page-head"><div><h2>${T('loan_title')}</h2><div class="sub">${T('loan_sub')}</div></div>
        <div class="head-actions"><button class="btn primary" id="addLoan">＋ ${T('add_loan')}</button></div></div>
      ${loans.length ? `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${loans.map(loanCard).join('')}</div>`
        : `<div class="card empty"><span class="big">🏦</span>${T('no_loans')}</div>`}`;
    $('#addLoan').onclick = loanForm;
    $$('[data-pay]').forEach(b => b.onclick = async () => { if (confirm(T('make_payment') + ' (' + fmtMoney(b.dataset.amt) + ')?')) { try { await api('/loans/' + b.dataset.pay + '/pay', { method: 'POST' }); toast(T('save')); viewLoans(); } catch (e) { toast(e.message); } } });
    $$('[data-done]').forEach(b => b.onclick = async () => { await api('/loans/' + b.dataset.done + '/status?status=paid', { method: 'PATCH' }); viewLoans(); });
    $$('[data-del]').forEach(b => b.onclick = async () => { if (confirm(T('delete') + '?')) { await api('/loans/' + b.dataset.del, { method: 'DELETE' }); viewLoans(); } });
  }
  function loanCard(l) {
    const today = todayISO();
    let st = l.status, pill = 'muted', lbl = T('active');
    if (l.status === 'paid') { pill = 'ok'; lbl = T('paid'); }
    else if (l.next_payment_date < today) { pill = 'expense'; lbl = T('overdue'); }
    else if (daysBetween(today, l.next_payment_date) <= 7) { pill = 'warn'; lbl = T('due_soon'); }
    return `<div class="card">
      <div class="section-title"><h3>${esc(l.name)}</h3><span class="pill ${pill}">${lbl}</span></div>
      <div class="kv">
        <span class="k">${T('principal')}</span><span><b>${fmtMoney(l.amount)}</b></span>
        <span class="k">${T('pay_amount')}</span><span>${fmtMoney(l.payment_amount)} · ${l.frequency === 'weekly' ? T('weekly') : T('monthly')}</span>
        ${l.interest_rate ? `<span class="k">${T('rate')}</span><span>${esc(l.interest_rate)}%</span>` : ''}
        <span class="k">${T('next_pay')}</span><span>${esc(l.next_payment_date)}</span>
      </div>
      <div class="row-actions mt">
        ${l.status === 'active' ? `<button class="btn sm accent" data-pay="${l.loan_id}" data-amt="${l.payment_amount}">＋ ${T('make_payment')}</button>
        <button class="btn sm" data-done="${l.loan_id}">✓ ${T('mark_paid')}</button>` : ''}
        <button class="btn sm danger" data-del="${l.loan_id}">✕</button>
      </div></div>`;
  }
  function loanForm() {
    openModal(T('add_loan'), `
      <div class="field"><label>${T('loan_name')} *</label><input id="f_name" placeholder="ХААН Банк / John" autofocus></div>
      <div class="form-row">
        <div class="field"><label>${T('principal')} (₮) *</label><input id="f_amount" inputmode="numeric"></div>
        <div class="field"><label>${T('pay_amount')} (₮)</label><input id="f_pay" inputmode="numeric"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('rate')}</label><input id="f_rate" inputmode="decimal" value="0"></div>
        <div class="field"><label>${T('freq')}</label><select id="f_freq">${option('monthly', T('monthly'), 'monthly')}${option('weekly', T('weekly'), '')}</select></div>
      </div>
      <div class="field"><label>${T('start_date')}</label><input type="date" id="f_start" value="${todayISO()}"></div>
      <div class="modal-actions"><button class="btn ghost" id="f_cancel">${T('cancel')}</button><button class="btn primary" id="f_save">${T('save')}</button></div>`,
      body => {
        body.querySelector('#f_cancel').onclick = closeModal;
        body.querySelector('#f_save').onclick = async () => {
          const name = body.querySelector('#f_name').value.trim(); const amount = num(body.querySelector('#f_amount').value);
          if (!name || !amount) { toast(T('loan_name') + ' / ' + T('principal') + ' *'); return; }
          try { await api('/loans', { method: 'POST', body: { name, amount, payment_amount: num(body.querySelector('#f_pay').value), interest_rate: num(body.querySelector('#f_rate').value), frequency: body.querySelector('#f_freq').value, start_date: body.querySelector('#f_start').value || todayISO() } }); closeModal(); toast(T('save')); viewLoans(); }
          catch (err) { toast(err.message); }
        };
      });
  }

  /* ============================================================
     SETTINGS
     ============================================================ */
  async function viewSettings() {
    app.innerHTML = `
      <div class="page-head"><div><h2>${T('set_title')}</h2></div></div>
      <div class="card">
        <div class="section-title"><h3>👤 ${T('profile')}</h3></div>
        <div class="field"><label>${T('email')}</label><input value="${esc(user.email)}" disabled></div>
        <div class="form-row">
          <div class="field"><label>${T('name')}</label><input id="s_name" value="${esc(user.name || '')}"></div>
          <div class="field"><label>${T('company')}</label><input id="s_company" value="${esc(user.company || '')}"></div>
        </div>
        <button class="btn primary" id="saveProfile">${T('save')}</button>
        <span class="pill ok" style="margin-left:.6rem">☁ ${T('synced')}</span>
      </div>
      <div class="card mt">
        <div class="section-title"><h3>🌐 ${T('language')}</h3></div>
        <select id="s_lang" style="max-width:260px">${option('both', T('lang_both'), lang)}${option('mn', T('lang_mn'), lang)}${option('en', T('lang_en'), lang)}</select>
      </div>
      <div class="card mt">
        <div class="section-title"><h3>🔑 ${T('account')}</h3></div>
        <div class="hint">API: ${esc(API)}</div>
        <button class="btn danger mt" id="logoutBtn">${T('logout')}</button>
      </div>`;
    $('#saveProfile').onclick = async () => {
      try { user = await api('/auth/profile', { method: 'PATCH', body: { name: $('#s_name').value.trim(), company: $('#s_company').value.trim() } });
        localStorage.setItem('ca_user', JSON.stringify(user)); $('#brandName').textContent = user.company || 'Барилгын Нягтлан'; $('#avatar').textContent = (user.name ? user.name[0] : '?').toUpperCase(); toast(T('save')); }
      catch (e) { toast(e.message); }
    };
    $('#s_lang').onchange = () => { lang = $('#s_lang').value; localStorage.setItem('ca_lang', lang); applyStaticI18n(); render(); };
    $('#logoutBtn').onclick = () => { if (confirm(T('logout') + '?')) doLogout(); };
  }

  /* ============================================================
     CONVERT  (file → Excel)
     ============================================================ */
  async function viewConvert() {
    app.innerHTML = `
      <div class="page-head"><div><h2>📥 ${T('imp_title')}</h2><div class="sub">${T('imp_sub')}</div></div></div>
      <div class="card">
        <div class="field"><label>${T('imp_kind')}</label>
          <div class="seg">
            <button type="button" class="seg-btn active" id="kLedger">💰 ${T('imp_ledger')}</button>
            <button type="button" class="seg-btn" id="kMaterials">📦 ${T('imp_materials')}</button>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>${T('month')}</label><input type="month" id="impMonth" value="${thisMonthVal()}"></div>
          <div class="field"><label>&nbsp;</label><button type="button" class="btn sm" id="tmplBtn">⬇️ ${T('imp_template')}</button></div>
        </div>
        <div id="dropZone" class="dropzone">
          <div style="font-size:2.4rem">📄 → 🗂️</div>
          <p style="margin:.4rem 0 .2rem"><b>${T('conv_drop')}</b></p>
          <p class="hint">CSV · Excel (.xlsx) · TSV · JSON</p>
          <button class="btn primary mt" id="chooseBtn">📂 ${T('imp_choose')}</button>
          <input type="file" id="impFile" hidden>
        </div>
      </div>
      <div id="impResult" class="mt"></div>
      <div class="card mt">
        <div class="hint">${T('imp_or_convert')}</div>
        <div class="head-actions mt"><button class="btn ghost sm" id="convOnlyBtn">🔄 ${T('conv_title')}</button></div>
        <input type="file" id="convFile" hidden>
        <div id="convStatus" class="mt"></div>
      </div>`;
    let kind = 'ledger';
    const setKind = k => { kind = k; $('#kLedger').classList.toggle('active', k === 'ledger'); $('#kMaterials').classList.toggle('active', k === 'materials'); const ir = $('#impResult'); if (ir) ir.innerHTML = ''; };
    $('#kLedger').onclick = () => setKind('ledger');
    $('#kMaterials').onclick = () => setKind('materials');
    $('#tmplBtn').onclick = () => downloadTemplate(kind);
    const fileInput = $('#impFile'), dz = $('#dropZone');
    $('#chooseBtn').onclick = () => fileInput.click();
    fileInput.onchange = () => { if (fileInput.files[0]) previewImport(fileInput.files[0]); };
    dz.ondragover = e => { e.preventDefault(); dz.classList.add('drag'); };
    dz.ondragleave = () => dz.classList.remove('drag');
    dz.ondrop = e => { e.preventDefault(); dz.classList.remove('drag'); if (e.dataTransfer.files[0]) previewImport(e.dataTransfer.files[0]); };
    const cf = $('#convFile');
    $('#convOnlyBtn').onclick = () => cf.click();
    cf.onchange = () => { if (cf.files[0]) doConvert(cf.files[0]); };
  }
  function importKind() { return $('#kLedger') && $('#kLedger').classList.contains('active') ? 'ledger' : 'materials'; }
  async function previewImport(file) {
    const box = $('#impResult'); const kind = importKind(); const month = $('#impMonth') ? $('#impMonth').value : thisMonthVal();
    box.innerHTML = `<div class="loading"><div class="spinner"></div>${T('loading')}</div>`;
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('kind', kind); fd.append('month', month); fd.append('confirm', 'false');
      const res = await fetch(API + '/import', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
      if (res.status === 401) { doLogout(); return; }
      if (!res.ok) { let d = ''; try { d = (await res.json()).detail; } catch (e) { } throw new Error(d || ('Error ' + res.status)); }
      renderImportPreview(await res.json(), file, kind, month);
    } catch (e) { box.innerHTML = `<div class="alert danger">⚠️ ${esc(e.message)}</div>`; }
  }
  function renderImportPreview(j, file, kind, month) {
    const rows = j.preview || [];
    let head, body;
    if (kind === 'ledger') {
      head = `<th>${T('date')}</th><th>${T('type')}</th><th class="num">${T('amount')}</th><th>${T('category')}</th><th>${T('description')}</th>`;
      body = rows.map(r => `<tr><td class="nowrap">${esc(r.date)}</td><td><span class="pill ${r.type === 'income' ? 'income' : 'expense'}">${r.type === 'income' ? T('income_t') : T('outcome_t')}</span></td><td class="num">${fmtMoney(r.amount)}</td><td>${esc(r.category || '-')}</td><td>${esc(r.description || '-')}</td></tr>`).join('');
    } else {
      head = `<th>${T('name')}</th><th>${T('category')}</th><th>${T('unit')}</th><th class="num">${T('unit_price')}</th><th>${T('supplier')}</th><th class="num">${T('qty')}</th>`;
      body = rows.map(r => `<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.category || '-')}</td><td>${esc(unitLabel(r.unit))}</td><td class="num">${fmtMoney(r.price)}</td><td>${esc(r.supplier || '-')}</td><td class="num">${r.quantity != null ? fmtQty(r.quantity) : '-'}</td></tr>`).join('');
    }
    const warn = (kind === 'ledger' && !(j.columns || []).includes('type')) ? `<div class="alert warn">⚠️ ${T('imp_no_type')}</div>` : '';
    $('#impResult').innerHTML = warn + `<div class="card"><div class="section-title"><h3>${T('imp_preview')} · ${rows.length}/${j.total}</h3>
      <button class="btn primary" id="doImportBtn">✅ ${j.total} ${T('imp_import_n')}</button></div>
      <div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`;
    $('#doImportBtn').onclick = () => confirmImport(file, kind, month);
  }
  async function confirmImport(file, kind, month) {
    const btn = $('#doImportBtn'); if (btn) { btn.disabled = true; btn.textContent = '…'; }
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('kind', kind); fd.append('month', month); fd.append('confirm', 'true');
      const res = await fetch(API + '/import', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
      if (res.status === 401) { doLogout(); return; }
      if (!res.ok) { let d = ''; try { d = (await res.json()).detail; } catch (e) { } throw new Error(d || ('Error ' + res.status)); }
      const j = await res.json();
      let msg = '✅ ' + j.imported + ' ' + T('imp_done');
      if (j.stock_added) msg += ` · ${j.stock_added} ${T('nav_stocktake')}`;
      $('#impResult').innerHTML = `<div class="alert info">${msg}</div>`;
      toast(msg);
    } catch (e) { $('#impResult').innerHTML = `<div class="alert danger">⚠️ ${esc(e.message)}</div>`; }
  }
  async function downloadTemplate(kind) {
    try {
      const res = await fetch(API + '/import/template?kind=' + kind, { headers: { Authorization: 'Bearer ' + token } });
      if (res.status === 401) { doLogout(); return; }
      const blob = await res.blob(); const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'template_' + kind + '.xlsx';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (e) { toast(e.message); }
  }
  async function doConvert(file) {
    const status = $('#convStatus');
    if (status) status.innerHTML = `<div class="loading"><div class="spinner"></div>${T('loading')}</div>`;
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch(API + '/convert', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
      if (res.status === 401) { doLogout(); return; }
      if (!res.ok) { let d = ''; try { d = (await res.json()).detail; } catch (e) { } throw new Error(d || ('Error ' + res.status)); }
      const blob = await res.blob();
      const base = (file.name || 'converted').replace(/\.[^.]+$/, '') || 'converted';
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = base + '.xlsx';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      if (status) status.innerHTML = `<div class="alert info">✓ <b>${esc(base)}.xlsx</b> — ${T('conv_done')}</div>`;
      toast('📊 Excel ✓');
    } catch (e) {
      if (status) status.innerHTML = `<div class="alert danger">⚠️ ${esc(e.message)}</div>`;
    }
  }

  /* ---------- Sidebar / nav ---------- */
  function openSidebar() { $('#sidebar').classList.add('open'); $('#scrim').classList.add('show'); }
  function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); }
  $('#menuBtn').onclick = () => $('#sidebar').classList.contains('open') ? closeSidebar() : openSidebar();
  $('#scrim').onclick = closeSidebar;
  $$('.navlink').forEach(a => a.addEventListener('click', () => { location.hash = '#/' + a.dataset.route; }));
  $('#langBtn').onclick = () => { const order = ['both', 'mn', 'en']; lang = order[(order.indexOf(lang) + 1) % 3]; localStorage.setItem('ca_lang', lang); applyStaticI18n(); render(); };

  /* ---------- Dark / light theme toggle ---------- */
  function curTheme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function setTheme(t) { document.documentElement.setAttribute('data-theme', t); localStorage.setItem('ca_theme', t); const b = $('#themeBtn'); if (b) b.textContent = t === 'dark' ? '☀️' : '🌙'; }
  (function initTheme() { const b = $('#themeBtn'); if (b) { b.textContent = curTheme() === 'dark' ? '☀️' : '🌙'; b.onclick = () => setTheme(curTheme() === 'dark' ? 'light' : 'dark'); } })();

  /* ---------- Init ---------- */
  // Dismiss the animated intro splash after it plays.
  setTimeout(function () {
    var i = document.getElementById('introScreen');
    if (i) { i.classList.add('intro-done'); setTimeout(function () { if (i.parentNode) i.remove(); }, 600); }
  }, 1900);
  function showUpdateBanner() {
    if (document.getElementById('updateBanner')) return;
    const b = document.createElement('div'); b.id = 'updateBanner';
    const span = document.createElement('span'); span.textContent = '🔄 ' + (lang === 'en' ? 'New version available' : 'Шинэ хувилбар гарлаа');
    const btn = document.createElement('button'); btn.textContent = (lang === 'en' ? 'Refresh' : 'Шинэчлэх');
    btn.onclick = () => location.reload();
    b.appendChild(span); b.appendChild(btn); document.body.appendChild(b);
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing; if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner();
        });
      });
    }).catch(() => { });
  }
  setAuthMode('login');
  (async function boot() {
    const cached = localStorage.getItem('ca_user'); if (cached) { try { user = JSON.parse(cached); } catch (e) { } }
    if (!token) { showAuth(); return; }
    try { user = await api('/auth/me'); localStorage.setItem('ca_user', JSON.stringify(user)); showApp(); }
    catch (e) { if (e.message === 'unauthorized') { /* doLogout already called */ } else { showAuth(); } }
  })();

})();
