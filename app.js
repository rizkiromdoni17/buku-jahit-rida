/* ============================================================
Buku Jahit — Rida Roemah Jahit
Mesin aplikasi bersama (pesanan, nota, kuitansi, kas, laporan)
Tema & tata letak diatur oleh window.THEME di tiap halaman.
============================================================ */
(function () {
'use strict';
const T = window.THEME || { layout: 'sidebar', name: 'noir' };
const STANDALONE = !!T.standalone;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const num = v => { const n = Number(String(v ?? '').replace(/[^\d-]/g, '')); return isFinite(n) ? n : 0; };
const rp = n => (n < 0 ? '−' : '') + 'Rp' + Math.abs(Math.round(n || 0)).toLocaleString('id-ID');
const rpShort = n => { const a = Math.abs(n); const s = n < 0 ? '−' : ''; if (a >= 1e9) return s + 'Rp' + (a / 1e9).toFixed(1).replace('.', ',') + ' M'; if (a >= 1e6) return s + 'Rp' + (a / 1e6).toFixed(1).replace('.', ',') + ' jt'; if (a >= 1e3) return s + 'Rp' + Math.round(a / 1e3) + ' rb'; return rp(n); };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const tgl = iso => { if (!iso) return '—'; const d = new Date(iso + 'T00:00'); return d.getDate() + ' ' + BLN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
const tglPanjang = iso => { if (!iso) return '—'; const d = new Date(iso + 'T00:00'); return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear(); };
const ym = iso => (iso || '').slice(0, 7);
const ymLabel = k => { const [y, m] = k.split('-'); return BLN[+m - 1] + ' ' + y; };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
function terbilang(n) {
n = Math.floor(Math.abs(n));
const s = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
const f = x => {
if (x < 12) return s[x];
if (x < 20) return f(x - 10) + ' belas';
if (x < 100) return f(Math.floor(x / 10)) + ' puluh ' + f(x % 10);
if (x < 200) return 'seratus ' + f(x - 100);
if (x < 1000) return f(Math.floor(x / 100)) + ' ratus ' + f(x % 100);
if (x < 2000) return 'seribu ' + f(x - 1000);
if (x < 1e6) return f(Math.floor(x / 1000)) + ' ribu ' + f(x % 1000);
if (x < 1e9) return f(Math.floor(x / 1e6)) + ' juta ' + f(x % 1e6);
return f(Math.floor(x / 1e9)) + ' miliar ' + f(x % 1e9);
};
const r = (n === 0 ? 'nol' : f(n)).replace(/\s+/g, ' ').trim();
return r.charAt(0).toUpperCase() + r.slice(1) + ' rupiah';
}
const waNum = w => { let d = String(w || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '62' + d.slice(1); else if (d.startsWith('8')) d = '62' + d; return d; };
const STATUS = [
{ k: 'antre', l: 'Antre' }, { k: 'potong', l: 'Dipotong' }, { k: 'jahit', l: 'Dijahit' },
{ k: 'finishing', l: 'Finishing' }, { k: 'siap', l: 'Siap diambil' }, { k: 'diambil', l: 'Diambil' }];
const stLabel = k => (STATUS.find(s => s.k === k) || STATUS[0]).l;
const KATEGORI = ['Kebaya', 'Gaun / Dress', 'Gamis', 'Blouse / Baju', 'Kemeja', 'Jas / Vest', 'Rok', 'Celana', 'Seragam', 'Lainnya'];
const ATAS = ['Lingkar Dada', 'Lingkar Pinggang', 'Lingkar Panggul', 'Lebar Bahu', 'Panjang Baju', 'Panjang Lengan', 'Lingkar Lengan', 'Lingkar Ketiak', 'Lingkar Pergelangan', 'Lingkar Leher', 'Tinggi Dada', 'Jarak Dada'];
const BAWAH = ['Lingkar Pinggang', 'Lingkar Panggul', 'Panjang', 'Lingkar Paha', 'Lingkar Lutut', 'Lingkar Bawah', 'Pesak'];
const ukuranFor = kat => (kat === 'Rok' || kat === 'Celana') ? BAWAH : (kat === 'Gaun / Dress' || kat === 'Gamis') ? ATAS.concat(['Panjang Rok/Gaun']) : ATAS;
const DOMPET = [{ k: 'tunai', l: 'Tunai' }, { k: 'bank', l: 'Bank / Transfer' }, { k: 'qris', l: 'QRIS / E-wallet' }];
const dLabel = k => (DOMPET.find(d => d.k === k) || DOMPET[0]).l;
const KAT_MASUK = ['Pembayaran pesanan', 'Jual bahan / kain', 'Jasa lain', 'Modal / setoran', 'Lainnya'];
const KAT_KELUAR = ['Bahan & kain', 'Benang & aksesoris', 'Upah penjahit', 'Listrik & air', 'Sewa tempat', 'Peralatan & servis mesin', 'Transport & kirim', 'Promosi', 'Prive / ambil pribadi', 'Lainnya'];
const PRICE_EXAMPLE = [
['Jahit Baru', 'Kebaya', 'Kebaya modern (tanpa payet)', 350000], ['Jahit Baru', 'Kebaya', 'Kebaya payet / brokat full', 650000],
['Jahit Baru', 'Gaun / Dress', 'Gaun pesta / evening gown', 850000], ['Jahit Baru', 'Gaun / Dress', 'Dress harian', 250000],
['Jahit Baru', 'Gamis', 'Gamis', 225000], ['Jahit Baru', 'Blouse / Baju', 'Blouse', 150000], ['Jahit Baru', 'Kemeja', 'Kemeja', 150000],
['Jahit Baru', 'Jas / Vest', 'Vest / rompi', 275000], ['Jahit Baru', 'Rok', 'Rok', 125000], ['Jahit Baru', 'Celana', 'Celana bahan', 150000],
['Permak', 'Lainnya', 'Potong / pendek celana', 20000], ['Permak', 'Lainnya', 'Kecilkan / besarkan badan', 40000],
['Permak', 'Lainnya', 'Ganti resleting', 25000], ['Permak', 'Lainnya', 'Pasang payet (per motif)', 50000]];
const DEFAULT_SET = {
nama: 'Rida Roemah Jahit', tagline: 'Dressmaker · Fashion Designer · Custom Made', alamat: '', wa: '085921002005',
rekening: '', pin: '', saldoAwal: { tunai: 0, bank: 0, qris: 0 }, saldoAwalTgl: '',
catatanNota: 'Mohon cek ukuran & harga. Balas OK agar kain kami potong. Pengambilan lewat 30 hari di luar tanggung jawab kami.',
terimakasih: 'Terima kasih telah mempercayakan busana Anda kepada kami.'
};
const COLS = ['orders', 'customers', 'cash', 'prices'];
const LSKEY = 'rida-bukujahit-' + (T.name || 'x') + '-v1';
const S = {
mode: 'local', ready: false, db: null, uid: null, note: '',
data: { orders: {}, customers: {}, cash: {}, prices: {} }, set: { ...DEFAULT_SET },
loadLocal() { try { const j = JSON.parse(localStorage.getItem(LSKEY) || 'null'); if (j) { COLS.forEach(c => this.data[c] = j[c] || {}); this.set = { ...DEFAULT_SET, ...(j.set || {}) }; } } catch (e) {} },
saveLocal() { if (this.mode !== 'local') return; try { localStorage.setItem(LSKEY, JSON.stringify({ ...this.data, set: this.set })); } catch (e) { toast('Penyimpanan lokal penuh/terkunci. Unduh backup.'); } },
colRef(c) { return this.db.doc('data/users/' + this.uid + '/book').collection(c); },
setRef() { return this.db.doc('data/users/' + this.uid + '/settings'); },
async init() {
this.loadLocal();
if (STANDALONE) { try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {} this.ready = true; render(); return; }
let claude = null;
for (let i = 0; i < 15 && !claude; i++) { if (window.claude && window.claude.use) claude = window.claude; else await new Promise(r => setTimeout(r, 100)); }
if (!claude) { this.ready = true; render(); return; }
try {
const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
const id = user && await user.id();
if (!db || !id) { this.ready = true; render(); return; }
this.db = db; this.uid = id; this.mode = 'cloud';
COLS.forEach(c => this.data[c] = {});
this.set = { ...DEFAULT_SET };
let pending = COLS.length + 1;
const done = () => { if (--pending <= 0) { this.ready = true; clearTimeout(timer); this.note = ''; } schedule(); };
const timer = setTimeout(() => { if (!this.ready) { this.ready = true; this.note = 'Data belum bisa dijangkau — periksa koneksi. Tampilan mungkin belum terbaru.'; schedule(); } }, 10000);
COLS.forEach(c => {
let first = true;
this.colRef(c).onSnapshot(snap => {
const o = {}; snap.docs.forEach(d => { o[d.id] = d.data(); }); this.data[c] = o;
if (first && !snap.metadata.fromCache) { first = false; done(); } else schedule();
}, err => { if (first) { first = false; done(); } this.note = 'Sinkron terputus (' + err.code + '). Muat ulang halaman nanti.'; schedule(); });
});
let firstS = true;
this.setRef().onSnapshot(snap => {
this.set = { ...DEFAULT_SET, ...(snap.exists ? snap.data() : {}) };
if (firstS && !snap.metadata.fromCache) { firstS = false; done(); } else schedule();
}, () => { if (firstS) { firstS = false; done(); } });
render();
} catch (e) { this.mode = 'local'; this.ready = true; render(); }
},
async put(c, obj) {
obj = JSON.parse(JSON.stringify(obj));
this.data[c][obj.id] = obj; schedule();
if (this.mode === 'cloud') { try { await this.colRef(c).doc(obj.id).set(obj); } catch (e) { failWrite(e); } }
else this.saveLocal();
},
async del(c, id) {
delete this.data[c][id]; schedule();
if (this.mode === 'cloud') { try { await this.colRef(c).doc(id).delete(); } catch (e) { failWrite(e); } }
else this.saveLocal();
},
async saveSet(patch) {
this.set = { ...this.set, ...patch }; schedule();
if (this.mode === 'cloud') { try { await this.setRef().set(JSON.parse(JSON.stringify(this.set))); } catch (e) { failWrite(e); } }
else this.saveLocal();
}
};
function failWrite(e) { toast(e && e.code === 'quota_exceeded' ? 'Kapasitas data penuh. Hapus data lama atau unduh backup.' : 'Gagal menyimpan (' + ((e && e.code) || 'error') + '). Coba lagi.'); }
const orders = () => Object.values(S.data.orders).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
const cash = () => Object.values(S.data.cash).sort((a, b) => (a.tgl + (a.t || 0)).localeCompare(b.tgl + (b.t || 0)));
const customers = () => Object.values(S.data.customers).sort((a, b) => a.nama.localeCompare(b.nama));
const prices = () => Object.values(S.data.prices).sort((a, b) => (a.jenis + a.kategori + a.layanan).localeCompare(b.jenis + b.kategori + b.layanan));
const oTotal = o => (o.items || []).reduce((s, i) => s + num(i.qty) * num(i.harga), 0) - num(o.diskon);
const oPays = o => cash().filter(c => c.orderId === o.id && c.tipe === 'masuk');
const oPaid = o => oPays(o).reduce((s, c) => s + num(c.nominal), 0);
const oSisa = o => Math.max(0, oTotal(o) - oPaid(o));
const isLunas = o => oTotal(o) > 0 && oSisa(o) <= 0;
const custOrders = id => orders().filter(o => o.custId === id);
function saldoTo(dateIso, dompet) {
const sa = S.set.saldoAwal || {};
let s = dompet ? num(sa[dompet]) : DOMPET.reduce((t, d) => t + num(sa[d.k]), 0);
cash().forEach(c => { if (c.tgl <= dateIso && (!dompet || c.dompet === dompet)) s += (c.tipe === 'masuk' ? 1 : -1) * num(c.nominal); });
return s;
}
function monthSum(k) { let i = 0, o = 0; cash().forEach(c => { if (ym(c.tgl) === k) { if (c.tipe === 'masuk') i += num(c.nominal); else o += num(c.nominal); } }); return { i, o }; }
function nextNo() { let m = 0; orders().forEach(o => { const n = parseInt(String(o.no || '').replace(/\D/g, ''), 10); if (n > m) m = n; }); return 'RJ-' + String(m + 1).padStart(4, '0'); }
function priceCheck(o) {
const out = [];
(o.items || []).forEach((it, i) => {
const p = it.priceId && S.data.prices[it.priceId];
const name = (i + 1) + '. ' + (it.layanan || it.kategori);
if (!num(it.harga)) out.push({ lvl: 'bad', t: name + ': harga masih Rp0.' });
else if (it.khusus) out.push({ lvl: 'warn', t: name + ': harga khusus ' + rp(it.harga) + (p ? ' (daftar ' + rp(p.harga) + ')' : '') + (it.alasan ? ' — ' + it.alasan : '') });
else if (!it.priceId) out.push({ lvl: 'warn', t: name + ': tidak diambil dari daftar harga.' });
else if (p && num(p.harga) !== num(it.harga)) out.push({ lvl: 'warn', t: name + ': daftar harga sekarang ' + rp(p.harga) + ', nota memakai ' + rp(it.harga) + '.' });
if (!num(it.qty)) out.push({ lvl: 'bad', t: name + ': jumlah 0.' });
});
if (num(o.diskon) > 0) out.push({ lvl: 'warn', t: 'Ada diskon ' + rp(o.diskon) + '.' });
if (!out.length) out.push({ lvl: 'ok', t: 'Semua harga sesuai daftar harga.' });
return out;
}
let toastT;
function toast(msg) { let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); } el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
function modal(html, opts = {}) {
closeModal();
const w = document.createElement('div'); w.className = 'modal-wrap'; w.id = 'modal';
w.innerHTML = '<div class="modal ' + (opts.wide ? 'wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
w.addEventListener('click', e => { if (e.target === w) closeModal(); });
document.body.appendChild(w); document.body.classList.add('noscroll');
const f = w.querySelector('input,select,textarea'); if (f && !opts.nofocus) setTimeout(() => f.focus(), 30);
return w;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); document.body.classList.remove('noscroll'); }
function confirmBox(title, body, okLabel, danger) {
return new Promise(res => {
const w = modal('<h3 class="m-title">' + esc(title) + '</h3><p class="muted">' + body + '</p>' +
(danger && S.set.pin ? '<label class="field"><span>PIN pemilik</span><input class="input" type="password" inputmode="numeric" id="pinIn" autocomplete="off"></label>' : '') +
'<div class="m-actions"><button class="btn ghost" data-x="no">Batal</button><button class="btn ' + (danger ? 'danger' : 'primary') + '" data-x="ok">' + esc(okLabel || 'Ya') + '</button></div>', { nofocus: !(danger && S.set.pin) });
w.addEventListener('click', e => {
const b = e.target.closest('[data-x]'); if (!b) return;
if (b.dataset.x === 'ok' && danger && S.set.pin && $('#pinIn').value !== S.set.pin) { toast('PIN salah.'); return; }
closeModal(); res(b.dataset.x === 'ok');
});
});
}
async function saveFile(filename, data, mime) {
if (STANDALONE) {
const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain' });
const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); toast('Diunduh: ' + filename); return true;
}
try {
const d = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
if (d) { await d.save({ filename, data }); toast('File disiapkan: ' + filename); return true; }
} catch (e) { if (e && /declin|reject|cancel/i.test(e.code || e.message || '')) return false; }
// cadangan: tampilkan tautan data
const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain' });
const url = URL.createObjectURL(blob);
const isImg = /^image/.test(blob.type);
modal('<h3 class="m-title">Simpan ' + esc(filename) + '</h3>' + (isImg ? '<img src="' + url + '" class="dl-preview" alt="">' + '<p class="muted small">Di HP: tekan lama gambar lalu pilih “Simpan gambar”.</p>' : '<p class="muted small">Unduhan langsung tidak tersedia di tampilan ini. Buka tautan di bawah, atau salin isinya.</p><a class="btn primary" href="' + url + '" target="_blank" rel="noopener">Buka file</a>') + '<div class="m-actions"><button class="btn ghost" onclick="RJ.closeModal()">Tutup</button></div>');
return true;
}
async function copyText(t) { try { await navigator.clipboard.writeText(t); toast('Teks disalin.'); } catch (e) { modal('<h3 class="m-title">Salin teks</h3><textarea class="input" rows="10">' + esc(t) + '</textarea><div class="m-actions"><button class="btn ghost" onclick="RJ.closeModal()">Tutup</button></div>'); } }
function logoSVG(cls) {
return '<svg class="' + (cls || 'logo') + '" viewBox="0 0 120 150" fill="none" aria-label="Rida Roemah Jahit">' +
'<path d="M14 146V58a46 46 0 0 1 92 0v88" stroke="currentColor" stroke-width="2.2"/>' +
'<path d="M22 146V60a38 38 0 0 1 76 0v86" stroke="currentColor" stroke-width="1" opacity=".7"/>' +
'<g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
'<circle cx="60" cy="38" r="4"/><path d="M60 42v5"/>' +
'<path d="M50 49c-4 1-9 3-9 9 0 7 6 11 6 18 0 5-3 8-3 12 0 10 7 14 16 14s16-4 16-14c0-4-3-7-3-12 0-7 6-11 6-18 0-6-5-8-9-9-3 2-6 3-10 3s-7-1-10-3z"/>' +
'<path d="M47 76c8 3 18 3 26 0" opacity=".7"/>' +
'<path d="M60 102v24M52 126h16M60 126l-10 10M60 126l10 10"/></g></svg>';
}
function brandBlock() {
return '<div class="brand">' + logoSVG('logo') + '<div class="brand-t"><b>RIDA</b><i>Roemah Jahit</i></div></div>';
}
const MODEKEY = 'rida-mode-' + (T.name || 'x');
function getPref() { try { return localStorage.getItem(MODEKEY) || T.defMode || 'light'; } catch (e) { return T.defMode || 'light'; } }
function effMode(p) { p = p || getPref(); if (p === 'auto') return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; return p; }
function applyMode() { const m = effMode(); document.documentElement.dataset.mode = m; const tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || tc.content; }
function setPref(p) { try { localStorage.setItem(MODEKEY, p); } catch (e) {} applyMode(); forceRender(); }
const SUN = 'M12 4V2M12 22v-2M4.9 4.9 3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z';
const MOON = 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z';
function modeBtn() { const d = effMode() === 'dark'; return '<button class="modebtn" data-act="mode-toggle" aria-label="' + (d ? 'Ganti ke mode terang' : 'Ganti ke mode gelap') + '" title="' + (d ? 'Mode terang' : 'Mode gelap') + '">' + ico(d ? SUN : MOON) + '</button>'; }
if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (getPref() === 'auto') { applyMode(); forceRender(); } }); } catch (e) {} }
const NAV = [
{ k: 'beranda', l: 'Beranda', i: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
{ k: 'pesanan', l: 'Pesanan', i: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6' },
{ k: 'kas', l: 'Kas', i: 'M3 7h18v12H3zM3 7l3-3h12l3 3M16 13h2' },
{ k: 'laporan', l: 'Laporan', i: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
{ k: 'pelanggan', l: 'Pelanggan', i: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
{ k: 'atur', l: 'Atur', i: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .3-1.5-1.5L17 5l-3-1-1 2h-2L10 4 7 5l.5 1.8L6 8.3 4 8 3 11l2 1v0l-2 1 1 3 2-.3 1.5 1.5L7 19l3 1 1-2h2l1 2 3-1-.5-1.8 1.5-1.5 2 .3 1-3z' }];
const ico = d => '<svg viewBox="0 0 24 24" class="ico" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
let route = { v: 'beranda', id: null };
function parseHash() {
const h = (location.hash || '').replace('#', '');
const m = h.match(/^(order|nota|kuitansi|edit|cust)-(.+)$/);
if (m) route = { v: m[1], id: m[2] }; else route = { v: h || 'beranda', id: null };
}
function go(h) { if (location.hash === '#' + h) { parseHash(); render(); } else location.hash = h; window.scrollTo(0, 0); }
let filt = { status: 'aktif', q: '', kasM: '', kasT: 'semua', lapM: '', custQ: '' };
let draft = null; // pesanan yang sedang diisi
let rq = 0;
function schedule() { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; render(); }); }
function shell(content) {
const active = { order: 'pesanan', nota: 'pesanan', kuitansi: 'pesanan', edit: 'pesanan', baru: 'pesanan', cust: 'pelanggan' }[route.v] || route.v;
const navLinks = NAV.map(n => '<a href="#' + n.k + '" class="nav-a ' + (active === n.k ? 'on' : '') + '">' + ico(n.i) + '<span>' + n.l + '</span></a>').join('');
const sync = S.mode === 'cloud' ? '<span class="sync ok" title="Data tersimpan di akun Anda dan bisa dibuka di komputer & HP">● Tersinkron</span>' : (STANDALONE ? '<span class="sync loc" title="Data tersimpan di perangkat ini. Unduh backup secara rutin.">● Di perangkat ini</span>' : '<span class="sync loc" title="Data hanya tersimpan di perangkat/peramban ini">● Mode lokal</span>');
const note = S.note ? '<div class="banner warn">' + esc(S.note) + '</div>' : '';
if (T.layout === 'topbar') {
return '<header class="top"><div class="top-in">' + brandBlock() + '<nav class="top-nav">' + navLinks + '</nav><div class="top-r">' + sync + modeBtn() + '<a href="#baru" class="btn primary sm hide-m">+ Pesanan</a></div></div></header>' +
'<main class="main">' + note + content + '</main><nav class="bnav">' + navLinks + '</nav><a href="#baru" class="fab" aria-label="Pesanan baru">+</a>';
}
return '<aside class="side">' + brandBlock() + '<a href="#baru" class="btn primary block">+ Pesanan baru</a><nav class="side-nav">' + navLinks + '</nav><div class="side-foot"><div class="sf-row">' + sync + modeBtn() + '</div><small>' + esc(S.set.nama) + '</small></div></aside>' +
'<main class="main">' + '<div class="m-brand">' + brandBlock() + '<div class="mb-r">' + sync + modeBtn() + '</div></div>' + note + content + '</main><nav class="bnav">' + navLinks + '</nav><a href="#baru" class="fab" aria-label="Pesanan baru">+</a>';
}
function head(title, sub, right) { return '<div class="ph"><div><p class="eyebrow">' + (sub || '') + '</p><h1 class="h1">' + title + '</h1></div><div class="ph-r">' + (right || '') + '</div></div>'; }
function empty(t, btn) { return '<div class="empty"><div class="empty-ic">' + logoSVG('logo') + '</div><p>' + t + '</p>' + (btn || '') + '</div>'; }
function stBadge(o) { const l = isLunas(o); return '<span class="badge st-' + o.status + '">' + stLabel(o.status) + '</span>' + (oTotal(o) > 0 ? '<span class="badge ' + (l ? 'pay-ok' : 'pay-no') + '">' + (l ? 'Lunas' : 'Sisa ' + rpShort(oSisa(o))) + '</span>' : ''); }
let charts = {};
function vBeranda() {
const t = today(), k = ym(t);
const m = monthSum(k);
const prevK = ym(addDays(k + '-01', -1)); const pm = monthSum(prevK);
const os = orders();
const aktif = os.filter(o => o.status !== 'diambil');
const piutang = os.reduce((s, o) => s + oSisa(o), 0);
const ambil = aktif.filter(o => o.tglAmbil).sort((a, b) => a.tglAmbil.localeCompare(b.tglAmbil)).slice(0, 6);
const todayIn = cash().filter(c => c.tgl === t && c.tipe === 'masuk').reduce((s, c) => s + num(c.nominal), 0);
const h = new Date().getHours(); const salam = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
const isEmpty = !os.length && !cash().length;
const trend = pm.o ? Math.round((m.o - pm.o) / pm.o * 100) : null;
let html = head(salam, tglPanjang(t), '<a href="#baru" class="btn primary">+ Catat pesanan</a>');
if (isEmpty) html += '<div class="banner"><b>Buku masih kosong.</b> Mulai dengan mengisi <a href="#atur">daftar harga & profil usaha</a>, lalu catat pesanan pertama. Ingin mencoba dulu? <button class="link" data-act="demo">Muat data contoh</button></div>';
html += '<section class="hero card">' +
'<div class="hero-l"><span class="eyebrow">Saldo kas</span><div class="big">' + rp(saldoTo(t)) + '</div>' +
'<div class="wallets">' + DOMPET.map(d => '<div><span>' + d.l + '</span><b>' + rp(saldoTo(t, d.k)) + '</b></div>').join('') + '</div></div>' +
'<div class="hero-r"><div class="stat"><span>Masuk · ' + BLN[+k.slice(5) - 1] + '</span><b class="in">' + rp(m.i) + '</b></div>' +
'<div class="stat"><span>Keluar · ' + BLN[+k.slice(5) - 1] + '</span><b class="out">' + rp(m.o) + '</b>' + (trend !== null ? '<small>' + (trend <= 0 ? '↓ ' : '↑ ') + Math.abs(trend) + '% vs bln lalu</small>' : '') + '</div>' +
'<div class="stat"><span>Piutang pelanggan</span><b>' + rp(piutang) + '</b><small>' + os.filter(o => oSisa(o) > 0).length + ' pesanan belum lunas</small></div>' +
'<div class="stat"><span>Pesanan aktif</span><b>' + aktif.length + '</b><small>' + aktif.filter(o => o.status === 'siap').length + ' siap diambil</small></div></div></section>';
html += '<div class="grid2">' +
'<section class="card"><div class="card-h"><h2>Arus kas 6 bulan</h2><a href="#laporan" class="link">Laporan</a></div><div class="chart-box"><canvas id="cFlow"></canvas></div></section>' +
'<section class="card"><div class="card-h"><h2>Pengambilan terdekat</h2><a href="#pesanan" class="link">Semua</a></div>' +
(ambil.length ? '<ul class="list">' + ambil.map(o => { const d = daysBetween(t, o.tglAmbil); const lab = d < 0 ? 'Lewat ' + (-d) + ' hr' : d === 0 ? 'Hari ini' : d === 1 ? 'Besok' : d + ' hari lagi'; return '<li><a href="#order-' + o.id + '" class="row"><div class="row-m"><b>' + esc(o.nama) + '</b><small>' + esc(o.no) + ' · ' + esc((o.items || []).map(i => i.layanan || i.kategori).join(', ')) + '</small></div><div class="row-r"><span class="due ' + (d < 0 ? 'late' : d <= 1 ? 'soon' : '') + '">' + lab + '</span><small>' + stLabel(o.status) + '</small></div></a></li>'; }).join('') + '</ul>' : '<p class="muted pad">Belum ada jadwal pengambilan.</p>') + '</section></div>';
html += '<section class="card setoran"><div><h2>Setoran hari ini</h2><p class="muted">Uang masuk ' + rp(todayIn) + ' dari ' + cash().filter(c => c.tgl === t && c.tipe === 'masuk').length + ' transaksi.</p></div><div class="btns"><button class="btn ghost" data-act="kas-new" data-tipe="keluar">− Pengeluaran</button><button class="btn ghost" data-act="kas-new" data-tipe="masuk">+ Pemasukan</button><button class="btn primary" data-act="setoran">Kirim rekap ke WA</button></div></section>';
const recent = cash().slice(-6).reverse();
html += '<section class="card"><div class="card-h"><h2>Transaksi terakhir</h2><a href="#kas" class="link">Buku kas</a></div>' + (recent.length ? '<ul class="list">' + recent.map(cashRow).join('') + '</ul>' : '<p class="muted pad">Belum ada transaksi.</p>') + '</section>';
return html;
}
function cashRow(c) {
const o = c.orderId && S.data.orders[c.orderId];
return '<li><button class="row" data-act="kas-edit" data-id="' + c.id + '"><span class="dot ' + (c.tipe === 'masuk' ? 'in' : 'out') + '">' + (c.tipe === 'masuk' ? '↓' : '↑') + '</span><div class="row-m"><b>' + esc(c.ket || c.kategori) + '</b><small>' + esc(c.kategori) + ' · ' + dLabel(c.dompet) + ' · ' + tgl(c.tgl) + (o ? ' · ' + esc(o.no) : '') + '</small></div><div class="row-r"><b class="' + (c.tipe === 'masuk' ? 'in' : 'out') + '">' + (c.tipe === 'masuk' ? '+' : '−') + rp(c.nominal).replace('−', '') + '</b></div></button></li>';
}
function drawFlowChart(id, months) {
const el = document.getElementById(id); if (!el || !window.Chart) return;
const cs = getComputedStyle(document.body);
const cIn = cs.getPropertyValue('--c-in').trim(), cOut = cs.getPropertyValue('--c-out').trim(), cLine = cs.getPropertyValue('--c-line').trim(), cMut = cs.getPropertyValue('--muted').trim(), cGrid = cs.getPropertyValue('--grid').trim();
const labels = months.map(k => BLN[+k.slice(5) - 1].slice(0, 3));
const ins = months.map(k => monthSum(k).i), outs = months.map(k => monthSum(k).o);
const sal = months.map(k => { const [y, mm] = k.split('-').map(Number); const last = new Date(y, mm, 0).getDate(); return saldoTo(k + '-' + String(last).padStart(2, '0')); });
if (charts[id]) charts[id].destroy();
charts[id] = new Chart(el, {
data: { labels, datasets: [
{ type: 'bar', label: 'Masuk', data: ins, backgroundColor: cIn, borderRadius: 4, maxBarThickness: 22, order: 2 },
{ type: 'bar', label: 'Keluar', data: outs, backgroundColor: cOut, borderRadius: 4, maxBarThickness: 22, order: 2 },
{ type: 'line', label: 'Saldo akhir', data: sal, borderColor: cLine, backgroundColor: cLine, pointRadius: 3, borderWidth: 2, tension: .3, order: 1 }] },
options: { responsive: true, maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
plugins: { legend: { position: 'bottom', labels: { color: cMut, usePointStyle: true, boxWidth: 8, font: { size: 11 } } }, tooltip: { callbacks: { label: c => c.dataset.label + ': ' + rp(c.parsed.y) } } },
scales: { x: { grid: { display: false }, ticks: { color: cMut } }, y: { grid: { color: cGrid }, border: { display: false }, ticks: { color: cMut, callback: v => rpShort(v).replace('Rp', '') } } } }
});
}
function lastMonths(n, endK) { const out = []; let d = new Date((endK || ym(today())) + '-01T00:00'); for (let i = 0; i < n; i++) { out.unshift(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')); d.setMonth(d.getMonth() - 1); } return out; }
function vPesanan() {
const all = orders();
const q = filt.q.toLowerCase();
const list = all.filter(o => {
if (filt.status === 'aktif' && o.status === 'diambil') return false;
if (filt.status === 'belum' && oSisa(o) <= 0) return false;
if (!['aktif', 'semua', 'belum'].includes(filt.status) && o.status !== filt.status) return false;
if (q && !(o.nama + ' ' + o.no + ' ' + o.wa + ' ' + (o.items || []).map(i => i.layanan + i.kategori).join(' ')).toLowerCase().includes(q)) return false;
return true;
});
const chips = [['aktif', 'Aktif'], ['belum', 'Belum lunas']].concat(STATUS.map(s => [s.k, s.l])).concat([['semua', 'Semua']]);
let html = head('Pesanan', all.length + ' pesanan tercatat', '<a href="#baru" class="btn primary">+ Pesanan baru</a>');
html += '<div class="toolbar"><input class="input search" placeholder="Cari nama, no. nota, WA…" value="' + esc(filt.q) + '" data-filter="q"><div class="chips">' + chips.map(c => '<button class="chip ' + (filt.status === c[0] ? 'on' : '') + '" data-act="fstatus" data-v="' + c[0] + '">' + c[1] + ' <em>' + countSt(c[0]) + '</em></button>').join('') + '</div></div>';
if (!list.length) return html + empty(all.length ? 'Tidak ada pesanan untuk filter ini.' : 'Belum ada pesanan. Catat pesanan pertama — nota dan arus kas akan tersusun otomatis.', '<a href="#baru" class="btn primary">+ Pesanan baru</a>');
html += '<div class="ocards">' + list.map(o => '<a href="#order-' + o.id + '" class="ocard card"><div class="oc-top"><span class="ono">' + esc(o.no) + '</span><span class="muted small">' + tgl(o.tgl) + '</span></div><b class="oc-name">' + esc(o.nama) + '</b><p class="muted small clamp">' + esc((o.items || []).map(i => num(i.qty) + '× ' + (i.layanan || i.kategori)).join(' · ')) + '</p><div class="oc-bot"><div>' + stBadge(o) + '</div><b>' + rp(oTotal(o)) + '</b></div>' + (o.tglAmbil && o.status !== 'diambil' ? '<small class="muted">Ambil: ' + tgl(o.tglAmbil) + '</small>' : '') + '</a>').join('') + '</div>';
return html;
}
function countSt(k) { const os = orders(); if (k === 'semua') return os.length; if (k === 'aktif') return os.filter(o => o.status !== 'diambil').length; if (k === 'belum') return os.filter(o => oSisa(o) > 0).length; return os.filter(o => o.status === k).length; }
function newDraft() { return { id: uid(), no: nextNo(), tgl: today(), custId: '', nama: '', wa: '', bahan: 'Dari pelanggan', tglAmbil: addDays(today(), 7), status: 'antre', catatan: '', diskon: 0, items: [newItem()], dp: 0, dpDompet: 'tunai', okPelanggan: false }; }
function newItem() { return { id: uid(), jenis: 'Jahit Baru', kategori: 'Kebaya', priceId: '', layanan: '', qty: 1, harga: 0, khusus: false, alasan: '', ukuran: {}, catatan: '' }; }
function vForm(edit) {
if (!draft || (edit && draft.id !== route.id) || (!edit && draft._edit)) {
if (edit) { const o = S.data.orders[route.id]; if (!o) return empty('Pesanan tidak ditemukan.'); draft = JSON.parse(JSON.stringify(o)); draft._edit = true; }
else draft = newDraft();
}
const d = draft;
const cust = d.custId && S.data.customers[d.custId];
let html = head(edit ? 'Ubah pesanan' : 'Pesanan baru', d.no + ' · ' + tgl(d.tgl), '<a href="' + (edit ? '#order-' + d.id : '#pesanan') + '" class="btn ghost" data-act="cancel-form">Batal</a>');
html += '<form id="oform" class="form" autocomplete="off">';
html += '<section class="card fsec"><h2 class="sec-t"><span>1</span>Pelanggan</h2><div class="fgrid">' +
'<label class="field rel"><span>Nama pelanggan</span><input class="input" name="nama" value="' + esc(d.nama) + '" placeholder="Contoh: Bu Ratna" data-d="nama" required><div class="sugg" id="sugg"></div></label>' +
'<label class="field"><span>Nomor WhatsApp</span><input class="input" name="wa" value="' + esc(d.wa) + '" placeholder="08xx xxxx xxxx" inputmode="tel" data-d="wa"></label>' +
'</div>' + (cust ? '<p class="okline">✓ Pelanggan lama — ' + custOrders(cust.id).length + ' pesanan sebelumnya. Ukuran terakhir bisa dipakai di bawah.</p>' : '') + '</section>';
html += '<section class="card fsec"><h2 class="sec-t"><span>2</span>Jahitan</h2>' + d.items.map((it, idx) => itemForm(it, idx, cust)).join('') +
'<button type="button" class="btn ghost block" data-act="add-item">+ Tambah jahitan lain (pelanggan sama)</button></section>';
const total = oTotal(d);
html += '<section class="card fsec"><h2 class="sec-t"><span>3</span>Jadwal & pembayaran</h2><div class="fgrid">' +
'<label class="field"><span>Tanggal pesan</span><input class="input" type="date" value="' + d.tgl + '" data-d="tgl"></label>' +
'<label class="field"><span>Perkiraan ambil</span><input class="input" type="date" value="' + esc(d.tglAmbil) + '" data-d="tglAmbil"></label>' +
'<label class="field"><span>Bahan</span><select class="input" data-d="bahan">' + ['Dari pelanggan', 'Dari toko', 'Campuran'].map(b => '<option ' + (d.bahan === b ? 'selected' : '') + '>' + b + '</option>').join('') + '</select></label>' +
'<label class="field"><span>Diskon (Rp)</span><input class="input money" inputmode="numeric" value="' + (num(d.diskon) ? num(d.diskon).toLocaleString('id-ID') : '') + '" placeholder="0" data-d="diskon"></label>' +
(!edit ? '<label class="field"><span>Dibayar sekarang (DP)</span><input class="input money" inputmode="numeric" value="' + (num(d.dp) ? num(d.dp).toLocaleString('id-ID') : '') + '" placeholder="0" data-d="dp"></label>' +
'<label class="field"><span>Masuk ke</span><select class="input" data-d="dpDompet">' + DOMPET.map(x => '<option value="' + x.k + '" ' + (d.dpDompet === x.k ? 'selected' : '') + '>' + x.l + '</option>').join('') + '</select></label>' : '') +
'<label class="field span2"><span>Catatan pesanan</span><textarea class="input" rows="2" data-d="catatan" placeholder="Model, referensi foto, permintaan khusus…">' + esc(d.catatan) + '</textarea></label></div>' +
'<div class="sum" id="sumBox">' + sumBox(d, edit) + '</div></section>';
html += '<div class="form-bar"><div><span class="muted small">Total</span><b id="barTotal">' + rp(total) + '</b></div><button type="submit" class="btn primary">✓ Simpan & buat nota</button></div></form>';
return html;
}
function sumBox(d, edit) {
const t = oTotal(d), dp = edit ? oPaid(d) : num(d.dp);
const chk = priceCheck(d);
return '<div class="sum-rows"><div><span>Total biaya</span><b>' + rp(t) + '</b></div><div><span>' + (edit ? 'Sudah dibayar' : 'DP') + '</span><b>' + rp(dp) + '</b></div><div class="sum-sisa"><span>Sisa tagihan</span><b>' + rp(Math.max(0, t - dp)) + '</b></div></div><p class="terbilang">' + terbilang(t) + '</p>' +
'<ul class="checks">' + chk.map(c => '<li class="' + c.lvl + '">' + esc(c.t) + '</li>').join('') + '</ul>';
}
function itemForm(it, idx, cust) {
const pl = prices().filter(p => p.jenis === it.jenis);
const last = cust && cust.ukuran && cust.ukuran[it.kategori];
const fields = it.jenis === 'Permak' ? [] : ukuranFor(it.kategori);
return '<div class="item" data-idx="' + idx + '"><div class="item-h"><b>Jahitan ' + (idx + 1) + '</b>' + (idx > 0 ? '<button type="button" class="link danger" data-act="rm-item" data-idx="' + idx + '">Hapus</button>' : '') + '</div>' +
'<div class="seg">' + ['Jahit Baru', 'Permak'].map(j => '<button type="button" class="' + (it.jenis === j ? 'on' : '') + '" data-act="it-jenis" data-idx="' + idx + '" data-v="' + j + '">' + j + '</button>').join('') + '</div>' +
'<div class="kat">' + KATEGORI.map(k => '<button type="button" class="kchip ' + (it.kategori === k ? 'on' : '') + '" data-act="it-kat" data-idx="' + idx + '" data-v="' + k + '">' + k + '</button>').join('') + '</div>' +
'<div class="fgrid">' +
'<label class="field span2"><span>Layanan dari daftar harga</span><select class="input" data-i="priceId" data-idx="' + idx + '"><option value="">' + (pl.length ? '— Pilih layanan —' : '— Daftar harga ' + it.jenis + ' masih kosong —') + '</option>' +
pl.map(p => '<option value="' + p.id + '" ' + (it.priceId === p.id ? 'selected' : '') + '>' + esc(p.kategori + ' · ' + p.layanan) + ' — ' + rp(p.harga) + '</option>').join('') + '</select></label>' +
'<label class="field"><span>Jumlah</span><div class="stepper"><button type="button" data-act="qty" data-idx="' + idx + '" data-v="-1">−</button><input class="input" inputmode="numeric" value="' + num(it.qty) + '" data-i="qty" data-idx="' + idx + '"><button type="button" data-act="qty" data-idx="' + idx + '" data-v="1">+</button></div></label>' +
'<label class="field"><span>Harga satuan ' + (it.khusus || !it.priceId ? '' : '<em class="lock">🔒 sesuai daftar</em>') + '</span><input class="input money" inputmode="numeric" value="' + (num(it.harga) ? num(it.harga).toLocaleString('id-ID') : '') + '" placeholder="0" data-i="harga" data-idx="' + idx + '" ' + (it.priceId && !it.khusus ? 'readonly' : '') + '></label>' +
(it.priceId ? '<label class="check span2"><input type="checkbox" data-i="khusus" data-idx="' + idx + '" ' + (it.khusus ? 'checked' : '') + '> Pakai harga khusus (tidak sesuai daftar)</label>' : '') +
(it.khusus || (!it.priceId && pl.length) ? '<label class="field span2"><span>Alasan harga ' + (it.khusus ? 'khusus' : 'manual') + '</span><input class="input" value="' + esc(it.alasan) + '" placeholder="Contoh: pelanggan langganan, bahan tipis" data-i="alasan" data-idx="' + idx + '"></label>' : '') +
(!it.priceId ? '<label class="field span2"><span>Nama layanan</span><input class="input" value="' + esc(it.layanan) + '" placeholder="Contoh: Kebaya kutubaru" data-i="layanan" data-idx="' + idx + '"></label>' : '') +
'</div>' +
(fields.length ? '<div class="uk-h"><span>Ukuran ' + esc(it.kategori) + ' (cm) — isi yang perlu saja</span>' + (last ? '<button type="button" class="link" data-act="use-last" data-idx="' + idx + '">Pakai ukuran terakhir (' + tgl(last._tgl) + ')</button>' : '') + '</div><div class="uk">' +
fields.map(f => '<label class="ukf"><span>' + f + '</span><div><input class="input" inputmode="decimal" value="' + esc(it.ukuran[f] || '') + '" data-u="' + esc(f) + '" data-idx="' + idx + '"><em>cm</em></div></label>').join('') + '</div>' : '') +
'<label class="field"><span>' + (it.jenis === 'Permak' ? 'Detail permak' : 'Catatan model / ukuran') + '</span><input class="input" value="' + esc(it.catatan) + '" placeholder="' + (it.jenis === 'Permak' ? 'Contoh: kecilkan pinggang 3 cm' : 'Contoh: lengan balon, kerah sabrina') + '" data-i="catatan" data-idx="' + idx + '"></label></div>';
}
function refreshSum() { if (!draft) return; const b = $('#sumBox'); if (b) b.innerHTML = sumBox(draft, !!draft._edit); const t = $('#barTotal'); if (t) t.textContent = rp(oTotal(draft)); }
async function submitOrder() {
const d = draft;
if (!d.nama.trim()) { toast('Isi nama pelanggan.'); return; }
if (!d.items.length || oTotal(d) <= 0) { toast('Total masih Rp0 — pilih layanan atau isi harga.'); return; }
if (d.items.some(i => !i.priceId && !i.layanan.trim())) { toast('Isi nama layanan untuk jahitan tanpa daftar harga.'); return; }
if (d.items.some(i => i.khusus && !i.alasan.trim())) { toast('Tulis alasan untuk harga khusus.'); return; }
// pelanggan
let c = d.custId && S.data.customers[d.custId];
if (!c) c = customers().find(x => x.nama.toLowerCase() === d.nama.trim().toLowerCase() && (!d.wa || waNum(x.wa) === waNum(d.wa)));
if (!c) c = { id: uid(), nama: d.nama.trim(), wa: d.wa, alamat: '', catatan: '', ukuran: {} };
c = JSON.parse(JSON.stringify(c)); c.nama = d.nama.trim(); if (d.wa) c.wa = d.wa; c.ukuran = c.ukuran || {};
d.items.forEach(i => { const vals = Object.fromEntries(Object.entries(i.ukuran || {}).filter(([, v]) => String(v).trim())); if (Object.keys(vals).length) c.ukuran[i.kategori] = { ...vals, _tgl: d.tgl }; });
await S.put('customers', c);
const isEdit = !!d._edit;
const o = { id: d.id, no: d.no, tgl: d.tgl, custId: c.id, nama: c.nama, wa: d.wa || c.wa || '', bahan: d.bahan, tglAmbil: d.tglAmbil, status: d.status || 'antre', catatan: d.catatan, diskon: num(d.diskon), items: d.items.map(i => ({ ...i, qty: num(i.qty), harga: num(i.harga), hargaList: i.priceId && S.data.prices[i.priceId] ? num(S.data.prices[i.priceId].harga) : null })), okPelanggan: !!d.okPelanggan, createdAt: d.createdAt || Date.now(), updatedAt: Date.now() };
await S.put('orders', o);
if (!isEdit && num(d.dp) > 0) await S.put('cash', { id: uid(), tgl: d.tgl, t: Date.now(), tipe: 'masuk', kategori: 'Pembayaran pesanan', ket: (num(d.dp) >= oTotal(o) ? 'Lunas ' : 'DP ') + o.no + ' · ' + o.nama, nominal: num(d.dp), dompet: d.dpDompet, orderId: o.id, payKind: num(d.dp) >= oTotal(o) ? 'Lunas' : 'DP' });
draft = null; toast(isEdit ? 'Pesanan diperbarui.' : 'Pesanan tersimpan.'); go('nota-' + o.id);
}
function vOrder() {
const o = S.data.orders[route.id]; if (!o) return S.ready ? empty('Pesanan tidak ditemukan.', '<a class="btn" href="#pesanan">Kembali</a>') : '<p class="muted">Memuat…</p>';
const t = oTotal(o), paid = oPaid(o), sisa = oSisa(o), si = STATUS.findIndex(s => s.k === o.status);
let html = head(esc(o.nama), esc(o.no) + ' · dipesan ' + tgl(o.tgl), '<a href="#pesanan" class="btn ghost">← Pesanan</a>');
html += '<div class="grid2 detail">';
html += '<section class="card"><div class="card-h"><h2>Status pengerjaan</h2>' + stBadge(o) + '</div><ol class="steps">' + STATUS.map((s, i) => '<li class="' + (i < si ? 'done' : i === si ? 'now' : '') + '"><button data-act="set-status" data-v="' + s.k + '">' + s.l + '</button></li>').join('') + '</ol>' +
'<dl class="kv"><div><dt>WhatsApp</dt><dd>' + (o.wa ? '<a href="https://wa.me/' + waNum(o.wa) + '" target="_blank" rel="noopener">' + esc(o.wa) + '</a>' : '—') + '</dd></div><div><dt>Perkiraan ambil</dt><dd>' + tglPanjang(o.tglAmbil) + '</dd></div><div><dt>Bahan</dt><dd>' + esc(o.bahan) + '</dd></div><div><dt>Konfirmasi pelanggan</dt><dd>' + (o.okPelanggan ? '✓ Sudah balas OK' : '<button class="link" data-act="ok-pel">Tandai sudah balas OK</button>') + '</dd></div></dl>' +
(o.catatan ? '<p class="note">' + esc(o.catatan) + '</p>' : '') +
'<h3 class="sub-t">Rincian jahitan</h3><ul class="items">' + o.items.map(i => '<li><div class="it-l"><b>' + esc(i.layanan || i.kategori) + '</b><small>' + esc(i.jenis + ' · ' + i.kategori) + (i.khusus ? ' · harga khusus' : '') + '</small>' + (Object.keys(i.ukuran || {}).length ? '<small class="uk-s">' + Object.entries(i.ukuran).filter(([, v]) => v).map(([k, v]) => esc(k) + ' ' + esc(v)).join(' · ') + '</small>' : '') + (i.catatan ? '<small>“' + esc(i.catatan) + '”</small>' : '') + '</div><div class="it-r">' + num(i.qty) + ' × ' + rp(i.harga) + '<b>' + rp(num(i.qty) * num(i.harga)) + '</b></div></li>').join('') + (num(o.diskon) ? '<li><div class="it-l">Diskon</div><div class="it-r"><b>−' + rp(o.diskon) + '</b></div></li>' : '') + '</ul></section>';
html += '<section class="card"><div class="card-h"><h2>Pembayaran</h2></div><div class="paybox ' + (sisa <= 0 ? 'lunas' : '') + '"><span>' + (sisa <= 0 ? 'Lunas' : 'Sisa tagihan') + '</span><b>' + rp(sisa) + '</b><small>Total ' + rp(t) + ' · dibayar ' + rp(paid) + '</small></div>' +
(sisa > 0 ? '<div class="payform"><input class="input money" id="payAmt" inputmode="numeric" placeholder="Jumlah dibayar"><select class="input" id="payDompet">' + DOMPET.map(x => '<option value="' + x.k + '">' + x.l + '</option>').join('') + '</select><button class="btn" data-act="pay">Catat</button></div><button class="btn primary block" data-act="pay-full">✓ Tandai sudah lunas (' + rp(sisa) + ')</button>' + (o.wa ? '<a class="btn ghost block" target="_blank" rel="noopener" href="' + waLink(o.wa, reminderText(o)) + '">Ingatkan sisa bayar lewat WA</a>' : '') : '') +
'<h3 class="sub-t">Riwayat</h3>' + (oPays(o).length ? '<ul class="list">' + oPays(o).map(cashRow).join('') + '</ul>' : '<p class="muted small">Belum ada pembayaran.</p>') +
'<div class="doc-btns"><a class="btn" href="#nota-' + o.id + '">Nota pesanan</a><a class="btn" href="#kuitansi-' + o.id + '">Kuitansi' + (sisa <= 0 ? ' LUNAS' : '') + '</a></div>' +
'<div class="doc-btns"><a class="btn ghost" href="#edit-' + o.id + '">Ubah pesanan</a><button class="btn ghost danger" data-act="del-order">Hapus</button></div></section></div>';
return html;
}
const waLink = (wa, text) => 'https://wa.me/' + waNum(wa) + '?text=' + encodeURIComponent(text);
function reminderText(o) { return 'Halo ' + o.nama + ', kami dari *' + S.set.nama + '* 🙏\nMengingatkan sisa pembayaran pesanan *' + o.no + '* sebesar *' + rp(oSisa(o)) + '*.' + (o.status === 'siap' ? '\nPesanan Anda sudah *siap diambil*.' : '') + (S.set.rekening ? '\n\nPembayaran bisa ke: ' + S.set.rekening : '') + '\n\nTerima kasih.'; }
function notaText(o, kind) {
const L = [];
L.push('*' + (kind === 'kuitansi' ? 'KUITANSI' : 'NOTA PESANAN') + ' — ' + S.set.nama + '*');
L.push('No: ' + (kind === 'kuitansi' ? 'KW-' : '') + o.no + ' · ' + tgl(kind === 'kuitansi' ? (lastPayDate(o) || today()) : o.tgl));
L.push('Pelanggan: ' + o.nama); L.push('');
o.items.forEach((i, n) => {
L.push((n + 1) + '. ' + (i.layanan || i.kategori) + ' (' + i.jenis + ')');
L.push('   ' + num(i.qty) + ' × ' + rp(i.harga) + ' = *' + rp(num(i.qty) * num(i.harga)) + '*');
if (kind !== 'kuitansi') { const u = Object.entries(i.ukuran || {}).filter(([, v]) => v); if (u.length) L.push('   Ukuran: ' + u.map(([k, v]) => k + ' ' + v).join(', ')); if (i.catatan) L.push('   Catatan: ' + i.catatan); }
});
if (num(o.diskon)) L.push('Diskon: −' + rp(o.diskon));
L.push(''); L.push('Total: *' + rp(oTotal(o)) + '*');
oPays(o).forEach(p => L.push(tgl(p.tgl) + ' · ' + (p.payKind || 'Bayar') + ': ' + rp(p.nominal)));
L.push((oSisa(o) <= 0 ? '✅ *LUNAS*' : 'Sisa tagihan: *' + rp(oSisa(o)) + '*'));
if (kind !== 'kuitansi') { L.push('Perkiraan ambil: ' + tglPanjang(o.tglAmbil)); L.push(''); L.push(S.set.catatanNota); }
else { L.push(''); L.push(S.set.terimakasih); }
if (S.set.rekening && oSisa(o) > 0) L.push('Rekening: ' + S.set.rekening);
return L.join('\n');
}
const lastPayDate = o => { const p = oPays(o); return p.length ? p[p.length - 1].tgl : null; };
function wrap(ctx, text, maxW) { const words = String(text).split(' '); const lines = []; let cur = ''; words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
function drawDoc(o, kind) {
const W = 900, P = 64, cv = document.createElement('canvas'), sc = 2;
cv.width = W * sc; cv.height = 3200 * sc; const x = cv.getContext('2d'); x.scale(sc, sc);
const ink = '#1d1a16', mut = '#7a7166', gold = '#a8854f', line = '#e6dccb', paper = '#fffdf8';
const serif = '"Cormorant Garamond", "Bodoni Moda", Georgia, serif', sans = '"Manrope", "DM Sans", system-ui, sans-serif';
x.fillStyle = paper; x.fillRect(0, 0, W, 3200);
let y = P;
// logo
x.save(); x.translate(P, y - 6); x.scale(.52, .52); x.strokeStyle = gold; x.lineWidth = 2.4; x.lineCap = 'round'; x.lineJoin = 'round';
const p2d = d => x.stroke(new Path2D(d));
p2d('M14 146V58a46 46 0 0 1 92 0v88'); x.lineWidth = 1; p2d('M22 146V60a38 38 0 0 1 76 0v86'); x.lineWidth = 2.2;
x.beginPath(); x.arc(60, 38, 4, 0, 7); x.stroke(); p2d('M60 42v5'); p2d('M50 49c-4 1-9 3-9 9 0 7 6 11 6 18 0 5-3 8-3 12 0 10 7 14 16 14s16-4 16-14c0-4-3-7-3-12 0-7 6-11 6-18 0-6-5-8-9-9-3 2-6 3-10 3s-7-1-10-3z'); p2d('M60 102v24M52 126h16M60 126l-10 10M60 126l10 10');
x.restore();
x.fillStyle = ink; x.font = '600 34px ' + serif; x.fillText(S.set.nama, P + 78, y + 22);
x.fillStyle = mut; x.font = '400 14px ' + sans;
const sub = [S.set.tagline, S.set.alamat, S.set.wa ? 'WA ' + S.set.wa : ''].filter(Boolean);
sub.forEach((s, i) => wrap(x, s, 470).forEach((ln, j) => x.fillText(ln, P + 78, y + 46 + (i + j) * 19)));
x.textAlign = 'right'; x.fillStyle = gold; x.font = '700 13px ' + sans; x.fillText(kind === 'kuitansi' ? 'K U I T A N S I' : 'N O T A   P E S A N A N', W - P, y + 6);
x.fillStyle = ink; x.font = '600 22px ' + sans; x.fillText((kind === 'kuitansi' ? 'KW-' : '') + o.no, W - P, y + 34);
x.fillStyle = mut; x.font = '400 14px ' + sans; x.fillText(tgl(kind === 'kuitansi' ? (lastPayDate(o) || today()) : o.tgl), W - P, y + 56); x.textAlign = 'left';
y += 112; x.fillStyle = gold; x.fillRect(P, y, W - 2 * P, 1.5); y += 34;
// pelanggan
const kv = (k, v, yy, xx) => { x.fillStyle = mut; x.font = '500 12px ' + sans; x.fillText(k.toUpperCase(), xx || P, yy); x.fillStyle = ink; x.font = '600 17px ' + sans; x.fillText(v, xx || P, yy + 22); };
if (kind === 'kuitansi') {
kv('Sudah terima dari', o.nama, y); kv('Uang sejumlah', rp(oPaid(o)), y, W / 2); y += 50;
x.fillStyle = '#f6efe2'; x.fillRect(P, y, W - 2 * P, 38); x.fillStyle = ink; x.font = 'italic 500 16px ' + serif; x.fillText('“' + terbilang(oPaid(o)) + '”', P + 14, y + 25); y += 62;
kv('Untuk pembayaran', o.items.map(i => i.layanan || i.kategori).join(', ').slice(0, 70) + ' — pesanan ' + o.no, y); y += 52;
} else {
kv('Pelanggan', o.nama + (o.wa ? '  ·  ' + o.wa : ''), y); kv('Perkiraan ambil', tglPanjang(o.tglAmbil), y, W / 2 + 40); y += 60;
}
// tabel item
x.fillStyle = mut; x.font = '600 12px ' + sans; x.fillText('RINCIAN', P, y); x.textAlign = 'right'; x.fillText('JUMLAH', W - P, y); x.fillText('HARGA', W - P - 170, y); x.textAlign = 'left'; y += 12;
x.fillStyle = line; x.fillRect(P, y, W - 2 * P, 1); y += 28;
o.items.forEach((i, n) => {
x.fillStyle = ink; x.font = '600 17px ' + sans; x.fillText((n + 1) + '. ' + (i.layanan || i.kategori), P, y);
x.textAlign = 'right'; x.fillText(rp(num(i.qty) * num(i.harga)), W - P, y); x.font = '400 15px ' + sans; x.fillStyle = mut; x.fillText(num(i.qty) + ' × ' + rp(i.harga), W - P - 170, y); x.textAlign = 'left';
y += 21; x.fillStyle = mut; x.font = '400 13px ' + sans; x.fillText(i.jenis + ' · ' + i.kategori + (i.khusus ? ' · harga khusus' : ''), P + 20, y); y += 19;
if (kind !== 'kuitansi') {
const u = Object.entries(i.ukuran || {}).filter(([, v]) => v).map(([k, v]) => k + ' ' + v + ' cm');
if (u.length) { x.fillStyle = ink; x.font = '400 13px ' + sans; wrap(x, 'Ukuran: ' + u.join(' · '), W - 2 * P - 200).forEach(l => { x.fillText(l, P + 20, y); y += 18; }); }
if (i.catatan) { x.fillStyle = mut; x.font = 'italic 400 13px ' + sans; wrap(x, 'Catatan: ' + i.catatan, W - 2 * P - 200).forEach(l => { x.fillText(l, P + 20, y); y += 18; }); }
}
y += 12; x.fillStyle = line; x.fillRect(P, y - 6, W - 2 * P, .7); y += 18;
});
// ringkasan
const rowR = (k, v, bold, color) => { x.fillStyle = color || mut; x.font = (bold ? '700 ' : '400 ') + (bold ? 18 : 15) + 'px ' + sans; x.fillText(k, W / 2 + 20, y); x.textAlign = 'right'; x.fillStyle = color || ink; x.fillText(v, W - P, y); x.textAlign = 'left'; y += bold ? 32 : 26; };
if (num(o.diskon)) rowR('Diskon', '−' + rp(o.diskon));
rowR('Total biaya', rp(oTotal(o)), true);
oPays(o).forEach(p => rowR(tgl(p.tgl) + ' · ' + (p.payKind || 'Bayar'), rp(p.nominal)));
const sisa = oSisa(o);
x.fillStyle = sisa > 0 ? '#fbf1dc' : '#eef4ea'; x.fillRect(W / 2 + 6, y - 22, W / 2 - P - 6, 42); y += 4;
rowR(sisa > 0 ? 'Sisa tagihan' : 'Sisa tagihan', rp(sisa), true, sisa > 0 ? '#9a5b12' : '#3d6b3a');
if (kind !== 'kuitansi') { x.fillStyle = mut; x.font = 'italic 400 14px ' + serif; wrap(x, terbilang(oTotal(o)), W / 2 - P).forEach(l => { x.fillText(l, P, y - 70); }); }
y += 18;
// stempel lunas
if (sisa <= 0 && oTotal(o) > 0) {
x.save(); x.translate(P + 120, y + 30); x.rotate(-.18); x.strokeStyle = '#3d6b3a'; x.lineWidth = 3; x.strokeRect(-100, -34, 200, 68); x.lineWidth = 1; x.strokeRect(-94, -28, 188, 56);
x.fillStyle = '#3d6b3a'; x.font = '800 38px ' + sans; x.textAlign = 'center'; x.fillText('LUNAS', 0, 13); x.restore(); y += 80;
}
// catatan
const note = kind === 'kuitansi' ? S.set.terimakasih : S.set.catatanNota;
x.fillStyle = '#f6efe2'; const nl = (() => { x.font = '400 14px ' + sans; return wrap(x, note, W - 2 * P - 36); })();
x.fillRect(P, y, W - 2 * P, nl.length * 20 + 26); x.fillStyle = ink; nl.forEach((l, i) => x.fillText(l, P + 18, y + 26 + i * 20)); y += nl.length * 20 + 50;
if (S.set.rekening && sisa > 0) { x.fillStyle = mut; x.font = '400 14px ' + sans; x.fillText('Pembayaran: ' + S.set.rekening, P, y); y += 30; }
x.textAlign = 'right'; x.fillStyle = mut; x.font = '400 13px ' + sans; x.fillText('Hormat kami,', W - P, y + 10); x.fillStyle = ink; x.font = '600 26px ' + serif; x.fillText(S.set.nama, W - P, y + 70); x.textAlign = 'left';
y += 100; x.fillStyle = gold; x.fillRect(P, y, W - 2 * P, 1); y += 24; x.fillStyle = mut; x.font = '400 11px ' + sans; x.fillText('Dicetak ' + tglPanjang(today()) + ' · ' + S.set.nama, P, y); y += P - 20;
const out = document.createElement('canvas'); out.width = W * sc; out.height = y * sc; out.getContext('2d').drawImage(cv, 0, 0); return out;
}
let docState = { checked: false };
function vDoc(kind) {
const o = S.data.orders[route.id]; if (!o) return S.ready ? empty('Pesanan tidak ditemukan.') : '<p class="muted">Memuat…</p>';
const chk = priceCheck(o); const hasWarn = chk.some(c => c.lvl !== 'ok');
let html = head(kind === 'kuitansi' ? 'Kuitansi' + (oSisa(o) <= 0 ? ' lunas' : '') : 'Nota pesanan', esc(o.no) + ' · ' + esc(o.nama), '<a href="#order-' + o.id + '" class="btn ghost">Rincian pesanan</a>');
html += '<div class="docwrap"><div class="docimg card"><img id="docImg" alt="Nota ' + esc(o.no) + '"></div><aside class="docside">' +
'<section class="card"><h2>Cek sebelum kirim</h2><ul class="checks">' + chk.map(c => '<li class="' + c.lvl + '">' + esc(c.t) + '</li>').join('') + '</ul>' +
'<p class="muted small">Total <b>' + rp(oTotal(o)) + '</b> — ' + terbilang(oTotal(o)) + '.</p>' +
'<label class="check"><input type="checkbox" id="chkOk" ' + (docState.checked ? 'checked' : '') + '> Harga, jumlah & nama pelanggan sudah saya cek' + (hasWarn ? ' (termasuk catatan di atas)' : '') + '</label></section>' +
'<section class="card sendbox ' + (docState.checked ? '' : 'locked') + '"><h2>Kirim ke pelanggan</h2>' +
(o.wa ? '<a class="btn primary block" data-guard target="_blank" rel="noopener" href="' + waLink(o.wa, notaText(o, kind)) + '">Kirim teks ke WA ' + esc(o.wa) + '</a>' : '<p class="muted small">Nomor WA pelanggan belum diisi.</p>') +
(STANDALONE && navigator.canShare ? '<button class="btn primary block" data-guard data-act="share-img" data-kind="' + kind + '">Bagikan gambar nota (WA, dll.)</button>' : '') + '<button class="btn block" data-guard data-act="save-img" data-kind="' + kind + '">Simpan gambar nota (PNG)</button><button class="btn ghost block" data-guard data-act="copy-nota" data-kind="' + kind + '">Salin teks nota</button>' +
'<p class="muted small">Kirim teks lewat WA, lalu lampirkan gambar nota yang sudah disimpan bila perlu.</p></section>' +
(kind === 'nota' ? '<section class="card"><label class="check"><input type="checkbox" data-act="ok-pel-toggle" ' + (o.okPelanggan ? 'checked' : '') + '> Pelanggan sudah membalas OK (aman untuk potong kain)</label></section>' : '') +
'<div class="doc-btns"><a class="btn ghost" href="#' + (kind === 'nota' ? 'kuitansi' : 'nota') + '-' + o.id + '">Lihat ' + (kind === 'nota' ? 'kuitansi' : 'nota') + '</a></div></aside></div>';
setTimeout(() => { const img = $('#docImg'); if (img) (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { img.src = drawDoc(o, kind).toDataURL('image/png'); }); }, 0);
return html;
}
function vKas() {
const k = filt.kasM || ym(today());
const rows = cash().filter(c => ym(c.tgl) === k && (filt.kasT === 'semua' || c.tipe === filt.kasT)).reverse();
const m = monthSum(k);
const months = [...new Set(cash().map(c => ym(c.tgl)).concat([ym(today())]))].sort().reverse();
let html = head('Buku kas', 'Semua uang masuk & keluar', '<button class="btn ghost" data-act="kas-new" data-tipe="keluar">− Pengeluaran</button><button class="btn primary" data-act="kas-new" data-tipe="masuk">+ Pemasukan</button>');
html += '<div class="toolbar"><select class="input sel" data-filter="kasM">' + months.map(x => '<option value="' + x + '" ' + (x === k ? 'selected' : '') + '>' + ymLabel(x) + '</option>').join('') + '</select><div class="seg sm">' + [['semua', 'Semua'], ['masuk', 'Masuk'], ['keluar', 'Keluar']].map(t => '<button class="' + (filt.kasT === t[0] ? 'on' : '') + '" data-act="kasT" data-v="' + t[0] + '">' + t[1] + '</button>').join('') + '</div></div>';
html += '<div class="kpis"><div class="kpi card"><span>Masuk</span><b class="in">' + rp(m.i) + '</b></div><div class="kpi card"><span>Keluar</span><b class="out">' + rp(m.o) + '</b></div><div class="kpi card"><span>Bersih</span><b>' + rp(m.i - m.o) + '</b></div><div class="kpi card"><span>Saldo akhir</span><b>' + rp(saldoTo(endOf(k))) + '</b></div></div>';
html += '<section class="card">' + (rows.length ? '<ul class="list">' + rows.map(cashRow).join('') + '</ul>' : '<p class="muted pad">Belum ada transaksi di ' + ymLabel(k) + '.</p>') + '</section>';
return html;
}
const endOf = k => { const [y, m] = k.split('-').map(Number); return k + '-' + String(new Date(y, m, 0).getDate()).padStart(2, '0'); };
function kasEdit(c) {
const isNew = false; c = c || { id: uid(), tgl: today(), tipe: 'keluar', kategori: '', ket: '', nominal: 0, dompet: 'tunai' };
const kats = c.tipe === 'masuk' ? KAT_MASUK : KAT_KELUAR;
const linked = c.orderId && S.data.orders[c.orderId];
const w = modal('<h3 class="m-title">' + (isNew ? (c.tipe === 'masuk' ? 'Catat pemasukan' : 'Catat pengeluaran') : 'Ubah transaksi') + '</h3>' +
(linked ? '<p class="muted small">Pembayaran untuk pesanan ' + esc(linked.no) + ' · ' + esc(linked.nama) + '</p>' : '') +
'<div class="seg">' + ['masuk', 'keluar'].map(t => '<button type="button" class="' + (c.tipe === t ? 'on' : '') + '" data-k="tipe" data-v="' + t + '"' + (linked ? ' disabled' : '') + '>' + (t === 'masuk' ? 'Pemasukan' : 'Pengeluaran') + '</button>').join('') + '</div>' +
'<div class="fgrid"><label class="field span2"><span>Nominal</span><input class="input money big-in" id="kNom" inputmode="numeric" value="' + (num(c.nominal) ? num(c.nominal).toLocaleString('id-ID') : '') + '" placeholder="Rp0"></label>' +
'<label class="field"><span>Tanggal</span><input class="input" type="date" id="kTgl" value="' + c.tgl + '"></label>' +
'<label class="field"><span>Dompet</span><select class="input" id="kDom">' + DOMPET.map(x => '<option value="' + x.k + '" ' + (c.dompet === x.k ? 'selected' : '') + '>' + x.l + '</option>').join('') + '</select></label>' +
'<label class="field span2"><span>Kategori</span><select class="input" id="kKat">' + kats.map(x => '<option ' + (c.kategori === x ? 'selected' : '') + '>' + x + '</option>').join('') + '</select></label>' +
'<label class="field span2"><span>Keterangan</span><input class="input" id="kKet" value="' + esc(c.ket) + '" placeholder="Contoh: kain satin 3 m"></label></div>' +
'<div class="m-actions">' + (!isNew ? '<button class="btn ghost danger" data-k="del">Hapus</button>' : '') + '<span class="sp"></span><button class="btn ghost" data-k="no">Batal</button><button class="btn primary" data-k="ok">Simpan</button></div>');
w.addEventListener('click', async e => {
const b = e.target.closest('[data-k]'); if (!b) return;
if (b.dataset.k === 'tipe') { if (c.tipe !== b.dataset.v) { c = { ...c, tipe: b.dataset.v, kategori: '', nominal: num($('#kNom').value), ket: $('#kKet').value, tgl: $('#kTgl').value, dompet: $('#kDom').value }; kasEdit(c); } return; }
if (b.dataset.k === 'no') return closeModal();
if (b.dataset.k === 'del') { closeModal(); if (await confirmBox('Hapus transaksi?', 'Transaksi ' + rp(c.nominal) + ' akan dihapus dari buku kas' + (linked ? ' dan pembayaran pesanan ' + esc(linked.no) + ' ikut berkurang' : '') + '.', 'Hapus', true)) { await S.del('cash', c.id); toast('Transaksi dihapus.'); } return; }
if (b.dataset.k === 'ok') {
const n = num($('#kNom').value); if (n <= 0) { toast('Isi nominal.'); return; }
const obj = { ...c, nominal: n, tgl: $('#kTgl').value || today(), dompet: $('#kDom').value, kategori: $('#kKat').value, ket: $('#kKet').value.trim(), t: c.t || Date.now() };
closeModal(); await S.put('cash', obj); toast('Tersimpan.');
}
});
}
function vLaporan() {
const k = filt.lapM || ym(today());
const months = [...new Set(cash().map(c => ym(c.tgl)).concat(orders().map(o => ym(o.tgl))).concat([ym(today())]))].sort().reverse();
const start = k + '-01', end = endOf(k);
const saldoAwal = saldoTo(addDays(start, -1)), m = monthSum(k), saldoAkhir = saldoTo(end);
const rows = cash().filter(c => ym(c.tgl) === k);
const byKat = t => { const o = {}; rows.filter(c => c.tipe === t).forEach(c => o[c.kategori] = (o[c.kategori] || 0) + num(c.nominal)); return Object.entries(o).sort((a, b) => b[1] - a[1]); };
const kin = byKat('masuk'), kout = byKat('keluar');
const maxK = Math.max(1, ...kin.map(x => x[1]), ...kout.map(x => x[1]));
const os = orders().filter(o => ym(o.tgl) === k);
const omzet = os.reduce((s, o) => s + oTotal(o), 0);
const piut = orders().filter(o => oSisa(o) > 0);
// harian
const days = {}; rows.forEach(c => { const d = days[c.tgl] || (days[c.tgl] = { i: 0, o: 0 }); if (c.tipe === 'masuk') d.i += num(c.nominal); else d.o += num(c.nominal); });
let run = saldoAwal; const daily = Object.keys(days).sort().map(d => { run += days[d].i - days[d].o; return { d, ...days[d], s: run }; });
const dompetRows = DOMPET.map(d => ({ l: d.l, a: saldoTo(addDays(start, -1), d.k), z: saldoTo(end, d.k) }));
let html = head('Laporan keuangan', 'Arus kas, pemasukan, pengeluaran & piutang', '<select class="input sel" data-filter="lapM">' + months.map(x => '<option value="' + x + '" ' + (x === k ? 'selected' : '') + '>' + ymLabel(x) + '</option>').join('') + '</select>');
html += '<div class="toolbar end"><button class="btn ghost" data-act="csv" data-m="' + k + '">Ekspor kas (CSV/Excel)</button><button class="btn ghost" data-act="csv-orders">Ekspor pesanan (CSV)</button><button class="btn primary" data-act="lap-wa" data-m="' + k + '">Kirim ringkasan ke WA</button></div>';
html += '<section class="card flowcard"><h2>Arus kas · ' + ymLabel(k) + '</h2><div class="flow"><div><span>Saldo awal</span><b>' + rp(saldoAwal) + '</b></div><i>+</i><div><span>Uang masuk</span><b class="in">' + rp(m.i) + '</b></div><i>−</i><div><span>Uang keluar</span><b class="out">' + rp(m.o) + '</b></div><i>=</i><div class="end"><span>Saldo akhir</span><b>' + rp(saldoAkhir) + '</b></div></div>' +
'<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Dompet</th><th>Saldo awal</th><th>Saldo akhir</th></tr></thead><tbody>' + dompetRows.map(r => '<tr><td>' + r.l + '</td><td>' + rp(r.a) + '</td><td><b>' + rp(r.z) + '</b></td></tr>').join('') + '</tbody></table></div></section>';
html += '<div class="grid2"><section class="card"><div class="card-h"><h2>Tren 6 bulan</h2></div><div class="chart-box"><canvas id="cFlow2"></canvas></div></section>' +
'<section class="card"><div class="card-h"><h2>Per kategori</h2></div>' + (kin.length + kout.length ? '<div class="hbars">' + kin.map(x => hbar(x, maxK, 'in')).join('') + kout.map(x => hbar(x, maxK, 'out')).join('') + '</div>' : '<p class="muted pad">Belum ada transaksi.</p>') + '</section></div>';
html += '<div class="kpis"><div class="kpi card"><span>Pesanan bulan ini</span><b>' + os.length + '</b></div><div class="kpi card"><span>Nilai pesanan</span><b>' + rp(omzet) + '</b></div><div class="kpi card"><span>Laba kas (masuk − keluar)</span><b class="' + (m.i - m.o >= 0 ? 'in' : 'out') + '">' + rp(m.i - m.o) + '</b></div><div class="kpi card"><span>Total piutang</span><b>' + rp(piut.reduce((s, o) => s + oSisa(o), 0)) + '</b></div></div>';
html += '<section class="card"><div class="card-h"><h2>Rincian harian</h2></div>' + (daily.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tanggal</th><th>Masuk</th><th>Keluar</th><th>Saldo</th></tr></thead><tbody>' + daily.map(r => '<tr><td>' + tgl(r.d) + '</td><td class="in">' + (r.i ? rp(r.i) : '—') + '</td><td class="out">' + (r.o ? rp(r.o) : '—') + '</td><td><b>' + rp(r.s) + '</b></td></tr>').join('') + '</tbody></table></div>' : '<p class="muted pad">—</p>') + '</section>';
html += '<section class="card"><div class="card-h"><h2>Piutang (belum lunas)</h2></div>' + (piut.length ? '<ul class="list">' + piut.map(o => '<li><a class="row" href="#order-' + o.id + '"><div class="row-m"><b>' + esc(o.nama) + '</b><small>' + esc(o.no) + ' · ' + tgl(o.tgl) + ' · ' + stLabel(o.status) + '</small></div><div class="row-r"><b class="out">' + rp(oSisa(o)) + '</b><small>dari ' + rp(oTotal(o)) + '</small></div></a></li>').join('') + '</ul>' : '<p class="muted pad">Semua pesanan sudah lunas.</p>') + '</section>';
return html;
}
const hbar = (x, max, t) => '<div class="hb"><span>' + esc(x[0]) + '</span><div class="hb-t"><i class="' + t + '" style="width:' + Math.max(2, x[1] / max * 100) + '%"></i></div><b class="' + t + '">' + rpShort(x[1]) + '</b></div>';
function csvCell(v) { v = String(v ?? ''); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function vPelanggan() {
const q = filt.custQ.toLowerCase();
const list = customers().filter(c => !q || (c.nama + ' ' + c.wa).toLowerCase().includes(q));
let html = head('Pelanggan', customers().length + ' pelanggan', '');
html += '<div class="toolbar"><input class="input search" placeholder="Cari nama atau WA…" value="' + esc(filt.custQ) + '" data-filter="custQ"></div>';
if (!list.length) return html + empty('Pelanggan tersimpan otomatis setiap kali Anda mencatat pesanan.');
html += '<div class="ocards">' + list.map(c => { const os = custOrders(c.id); const spent = os.reduce((s, o) => s + oTotal(o), 0); const debt = os.reduce((s, o) => s + oSisa(o), 0); return '<a class="ocard card" href="#cust-' + c.id + '"><div class="avatar">' + esc(c.nama.trim().charAt(0).toUpperCase()) + '</div><b class="oc-name">' + esc(c.nama) + '</b><p class="muted small">' + esc(c.wa || 'WA belum ada') + '</p><div class="oc-bot"><small class="muted">' + os.length + ' pesanan · ' + rpShort(spent) + '</small>' + (debt > 0 ? '<span class="badge pay-no">Sisa ' + rpShort(debt) + '</span>' : '') + '</div></a>'; }).join('') + '</div>';
return html;
}
function vCust() {
const c = S.data.customers[route.id]; if (!c) return empty('Pelanggan tidak ditemukan.');
const os = custOrders(c.id);
let html = head(esc(c.nama), esc(c.wa || ''), '<a href="#pelanggan" class="btn ghost">← Pelanggan</a>');
html += '<div class="grid2"><section class="card"><div class="card-h"><h2>Data</h2></div><div class="fgrid">' +
'<label class="field"><span>Nama</span><input class="input" id="cNama" value="' + esc(c.nama) + '"></label><label class="field"><span>WhatsApp</span><input class="input" id="cWa" value="' + esc(c.wa) + '"></label>' +
'<label class="field span2"><span>Alamat</span><input class="input" id="cAl" value="' + esc(c.alamat || '') + '"></label><label class="field span2"><span>Catatan (preferensi, alergi bahan, dsb.)</span><textarea class="input" id="cCat" rows="2">' + esc(c.catatan || '') + '</textarea></label></div>' +
'<div class="doc-btns"><button class="btn primary" data-act="cust-save">Simpan</button>' + (c.wa ? '<a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/' + waNum(c.wa) + '">Chat WA</a>' : '') + '<button class="btn ghost" data-act="cust-order">+ Pesanan untuk ' + esc(c.nama.split(' ')[0]) + '</button></div></section>' +
'<section class="card"><div class="card-h"><h2>Ukuran tersimpan</h2></div>' + (Object.keys(c.ukuran || {}).length ? Object.entries(c.ukuran).map(([k, u]) => '<div class="ukbox"><b>' + esc(k) + '</b><small class="muted">' + tgl(u._tgl) + '</small><div class="uk-s">' + Object.entries(u).filter(([kk]) => kk !== '_tgl').map(([kk, v]) => '<span>' + esc(kk) + ' <b>' + esc(v) + '</b></span>').join('') + '</div></div>').join('') : '<p class="muted pad">Belum ada ukuran.</p>') + '</section></div>';
html += '<section class="card"><div class="card-h"><h2>Riwayat pesanan</h2></div>' + (os.length ? '<ul class="list">' + os.map(o => '<li><a class="row" href="#order-' + o.id + '"><div class="row-m"><b>' + esc(o.no) + '</b><small>' + tgl(o.tgl) + ' · ' + esc(o.items.map(i => i.layanan || i.kategori).join(', ')) + '</small></div><div class="row-r"><b>' + rp(oTotal(o)) + '</b><small>' + (isLunas(o) ? 'Lunas' : 'Sisa ' + rp(oSisa(o))) + '</small></div></a></li>').join('') + '</ul>' : '<p class="muted pad">—</p>') + '</section>';
return html;
}
function vAtur() {
const s = S.set;
let html = head('Pengaturan', 'Profil usaha, daftar harga, keamanan & data', '');
html += '<div class="grid2"><section class="card"><div class="card-h"><h2>Profil usaha (tampil di nota)</h2></div><div class="fgrid">' +
'<label class="field span2"><span>Nama usaha</span><input class="input" data-s="nama" value="' + esc(s.nama) + '"></label>' +
'<label class="field span2"><span>Tagline</span><input class="input" data-s="tagline" value="' + esc(s.tagline) + '"></label>' +
'<label class="field span2"><span>Alamat</span><input class="input" data-s="alamat" value="' + esc(s.alamat) + '" placeholder="Alamat workshop"></label>' +
'<label class="field"><span>WhatsApp usaha</span><input class="input" data-s="wa" value="' + esc(s.wa) + '"></label>' +
'<label class="field"><span>Info pembayaran</span><input class="input" data-s="rekening" value="' + esc(s.rekening) + '" placeholder="Bank … a.n. …"></label>' +
'<label class="field span2"><span>Catatan di nota pesanan</span><textarea class="input" rows="2" data-s="catatanNota">' + esc(s.catatanNota) + '</textarea></label>' +
'<label class="field span2"><span>Ucapan di kuitansi</span><input class="input" data-s="terimakasih" value="' + esc(s.terimakasih) + '"></label></div>' +
'<div class="doc-btns"><button class="btn primary" data-act="save-set">Simpan profil</button></div></section>' +
'<section class="card"><div class="card-h"><h2>Saldo awal & keamanan</h2></div><p class="muted small">Isi uang yang sudah ada sebelum mulai memakai buku ini.</p><div class="fgrid">' +
DOMPET.map(d => '<label class="field"><span>Saldo awal ' + d.l + '</span><input class="input money" inputmode="numeric" data-sa="' + d.k + '" value="' + (num((s.saldoAwal || {})[d.k]) ? num(s.saldoAwal[d.k]).toLocaleString('id-ID') : '') + '" placeholder="0"></label>').join('') +
'<label class="field"><span>PIN untuk menghapus data</span><input class="input" type="password" inputmode="numeric" id="pinSet" placeholder="' + (s.pin ? '•••• (sudah diatur)' : 'Kosong = tanpa PIN') + '" autocomplete="new-password"></label></div>' +
'<div class="doc-btns"><button class="btn primary" data-act="save-saldo">Simpan</button></div>' +
'<p class="muted small sync-note">' + (S.mode === 'cloud' ? '✓ Data tersimpan di akun Claude Anda — buka tautan yang sama di komputer atau HP (masuk dengan akun yang sama) dan datanya ikut.' : (STANDALONE ? 'Data tersimpan di perangkat ini saja (tidak ikut ke HP/komputer lain). Unduh backup minimal seminggu sekali; untuk pindah perangkat, unduh backup lalu “Pulihkan dari backup” di perangkat baru.' : 'Mode lokal: data hanya tersimpan di peramban ini. Buka halaman ini dari tautan artifact claude.ai agar tersinkron antara komputer & HP. Rajin unduh backup.')) + '</p></section></div>';
const pref = getPref();
html += '<section class="card"><div class="card-h"><h2>Tampilan</h2></div><div class="seg modeseg">' + [['light', 'Terang'], ['dark', 'Gelap'], ['auto', 'Ikuti perangkat']].map(m => '<button class="' + (pref === m[0] ? 'on' : '') + '" data-act="mode-set" data-v="' + m[0] + '">' + m[1] + '</button>').join('') + '</div><p class="muted small" style="margin-top:10px">Pilihan tampilan disimpan di perangkat ini. Nota & kuitansi tetap dicetak di kertas terang.</p></section>';
// daftar harga
const pl = prices();
html += '<section class="card"><div class="card-h"><h2>Daftar harga</h2><div class="btns">' + (!pl.length ? '<button class="btn ghost sm" data-act="price-example">Isi contoh (ubah sesuai harga Anda)</button>' : '') + '<button class="btn primary sm" data-act="price-new">+ Harga</button></div></div>' +
'<p class="muted small">Nota mengambil harga dari sini dan terkunci, jadi harga yang dikirim ke pelanggan selalu sama dengan daftar. Harga di luar daftar wajib diberi alasan dan tampil sebagai peringatan sebelum dikirim.</p>' +
(pl.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Jenis</th><th>Kategori</th><th>Layanan</th><th>Harga</th><th></th></tr></thead><tbody>' + pl.map(p => '<tr><td>' + esc(p.jenis) + '</td><td>' + esc(p.kategori) + '</td><td>' + esc(p.layanan) + '</td><td><b>' + rp(p.harga) + '</b></td><td><button class="link" data-act="price-edit" data-id="' + p.id + '">Ubah</button></td></tr>').join('') + '</tbody></table></div>' : '<p class="muted pad">Belum ada harga.</p>') + '</section>';
html += '<section class="card"><div class="card-h"><h2>Data & cadangan</h2></div><div class="doc-btns"><button class="btn" data-act="backup">Unduh backup (.json)</button><label class="btn ghost">Pulihkan dari backup<input type="file" accept=".json,application/json" id="restoreIn" hidden></label><button class="btn ghost" data-act="demo">Muat data contoh</button><button class="btn ghost danger" data-act="wipe">Hapus semua data</button></div><p class="muted small">Ekspor laporan ke Excel ada di menu Laporan.</p></section>';
return html;
}
function priceForm(p) {
const isNew = !p; p = p || { id: uid(), jenis: 'Jahit Baru', kategori: 'Kebaya', layanan: '', harga: 0 };
const w = modal('<h3 class="m-title">' + (isNew ? 'Tambah harga' : 'Ubah harga') + '</h3><div class="fgrid">' +
'<label class="field"><span>Jenis</span><select class="input" id="pJ">' + ['Jahit Baru', 'Permak'].map(j => '<option ' + (p.jenis === j ? 'selected' : '') + '>' + j + '</option>').join('') + '</select></label>' +
'<label class="field"><span>Kategori</span><select class="input" id="pK">' + KATEGORI.map(k => '<option ' + (p.kategori === k ? 'selected' : '') + '>' + k + '</option>').join('') + '</select></label>' +
'<label class="field span2"><span>Nama layanan</span><input class="input" id="pL" value="' + esc(p.layanan) + '" placeholder="Contoh: Kebaya brokat full payet"></label>' +
'<label class="field span2"><span>Harga</span><input class="input money big-in" id="pH" inputmode="numeric" value="' + (num(p.harga) ? num(p.harga).toLocaleString('id-ID') : '') + '"></label></div>' +
'<div class="m-actions">' + (!isNew ? '<button class="btn ghost danger" data-k="del">Hapus</button>' : '') + '<span class="sp"></span><button class="btn ghost" data-k="no">Batal</button><button class="btn primary" data-k="ok">Simpan</button></div>');
w.addEventListener('click', async e => {
const b = e.target.closest('[data-k]'); if (!b) return;
if (b.dataset.k === 'no') return closeModal();
if (b.dataset.k === 'del') { closeModal(); if (await confirmBox('Hapus harga?', esc(p.layanan) + ' akan dihapus dari daftar. Nota lama tidak berubah.', 'Hapus', true)) S.del('prices', p.id); return; }
const o = { ...p, jenis: $('#pJ').value, kategori: $('#pK').value, layanan: $('#pL').value.trim(), harga: num($('#pH').value) };
if (!o.layanan || !o.harga) { toast('Isi nama layanan dan harga.'); return; }
closeModal(); await S.put('prices', o); toast('Harga tersimpan.');
});
}
async function loadDemo() {
if (!(await confirmBox('Muat data contoh?', 'Pesanan, pelanggan, transaksi, dan daftar harga contoh akan ditambahkan (ditandai “contoh”). Anda bisa menghapusnya lewat “Hapus semua data”.', 'Muat'))) return;
const pid = {}; for (const p of PRICE_EXAMPLE) { const id = uid(); pid[p[2]] = id; await S.put('prices', { id, jenis: p[0], kategori: p[1], layanan: p[2], harga: p[3] }); }
const P = n => S.data.prices[pid[n]];
const t = today(); const mk = (d) => addDays(t, d);
const custs = [['Bu Ratna (contoh)', '081244441212'], ['Mbak Sinta (contoh)', '081377778888'], ['Pak Budi (contoh)', '081299990000'], ['Nadia (contoh)', '085711112222']].map(([nama, wa]) => ({ id: uid(), nama, wa, alamat: '', catatan: '', ukuran: {} }));
custs[0].ukuran['Kebaya'] = { 'Lingkar Dada': '92', 'Lingkar Pinggang': '76', 'Lebar Bahu': '38', 'Panjang Baju': '62', 'Panjang Lengan': '55', _tgl: mk(-40) };
for (const c of custs) await S.put('customers', c);
const ords = [
[custs[0], [['Kebaya payet / brokat full', 1]], -40, 'diambil', [[-40, 300000, 'DP', 'bank'], [-30, 350000, 'Pelunasan', 'tunai']]],
[custs[1], [['Gaun pesta / evening gown', 1]], -20, 'jahit', [[-20, 400000, 'DP', 'qris']]],
[custs[2], [['Kecilkan / besarkan badan', 2], ['Potong / pendek celana', 1]], -3, 'siap', [[-3, 50000, 'DP', 'tunai']]],
[custs[3], [['Kebaya modern (tanpa payet)', 1], ['Rok', 1]], -1, 'potong', [[-1, 200000, 'DP', 'bank']]],
[custs[0], [['Gamis', 2]], 0, 'antre', []]];
let no = 1;
for (const [c, its, d, st, pays] of ords) {
const o = { id: uid(), no: 'RJ-' + String(no++).padStart(4, '0'), tgl: mk(d), custId: c.id, nama: c.nama, wa: c.wa, bahan: 'Dari pelanggan', tglAmbil: mk(d + 10), status: st, catatan: '', diskon: 0, okPelanggan: d < 0, createdAt: Date.now() + no, items: its.map(([n, q]) => { const p = P(n); return { id: uid(), jenis: p.jenis, kategori: p.kategori, priceId: p.id, layanan: p.layanan, qty: q, harga: p.harga, hargaList: p.harga, khusus: false, alasan: '', ukuran: p.kategori === 'Kebaya' && c === custs[0] ? { ...custs[0].ukuran.Kebaya, _tgl: undefined } : {}, catatan: '' }; }) };
o.items.forEach(i => delete i.ukuran._tgl);
await S.put('orders', o);
for (const [pd, n, kind, dom] of pays) await S.put('cash', { id: uid(), tgl: mk(pd), t: Date.now(), tipe: 'masuk', kategori: 'Pembayaran pesanan', ket: kind + ' ' + o.no + ' · ' + o.nama, nominal: n, dompet: dom, orderId: o.id, payKind: kind });
}
const outs = [[-45, 'Bahan & kain', 'Kain satin & furing (contoh)', 450000, 'bank'], [-35, 'Listrik & air', 'Token listrik (contoh)', 200000, 'bank'], [-25, 'Benang & aksesoris', 'Benang, resleting, payet (contoh)', 175000, 'tunai'], [-15, 'Upah penjahit', 'Upah mingguan (contoh)', 600000, 'bank'], [-5, 'Bahan & kain', 'Brokat 2 m (contoh)', 260000, 'qris'], [-60, 'Jasa lain', 'Jahit seragam kantor (contoh)', 1500000, 'bank']];
for (const [d, kat, ket, n, dom] of outs) await S.put('cash', { id: uid(), tgl: mk(d), t: Date.now(), tipe: kat === 'Jasa lain' ? 'masuk' : 'keluar', kategori: kat, ket, nominal: n, dompet: dom });
toast('Data contoh dimuat.');
}
function render() {
const app = $('#app'); if (!app) return;
if (!S.ready && S.mode === 'cloud') { app.innerHTML = shell('<div class="loading">' + logoSVG('logo') + '<p>Membuka buku…</p></div>'); return; }
// jangan rerender form yang sedang diketik
const ae = document.activeElement;
if ((route.v === 'baru' || route.v === 'edit') && $('#oform') && ae && ae.closest && ae.closest('#oform') && !render._force) { refreshSum(); return; }
render._force = false;
let c = '';
switch (route.v) {
case 'beranda': c = vBeranda(); break;
case 'pesanan': c = vPesanan(); break;
case 'baru': c = vForm(false); break;
case 'edit': c = vForm(true); break;
case 'order': c = vOrder(); break;
case 'nota': c = vDoc('nota'); break;
case 'kuitansi': c = vDoc('kuitansi'); break;
case 'kas': c = vKas(); break;
case 'laporan': c = vLaporan(); break;
case 'pelanggan': c = vPelanggan(); break;
case 'cust': c = vCust(); break;
case 'atur': c = vAtur(); break;
default: c = vBeranda();
}
const y = window.scrollY;
document.body.classList.toggle('on-form', route.v === 'baru' || route.v === 'edit');
app.innerHTML = shell(c);
window.scrollTo(0, y);
if (route.v === 'beranda') drawFlowChart('cFlow', lastMonths(6));
if (route.v === 'laporan') drawFlowChart('cFlow2', lastMonths(6, filt.lapM || ym(today())));
}
function forceRender() { render._force = true; render(); }
function moneyFmt(el) { const n = num(el.value); const pos = el.value.length - el.selectionStart; el.value = n ? n.toLocaleString('id-ID') : ''; try { const p = Math.max(0, el.value.length - pos); el.setSelectionRange(p, p); } catch (e) {} }
document.addEventListener('input', e => {
const el = e.target;
if (el.classList.contains('money')) moneyFmt(el);
if (el.dataset.filter) { filt[el.dataset.filter] = el.value; const pos = el.selectionStart; forceRender(); const n = $('[data-filter="' + el.dataset.filter + '"]'); if (n && n.tagName === 'INPUT') { n.focus(); n.setSelectionRange(pos, pos); } return; }
if (!draft || !el.closest('#oform')) return;
if (el.dataset.d) { draft[el.dataset.d] = el.classList.contains('money') ? num(el.value) : el.value; if (el.dataset.d === 'nama') showSugg(el.value); if (el.dataset.d === 'nama' || el.dataset.d === 'wa') { if (draft.custId && el.dataset.d === 'nama') { const c = S.data.customers[draft.custId]; if (c && c.nama !== el.value) draft.custId = ''; } } }
const it = el.dataset.idx != null && draft.items[+el.dataset.idx];
if (it && el.dataset.i && el.type !== 'checkbox' && el.tagName !== 'SELECT') it[el.dataset.i] = el.classList.contains('money') || el.dataset.i === 'qty' ? num(el.value) : el.value;
if (it && el.dataset.u) it.ukuran[el.dataset.u] = el.value;
refreshSum();
});
document.addEventListener('change', e => {
const el = e.target;
if (el.dataset.filter && el.tagName === 'SELECT') { filt[el.dataset.filter] = el.value; forceRender(); return; }
if (el.id === 'restoreIn' && el.files[0]) return restore(el.files[0]);
if (el.id === 'chkOk') { docState.checked = el.checked; const sb = $('.sendbox'); if (sb) sb.classList.toggle('locked', !el.checked); return; }
if (el.dataset.act === 'ok-pel-toggle') { const o = S.data.orders[route.id]; if (o) S.put('orders', { ...o, okPelanggan: el.checked }); return; }
if (!draft || !el.closest('#oform')) return;
if (el.dataset.d && el.tagName === 'SELECT') draft[el.dataset.d] = el.value;
const idx = el.dataset.idx; if (idx == null) return; const it = draft.items[+idx];
if (el.dataset.i === 'priceId') { it.priceId = el.value; const p = S.data.prices[el.value]; if (p) { it.harga = p.harga; it.layanan = p.layanan; it.kategori = p.kategori === 'Lainnya' && it.jenis === 'Permak' ? it.kategori : p.kategori; it.khusus = false; it.alasan = ''; } else { it.layanan = ''; } forceRender(); }
if (el.dataset.i === 'khusus') { it.khusus = el.checked; if (!el.checked) { const p = S.data.prices[it.priceId]; if (p) it.harga = p.harga; it.alasan = ''; } forceRender(); }
});
document.addEventListener('submit', e => { if (e.target.id === 'oform') { e.preventDefault(); submitOrder(); } });
function showSugg(v) {
const box = $('#sugg'); if (!box) return; v = v.trim().toLowerCase();
const hits = v.length < 2 ? [] : customers().filter(c => c.nama.toLowerCase().includes(v) || (c.wa || '').includes(v)).slice(0, 5);
box.innerHTML = hits.map(c => '<button type="button" data-act="pick-cust" data-id="' + c.id + '"><b>' + esc(c.nama) + '</b><small>' + esc(c.wa || '') + ' · ' + custOrders(c.id).length + ' pesanan</small></button>').join('');
box.classList.toggle('on', hits.length > 0);
}
document.addEventListener('click', async e => {
const g = e.target.closest('[data-guard]');
if (g && !docState.checked) { e.preventDefault(); toast('Centang dulu “sudah saya cek” sebelum mengirim.'); const c = $('#chkOk'); if (c) c.closest('.card').classList.add('pulse'); return; }
const b = e.target.closest('[data-act]'); if (!b) return;
const a = b.dataset.act, idx = b.dataset.idx != null ? +b.dataset.idx : null;
const it = draft && idx != null ? draft.items[idx] : null;
switch (a) {
case 'demo': return loadDemo();
case 'mode-toggle': return setPref(effMode() === 'dark' ? 'light' : 'dark');
case 'mode-set': return setPref(b.dataset.v);
case 'fstatus': filt.status = b.dataset.v; return forceRender();
case 'kasT': filt.kasT = b.dataset.v; return forceRender();
case 'kas-new': return kasFormNew({ id: uid(), tgl: today(), tipe: b.dataset.tipe || 'keluar', kategori: '', ket: '', nominal: 0, dompet: 'tunai' });
case 'kas-edit': return kasForm(S.data.cash[b.dataset.id]);
case 'add-item': draft.items.push(newItem()); return forceRender();
case 'rm-item': draft.items.splice(idx, 1); return forceRender();
case 'it-jenis': it.jenis = b.dataset.v; it.priceId = ''; it.harga = 0; it.layanan = ''; it.khusus = false; if (it.jenis === 'Permak') it.ukuran = {}; return forceRender();
case 'it-kat': it.kategori = b.dataset.v; if (it.priceId && S.data.prices[it.priceId] && S.data.prices[it.priceId].kategori !== it.kategori && it.jenis !== 'Permak') { it.priceId = ''; it.harga = 0; it.layanan = ''; } return forceRender();
case 'qty': it.qty = Math.max(1, num(it.qty) + num(b.dataset.v)); return forceRender();
case 'use-last': { const c = S.data.customers[draft.custId]; const u = c && c.ukuran[it.kategori]; if (u) { it.ukuran = Object.fromEntries(Object.entries(u).filter(([k]) => k !== '_tgl')); toast('Ukuran terakhir dipakai — cek ulang bila perlu.'); } return forceRender(); }
case 'pick-cust': { const c = S.data.customers[b.dataset.id]; draft.custId = c.id; draft.nama = c.nama; draft.wa = c.wa || ''; return forceRender(); }
case 'cancel-form': draft = null; return;
case 'set-status': { const o = S.data.orders[route.id]; await S.put('orders', { ...o, status: b.dataset.v, updatedAt: Date.now() }); toast('Status: ' + stLabel(b.dataset.v)); if (b.dataset.v === 'siap' && o.wa) { modal('<h3 class="m-title">Kabari pelanggan?</h3><p class="muted">Pesanan ' + esc(o.no) + ' siap diambil.</p><div class="m-actions"><button class="btn ghost" onclick="RJ.closeModal()">Nanti</button><a class="btn primary" target="_blank" rel="noopener" onclick="RJ.closeModal()" href="' + waLink(o.wa, 'Halo ' + o.nama + ', pesanan *' + o.no + '* di *' + S.set.nama + '* sudah *siap diambil* 🙏' + (oSisa(o) > 0 ? '\nSisa pembayaran: *' + rp(oSisa(o)) + '*.' : '') + '\nTerima kasih.') + '">Kirim WA</a></div>', { nofocus: true }); } return; }
case 'ok-pel': { const o = S.data.orders[route.id]; return S.put('orders', { ...o, okPelanggan: true }); }
case 'pay': case 'pay-full': {
const o = S.data.orders[route.id]; const sisa = oSisa(o);
const n = a === 'pay-full' ? sisa : num($('#payAmt').value); const dom = $('#payDompet') ? $('#payDompet').value : 'tunai';
if (n <= 0) { toast('Isi jumlah dibayar.'); return; }
if (n > sisa && !(await confirmBox('Lebih dari sisa tagihan?', 'Sisa tagihan ' + rp(sisa) + ', yang dicatat ' + rp(n) + '.', 'Tetap catat'))) return;
const kind = n >= sisa ? 'Pelunasan' : 'Cicilan';
await S.put('cash', { id: uid(), tgl: today(), t: Date.now(), tipe: 'masuk', kategori: 'Pembayaran pesanan', ket: kind + ' ' + o.no + ' · ' + o.nama, nominal: n, dompet: dom, orderId: o.id, payKind: kind });
toast(kind === 'Pelunasan' ? 'Lunas ✓ Kuitansi siap.' : 'Pembayaran dicatat.'); if (kind === 'Pelunasan') { docState.checked = false; go('kuitansi-' + o.id); } return;
}
case 'del-order': { const o = S.data.orders[route.id]; const pays = oPays(o); if (!(await confirmBox('Hapus pesanan ' + esc(o.no) + '?', 'Pesanan ' + esc(o.nama) + ' akan dihapus' + (pays.length ? ' beserta ' + pays.length + ' catatan pembayaran (' + rp(oPaid(o)) + ') di buku kas' : '') + '. Tindakan ini tidak bisa dibatalkan.', 'Hapus', true))) return; for (const p of pays) await S.del('cash', p.id); await S.del('orders', o.id); toast('Pesanan dihapus.'); return go('pesanan'); }
case 'save-img': { const o = S.data.orders[route.id]; const cv = drawDoc(o, b.dataset.kind); cv.toBlob(bl => saveFile((b.dataset.kind === 'kuitansi' ? 'Kuitansi-' : 'Nota-') + o.no + '-' + o.nama.replace(/[^\w]+/g, '_') + '.png', bl, 'image/png')); return; }
case 'share-img': { const o = S.data.orders[route.id]; const cv = drawDoc(o, b.dataset.kind); cv.toBlob(async bl => { const f = new File([bl], (b.dataset.kind === 'kuitansi' ? 'Kuitansi-' : 'Nota-') + o.no + '.png', { type: 'image/png' }); try { if (navigator.canShare({ files: [f] })) await navigator.share({ files: [f], text: notaText(o, b.dataset.kind) }); else saveFile(f.name, bl, 'image/png'); } catch (e) { if (e.name !== 'AbortError') saveFile(f.name, bl, 'image/png'); } }); return; }
case 'copy-nota': return copyText(notaText(S.data.orders[route.id], b.dataset.kind));
case 'setoran': return setoranWA();
case 'lap-wa': return copyOrWa(lapText(b.dataset.m));
case 'csv': { const k = b.dataset.m; const rows = [['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Dompet', 'No pesanan', 'Masuk', 'Keluar']].concat(cash().filter(c => ym(c.tgl) === k).map(c => [c.tgl, c.tipe, c.kategori, c.ket, dLabel(c.dompet), c.orderId && S.data.orders[c.orderId] ? S.data.orders[c.orderId].no : '', c.tipe === 'masuk' ? c.nominal : '', c.tipe === 'keluar' ? c.nominal : ''])); return saveFile('Kas-' + S.set.nama.replace(/\W+/g, '_') + '-' + k + '.csv', '﻿' + rows.map(r => r.map(csvCell).join(';')).join('\n'), 'text/csv'); }
case 'csv-orders': { const rows = [['No', 'Tanggal', 'Pelanggan', 'WA', 'Rincian', 'Status', 'Total', 'Dibayar', 'Sisa', 'Ambil']].concat(orders().map(o => [o.no, o.tgl, o.nama, o.wa, o.items.map(i => num(i.qty) + 'x ' + (i.layanan || i.kategori) + ' @' + i.harga).join(' | '), stLabel(o.status), oTotal(o), oPaid(o), oSisa(o), o.tglAmbil])); return saveFile('Pesanan-' + S.set.nama.replace(/\W+/g, '_') + '.csv', '﻿' + rows.map(r => r.map(csvCell).join(';')).join('\n'), 'text/csv'); }
case 'cust-save': { const c = S.data.customers[route.id]; await S.put('customers', { ...c, nama: $('#cNama').value.trim() || c.nama, wa: $('#cWa').value.trim(), alamat: $('#cAl').value.trim(), catatan: $('#cCat').value.trim() }); return toast('Pelanggan disimpan.'); }
case 'cust-order': { const c = S.data.customers[route.id]; draft = newDraft(); draft.custId = c.id; draft.nama = c.nama; draft.wa = c.wa || ''; return go('baru'); }
case 'save-set': { const p = {}; document.querySelectorAll('[data-s]').forEach(i => p[i.dataset.s] = i.value.trim()); await S.saveSet(p); return toast('Profil disimpan.'); }
case 'save-saldo': { const sa = {}; document.querySelectorAll('[data-sa]').forEach(i => sa[i.dataset.sa] = num(i.value)); const p = { saldoAwal: sa }; const pin = $('#pinSet').value.trim(); if (pin) { if (S.set.pin && !(await askPin())) return; p.pin = pin; } await S.saveSet(p); return toast('Disimpan.'); }
case 'price-new': return priceForm(null);
case 'price-edit': return priceForm(S.data.prices[b.dataset.id]);
case 'price-example': { for (const p of PRICE_EXAMPLE) await S.put('prices', { id: uid(), jenis: p[0], kategori: p[1], layanan: p[2], harga: p[3] }); return toast('Contoh harga dimuat — sesuaikan dengan harga Anda.'); }
case 'backup': return saveFile('Backup-BukuJahit-' + today() + '.json', JSON.stringify({ app: 'buku-jahit-rida', v: 1, at: new Date().toISOString(), set: S.set, ...S.data }, null, 1), 'application/json');
case 'wipe': { if (!(await confirmBox('Hapus semua data?', 'Semua pesanan, pelanggan, transaksi kas, dan daftar harga akan dihapus permanen. Unduh backup dulu bila perlu.', 'Hapus semua', true))) return; for (const c of COLS) for (const id of Object.keys(S.data[c])) await S.del(c, id); return toast('Semua data dihapus.'); }
}
});
function askPin() { return new Promise(res => { const w = modal('<h3 class="m-title">Masukkan PIN lama</h3><input class="input" type="password" inputmode="numeric" id="pinOld"><div class="m-actions"><button class="btn ghost" data-x="no">Batal</button><button class="btn primary" data-x="ok">Lanjut</button></div>'); w.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (!b) return; const ok = b.dataset.x === 'ok' && $('#pinOld').value === S.set.pin; if (b.dataset.x === 'ok' && !ok) { toast('PIN salah.'); return; } closeModal(); res(ok); }); }); }
function setoranWA() {
const t = today(); const rows = cash().filter(c => c.tgl === t);
const inn = rows.filter(c => c.tipe === 'masuk'), out = rows.filter(c => c.tipe === 'keluar');
const sum = a => a.reduce((s, c) => s + num(c.nominal), 0);
const L = ['*Rekap harian — ' + S.set.nama + '*', tglPanjang(t), '', 'Uang masuk: *' + rp(sum(inn)) + '*'];
DOMPET.forEach(d => { const v = sum(inn.filter(c => c.dompet === d.k)); if (v) L.push('  · ' + d.l + ': ' + rp(v)); });
inn.forEach(c => L.push('  - ' + (c.ket || c.kategori) + ': ' + rp(c.nominal)));
L.push('Uang keluar: *' + rp(sum(out)) + '*'); out.forEach(c => L.push('  - ' + (c.ket || c.kategori) + ': ' + rp(c.nominal)));
L.push('', 'Pesanan baru hari ini: ' + orders().filter(o => o.tgl === t).length, 'Diambil hari ini: ' + orders().filter(o => o.status === 'diambil' && (o.updatedAt && new Date(o.updatedAt).toISOString().slice(0, 10) === t)).length, 'Saldo kas: *' + rp(saldoTo(t)) + '*');
copyOrWa(L.join('\n'));
}
function lapText(k) {
const m = monthSum(k); const start = k + '-01';
return ['*Laporan kas ' + ymLabel(k) + ' — ' + S.set.nama + '*', '', 'Saldo awal: ' + rp(saldoTo(addDays(start, -1))), 'Uang masuk: ' + rp(m.i), 'Uang keluar: ' + rp(m.o), 'Saldo akhir: *' + rp(saldoTo(endOf(k))) + '*', '', 'Pesanan: ' + orders().filter(o => ym(o.tgl) === k).length, 'Piutang: ' + rp(orders().reduce((s, o) => s + oSisa(o), 0))].join('\n');
}
function copyOrWa(text) {
modal('<h3 class="m-title">Kirim ringkasan</h3><textarea class="input mono" rows="12" id="waTxt">' + esc(text) + '</textarea><label class="field"><span>Kirim ke nomor WA (opsional)</span><input class="input" id="waTo" inputmode="tel" placeholder="08xx…"></label><div class="m-actions"><button class="btn ghost" onclick="RJ.closeModal()">Tutup</button><button class="btn" id="waCopy">Salin</button><a class="btn primary" id="waGo" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(text) + '">Buka WhatsApp</a></div>', { nofocus: true });
const upd = () => { $('#waGo').href = ($('#waTo').value ? 'https://wa.me/' + waNum($('#waTo').value) : 'https://wa.me/') + '?text=' + encodeURIComponent($('#waTxt').value); };
$('#waTo').addEventListener('input', upd); $('#waTxt').addEventListener('input', upd); $('#waCopy').addEventListener('click', () => copyText($('#waTxt').value));
}
async function restore(file) {
try {
const j = JSON.parse(await file.text()); if (j.app !== 'buku-jahit-rida') { toast('File bukan backup Buku Jahit.'); return; }
if (!(await confirmBox('Pulihkan backup?', 'Data dari backup ' + esc((j.at || '').slice(0, 10)) + ' akan ditambahkan/menimpa data dengan ID yang sama.', 'Pulihkan'))) return;
for (const c of COLS) for (const o of Object.values(j[c] || {})) await S.put(c, o);
if (j.set) await S.saveSet(j.set); toast('Backup dipulihkan.');
} catch (e) { toast('Backup tidak bisa dibaca.'); }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('click', e => { if (!e.target.closest('#sugg') && !e.target.closest('[data-d="nama"]')) { const s = $('#sugg'); if (s) s.classList.remove('on'); } }, true);
function kasForm(c) {
if (c) return kasEdit(c);
const tpl = { id: uid(), tgl: today(), tipe: 'keluar', kategori: '', ket: '', nominal: 0, dompet: 'tunai' };
return kasFormNew(tpl);
}
function kasFormNew(c) {
const kats = c.tipe === 'masuk' ? KAT_MASUK : KAT_KELUAR;
const w = modal('<h3 class="m-title">' + (c.tipe === 'masuk' ? 'Catat pemasukan' : 'Catat pengeluaran') + '</h3>' +
'<div class="seg">' + ['masuk', 'keluar'].map(t => '<button type="button" class="' + (c.tipe === t ? 'on' : '') + '" data-k="tipe" data-v="' + t + '">' + (t === 'masuk' ? 'Pemasukan' : 'Pengeluaran') + '</button>').join('') + '</div>' +
'<div class="fgrid"><label class="field span2"><span>Nominal</span><input class="input money big-in" id="kNom" inputmode="numeric" value="' + (num(c.nominal) ? num(c.nominal).toLocaleString('id-ID') : '') + '" placeholder="Rp0"></label>' +
'<label class="field"><span>Tanggal</span><input class="input" type="date" id="kTgl" value="' + c.tgl + '"></label>' +
'<label class="field"><span>Dompet</span><select class="input" id="kDom">' + DOMPET.map(x => '<option value="' + x.k + '" ' + (c.dompet === x.k ? 'selected' : '') + '>' + x.l + '</option>').join('') + '</select></label>' +
'<label class="field span2"><span>Kategori</span><select class="input" id="kKat">' + kats.map(x => '<option ' + (c.kategori === x ? 'selected' : '') + '>' + x + '</option>').join('') + '</select></label>' +
'<label class="field span2"><span>Keterangan</span><input class="input" id="kKet" value="' + esc(c.ket) + '" placeholder="' + (c.tipe === 'masuk' ? 'Contoh: jual sisa kain' : 'Contoh: kain satin 3 m') + '"></label></div>' +
'<div class="m-actions"><span class="sp"></span><button class="btn ghost" data-k="no">Batal</button><button class="btn primary" data-k="ok">Simpan</button></div>');
w.addEventListener('click', async e => {
const b = e.target.closest('[data-k]'); if (!b) return;
const cur = { ...c, nominal: num($('#kNom').value), tgl: $('#kTgl').value || today(), dompet: $('#kDom').value, kategori: $('#kKat').value, ket: $('#kKet').value.trim() };
if (b.dataset.k === 'tipe') { if (cur.tipe !== b.dataset.v) { cur.tipe = b.dataset.v; cur.kategori = ''; kasFormNew(cur); } return; }
if (b.dataset.k === 'no') return closeModal();
if (b.dataset.k === 'ok') { if (cur.nominal <= 0) { toast('Isi nominal.'); return; } closeModal(); await S.put('cash', { ...cur, t: Date.now() }); toast('Tersimpan.'); }
});
}
window.RJ = { closeModal, S };
window.addEventListener('hashchange', () => { parseHash(); if (!['nota', 'kuitansi'].includes(route.v)) docState.checked = false; if (route.v !== 'baru' && route.v !== 'edit') draft = null; forceRender(); window.scrollTo(0, 0); });
if (STANDALONE && 'serviceWorker' in navigator && location.protocol === 'https:') window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
document.addEventListener('DOMContentLoaded', () => { applyMode(); parseHash(); render(); S.init(); });
})();