/* ============================================================
   Барилгын Нягтлан · Construction Accountant Assistant
   - Bilingual (Монгол / English), Tögrög (₮)
   - Offline-first: data in localStorage, no server required
   - Sections: Dashboard, Materials, Stocktaking, Ledger, Loans, Settings
   ============================================================ */
'use strict';
(function () {

  /* ---------- Storage ---------- */
  const DB_KEY = 'ca_v1';
  const DEFAULT_DB = {
    v: 1,
    settings: { lang: 'both', company: { name: '', reg: '', phone: '' }, notifyDays: 5, notifyLog: {} },
    materials: [],
    txns: [],
    loans: [],
    stocktakes: []
  };
  let DB = loadDB();

  function loadDB() {
    try {
      const raw = JSON.parse(localStorage.getItem(DB_KEY));
      if (raw && raw.v) return Object.assign({}, DEFAULT_DB, raw,
        { settings: Object.assign({}, DEFAULT_DB.settings, raw.settings) });
    } catch (e) { /* ignore */ }
    return null;
  }
  function saveDB() { localStorage.setItem(DB_KEY, JSON.stringify(DB)); }

  /* ---------- i18n ---------- */
  const STR = {
    nav_dashboard: ['Хяналт', 'Dashboard'], nav_materials: ['Материал', 'Materials'],
    nav_stocktake: ['Тооллого', 'Stocktaking'], nav_ledger: ['Орлого/Зарлага', 'Income & Expense'],
    nav_loans: ['Зээл', 'Loans'], nav_settings: ['Тохиргоо', 'Settings'],

    add: ['Нэмэх', 'Add'], edit: ['Засах', 'Edit'], delete: ['Устгах', 'Delete'],
    save: ['Хадгалах', 'Save'], cancel: ['Болих', 'Cancel'], search: ['Хайх', 'Search'],
    month: ['Сар', 'Month'], all: ['Бүгд', 'All'], total: ['Нийт', 'Total'], date: ['Огноо', 'Date'],
    amount: ['Дүн', 'Amount'], category: ['Ангилал', 'Category'], note: ['Тэмдэглэл', 'Note'],
    name: ['Нэр', 'Name'], actions: ['Үйлдэл', 'Actions'],

    dash_title: ['Хяналтын самбар', 'Dashboard'], this_month: ['Энэ сар', 'This month'],
    income: ['Орлого', 'Income'], expense: ['Зарлага', 'Expense'], net: ['Цэвэр', 'Net'],
    cash_balance: ['Нийт үлдэгдэл', 'Cash balance'], low_stock: ['Дуусаж буй материал', 'Low stock'],
    upcoming_loans: ['Зээлийн төлбөр', 'Loan payments'], no_alerts: ['Анхаарах зүйл алга', 'All clear'],
    last6: ['Сүүлийн 6 сарын урсгал', 'Last 6 months'],

    mat_title: ['Материал', 'Materials'], mat_sub: ['Үнэ, үлдэгдэл, нийлүүлэгч', 'Price, stock & supplier'],
    unit: ['Нэгж', 'Unit'], unit_price: ['Нэгж үнэ', 'Unit price'], stock: ['Үлдэгдэл', 'Stock'],
    min_stock: ['Доод хязгаар', 'Min level'], supplier: ['Нийлүүлэгч', 'Supplier'], value: ['Өртөг', 'Value'],
    add_material: ['Материал нэмэх', 'Add material'], edit_material: ['Материал засах', 'Edit material'],
    search_materials: ['Материал хайх...', 'Search materials...'], all_categories: ['Бүх ангилал', 'All categories'],
    low_only: ['Зөвхөн дуусаж буй', 'Low only'], no_materials: ['Материал бүртгэгдээгүй байна', 'No materials yet'],
    stock_value: ['Агуулахын нийт өртөг', 'Total stock value'],

    st_title: ['Сарын эцсийн тооллого', 'Monthly stocktaking'],
    st_sub: ['Бодит үлдэгдлийг тоолж, зөрүүг гаргана', 'Count actual stock, find variance'],
    new_count: ['Шинэ тооллого', 'New count'], expected: ['Бүртгэлийн', 'System'], counted: ['Тоолсон', 'Counted'],
    diff: ['Зөрүү', 'Diff'], apply_counts: ['Үлдэгдэлд буулгах', 'Apply to stock'],
    no_stocktakes: ['Тооллого хийгээгүй байна', 'No counts yet'], save_count: ['Тооллого хадгалах', 'Save count'],
    applied: ['Үлдэгдэлд буулгалаа', 'Applied to stock'], value_variance: ['Өртгийн зөрүү', 'Value variance'],
    view: ['Үзэх', 'View'], count_sheet: ['Тооллогын хуудас', 'Count sheet'],

    led_title: ['Орлого ба Зарлага', 'Income & Expense'], led_sub: ['Мөнгөн гүйлгээний бүртгэл', 'Cash-flow ledger'],
    add_txn: ['Гүйлгээ нэмэх', 'Add entry'], type: ['Төрөл', 'Type'], income_t: ['Орлого', 'Income'],
    expense_t: ['Зарлага', 'Expense'], method: ['Төлбөрийн хэлбэр', 'Method'], project: ['Төсөл', 'Project'],
    description: ['Утга', 'Description'], balance: ['Үлдэгдэл', 'Balance'], no_txns: ['Гүйлгээ алга', 'No entries'],

    loan_title: ['Зээлийн сануулга', 'Loan reminders'], loan_sub: ['Зээл, төлбөрийн хугацааг хянана', 'Track loans & due dates'],
    add_loan: ['Зээл нэмэх', 'Add loan'], borrowed: ['Авсан зээл', 'Borrowed'], lent: ['Өгсөн зээл', 'Lent'],
    party: ['Хэнтэй', 'Counterparty'], principal: ['Үндсэн дүн', 'Principal'], rate: ['Хүү (%)', 'Rate (%)'],
    start_date: ['Эхэлсэн', 'Start'], due_date: ['Төлөх огноо', 'Due date'], freq: ['Давтамж', 'Frequency'],
    once: ['Нэг удаа', 'One-time'], monthly: ['Сар бүр', 'Monthly'], paid: ['Төлсөн', 'Paid'],
    remaining: ['Үлдэгдэл', 'Remaining'], status: ['Төлөв', 'Status'], active: ['Идэвхтэй', 'Active'],
    closed: ['Хаагдсан', 'Closed'], overdue: ['Хугацаа хэтэрсэн', 'Overdue'], due_soon: ['Удахгүй', 'Due soon'],
    add_payment: ['Төлбөр нэмэх', 'Add payment'], payments: ['Төлбөрүүд', 'Payments'], payment: ['Төлбөр', 'Payment'],
    enable_reminders: ['Мэдэгдэл асаах', 'Enable reminders'], no_loans: ['Зээл бүртгэгдээгүй', 'No loans yet'],
    i_owe: ['Би төлөх', 'I owe'], owed_to_me: ['Надад төлөх', 'Owed to me'],

    set_title: ['Тохиргоо', 'Settings'], company: ['Байгууллага', 'Company'],
    company_name: ['Байгууллагын нэр', 'Company name'], reg_no: ['Регистр', 'Reg. number'], phone: ['Утас', 'Phone'],
    language: ['Хэл', 'Language'], backup: ['Нөөшлөх', 'Backup & restore'],
    export_data: ['Өгөгдөл татах (JSON)', 'Export data (JSON)'], import_data: ['Өгөгдөл оруулах', 'Import data'],
    clear_all: ['Бүх өгөгдөл устгах', 'Erase all data'], install: ['Утсандаа суулгах', 'Install on phone'],
    notify_days: ['Хэдэн өдрийн өмнө сануулах', 'Remind days before'], reminders: ['Сануулга', 'Reminders'],
    data_kept_local: ['Өгөгдөл зөвхөн энэ төхөөрөмжид хадгалагдана. Тогтмол нөөшилж байгаарай.',
      'Data is stored only on this device. Export a backup regularly.'],
    danger_zone: ['Аюултай бүс', 'Danger zone'],
    lang_mn: ['Монгол', 'Mongolian'], lang_en: ['Англи', 'English'], lang_both: ['Хоёулаа', 'Both']
  };
  function T(key) {
    const e = STR[key]; if (!e) return key;
    const lang = DB.settings.lang;
    if (lang === 'mn') return e[0];
    if (lang === 'en') return e[1];
    return e[0] + ' / ' + e[1];
  }

  /* ---------- Reference data ---------- */
  const UNITS = [
    ['ш', 'ширхэг', 'pcs'], ['кг', 'килограмм', 'kg'], ['тонн', 'тонн', 'ton'],
    ['м', 'метр', 'm'], ['м²', 'кв.метр', 'm²'], ['м³', 'куб.метр', 'm³'],
    ['уут', 'уут', 'bag'], ['литр', 'литр', 'L'], ['хайрцаг', 'хайрцаг', 'box'],
    ['багц', 'багц', 'set'], ['рулон', 'рулон', 'roll']
  ];
  function unitLabel(v) {
    const u = UNITS.find(x => x[0] === v); if (!u) return v || '';
    const lang = DB.settings.lang;
    if (lang === 'en') return u[2];
    if (lang === 'mn') return u[1];
    return u[1] + '/' + u[2];
  }
  const MAT_CATS = ['Цемент / Cement', 'Төмөр / Steel', 'Мод / Wood', 'Дулаалга / Insulation',
    'Цахилгаан / Electrical', 'Сантехник / Plumbing', 'Засал / Finishing', 'Багаж / Tools', 'Бусад / Other'];
  const INCOME_CATS = ['Борлуулалт / Sales', 'Урьдчилгаа / Advance', 'Зээл авсан / Loan in', 'Бусад / Other'];
  const EXPENSE_CATS = ['Материал / Materials', 'Цалин / Salary', 'Түрээс / Rent', 'Тээвэр / Transport',
    'Татвар / Tax', 'Зээл төлсөн / Loan payment', 'Бусад / Other'];
  const METHODS = ['Бэлэн / Cash', 'Данс / Bank', 'Карт / Card', 'Зээл / Credit'];

  /* ---------- Helpers ---------- */
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const app = $('#app');
  function uid() { return Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function todayISO() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function thisMonth() { return todayISO().slice(0, 7); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function num(v) { const n = parseFloat(String(v).replace(/[^\d.\-]/g, '')); return isNaN(n) ? 0 : n; }
  function fmtMoney(n) {
    n = Math.round(num(n)); const neg = n < 0;
    return (neg ? '−' : '') + Math.abs(n).toLocaleString('en-US') + '₮';
  }
  function fmtQty(n) { n = num(n); return Number.isInteger(n) ? String(n) : n.toFixed(2); }
  function daysBetween(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }
  function monthsBack(n) {
    const out = []; const d = new Date();
    for (let i = n - 1; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(`${x.getFullYear()}-${pad(x.getMonth() + 1)}`); }
    return out;
  }
  function option(value, label, sel) { return `<option value="${esc(value)}"${value === sel ? ' selected' : ''}>${esc(label)}</option>`; }
  function datalist(id, items) { return `<datalist id="${id}">${items.map(i => `<option value="${esc(i)}">`).join('')}</datalist>`; }

  /* ---------- Toast & modal ---------- */
  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600); }
  function openModal(title, bodyHTML, onMount) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = bodyHTML;
    $('#modal').classList.remove('hidden');
    if (onMount) onMount($('#modalBody'));
  }
  function closeModal() { $('#modal').classList.add('hidden'); $('#modalBody').innerHTML = ''; }
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });

  /* ---------- Material helpers ---------- */
  function matById(id) { return DB.materials.find(m => m.id === id); }
  function isLow(m) { return num(m.minStock) > 0 && num(m.stock) <= num(m.minStock); }

  /* ---------- Loan helpers ---------- */
  function loanPaid(l) { return (l.payments || []).reduce((s, p) => s + num(p.amount), 0); }
  function loanRemaining(l) { return Math.max(0, num(l.principal) - loanPaid(l)); }
  function loanState(l) {
    if (loanRemaining(l) <= 0) return 'closed';
    if (!l.dueDate) return 'active';
    const today = todayISO();
    if (l.dueDate < today) return 'overdue';
    if (daysBetween(today, l.dueDate) <= (DB.settings.notifyDays || 5)) return 'soon';
    return 'active';
  }

  /* ============================================================
     ROUTER
     ============================================================ */
  const ROUTES = { dashboard: viewDashboard, materials: viewMaterials, stocktake: viewStocktake, ledger: viewLedger, loans: viewLoans, settings: viewSettings };
  function currentRoute() { return (location.hash.replace('#/', '') || 'dashboard'); }
  function render() {
    const r = currentRoute();
    const fn = ROUTES[r] || viewDashboard;
    $$('.navlink').forEach(a => a.classList.toggle('active', a.dataset.route === r));
    app.scrollTop = 0; window.scrollTo(0, 0);
    fn();
    closeSidebar();
  }
  window.addEventListener('hashchange', render);

  /* ---------- Static i18n (nav, brand) ---------- */
  function applyStaticI18n() {
    $$('[data-t]').forEach(el => { el.textContent = T(el.dataset.t); });
  }

  /* ============================================================
     VIEW: DASHBOARD
     ============================================================ */
  function monthTotals(ym) {
    let inc = 0, exp = 0;
    DB.txns.forEach(t => { if ((t.date || '').slice(0, 7) === ym) { if (t.kind === 'income') inc += num(t.amount); else exp += num(t.amount); } });
    return { inc, exp, net: inc - exp };
  }
  function cashBalance() { return DB.txns.reduce((s, t) => s + (t.kind === 'income' ? num(t.amount) : -num(t.amount)), 0); }

  function viewDashboard() {
    const ym = thisMonth();
    const m = monthTotals(ym);
    const low = DB.materials.filter(isLow);
    const loanAlerts = DB.loans.filter(l => { const s = loanState(l); return s === 'overdue' || s === 'soon'; })
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    const stockVal = DB.materials.reduce((s, x) => s + num(x.stock) * num(x.price), 0);

    let html = `
      <div class="page-head"><div><h2>${T('dash_title')}</h2>
      <div class="sub">${esc(DB.settings.company.name || '')} · ${ym}</div></div></div>

      <div class="grid kpis">
        <div class="card kpi green"><div class="label">${T('income')} · ${T('this_month')}</div><div class="value">${fmtMoney(m.inc)}</div></div>
        <div class="card kpi red"><div class="label">${T('expense')} · ${T('this_month')}</div><div class="value">${fmtMoney(m.exp)}</div></div>
        <div class="card kpi ${m.net >= 0 ? 'green' : 'red'}"><div class="label">${T('net')} · ${T('this_month')}</div><div class="value">${fmtMoney(m.net)}</div></div>
        <div class="card kpi blue"><div class="label">${T('cash_balance')}</div><div class="value">${fmtMoney(cashBalance())}</div></div>
      </div>

      <div class="grid dash-grid mt">
        <div class="card">
          <div class="section-title"><h3>${T('last6')}</h3></div>
          ${chartSVG()}
          <div class="kv mt"><span class="k">${T('stock_value')}</span><span>${fmtMoney(stockVal)}</span></div>
        </div>
        <div class="card">
          <div class="section-title"><h3>🔔 ${T('upcoming_loans')}</h3></div>
          ${loanAlerts.length ? loanAlerts.map(loanAlertRow).join('') :
        `<div class="alert info">✓ ${T('no_alerts')}</div>`}
          <div class="section-title mt"><h3>📦 ${T('low_stock')}</h3></div>
          ${low.length ? low.map(x => `<div class="alert warn">⚠️ <b>${esc(x.name)}</b> — ${fmtQty(x.stock)} ${esc(unitLabel(x.unit))} (${T('min_stock')}: ${fmtQty(x.minStock)})</div>`).join('') :
        `<div class="alert info">✓ ${T('no_alerts')}</div>`}
        </div>
      </div>`;
    app.innerHTML = html;
  }

  function loanAlertRow(l) {
    const st = loanState(l);
    const cls = st === 'overdue' ? 'danger' : 'warn';
    const lbl = st === 'overdue' ? T('overdue') : T('due_soon');
    const dirLbl = l.dir === 'borrowed' ? T('i_owe') : T('owed_to_me');
    return `<div class="alert ${cls}">🏦 <div><b>${esc(l.party)}</b> — ${dirLbl} ${fmtMoney(loanRemaining(l))}<br>
      <span class="muted">${T('due_date')}: ${esc(l.dueDate || '-')} · ${lbl}</span></div></div>`;
  }

  function chartSVG() {
    const months = monthsBack(6);
    const data = months.map(ym => monthTotals(ym));
    const max = Math.max(1, ...data.map(d => Math.max(d.inc, d.exp)));
    const W = 480, H = 150, pad = 22, bw = (W - pad * 2) / months.length;
    let bars = '';
    months.forEach((ym, i) => {
      const d = data[i];
      const x = pad + i * bw;
      const ih = (d.inc / max) * (H - 40), eh = (d.exp / max) * (H - 40);
      const bwi = bw * 0.32;
      bars += `<rect class="bar-in" x="${x + bw * 0.15}" y="${H - 20 - ih}" width="${bwi}" height="${ih}" rx="2"/>`;
      bars += `<rect class="bar-out" x="${x + bw * 0.5}" y="${H - 20 - eh}" width="${bwi}" height="${eh}" rx="2"/>`;
      bars += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${ym.slice(2)}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      ${bars}
      <g transform="translate(${pad},8)">
        <rect class="bar-in" width="10" height="10" rx="2"/><text x="14" y="9">${T('income')}</text>
        <rect class="bar-out" x="90" width="10" height="10" rx="2"/><text x="104" y="9">${T('expense')}</text>
      </g></svg>`;
  }

  /* ============================================================
     VIEW: MATERIALS  (catalog + search)
     ============================================================ */
  let matFilter = { q: '', cat: '', low: false };
  function viewMaterials() {
    const cats = [...new Set(DB.materials.map(m => m.category).filter(Boolean))];
    let list = DB.materials.slice();
    const q = matFilter.q.trim().toLowerCase();
    if (q) list = list.filter(m => (m.name + ' ' + (m.supplier || '') + ' ' + (m.category || '')).toLowerCase().includes(q));
    if (matFilter.cat) list = list.filter(m => m.category === matFilter.cat);
    if (matFilter.low) list = list.filter(isLow);
    list.sort((a, b) => a.name.localeCompare(b.name, 'mn'));
    const stockVal = list.reduce((s, x) => s + num(x.stock) * num(x.price), 0);

    app.innerHTML = `
      <div class="page-head">
        <div><h2>${T('mat_title')}</h2><div class="sub">${T('mat_sub')}</div></div>
        <div class="head-actions"><button class="btn primary" id="addMat">＋ ${T('add_material')}</button></div>
      </div>
      <div class="toolbar">
        <div class="search"><input id="matSearch" placeholder="${T('search_materials')}" value="${esc(matFilter.q)}"></div>
        <select id="matCat"><option value="">${T('all_categories')}</option>${cats.map(c => option(c, c, matFilter.cat)).join('')}</select>
        <label class="btn ghost sm"><input type="checkbox" id="matLow" ${matFilter.low ? 'checked' : ''} style="width:auto;margin-right:.4rem"> ${T('low_only')}</label>
      </div>
      ${list.length ? `
      <div class="card table-wrap"><table>
        <thead><tr>
          <th>${T('name')}</th><th>${T('category')}</th><th>${T('unit')}</th>
          <th class="num">${T('unit_price')}</th><th class="num">${T('stock')}</th><th class="num">${T('min_stock')}</th>
          <th>${T('supplier')}</th><th class="num">${T('value')}</th><th></th>
        </tr></thead><tbody>
        ${list.map(m => `<tr class="${isLow(m) ? 'low' : ''}">
          <td><b>${esc(m.name)}</b>${m.note ? `<br><span class="muted" style="font-size:.8rem">${esc(m.note)}</span>` : ''}</td>
          <td>${esc(m.category || '-')}</td>
          <td>${esc(unitLabel(m.unit))}</td>
          <td class="num">${fmtMoney(m.price)}</td>
          <td class="num">${fmtQty(m.stock)}${isLow(m) ? ' ⚠️' : ''}</td>
          <td class="num">${fmtQty(m.minStock)}</td>
          <td>${esc(m.supplier || '-')}</td>
          <td class="num">${fmtMoney(num(m.stock) * num(m.price))}</td>
          <td><div class="row-actions">
            <button class="btn sm" data-edit="${m.id}">✎</button>
            <button class="btn sm danger" data-del="${m.id}">✕</button>
          </div></td>
        </tr>`).join('')}
        </tbody>
        <tfoot><tr><th colspan="7" class="right">${T('stock_value')}</th><th class="num">${fmtMoney(stockVal)}</th><th></th></tr></tfoot>
      </table></div>` :
        `<div class="card empty"><span class="big">📦</span>${T('no_materials')}</div>`}
    `;
    $('#addMat').onclick = () => materialForm();
    $('#matSearch').oninput = e => { matFilter.q = e.target.value; debouncedMat(); };
    $('#matCat').onchange = e => { matFilter.cat = e.target.value; viewMaterials(); };
    $('#matLow').onchange = e => { matFilter.low = e.target.checked; viewMaterials(); };
    $$('[data-edit]').forEach(b => b.onclick = () => materialForm(matById(b.dataset.edit)));
    $$('[data-del]').forEach(b => b.onclick = () => {
      const m = matById(b.dataset.del);
      if (confirm(`${T('delete')}: ${m.name}?`)) { DB.materials = DB.materials.filter(x => x.id !== m.id); saveDB(); viewMaterials(); toast(T('delete')); }
    });
  }
  let matDebTimer; function debouncedMat() { clearTimeout(matDebTimer); matDebTimer = setTimeout(viewMaterials, 200); }

  function materialForm(m) {
    const e = m || { id: '', name: '', category: '', unit: 'ш', price: '', stock: '', minStock: '', supplier: '', note: '' };
    openModal(m ? T('edit_material') : T('add_material'), `
      ${datalist('catList', MAT_CATS)}
      <div class="field"><label>${T('name')} *</label><input id="f_name" value="${esc(e.name)}" autofocus></div>
      <div class="form-row">
        <div class="field"><label>${T('category')}</label><input id="f_cat" list="catList" value="${esc(e.category)}"></div>
        <div class="field"><label>${T('unit')}</label><select id="f_unit">${UNITS.map(u => option(u[0], DB.settings.lang === 'en' ? u[2] : u[1], e.unit)).join('')}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('unit_price')} (₮)</label><input id="f_price" inputmode="numeric" value="${e.price}"></div>
        <div class="field"><label>${T('supplier')}</label><input id="f_supplier" value="${esc(e.supplier)}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('stock')}</label><input id="f_stock" inputmode="decimal" value="${e.stock}"></div>
        <div class="field"><label>${T('min_stock')}</label><input id="f_min" inputmode="decimal" value="${e.minStock}"></div>
      </div>
      <div class="field"><label>${T('note')}</label><input id="f_note" value="${esc(e.note)}"></div>
      <div class="modal-actions">
        <button class="btn ghost" id="f_cancel">${T('cancel')}</button>
        <button class="btn primary" id="f_save">${T('save')}</button>
      </div>`, body => {
      body.querySelector('#f_cancel').onclick = closeModal;
      body.querySelector('#f_save').onclick = () => {
        const name = body.querySelector('#f_name').value.trim();
        if (!name) { toast(T('name') + ' *'); return; }
        const rec = {
          id: e.id || uid(), name,
          category: body.querySelector('#f_cat').value.trim(),
          unit: body.querySelector('#f_unit').value,
          price: num(body.querySelector('#f_price').value),
          stock: num(body.querySelector('#f_stock').value),
          minStock: num(body.querySelector('#f_min').value),
          supplier: body.querySelector('#f_supplier').value.trim(),
          note: body.querySelector('#f_note').value.trim(),
          updatedAt: todayISO()
        };
        if (e.id) { const i = DB.materials.findIndex(x => x.id === e.id); DB.materials[i] = rec; }
        else DB.materials.push(rec);
        saveDB(); closeModal(); viewMaterials(); toast(T('save'));
      };
    });
  }

  /* ============================================================
     VIEW: STOCKTAKING
     ============================================================ */
  function viewStocktake() {
    const list = DB.stocktakes.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    app.innerHTML = `
      <div class="page-head">
        <div><h2>${T('st_title')}</h2><div class="sub">${T('st_sub')}</div></div>
        <div class="head-actions"><button class="btn primary" id="newCount">＋ ${T('new_count')}</button></div>
      </div>
      ${list.length ? `<div class="card table-wrap"><table>
        <thead><tr><th>${T('date')}</th><th>${T('month')}</th><th class="num">${T('count_sheet')}</th><th class="num">${T('value_variance')}</th><th>${T('note')}</th><th></th></tr></thead>
        <tbody>${list.map(s => {
      const variance = (s.lines || []).reduce((sum, l) => sum + (num(l.counted) - num(l.expected)) * num(l.price), 0);
      return `<tr>
            <td>${esc(s.date)}</td><td>${esc(s.month)}</td>
            <td class="num">${(s.lines || []).length}</td>
            <td class="num ${variance < 0 ? 'amt-expense' : 'amt-income'}">${fmtMoney(variance)}</td>
            <td>${esc(s.note || '-')}</td>
            <td><div class="row-actions">
              <button class="btn sm" data-view="${s.id}">${T('view')}</button>
              <button class="btn sm danger" data-del="${s.id}">✕</button>
            </div></td></tr>`;
    }).join('')}</tbody></table></div>` :
        `<div class="card empty"><span class="big">📋</span>${T('no_stocktakes')}</div>`}
    `;
    $('#newCount').onclick = stocktakeForm;
    $$('[data-view]').forEach(b => b.onclick = () => stocktakeDetail(DB.stocktakes.find(s => s.id === b.dataset.view)));
    $$('[data-del]').forEach(b => b.onclick = () => {
      if (confirm(T('delete') + '?')) { DB.stocktakes = DB.stocktakes.filter(s => s.id !== b.dataset.del); saveDB(); viewStocktake(); }
    });
  }

  function stocktakeForm() {
    if (!DB.materials.length) { toast(T('no_materials')); return; }
    const lines = DB.materials.map(m => ({ materialId: m.id, name: m.name, unit: m.unit, expected: num(m.stock), price: num(m.price), counted: '' }));
    app.innerHTML = `
      <div class="page-head">
        <div><h2>${T('new_count')}</h2><div class="sub">${T('st_sub')}</div></div>
        <div class="head-actions"><button class="btn ghost" id="stCancel">${T('cancel')}</button><button class="btn primary" id="stSave">${T('save_count')}</button></div>
      </div>
      <div class="toolbar">
        <div class="field" style="margin:0"><label>${T('month')}</label><input type="month" id="stMonth" value="${thisMonth()}"></div>
        <div class="field" style="margin:0;flex:1"><label>${T('note')}</label><input id="stNote" placeholder="${T('note')}"></div>
      </div>
      <div class="card table-wrap"><table>
        <thead><tr><th>${T('name')}</th><th>${T('unit')}</th><th class="num">${T('expected')}</th><th class="num">${T('counted')}</th><th class="num">${T('diff')}</th></tr></thead>
        <tbody>${lines.map((l, i) => `<tr>
          <td><b>${esc(l.name)}</b></td><td>${esc(unitLabel(l.unit))}</td>
          <td class="num">${fmtQty(l.expected)}</td>
          <td class="num"><input data-cnt="${i}" inputmode="decimal" style="width:90px;text-align:right" placeholder="${fmtQty(l.expected)}"></td>
          <td class="num" data-diff="${i}">—</td>
        </tr>`).join('')}</tbody>
      </table></div>`;
    function recompute(i) {
      const inp = app.querySelector(`[data-cnt="${i}"]`);
      const cell = app.querySelector(`[data-diff="${i}"]`);
      if (inp.value === '') { cell.textContent = '—'; cell.className = 'num'; lines[i].counted = ''; return; }
      const c = num(inp.value); lines[i].counted = c;
      const d = c - lines[i].expected;
      cell.textContent = (d > 0 ? '+' : '') + fmtQty(d);
      cell.className = 'num ' + (d < 0 ? 'amt-expense' : d > 0 ? 'amt-income' : '');
    }
    app.querySelectorAll('[data-cnt]').forEach(inp => inp.oninput = () => recompute(+inp.dataset.cnt));
    $('#stCancel').onclick = viewStocktake;
    $('#stSave').onclick = () => {
      const rec = { id: uid(), month: $('#stMonth').value || thisMonth(), date: todayISO(), note: $('#stNote').value.trim(), lines: lines.slice() };
      DB.stocktakes.push(rec); saveDB(); stocktakeDetail(rec); toast(T('save'));
    };
  }

  function stocktakeDetail(s) {
    const counted = (s.lines || []).filter(l => l.counted !== '' && l.counted != null);
    const variance = counted.reduce((sum, l) => sum + (num(l.counted) - num(l.expected)) * num(l.price), 0);
    app.innerHTML = `
      <div class="page-head">
        <div><h2>${T('count_sheet')} — ${esc(s.month)}</h2><div class="sub">${esc(s.date)}${s.note ? ' · ' + esc(s.note) : ''}</div></div>
        <div class="head-actions">
          <button class="btn ghost" id="stBack">‹ ${T('nav_stocktake')}</button>
          <button class="btn accent" id="stApply">${T('apply_counts')}</button>
        </div>
      </div>
      <div class="grid kpis">
        <div class="card kpi blue"><div class="label">${T('count_sheet')}</div><div class="value">${(s.lines || []).length}</div></div>
        <div class="card kpi ${variance < 0 ? 'red' : 'green'}"><div class="label">${T('value_variance')}</div><div class="value">${fmtMoney(variance)}</div></div>
      </div>
      <div class="card table-wrap mt"><table>
        <thead><tr><th>${T('name')}</th><th>${T('unit')}</th><th class="num">${T('expected')}</th><th class="num">${T('counted')}</th><th class="num">${T('diff')}</th><th class="num">${T('value_variance')}</th></tr></thead>
        <tbody>${(s.lines || []).map(l => {
      const has = l.counted !== '' && l.counted != null;
      const d = has ? num(l.counted) - num(l.expected) : 0;
      return `<tr class="${d < 0 ? 'low' : ''}">
            <td><b>${esc(l.name)}</b></td><td>${esc(unitLabel(l.unit))}</td>
            <td class="num">${fmtQty(l.expected)}</td>
            <td class="num">${has ? fmtQty(l.counted) : '—'}</td>
            <td class="num">${has ? (d > 0 ? '+' : '') + fmtQty(d) : '—'}</td>
            <td class="num">${has ? fmtMoney(d * num(l.price)) : '—'}</td></tr>`;
    }).join('')}</tbody>
      </table></div>`;
    $('#stBack').onclick = viewStocktake;
    $('#stApply').onclick = () => {
      if (!confirm(T('apply_counts') + '?')) return;
      counted.forEach(l => { const m = matById(l.materialId); if (m) m.stock = num(l.counted); });
      saveDB(); toast(T('applied'));
    };
  }

  /* ============================================================
     VIEW: LEDGER (income & expense)
     ============================================================ */
  let ledFilter = { month: thisMonth(), kind: '', cat: '' };
  function viewLedger() {
    let list = DB.txns.slice();
    if (ledFilter.month) list = list.filter(t => (t.date || '').slice(0, 7) === ledFilter.month);
    if (ledFilter.kind) list = list.filter(t => t.kind === ledFilter.kind);
    if (ledFilter.cat) list = list.filter(t => t.category === ledFilter.cat);
    list.sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
    const inc = list.filter(t => t.kind === 'income').reduce((s, t) => s + num(t.amount), 0);
    const exp = list.filter(t => t.kind === 'expense').reduce((s, t) => s + num(t.amount), 0);
    const cats = [...new Set(DB.txns.map(t => t.category).filter(Boolean))];

    app.innerHTML = `
      <div class="page-head">
        <div><h2>${T('led_title')}</h2><div class="sub">${T('led_sub')}</div></div>
        <div class="head-actions"><button class="btn primary" id="addTxn">＋ ${T('add_txn')}</button></div>
      </div>
      <div class="toolbar">
        <input type="month" id="ledMonth" value="${ledFilter.month}">
        <select id="ledKind"><option value="">${T('all')}</option>${option('income', T('income_t'), ledFilter.kind)}${option('expense', T('expense_t'), ledFilter.kind)}</select>
        <select id="ledCat"><option value="">${T('all_categories')}</option>${cats.map(c => option(c, c, ledFilter.cat)).join('')}</select>
      </div>
      <div class="grid kpis">
        <div class="card kpi green"><div class="label">${T('income')}</div><div class="value">${fmtMoney(inc)}</div></div>
        <div class="card kpi red"><div class="label">${T('expense')}</div><div class="value">${fmtMoney(exp)}</div></div>
        <div class="card kpi ${inc - exp >= 0 ? 'green' : 'red'}"><div class="label">${T('net')}</div><div class="value">${fmtMoney(inc - exp)}</div></div>
      </div>
      ${list.length ? `<div class="card table-wrap mt"><table>
        <thead><tr><th>${T('date')}</th><th>${T('type')}</th><th>${T('category')}</th><th>${T('description')}</th><th>${T('project')}</th><th>${T('method')}</th><th class="num">${T('amount')}</th><th></th></tr></thead>
        <tbody>${list.map(t => `<tr>
          <td class="nowrap">${esc(t.date)}</td>
          <td><span class="pill ${t.kind}">${t.kind === 'income' ? T('income_t') : T('expense_t')}</span></td>
          <td>${esc(t.category || '-')}</td>
          <td>${esc(t.desc || '-')}</td>
          <td>${esc(t.project || '-')}</td>
          <td>${esc(t.method || '-')}</td>
          <td class="num ${t.kind === 'income' ? 'amt-income' : 'amt-expense'}">${t.kind === 'income' ? '+' : '−'}${fmtMoney(t.amount)}</td>
          <td><div class="row-actions"><button class="btn sm" data-edit="${t.id}">✎</button><button class="btn sm danger" data-del="${t.id}">✕</button></div></td>
        </tr>`).join('')}</tbody>
      </table></div>` : `<div class="card empty mt"><span class="big">💰</span>${T('no_txns')}</div>`}
    `;
    $('#addTxn').onclick = () => txnForm();
    $('#ledMonth').onchange = e => { ledFilter.month = e.target.value; viewLedger(); };
    $('#ledKind').onchange = e => { ledFilter.kind = e.target.value; viewLedger(); };
    $('#ledCat').onchange = e => { ledFilter.cat = e.target.value; viewLedger(); };
    $$('[data-edit]').forEach(b => b.onclick = () => txnForm(DB.txns.find(t => t.id === b.dataset.edit)));
    $$('[data-del]').forEach(b => b.onclick = () => {
      if (confirm(T('delete') + '?')) { DB.txns = DB.txns.filter(t => t.id !== b.dataset.del); saveDB(); viewLedger(); }
    });
  }

  function txnForm(t) {
    const e = t || { id: '', date: todayISO(), kind: 'expense', category: '', amount: '', desc: '', project: '', method: '', materialId: '', qty: '' };
    function catOptionsHTML(kind) { const arr = kind === 'income' ? INCOME_CATS : EXPENSE_CATS; return arr.map(c => `<option value="${esc(c)}">`).join(''); }
    openModal(t ? T('edit') : T('add_txn'), `
      ${datalist('methodList', METHODS)}
      <datalist id="txnCatList">${catOptionsHTML(e.kind)}</datalist>
      <div class="form-row">
        <div class="field"><label>${T('type')}</label>
          <select id="f_kind">${option('expense', T('expense_t'), e.kind)}${option('income', T('income_t'), e.kind)}</select></div>
        <div class="field"><label>${T('date')}</label><input type="date" id="f_date" value="${esc(e.date)}"></div>
      </div>
      <div class="field" id="matPickWrap"><label>${T('nav_materials')} (${T('expense_t').toLowerCase()})</label>
        <select id="f_mat"><option value="">— ${T('all')} —</option>${DB.materials.map(m => option(m.id, m.name, e.materialId)).join('')}</select>
      </div>
      <div class="form-row" id="matQtyWrap">
        <div class="field"><label>${T('stock')} (${T('counted').toLowerCase()})</label><input id="f_qty" inputmode="decimal" value="${e.qty || ''}" placeholder="0"></div>
        <div class="field"><label>${T('unit_price')}</label><input id="f_uprice" inputmode="numeric" placeholder="0" readonly></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('amount')} (₮) *</label><input id="f_amount" inputmode="numeric" value="${e.amount}"></div>
        <div class="field"><label>${T('category')}</label><input id="f_cat" list="txnCatList" value="${esc(e.category)}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('project')}</label><input id="f_project" value="${esc(e.project)}"></div>
        <div class="field"><label>${T('method')}</label><input id="f_method" list="methodList" value="${esc(e.method)}"></div>
      </div>
      <div class="field"><label>${T('description')}</label><input id="f_desc" value="${esc(e.desc)}"></div>
      <div class="hint" id="stockHint"></div>
      <div class="modal-actions"><button class="btn ghost" id="f_cancel">${T('cancel')}</button><button class="btn primary" id="f_save">${T('save')}</button></div>
    `, body => {
      const kindSel = body.querySelector('#f_kind');
      const matWrap = body.querySelector('#matPickWrap');
      const qtyWrap = body.querySelector('#matQtyWrap');
      const matSel = body.querySelector('#f_mat');
      const qty = body.querySelector('#f_qty');
      const uprice = body.querySelector('#f_uprice');
      const amount = body.querySelector('#f_amount');
      const hint = body.querySelector('#stockHint');
      function toggleMat() {
        const isExp = kindSel.value === 'expense';
        matWrap.classList.toggle('hidden', !isExp || !DB.materials.length);
        qtyWrap.classList.toggle('hidden', !isExp || !matSel.value);
        hint.textContent = (isExp && matSel.value) ? '✓ ' + (DB.settings.lang === 'en' ? 'Stock will increase by the quantity.' : 'Үлдэгдэлд тоо хэмжээ нэмэгдэнэ.') : '';
        body.querySelector('#txnCatList').innerHTML = (kindSel.value === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => `<option value="${esc(c)}">`).join('');
      }
      function recalc() {
        const m = matById(matSel.value);
        if (m) { uprice.value = m.price; if (qty.value) amount.value = Math.round(num(qty.value) * num(m.price)); }
      }
      kindSel.onchange = toggleMat;
      matSel.onchange = () => { toggleMat(); recalc(); };
      qty.oninput = recalc;
      toggleMat(); if (e.materialId) recalc();
      body.querySelector('#f_cancel').onclick = closeModal;
      body.querySelector('#f_save').onclick = () => {
        const amt = num(amount.value);
        if (!amt) { toast(T('amount') + ' *'); return; }
        const rec = {
          id: e.id || uid(), date: body.querySelector('#f_date').value || todayISO(),
          kind: kindSel.value, amount: amt,
          category: body.querySelector('#f_cat').value.trim(),
          desc: body.querySelector('#f_desc').value.trim(),
          project: body.querySelector('#f_project').value.trim(),
          method: body.querySelector('#f_method').value.trim(),
          materialId: (kindSel.value === 'expense' ? matSel.value : ''),
          qty: (kindSel.value === 'expense' && matSel.value) ? num(qty.value) : ''
        };
        // Stock increment for new material-purchase expenses
        if (!e.id && rec.materialId && rec.qty) { const m = matById(rec.materialId); if (m) { m.stock = num(m.stock) + num(rec.qty); } }
        if (e.id) { const i = DB.txns.findIndex(x => x.id === e.id); DB.txns[i] = rec; }
        else DB.txns.push(rec);
        saveDB(); closeModal(); viewLedger(); toast(T('save'));
      };
    });
  }

  /* ============================================================
     VIEW: LOANS
     ============================================================ */
  function viewLoans() {
    const notifyState = ('Notification' in window) ? Notification.permission : 'unsupported';
    const list = DB.loans.slice().sort((a, b) => {
      const order = { overdue: 0, soon: 1, active: 2, closed: 3 };
      return order[loanState(a)] - order[loanState(b)] || (a.dueDate || '').localeCompare(b.dueDate || '');
    });
    app.innerHTML = `
      <div class="page-head">
        <div><h2>${T('loan_title')}</h2><div class="sub">${T('loan_sub')}</div></div>
        <div class="head-actions">
          ${notifyState === 'granted' ? '' : notifyState === 'unsupported' ? '' : `<button class="btn" id="enableNotif">🔔 ${T('enable_reminders')}</button>`}
          <button class="btn primary" id="addLoan">＋ ${T('add_loan')}</button>
        </div>
      </div>
      ${list.length ? `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
        ${list.map(loanCard).join('')}
      </div>` : `<div class="card empty"><span class="big">🏦</span>${T('no_loans')}</div>`}
    `;
    $('#addLoan').onclick = () => loanForm();
    const en = $('#enableNotif'); if (en) en.onclick = () => requestNotify().then(viewLoans);
    $$('[data-pay]').forEach(b => b.onclick = () => paymentForm(DB.loans.find(l => l.id === b.dataset.pay)));
    $$('[data-edit]').forEach(b => b.onclick = () => loanForm(DB.loans.find(l => l.id === b.dataset.edit)));
    $$('[data-del]').forEach(b => b.onclick = () => {
      if (confirm(T('delete') + '?')) { DB.loans = DB.loans.filter(l => l.id !== b.dataset.del); saveDB(); viewLoans(); }
    });
  }

  function loanCard(l) {
    const st = loanState(l);
    const stPill = { overdue: 'expense', soon: 'warn', active: 'muted', closed: 'ok' }[st];
    const stLbl = { overdue: T('overdue'), soon: T('due_soon'), active: T('active'), closed: T('closed') }[st];
    const dirLbl = l.dir === 'borrowed' ? T('borrowed') : T('lent');
    const rem = loanRemaining(l);
    return `<div class="card">
      <div class="section-title"><h3>${esc(l.party)}</h3><span class="pill ${stPill}">${stLbl}</span></div>
      <div class="kv">
        <span class="k">${T('type')}</span><span>${dirLbl}${l.rate ? ` · ${esc(l.rate)}%` : ''}</span>
        <span class="k">${T('principal')}</span><span>${fmtMoney(l.principal)}</span>
        <span class="k">${T('paid')}</span><span class="amt-income">${fmtMoney(loanPaid(l))}</span>
        <span class="k">${T('remaining')}</span><span class="amt-expense"><b>${fmtMoney(rem)}</b></span>
        <span class="k">${T('due_date')}</span><span>${esc(l.dueDate || '-')}${l.freq === 'monthly' ? ' · ' + T('monthly') : ''}</span>
        ${l.note ? `<span class="k">${T('note')}</span><span>${esc(l.note)}</span>` : ''}
      </div>
      <div class="row-actions mt">
        ${rem > 0 ? `<button class="btn sm accent" data-pay="${l.id}">＋ ${T('add_payment')}</button>` : ''}
        <button class="btn sm" data-edit="${l.id}">✎</button>
        <button class="btn sm danger" data-del="${l.id}">✕</button>
      </div>
      ${(l.payments && l.payments.length) ? `<div class="hint mt">${T('payments')}: ${l.payments.map(p => `${esc(p.date)} ${fmtMoney(p.amount)}`).join(' · ')}</div>` : ''}
    </div>`;
  }

  function loanForm(l) {
    const e = l || { id: '', dir: 'borrowed', party: '', principal: '', rate: '', startDate: todayISO(), dueDate: '', freq: 'once', note: '', payments: [] };
    openModal(l ? T('edit') : T('add_loan'), `
      <div class="form-row">
        <div class="field"><label>${T('type')}</label><select id="f_dir">${option('borrowed', T('borrowed'), e.dir)}${option('lent', T('lent'), e.dir)}</select></div>
        <div class="field"><label>${T('party')} *</label><input id="f_party" value="${esc(e.party)}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('principal')} (₮) *</label><input id="f_principal" inputmode="numeric" value="${e.principal}"></div>
        <div class="field"><label>${T('rate')}</label><input id="f_rate" inputmode="decimal" value="${e.rate}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('start_date')}</label><input type="date" id="f_start" value="${esc(e.startDate)}"></div>
        <div class="field"><label>${T('due_date')}</label><input type="date" id="f_due" value="${esc(e.dueDate)}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${T('freq')}</label><select id="f_freq">${option('once', T('once'), e.freq)}${option('monthly', T('monthly'), e.freq)}</select></div>
        <div class="field"><label>${T('note')}</label><input id="f_note" value="${esc(e.note)}"></div>
      </div>
      <div class="modal-actions"><button class="btn ghost" id="f_cancel">${T('cancel')}</button><button class="btn primary" id="f_save">${T('save')}</button></div>
    `, body => {
      body.querySelector('#f_cancel').onclick = closeModal;
      body.querySelector('#f_save').onclick = () => {
        const party = body.querySelector('#f_party').value.trim();
        const principal = num(body.querySelector('#f_principal').value);
        if (!party || !principal) { toast(T('party') + ' / ' + T('principal') + ' *'); return; }
        const rec = {
          id: e.id || uid(), dir: body.querySelector('#f_dir').value, party, principal,
          rate: body.querySelector('#f_rate').value.trim(),
          startDate: body.querySelector('#f_start').value,
          dueDate: body.querySelector('#f_due').value,
          freq: body.querySelector('#f_freq').value,
          note: body.querySelector('#f_note').value.trim(),
          payments: e.payments || []
        };
        if (e.id) { const i = DB.loans.findIndex(x => x.id === e.id); DB.loans[i] = rec; }
        else DB.loans.push(rec);
        saveDB(); closeModal(); viewLoans(); toast(T('save'));
        if ('Notification' in window && Notification.permission === 'default') requestNotify();
      };
    });
  }

  function paymentForm(l) {
    openModal(T('add_payment') + ' — ' + l.party, `
      <div class="kv"><span class="k">${T('remaining')}</span><span class="amt-expense"><b>${fmtMoney(loanRemaining(l))}</b></span></div>
      <div class="form-row mt">
        <div class="field"><label>${T('date')}</label><input type="date" id="p_date" value="${todayISO()}"></div>
        <div class="field"><label>${T('amount')} (₮) *</label><input id="p_amount" inputmode="numeric" value="${loanRemaining(l)}"></div>
      </div>
      <div class="field"><label>${T('note')}</label><input id="p_note"></div>
      <label class="hint"><input type="checkbox" id="p_ledger" checked style="width:auto;margin-right:.4rem">
        ${DB.settings.lang === 'en' ? 'Also record in ledger' : 'Орлого/Зарлагад мөн бичих'}</label>
      <div class="modal-actions"><button class="btn ghost" id="p_cancel">${T('cancel')}</button><button class="btn primary" id="p_save">${T('save')}</button></div>
    `, body => {
      body.querySelector('#p_cancel').onclick = closeModal;
      body.querySelector('#p_save').onclick = () => {
        const amt = num(body.querySelector('#p_amount').value);
        if (!amt) { toast(T('amount') + ' *'); return; }
        const date = body.querySelector('#p_date').value || todayISO();
        const note = body.querySelector('#p_note').value.trim();
        l.payments = l.payments || []; l.payments.push({ id: uid(), date, amount: amt, note });
        if (body.querySelector('#p_ledger').checked) {
          // borrowed → I pay = expense ; lent → I receive = income
          DB.txns.push({
            id: uid(), date, kind: l.dir === 'borrowed' ? 'expense' : 'income', amount: amt,
            category: l.dir === 'borrowed' ? 'Зээл төлсөн / Loan payment' : 'Зээл авсан / Loan in',
            desc: (l.dir === 'borrowed' ? T('payment') + ' → ' : T('payment') + ' ← ') + l.party, project: '', method: ''
          });
        }
        saveDB(); closeModal(); viewLoans(); toast(T('save'));
      };
    });
  }

  /* ============================================================
     VIEW: SETTINGS
     ============================================================ */
  function viewSettings() {
    const s = DB.settings;
    app.innerHTML = `
      <div class="page-head"><div><h2>${T('set_title')}</h2></div></div>

      <div class="card">
        <div class="section-title"><h3>🏢 ${T('company')}</h3></div>
        <div class="field"><label>${T('company_name')}</label><input id="s_name" value="${esc(s.company.name)}"></div>
        <div class="form-row">
          <div class="field"><label>${T('reg_no')}</label><input id="s_reg" value="${esc(s.company.reg)}"></div>
          <div class="field"><label>${T('phone')}</label><input id="s_phone" value="${esc(s.company.phone)}"></div>
        </div>
      </div>

      <div class="card mt">
        <div class="section-title"><h3>🌐 ${T('language')}</h3></div>
        <select id="s_lang" style="max-width:260px">
          ${option('both', T('lang_both'), s.lang)}${option('mn', T('lang_mn'), s.lang)}${option('en', T('lang_en'), s.lang)}
        </select>
        <div class="section-title mt"><h3>🔔 ${T('reminders')}</h3></div>
        <div class="field" style="max-width:260px"><label>${T('notify_days')}</label><input id="s_days" type="number" min="0" max="60" value="${s.notifyDays}"></div>
      </div>

      <div class="card mt">
        <div class="section-title"><h3>💾 ${T('backup')}</h3></div>
        <div class="hint">${T('data_kept_local')}</div>
        <div class="head-actions mt">
          <button class="btn" id="exportBtn">⬇️ ${T('export_data')}</button>
          <label class="btn ghost">⬆️ ${T('import_data')}<input type="file" id="importFile" accept="application/json" hidden></label>
          <button class="btn" id="installBtn" ${deferredPrompt ? '' : 'disabled'}>📲 ${T('install')}</button>
        </div>
      </div>

      <div class="card mt" style="border-color:#f3c2bd">
        <div class="section-title"><h3 style="color:var(--red)">⚠️ ${T('danger_zone')}</h3></div>
        <button class="btn danger" id="clearBtn">${T('clear_all')}</button>
      </div>
    `;
    function saveSettings() {
      s.company = { name: $('#s_name').value.trim(), reg: $('#s_reg').value.trim(), phone: $('#s_phone').value.trim() };
      s.lang = $('#s_lang').value;
      s.notifyDays = Math.max(0, parseInt($('#s_days').value) || 0);
      saveDB(); $('#brandName').textContent = s.company.name || 'Барилгын Нягтлан';
    }
    ['s_name', 's_reg', 's_phone', 's_days'].forEach(id => $('#' + id).onchange = saveSettings);
    $('#s_lang').onchange = () => { saveSettings(); applyStaticI18n(); render(); toast(T('save')); };
    $('#exportBtn').onclick = exportData;
    $('#importFile').onchange = importData;
    $('#clearBtn').onclick = () => {
      if (confirm(T('clear_all') + '?\n\n' + (DB.settings.lang === 'en' ? 'This cannot be undone. Export a backup first!' : 'Буцаах боломжгүй. Эхлээд нөөшилнө үү!'))) {
        if (confirm(DB.settings.lang === 'en' ? 'Really erase everything?' : 'Үнэхээр бүгдийг устгах уу?')) {
          DB = JSON.parse(JSON.stringify(DEFAULT_DB)); saveDB(); applyStaticI18n(); render(); toast(T('clear_all'));
        }
      }
    };
    const ib = $('#installBtn'); if (ib) ib.onclick = doInstall;
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const name = (DB.settings.company.name || 'baraa-nyagtlan').replace(/[\\/:*?"<>|]/g, '').trim() || 'nyagtlan';
    a.href = URL.createObjectURL(blob); a.download = `${name}-${todayISO()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(T('export_data'));
  }
  function importData(ev) {
    const file = ev.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !data.v) throw new Error('bad');
        if (!confirm(DB.settings.lang === 'en' ? 'Replace all current data with this file?' : 'Одоогийн өгөгдлийг энэ файлаар бүхэлд нь солих уу?')) return;
        DB = Object.assign({}, DEFAULT_DB, data, { settings: Object.assign({}, DEFAULT_DB.settings, data.settings) });
        saveDB(); applyStaticI18n(); render(); toast(T('import_data') + ' ✓');
      } catch (e) { toast('⚠️ JSON ' + (DB.settings.lang === 'en' ? 'file invalid' : 'файл буруу')); }
    };
    reader.readAsText(file);
    ev.target.value = '';
  }

  /* ---------- PWA install ---------- */
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
  function doInstall() {
    if (!deferredPrompt) { toast(DB.settings.lang === 'en' ? 'Use browser menu → Install' : 'Хөтчийн цэс → Суулгах'); return; }
    deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; });
  }

  /* ---------- Notifications / loan reminders ---------- */
  function requestNotify() {
    if (!('Notification' in window)) { toast('🔕'); return Promise.resolve(); }
    return Notification.requestPermission().then(p => { if (p === 'granted') { toast('🔔 ✓'); checkLoanReminders(); } });
  }
  function fireNotify(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'NOTIFY', title, body, tag: uid() });
      } else { try { new Notification(title, { body }); } catch (e) { } }
    }
  }
  function checkLoanReminders() {
    const today = todayISO();
    DB.settings.notifyLog = DB.settings.notifyLog || {};
    let changed = false;
    DB.loans.forEach(l => {
      const st = loanState(l);
      if ((st === 'overdue' || st === 'soon') && DB.settings.notifyLog[l.id] !== today) {
        const dirLbl = l.dir === 'borrowed' ? T('i_owe') : T('owed_to_me');
        fireNotify('🏦 ' + (st === 'overdue' ? T('overdue') : T('due_soon')),
          `${l.party}: ${dirLbl} ${fmtMoney(loanRemaining(l))} · ${T('due_date')} ${l.dueDate}`);
        DB.settings.notifyLog[l.id] = today; changed = true;
      }
    });
    if (changed) saveDB();
  }

  /* ============================================================
     SIDEBAR (mobile)
     ============================================================ */
  function openSidebar() { $('#sidebar').classList.add('open'); $('#scrim').classList.add('show'); }
  function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); }
  $('#menuBtn').onclick = () => $('#sidebar').classList.contains('open') ? closeSidebar() : openSidebar();
  $('#scrim').onclick = closeSidebar;
  $$('.navlink').forEach(a => a.addEventListener('click', () => { location.hash = '#/' + a.dataset.route; }));
  $('#langBtn').onclick = () => {
    const order = ['both', 'mn', 'en']; DB.settings.lang = order[(order.indexOf(DB.settings.lang) + 1) % 3];
    saveDB(); applyStaticI18n(); render();
    toast(T(DB.settings.lang === 'mn' ? 'lang_mn' : DB.settings.lang === 'en' ? 'lang_en' : 'lang_both'));
  };

  /* ============================================================
     ONE-TIME MIGRATION from old voice app
     ============================================================ */
  function migrateOldApp() {
    let oldEntries; try { oldEntries = JSON.parse(localStorage.getItem('nyagtlan_entries_v1')); } catch (e) { oldEntries = null; }
    let oldCo; try { oldCo = JSON.parse(localStorage.getItem('nyagtlan_company_v1')); } catch (e) { oldCo = null; }
    if (!oldEntries || !oldEntries.length) { if (oldCo && oldCo.name) { DB.settings.company = { name: oldCo.name, reg: oldCo.reg || '', phone: oldCo.phone || '' }; saveDB(); } return; }
    const msg = `Хуучин аппаас ${oldEntries.length} бичлэг олдлоо. Шинэ апп руу импортлох уу?\n\nFound ${oldEntries.length} records from the old app. Import them?`;
    if (!confirm(msg)) return;
    if (oldCo && oldCo.name) DB.settings.company = { name: oldCo.name, reg: oldCo.reg || '', phone: oldCo.phone || '' };
    const matByName = {};
    oldEntries.forEach(en => {
      if (en.type === 'income') {
        DB.txns.push({ id: uid(), date: en.date || todayISO(), kind: 'income', amount: num(en.amount), category: 'Борлуулалт / Sales', desc: en.source || en.note || '', project: '', method: '' });
      } else { // material purchase
        const nm = (en.name || 'Материал').trim();
        let m = matByName[nm.toLowerCase()] || DB.materials.find(x => x.name.toLowerCase() === nm.toLowerCase());
        if (!m) { m = { id: uid(), name: nm, category: '', unit: en.unit || 'ш', price: num(en.price), stock: 0, minStock: 0, supplier: en.supplier || '', note: '' }; DB.materials.push(m); matByName[nm.toLowerCase()] = m; }
        if (en.qty) m.stock = num(m.stock) + num(en.qty);
        if (en.price) m.price = num(en.price);
        DB.txns.push({ id: uid(), date: en.date || todayISO(), kind: 'expense', amount: num(en.total), category: 'Материал / Materials', desc: nm + (en.note ? ' · ' + en.note : ''), project: '', method: '', materialId: m.id, qty: num(en.qty) || '' });
      }
    });
    saveDB();
    toast('✓ ' + oldEntries.length);
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    if (!DB) { DB = JSON.parse(JSON.stringify(DEFAULT_DB)); saveDB(); migrateOldApp(); }
    $('#brandName').textContent = DB.settings.company.name || 'Барилгын Нягтлан';
    applyStaticI18n();
    if (!location.hash) location.hash = '#/dashboard';
    render();
    // loan reminder checks
    if ('Notification' in window && Notification.permission === 'granted') checkLoanReminders();
    setInterval(checkLoanReminders, 60 * 60 * 1000); // hourly while open
  }

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  init();

})();
