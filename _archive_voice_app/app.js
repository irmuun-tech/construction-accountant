/* =========================================================
   Барилгын Нягтлан — гол логик
   • Дуу хоолой: Chrome webkitSpeechRecognition (mn-MN)
   • Хадгалалт: офлайн (localStorage) ЭСВЭЛ үүл (Firebase/Firestore)
   • Зураг: Openverse + Wikipedia (түлхүүргүй)
   • Excel: SheetJS
   ========================================================= */

'use strict';

const STORE_KEY = 'nyagtlan_entries_v1';
const REM_KEY = 'nyagtlan_reminders_v1';

// ---------- Туслах ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmt = (n) => (Number(n) || 0).toLocaleString('mn-MN') + ' ₮';
const pad = (n) => String(n).padStart(2, '0');
function todayISO() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function uid() { return Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
function load(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function esc(s) { return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// ---------- Төлөв ----------
let entries = load(STORE_KEY);
let reminders = load(REM_KEY);
let currentType = 'material';
let selectedMonth = todayISO().slice(0, 7);
let selectedImageUrl = '';

// ---------- Байгууллага ----------
const CO_KEY = 'nyagtlan_company_v1';
function loadCompany() { try { return JSON.parse(localStorage.getItem(CO_KEY)) || {}; } catch { return {}; } }
function saveCompany(obj) { localStorage.setItem(CO_KEY, JSON.stringify(obj)); }

// ---------- Үүл / нэвтрэлт ----------
let db = null, auth = null, currentUser = null;
let mode = 'local';            // 'local' эсвэл 'cloud'
let skippedLogin = false;
let unsubEntries = null, unsubRems = null;

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function refreshAll() { renderList(); renderReminders(); renderReport(); }

// =========================================================
//  FIREBASE / ҮҮЛ
// =========================================================
function isConfigured() {
  const c = window.FIREBASE_CONFIG;
  return c && c.apiKey && !/PASTE|YOUR_/.test(c.apiKey);
}

function initFirebase() {
  if (!isConfigured() || typeof firebase === 'undefined') return false;
  try {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); // офлайн кэш
    auth.onAuthStateChanged(onAuth);
    return true;
  } catch (e) {
    console.warn('Firebase init алдаа:', e);
    return false;
  }
}

function onAuth(user) {
  currentUser = user;
  if (user) {
    mode = 'cloud';
    if (unsubEntries) { unsubEntries(); unsubEntries = null; }
    if (unsubRems) { unsubRems(); unsubRems = null; }
    hideLogin();
    updateAcct(user.email);
    subscribeCloud();
  } else {
    mode = 'local';
    if (unsubEntries) { unsubEntries(); unsubEntries = null; }
    if (unsubRems) { unsubRems(); unsubRems = null; }
    entries = load(STORE_KEY);
    reminders = load(REM_KEY);
    updateAcct(null);
    refreshAll();
    if (!skippedLogin) showLogin();
  }
}

function subscribeCloud() {
  const base = db.collection('users').doc(currentUser.uid);
  unsubEntries = base.collection('entries').onSnapshot((snap) => {
    entries = snap.docs.map((d) => d.data());
    renderList(); renderReport();
  }, (err) => console.warn('entries snapshot', err));
  unsubRems = base.collection('reminders').onSnapshot((snap) => {
    reminders = snap.docs.map((d) => d.data());
    renderReminders(); scheduleAll();
  }, (err) => console.warn('reminders snapshot', err));
}

// ---- Хадгалах (mode-аас хамаарч салаалах) ----
function persistEntryAdd(entry) {
  if (mode === 'cloud') {
    db.collection('users').doc(currentUser.uid).collection('entries').doc(entry.id).set(entry)
      .then(() => toast('✅ Үүлэнд хадгалагдлаа'))
      .catch(() => toast('Хадгалах үед алдаа гарлаа'));
  } else {
    entries.push(entry); save(STORE_KEY, entries);
    toast('✅ Хадгалагдлаа'); renderList();
  }
}
function persistEntryDelete(id) {
  if (mode === 'cloud') {
    db.collection('users').doc(currentUser.uid).collection('entries').doc(id).delete();
  } else {
    entries = entries.filter((e) => e.id !== id); save(STORE_KEY, entries); renderList();
  }
  toast('Устгагдлаа');
}
function persistReminder(rem) {
  if (mode === 'cloud') {
    db.collection('users').doc(currentUser.uid).collection('reminders').doc(rem.id).set(rem).catch(() => {});
  } else {
    const i = reminders.findIndex((r) => r.id === rem.id);
    if (i >= 0) reminders[i] = rem; else reminders.push(rem);
    save(REM_KEY, reminders); renderReminders();
  }
}
function persistReminderDelete(id) {
  if (mode === 'cloud') {
    db.collection('users').doc(currentUser.uid).collection('reminders').doc(id).delete();
  } else {
    reminders = reminders.filter((r) => r.id !== id); save(REM_KEY, reminders); renderReminders();
  }
}

// ---- Нэвтрэх UI ----
function showLogin() { $('#loginOverlay').classList.remove('hidden'); }
function hideLogin() { $('#loginOverlay').classList.add('hidden'); }
function updateAcct(email) {
  const b = $('#acctBtn');
  if (email) { b.classList.add('signed-in'); b.title = email; b.textContent = '✓'; }
  else { b.classList.remove('signed-in'); b.title = 'Нэвтрэх'; b.textContent = '👤'; }
}
function authError(code) {
  const map = {
    'auth/invalid-email': 'Имэйл хаяг буруу байна.',
    'auth/missing-password': 'Нууц үг оруулна уу.',
    'auth/weak-password': 'Нууц үг 6-аас дээш тэмдэгт байх ёстой.',
    'auth/email-already-in-use': 'Энэ имэйл бүртгэлтэй байна. Нэвтэрнэ үү.',
    'auth/invalid-credential': 'Имэйл эсвэл нууц үг буруу байна.',
    'auth/user-not-found': 'Бүртгэл олдсонгүй. Эхлээд бүртгүүлнэ үү.',
    'auth/wrong-password': 'Нууц үг буруу байна.',
    'auth/network-request-failed': 'Интернэт холболтоо шалгана уу.'
  };
  return map[code] || ('Алдаа: ' + code);
}

const NOT_CONFIGURED = '⚙️ Үүлэн бүртгэл хараахан тохируулагдаагүй байна. ЗААВАР.md → «Үүлэн бүртгэл тохируулах» алхмыг хийгээрэй. Одоохондоо доорхоос офлайнаар үргэлжлүүлнэ үү.';
$('#signInBtn').addEventListener('click', () => {
  if (!auth) { $('#loginErr').textContent = NOT_CONFIGURED; return; }
  $('#loginErr').textContent = '';
  auth.signInWithEmailAndPassword($('#loginEmail').value.trim(), $('#loginPass').value)
    .catch((e) => { $('#loginErr').textContent = authError(e.code); });
});
$('#signUpBtn').addEventListener('click', () => {
  if (!auth) { $('#loginErr').textContent = NOT_CONFIGURED; return; }
  $('#loginErr').textContent = '';
  auth.createUserWithEmailAndPassword($('#loginEmail').value.trim(), $('#loginPass').value)
    .then(() => toast('Бүртгэл үүслээ'))
    .catch((e) => { $('#loginErr').textContent = authError(e.code); });
});
$('#skipLoginBtn').addEventListener('click', () => { skippedLogin = true; hideLogin(); toast('Офлайн горим'); });

$('#acctBtn').addEventListener('click', () => {
  if (!isConfigured()) { toast('Үүл тохируулаагүй байна (ЗААВАР.md үзнэ үү).'); return; }
  if (currentUser) {
    if (confirm(`${currentUser.email}\nГарах уу?`)) auth.signOut();
  } else {
    skippedLogin = false; showLogin();
  }
});

// =========================================================
//  ТАБ / ТӨРӨЛ СОЛИХ
// =========================================================
$$('.navbtn').forEach((btn) => btn.addEventListener('click', () => {
  const tab = btn.dataset.tab;
  $$('.navbtn').forEach((b) => b.classList.toggle('active', b === btn));
  $$('.tab').forEach((t) => t.classList.remove('active'));
  $('#tab-' + tab).classList.add('active');
  if (tab === 'list') renderList();
  if (tab === 'remind') renderReminders();
  if (tab === 'report') renderReport();
}));

$$('.type-btn').forEach((btn) => btn.addEventListener('click', () => {
  currentType = btn.dataset.type;
  $$('.type-btn').forEach((b) => b.classList.toggle('active', b === btn));
  $('#materialForm').classList.toggle('hidden', currentType !== 'material');
  $('#incomeForm').classList.toggle('hidden', currentType !== 'income');
}));

$('#entryDate').value = todayISO();

// Тоо × нэгж үнэ = нийт
const mQty = $('#materialForm [name=qty]');
const mPrice = $('#materialForm [name=price]');
const mTotal = $('#materialForm [name=total]');
const mName = $('#materialForm [name=name]');
function autoTotal() {
  const q = parseFloat(mQty.value), p = parseFloat(mPrice.value);
  if (!isNaN(q) && !isNaN(p)) mTotal.value = Math.round(q * p);
}
mQty.addEventListener('input', autoTotal);
mPrice.addEventListener('input', autoTotal);

// =========================================================
//  МАТЕРИАЛЫН ЗУРАГ ХАЙХ
// =========================================================
// Монгол → англи нэр томьёо (хайлтын чанарыг сайжруулна)
const MAT_TERMS = {
  'цемент': 'cement', 'тоосго': 'brick', 'улаан тоосго': 'red brick',
  'арматур': 'rebar steel', 'төмөр': 'steel metal', 'элс': 'construction sand',
  'дайрга': 'crushed stone', 'хайрга': 'gravel', 'хайргал': 'gravel',
  'мод': 'lumber wood', 'банз': 'wooden plank', 'модон банз': 'wooden plank',
  'фанер': 'plywood', 'осб': 'osb board', 'гипс': 'gypsum', 'гипсэн хавтан': 'drywall',
  'шохой': 'lime powder', 'будаг': 'paint bucket', 'хадаас': 'nails', 'шураг': 'screws',
  'бетон': 'concrete', 'блок': 'concrete block', 'хөөсөнцөр': 'foam insulation',
  'дулаалга': 'insulation', 'шил': 'glass sheet', 'цонх': 'window', 'хаалга': 'door',
  'хавтан': 'tile', 'плита': 'floor tile', 'керамик': 'ceramic tile',
  'хоолой': 'pipe', 'утас': 'electrical wire', 'кабель': 'cable', 'розетка': 'power socket',
  'хальс': 'plastic film', 'гялгар хальс': 'plastic sheeting', 'профайл': 'metal profile',
  'силикон': 'silicone sealant', 'наалт': 'adhesive', 'шавар': 'mortar', 'будагч': 'paint roller'
};
// Нэрийг барилгын материалын англи нэр томьёо руу хөрвүүлэх.
// recognized=false бол барилгын бус үг — хайхдаа "construction material" гэж хязгаарлана.
function termFor(name) {
  const k = name.trim().toLowerCase();
  if (MAT_TERMS[k]) return { q: MAT_TERMS[k], recognized: true };
  for (const key in MAT_TERMS) if (k.includes(key)) return { q: MAT_TERMS[key], recognized: true };
  return { q: k, recognized: false };
}

// Зөвхөн барилгын материалтай холбоотой зураг хайна (Wikipedia).
async function searchImage(name) {
  const { q, recognized } = termFor(name);
  // Танигдсан материал → тодорхой нэр томьёо. Танигдаагүй → "construction material"-аар хязгаарлана.
  const query = recognized ? q : (q + ' construction material');
  try {
    const u = `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
      `&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=0&gsrlimit=8` +
      `&prop=pageimages&piprop=thumbnail&pithumbsize=240&format=json&origin=*`;
    const r = await fetch(u);
    const j = await r.json();
    const pages = (j.query && j.query.pages) ? Object.values(j.query.pages) : [];
    pages.sort((a, b) => (a.index || 0) - (b.index || 0)); // хайлтын эрэмбийг хадгална
    return pages.filter((p) => p.thumbnail).map((p) => p.thumbnail.source);
  } catch { return []; }
}

let imgTimer, imgReqId = 0;
mName.addEventListener('input', () => {
  selectedImageUrl = '';
  const v = mName.value.trim();
  clearTimeout(imgTimer);
  if (v.length < 2) { $('#matImageBox').classList.add('hidden'); return; }
  imgTimer = setTimeout(() => runImageSearch(v), 600);
});

async function runImageSearch(name) {
  const box = $('#matImageBox'), status = $('#matImageStatus'), thumbs = $('#matImages');
  box.classList.remove('hidden'); thumbs.innerHTML = ''; status.textContent = '🔎 Зураг хайж байна...';
  const myId = ++imgReqId;
  const urls = await searchImage(name);
  if (myId !== imgReqId) return; // шинэ хайлт эхэлсэн
  if (!urls.length) { status.textContent = 'Зураг олдсонгүй (гараар үргэлжлүүлж болно).'; return; }
  status.textContent = 'Тохирох зургийг дарж сонгоно уу:';
  thumbs.innerHTML = '';
  urls.slice(0, 6).forEach((u) => {
    const img = new Image();
    img.src = u; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
    img.addEventListener('click', () => {
      thumbs.querySelectorAll('img').forEach((i) => i.classList.remove('selected'));
      img.classList.add('selected'); selectedImageUrl = u;
    });
    img.addEventListener('error', () => img.remove());
    thumbs.appendChild(img);
  });
}

// =========================================================
//  ДУУ ХООЛОЙ
// =========================================================
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
function setupRecognition() {
  if (!SR) return null;
  const r = new SR();
  r.lang = 'mn-MN'; r.continuous = false; r.interimResults = true; r.maxAlternatives = 1;
  return r;
}
function extractAmount(text) {
  if (!text) return null;
  const t = text.toLowerCase().replace(/,/g, '');
  const m = t.match(/(\d+(?:\.\d+)?)\s*(тэрбум|сая|мянга|мянган)?/);
  if (!m) return null;
  let num = parseFloat(m[1]); if (isNaN(num)) return null;
  const w = m[2] || '';
  if (w === 'тэрбум') num *= 1e9; else if (w === 'сая') num *= 1e6; else if (w === 'мянга' || w === 'мянган') num *= 1e3;
  return Math.round(num);
}
function startListening(target) {
  if (!SR) { toast('Энэ хөтөч дуу хоолойг дэмжихгүй. Chrome ашиглана уу.'); return; }
  recognition = setupRecognition();
  const micBtn = target === 'remind' ? $('#micRemindBtn') : $('#micBtn');
  const status = $('#micStatus'), interim = $('#interim');
  recognition.onstart = () => {
    if (target === 'add') { micBtn.classList.add('listening'); status.textContent = 'Сонсож байна... ярина уу'; }
    else micBtn.textContent = '🔴 Сонсож байна...';
  };
  recognition.onresult = (e) => {
    let finalT = '', interimT = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const tr = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalT += tr; else interimT += tr;
    }
    if (target === 'add') interim.textContent = interimT;
    if (finalT) applyTranscript(finalT.trim(), target);
  };
  recognition.onerror = (e) => {
    let msg = 'Алдаа: ' + e.error;
    if (e.error === 'not-allowed') msg = 'Микрофон зөвшөөрөл хэрэгтэй.';
    else if (e.error === 'no-speech') msg = 'Дуу сонсогдсонгүй. Дахин оролдоно уу.';
    else if (e.error === 'network') msg = 'Интернэт шаардлагатай (дуу таних үед).';
    toast(msg);
  };
  recognition.onend = () => {
    if (target === 'add') { micBtn.classList.remove('listening'); status.textContent = 'Товчийг дараад ярина уу'; interim.textContent = ''; }
    else micBtn.textContent = '🎤 Ярьж нэмэх';
  };
  try { recognition.start(); } catch {}
}
function applyTranscript(text, target) {
  if (target === 'remind') {
    const inp = $('#reminderForm [name=text]');
    inp.value = (inp.value ? inp.value + ' ' : '') + text;
    toast('Бичигдлээ. Цагаа сонгоод нэмнэ үү.'); return;
  }
  const amount = extractAmount(text);
  const cleaned = text.replace(/\d+(?:\.\d+)?\s*(тэрбум|сая|мянга|мянган)?\s*(төгрөг|төг)?/i, '').trim();
  if (currentType === 'material') {
    if (!mName.value) { mName.value = cleaned; mName.dispatchEvent(new Event('input')); }
    if (amount && !mTotal.value) mTotal.value = amount;
  } else {
    const src = $('#incomeForm [name=source]'), amt = $('#incomeForm [name=amount]');
    if (!src.value) src.value = cleaned;
    if (amount && !amt.value) amt.value = amount;
  }
  $('#entryNote').value = ($('#entryNote').value ? $('#entryNote').value + ' ' : '') + text;
  toast(amount ? `Дүн: ${fmt(amount)} — шалгаад хадгална уу` : 'Бичигдлээ — шалгаад хадгална уу');
}
$('#micBtn').addEventListener('click', () => startListening('add'));
$('#micRemindBtn').addEventListener('click', () => startListening('remind'));

// =========================================================
//  ХАДГАЛАХ
// =========================================================
$('#saveBtn').addEventListener('click', () => {
  const date = $('#entryDate').value || todayISO();
  const note = $('#entryNote').value.trim();
  let entry;
  if (currentType === 'material') {
    const f = $('#materialForm').elements;
    const name = f['name'].value.trim();
    const total = parseFloat(f['total'].value);
    if (!name && !total) { toast('Материалын нэр эсвэл үнэ оруулна уу.'); return; }
    entry = {
      id: uid(), type: 'material', date, note,
      name, qty: parseFloat(f['qty'].value) || null, unit: f['unit'].value,
      price: parseFloat(f['price'].value) || null, total: total || 0,
      supplier: f['supplier'].value.trim(), imageUrl: selectedImageUrl || ''
    };
  } else {
    const f = $('#incomeForm').elements;
    const amount = parseFloat(f['amount'].value);
    if (!amount) { toast('Орлогын дүн оруулна уу.'); return; }
    entry = { id: uid(), type: 'income', date, note, amount, source: f['source'].value.trim() };
  }
  persistEntryAdd(entry);
  clearForms();
});
function clearForms() {
  $('#materialForm').reset(); $('#incomeForm').reset();
  $('#entryNote').value = ''; $('#entryDate').value = todayISO();
  $('#interim').textContent = ''; $('#matImageBox').classList.add('hidden');
  $('#matImages').innerHTML = ''; selectedImageUrl = '';
}

// =========================================================
//  ЖАГСААЛТ + ХУРААНГУЙ
// =========================================================
function monthEntries(ym) {
  return entries.filter((e) => e.date && e.date.slice(0, 7) === ym)
    .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
}
function renderList() {
  const list = monthEntries(selectedMonth);
  const inc = list.filter((e) => e.type === 'income').reduce((s, e) => s + (e.amount || 0), 0);
  const mat = list.filter((e) => e.type === 'material').reduce((s, e) => s + (e.total || 0), 0);
  $('#sumIncome').textContent = fmt(inc);
  $('#sumMaterial').textContent = fmt(mat);
  const el = $('#entryList');
  if (!list.length) { el.innerHTML = '<div class="empty">Энэ сард бүртгэл алга.<br>«Бичих» хэсгээс нэмнэ үү.</div>'; return; }
  el.innerHTML = list.map((e) => {
    if (e.type === 'income') {
      return `<div class="entry-item">
        <div class="ei-main"><div class="ei-title">💰 ${esc(e.source) || 'Орлого'}</div>
        <div class="ei-sub">${e.date}${e.note ? ' · ' + esc(e.note) : ''}</div></div>
        <div class="ei-amount income">+${fmt(e.amount)}</div>
        <button class="ei-del" data-id="${e.id}">✕</button></div>`;
    }
    const qtyStr = e.qty ? `${e.qty} ${esc(e.unit)}${e.price ? ' × ' + fmt(e.price) : ''}` : '';
    const thumb = e.imageUrl ? `<img class="ei-thumb" src="${esc(e.imageUrl)}" referrerpolicy="no-referrer" onerror="this.remove()">` : '';
    return `<div class="entry-item">
      ${thumb}
      <div class="ei-main"><div class="ei-title">📦 ${esc(e.name) || 'Материал'}</div>
      <div class="ei-sub">${e.date}${qtyStr ? ' · ' + qtyStr : ''}${e.supplier ? ' · ' + esc(e.supplier) : ''}${e.note ? ' · ' + esc(e.note) : ''}</div></div>
      <div class="ei-amount material">−${fmt(e.total)}</div>
      <button class="ei-del" data-id="${e.id}">✕</button></div>`;
  }).join('');
  $$('#entryList .ei-del').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Энэ бүртгэлийг устгах уу?')) persistEntryDelete(b.dataset.id);
  }));
}

// =========================================================
//  САНУУЛГА
// =========================================================
$('#reminderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target.elements;
  const text = f['text'].value.trim(), when = f['when'].value;
  if (!text || !when) { toast('Сануулга болон цагаа оруулна уу.'); return; }
  persistReminder({ id: uid(), text, when, done: false, fired: false });
  e.target.reset();
  ensureNotifyPermission();
  scheduleAll();
  toast('🔔 Сануулга нэмэгдлээ');
});
function renderReminders() {
  const hint = $('#notifHint');
  if ('Notification' in window) {
    if (Notification.permission === 'granted') hint.textContent = '✅ Мэдэгдэл идэвхтэй.';
    else if (Notification.permission === 'denied') hint.textContent = '⚠️ Мэдэгдэл хаалттай. Хөтчийн тохиргооноос зөвшөөрнө үү.';
    else hint.textContent = 'ℹ️ Эхний сануулга нэмэхэд мэдэгдэл зөвшөөрнө үү.';
  }
  const list = [...reminders].sort((a, b) => a.when.localeCompare(b.when));
  const el = $('#reminderList');
  if (!list.length) { el.innerHTML = '<div class="empty">Сануулга алга.</div>'; return; }
  el.innerHTML = list.map((r) => {
    const d = new Date(r.when);
    const when = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `<div class="entry-item ${r.done ? 'rem-done' : ''}">
      <div class="ei-main"><div class="ei-title">🔔 ${esc(r.text)}</div><div class="ei-sub">${when}</div></div>
      <button class="ei-del" data-done="${r.id}">${r.done ? '↺' : '✓'}</button>
      <button class="ei-del" data-del="${r.id}">✕</button></div>`;
  }).join('');
  $$('#reminderList [data-done]').forEach((b) => b.addEventListener('click', () => {
    const r = reminders.find((x) => x.id === b.dataset.done);
    if (r) persistReminder({ ...r, done: !r.done });
  }));
  $$('#reminderList [data-del]').forEach((b) => b.addEventListener('click', () => persistReminderDelete(b.dataset.del)));
}
function ensureNotifyPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(() => renderReminders());
  }
}
let remTimer;
function scheduleAll() { clearTimeout(remTimer); checkReminders(); }
function checkReminders() {
  const now = Date.now();
  reminders.forEach((r) => {
    if (!r.done && !r.fired && new Date(r.when).getTime() <= now) {
      persistReminder({ ...r, fired: true });
      fireNotification('🔔 Сануулга', r.text);
    }
  });
  clearTimeout(remTimer);
  remTimer = setTimeout(checkReminders, 20000);
}
function fireNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'NOTIFY', title, body, tag: uid() });
  } else {
    toast(`${title}: ${body}`);
  }
}

// =========================================================
//  ТАЙЛАН + EXCEL
// =========================================================
function renderReport() {
  const list = monthEntries(selectedMonth);
  const inc = list.filter((e) => e.type === 'income');
  const mat = list.filter((e) => e.type === 'material');
  const incomeSum = inc.reduce((s, e) => s + (e.amount || 0), 0);
  const matSum = mat.reduce((s, e) => s + (e.total || 0), 0);
  $('#reportStats').innerHTML =
    `<b>Сар:</b> ${selectedMonth}<br>` +
    `Орлого: ${inc.length} бичлэг — <b style="color:#2e7d32">${fmt(incomeSum)}</b><br>` +
    `Материал: ${mat.length} бичлэг — <b style="color:#c62828">${fmt(matSum)}</b><br>` +
    `Зөрүү: <b>${fmt(incomeSum - matSum)}</b>`;
}
$('#excelBtn').addEventListener('click', exportExcel);
function exportExcel() {
  if (typeof XLSX === 'undefined') { toast('Excel сан ачаалагдаагүй. Интернэтэд холбогдоно уу.'); return; }
  const list = monthEntries(selectedMonth);
  if (!list.length) { toast('Энэ сард татах өгөгдөл алга.'); return; }
  const inc = list.filter((e) => e.type === 'income');
  const mat = list.filter((e) => e.type === 'material');
  const incomeSum = inc.reduce((s, e) => s + (e.amount || 0), 0);
  const matSum = mat.reduce((s, e) => s + (e.total || 0), 0);
  const wb = XLSX.utils.book_new();

  // Байгууллагын толгой мөрүүд (sheet бүрийн дээр)
  const co = loadCompany();
  function coHeader(title) {
    const rows = [[co.name || 'Байгууллага']];
    const meta = [];
    if (co.reg) meta.push('РД: ' + co.reg);
    if (co.phone) meta.push('Утас: ' + co.phone);
    if (meta.length) rows.push([meta.join('    ')]);
    rows.push([title + ' — ' + selectedMonth]);
    rows.push([]);
    return rows;
  }

  const matRows = [['Огноо', 'Материал', 'Тоо хэмжээ', 'Нэгж', 'Нэгж үнэ', 'Нийт үнэ (₮)', 'Нийлүүлэгч', 'Тэмдэглэл', 'Зураг (холбоос)']];
  mat.forEach((e) => matRows.push([e.date, e.name, e.qty, e.unit, e.price, e.total, e.supplier, e.note, e.imageUrl || '']));
  matRows.push(['', '', '', '', 'НИЙТ:', matSum, '', '', '']);
  const wsMat = XLSX.utils.aoa_to_sheet(coHeader('Материалын тайлан').concat(matRows));
  wsMat['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 6 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsMat, 'Материал');

  const incRows = [['Огноо', 'Дүн (₮)', 'Эх үүсвэр / Төлсөн', 'Тэмдэглэл']];
  inc.forEach((e) => incRows.push([e.date, e.amount, e.source, e.note]));
  incRows.push(['', incomeSum, 'НИЙТ', '']);
  const wsInc = XLSX.utils.aoa_to_sheet(coHeader('Орлогын тайлан').concat(incRows));
  wsInc['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 24 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, wsInc, 'Орлого');

  const sumRows = [
    ['ХУРААНГУЙ ТАЙЛАН', ''], ['Сар', selectedMonth], ['', ''],
    ['Нийт орлого', incomeSum], ['Нийт материалын зардал', matSum],
    ['Зөрүү (орлого − зардал)', incomeSum - matSum], ['', ''],
    ['Орлогын бичлэг', inc.length], ['Материалын бичлэг', mat.length]
  ];
  const wsSum = XLSX.utils.aoa_to_sheet(coHeader('Хураангуй тайлан').concat(sumRows));
  wsSum['!cols'] = [{ wch: 26 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsSum, 'Хураангуй');

  const safeName = (co.name || 'Нягтлан').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 40) || 'Нягтлан';
  XLSX.writeFile(wb, `${safeName}_${selectedMonth}.xlsx`);
  toast('📊 Excel татагдлаа');
}
$('#clearMonthBtn').addEventListener('click', () => {
  const list = monthEntries(selectedMonth);
  if (!list.length) { toast('Устгах зүйл алга.'); return; }
  if (!confirm(`${selectedMonth} сарын ${list.length} бүртгэлийг устгах уу? Буцаах боломжгүй.`)) return;
  list.forEach((e) => persistEntryDelete(e.id));
  toast('Энэ сарын бүртгэл устгагдлаа');
});

// =========================================================
//  САР СОНГОХ
// =========================================================
$('#monthBtn').addEventListener('click', () => {
  const val = prompt('Сар оруулна уу (ЖЖЖЖ-СС):', selectedMonth);
  if (val && /^\d{4}-\d{2}$/.test(val)) {
    selectedMonth = val; $('#monthBtn').textContent = val; renderList(); renderReport();
  }
});

// =========================================================
//  БАЙГУУЛЛАГЫН ТОХИРГОО
// =========================================================
function fillCompanyForm() {
  const co = loadCompany();
  $('#coName').value = co.name || '';
  $('#coReg').value = co.reg || '';
  $('#coPhone').value = co.phone || '';
}
$('#coSaveBtn').addEventListener('click', () => {
  const name = $('#coName').value.trim();
  if (!name) { toast('Байгууллагын нэрээ оруулна уу.'); return; }
  saveCompany({ name, reg: $('#coReg').value.trim(), phone: $('#coPhone').value.trim() });
  toast('✅ Байгууллагын мэдээлэл хадгалагдлаа');
});
$('#setupSaveBtn').addEventListener('click', () => {
  const name = $('#setupName').value.trim();
  if (!name) { $('#setupErr').textContent = 'Байгууллагын нэрээ оруулна уу.'; return; }
  saveCompany({ name, reg: $('#setupReg').value.trim(), phone: $('#setupPhone').value.trim() });
  $('#setupOverlay').classList.add('hidden');
  fillCompanyForm();
  toast('Тавтай морил, ' + name + '!');
});

// =========================================================
//  ЭХЛҮҮЛЭХ
// =========================================================
$('#monthBtn').textContent = selectedMonth;
const configured = initFirebase();   // configured бол onAuth нэвтрэх дэлгэц гаргана
if (!configured) {                    // үүлгүй — шууд офлайн, нэвтрэх товчийг нуух
  mode = 'local';
  $('#acctBtn').style.display = 'none';
}
fillCompanyForm();
if (!loadCompany().name) $('#setupOverlay').classList.remove('hidden'); // анхны нэвтрэлт
refreshAll();
scheduleAll();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
