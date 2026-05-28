// ============================================================
// DATA — Events catalogue
// ============================================================
const EVENTS = [
  {
    id: 1, name: 'NOS Alive 2026', emoji: '🎸', type: 'Festival',
    date: '10 Jul 2026', city: 'Lisboa', location: 'Passeio Marítimo de Algés, Algés, Lisboa',
    lat: 38.6979, lng: -9.2310,
    price: 89, totalStock: 200,
    bg: '#1a0d2e',
    types: [{ name: 'Normal', price: 89 }, { name: 'VIP', price: 160 }],
    popularity: 1
  },
  {
    id: 2, name: 'Super Bock Super Rock', emoji: '🤘', type: 'Festival',
    date: '19 Jul 2026', city: 'Setúbal', location: 'Herdade do Cabeço da Flauta, Meco, Setúbal',
    lat: 38.4262, lng: -8.8687,
    price: 75, totalStock: 150,
    bg: '#0d1a1e',
    types: [{ name: 'Normal', price: 75 }, { name: 'VIP', price: 130 }],
    popularity: 2
  },
  {
    id: 3, name: 'Primavera Sound Porto', emoji: '🌸', type: 'Festival',
    date: '5 Jun 2026', city: 'Porto', location: 'Parque da Cidade do Porto, Porto',
    lat: 41.1720, lng: -8.6900,
    price: 120, totalStock: 80,
    bg: '#1a0a0a',
    types: [{ name: 'Normal', price: 120 }, { name: 'VIP', price: 200 }],
    popularity: 3
  },
  {
    id: 4, name: 'Noite de Fado', emoji: '🎭', type: 'Concerto',
    date: '22 Mai 2026', city: 'Lisboa', location: 'Coliseu dos Recreios, Rua das Portas de Santo Antão, Lisboa',
    lat: 38.7163, lng: -9.1395,
    price: 35, totalStock: 50,
    bg: '#0a0a1a',
    types: [{ name: 'Normal', price: 35 }],
    popularity: 5
  },
  {
    id: 5, name: 'Feira Medieval de Óbidos', emoji: '⚔️', type: 'Feira',
    date: '1 Ago 2026', city: 'Óbidos', location: 'Castelo de Óbidos, Óbidos, Leiria',
    lat: 39.3622, lng: -9.1573,
    price: 10, totalStock: 300,
    bg: '#1a1200',
    types: [{ name: 'Entrada Geral', price: 10 }],
    popularity: 6
  },
  {
    id: 6, name: 'Vodafone Paredes de Coura', emoji: '🏕️', type: 'Festival',
    date: '13 Ago 2026', city: 'Paredes de Coura', location: 'Praia fluvial do Taboão, Paredes de Coura, Viana do Castelo',
    lat: 41.9094, lng: -8.5620,
    price: 95, totalStock: 120,
    bg: '#0a1a0a',
    types: [{ name: 'Normal', price: 95 }, { name: 'VIP', price: 170 }],
    popularity: 4
  }
];

// ============================================================
// STATE
// ============================================================
let currentUser = null;
let currentFilter = 'Todos';
let selectedEvent = null;
let ticketQtys = {};
let histFilter = 'all';
let prevScreen = 'home';

// ============================================================
// STORAGE HELPERS
// ============================================================
function save(key, val) { localStorage.setItem('festick_' + key, JSON.stringify(val)); }
function load(key) { try { return JSON.parse(localStorage.getItem('festick_' + key)); } catch (e) { return null; } }

function getUsers() { return load('users') || [{ name: 'Joana Ferreira', email: 'joana@festick.pt', pass: 'Joana@123' }]; }
function saveUsers(u) { save('users', u); }

function getTickets(email) { return (load('tickets') || {})[email] || []; }
function saveTicket(email, t) { let all = load('tickets') || {}; all[email] = [...(all[email] || []), t]; save('tickets', all); }

function getWallet(email) { return load('wallet_' + email) || { balance: 0, history: [] }; }
function saveWallet(email, w) { save('wallet_' + email, w); }

// Stock: keyed by eventId, returns remaining per type
function getStock() { return load('stock') || {}; }
function saveStock(s) { save('stock', s); }

function getRemainingStock(eventId, typeName) {
  const ev = EVENTS.find(e => e.id === eventId);
  if (!ev) return 0;
  const stock = getStock();
  const key = `${eventId}_${typeName}`;
  const sold = stock[key] || 0;
  // Total stock is shared across types for simplicity
  const totalSold = ev.types.reduce((sum, t) => sum + (stock[`${eventId}_${t.name}`] || 0), 0);
  return ev.totalStock - totalSold;
}

function deductStock(eventId, typeName, qty) {
  const stock = getStock();
  const key = `${eventId}_${typeName}`;
  stock[key] = (stock[key] || 0) + qty;
  saveStock(stock);
}

function getTotalSold(eventId) {
  const ev = EVENTS.find(e => e.id === eventId);
  if (!ev) return 0;
  const stock = getStock();
  return ev.types.reduce((sum, t) => sum + (stock[`${eventId}_${t.name}`] || 0), 0);
}

// ============================================================
// NAVIGATION
// ============================================================
let screenStack = [];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function goTo(id) {
  screenStack.push(id);
  showScreen(id);
  if (id === 'home') renderHome();
  if (id === 'tickets') renderTickets();
  if (id === 'wallet') renderWallet();
  if (id === 'profile') renderProfile();
}

function goBack() {
  screenStack.pop();
  const prev = screenStack[screenStack.length - 1] || 'home';
  showScreen(prev);
  if (prev === 'home') renderHome();
  if (prev === 'tickets') renderTickets();
}

// ============================================================
// AUTH
// ============================================================
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('auth-login').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? '' : 'none';
}

// Password: ≥8 chars, ≥1 lowercase, ≥1 uppercase, ≥1 digit, ≥1 special char
function validatePass(p) {
  return p.length >= 8
    && /[a-z]/.test(p)
    && /[A-Z]/.test(p)
    && /[0-9]/.test(p)
    && /[^a-zA-Z0-9]/.test(p);
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const users = getUsers();
  const user = users.find(u => u.email === email && u.pass === pass);
  if (!user) { document.getElementById('login-error').style.display = 'block'; return; }
  document.getElementById('login-error').style.display = 'none';
  currentUser = user;
  save('session', user.email);
  goTo('home');
}

function doRegister() {
  let ok = true;
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const users = getUsers();

  ['reg-email-error', 'reg-pass-error', 'reg-pass2-error'].forEach(id =>
    document.getElementById(id).style.display = 'none');

  if (!name || !email) { showToast('Preenche todos os campos', 'error'); return; }
  if (users.find(u => u.email === email)) { document.getElementById('reg-email-error').style.display = 'block'; ok = false; }
  if (!validatePass(pass)) { document.getElementById('reg-pass-error').style.display = 'block'; ok = false; }
  if (pass !== pass2) { document.getElementById('reg-pass2-error').style.display = 'block'; ok = false; }
  if (!ok) return;

  const newUser = { name, email, pass };
  saveUsers([...users, newUser]);
  currentUser = newUser;
  save('session', email);
  showToast('Conta criada com sucesso! Bem-vindo/a 🎉', 'success');
  goTo('home');
}

function doLogout() {
  currentUser = null;
  localStorage.removeItem('festick_session');
  screenStack = [];
  showScreen('auth');
}

// DEMO RESET — clears all user data (tickets, wallet, stock) but keeps accounts
function demoReset() {
  if (!confirm('Tens a certeza? Isto apaga todos os bilhetes, carteira e stock de todos os utilizadores.')) return;
  // Remove all festick_ keys except users and session
  Object.keys(localStorage)
    .filter(k => k.startsWith('festick_') && k !== 'festick_users' && k !== 'festick_session')
    .forEach(k => localStorage.removeItem(k));
  showToast('Reset feito! Dados limpos. 🔄', 'success');
  goTo('home');
}

// ============================================================
// HOME
// ============================================================
function renderHome() {
  updateAvatar();
  filterEvents();
}

function updateAvatar() {
  if (!currentUser) return;
  const init = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('home-avatar').textContent = init;
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('#filters-row .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filterEvents();
}

function filterEvents() {
  const q = (document.getElementById('search-input') || { value: '' }).value.toLowerCase();
  let events = EVENTS.filter(e => {
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || e.city.toLowerCase().includes(q);
    const matchF = currentFilter === 'Todos' || e.type === currentFilter;
    return matchQ && matchF;
  });
  // Sort by popularity (lower number = more popular)
  events.sort((a, b) => a.popularity - b.popularity);
  renderFeatured(events.slice(0, 3));
  renderAllEvents(events);
}

function isSoldOut(eventId) {
  const ev = EVENTS.find(e => e.id === eventId);
  return getTotalSold(eventId) >= ev.totalStock;
}

function renderFeatured(events) {
  const c = document.getElementById('featured-events');
  c.innerHTML = events.map(e => {
    const soldOut = isSoldOut(e.id);
    const remaining = e.totalStock - getTotalSold(e.id);
    return `
    <div class="event-card ${soldOut ? 'sold-out' : ''}" onclick="openEvent(${e.id})">
      <div class="event-card-img" style="background:${e.bg}">
        <div class="emoji-bg" style="font-size:60px;display:flex;align-items:center;justify-content:center;height:100%">${e.emoji}</div>
        <div class="event-tag">${e.type}</div>
        ${soldOut ? '<div style="position:absolute;top:8px;right:8px;background:#f87171;color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px">ESGOTADO</div>' : ''}
      </div>
      <div class="event-card-body">
        <div class="event-name">${e.name}</div>
        <div class="event-meta">📅 ${e.date}</div>
        <div class="event-meta">📍 ${e.city}</div>
        ${soldOut
          ? '<div class="sold-out-badge" style="margin-top:8px">Esgotado</div>'
          : `<div class="event-price">a partir de €${e.price}</div>`}
      </div>
    </div>`;
  }).join('');
}

function renderAllEvents(events) {
  const c = document.getElementById('all-events');
  if (!events.length) {
    c.innerHTML = '<p style="color:var(--muted);text-align:center;padding:30px 0">Sem eventos encontrados</p>';
    return;
  }
  c.innerHTML = events.map(e => {
    const soldOut = isSoldOut(e.id);
    const remaining = e.totalStock - getTotalSold(e.id);
    return `
    <div class="event-list-card ${soldOut ? 'sold-out' : ''}" onclick="openEvent(${e.id})">
      <div class="event-list-thumb" style="background:${e.bg}">${e.emoji}</div>
      <div class="event-list-info">
        <div class="event-list-name">${e.name}</div>
        <div class="event-list-sub">📅 ${e.date} · 📍 ${e.city}</div>
        <div class="event-list-sub">${soldOut
          ? '<span class="sold-out-badge">🔴 Esgotado</span>'
          : `🎫 ${remaining} bilhetes disponíveis`}</div>
        ${soldOut ? '' : `<div class="event-list-price">a partir de €${e.price}</div>`}
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// EVENT DETAIL
// ============================================================
function openEvent(id) {
  selectedEvent = EVENTS.find(e => e.id === id);
  ticketQtys = {};
  selectedEvent.types.forEach(t => ticketQtys[t.name] = 0);
  prevScreen = screenStack[screenStack.length - 1] || 'home';
  screenStack.push('detail');
  showScreen('detail');
  renderDetail();
}

function renderDetail() {
  const e = selectedEvent;
  const remaining = e.totalStock - getTotalSold(e.id);
  const soldOut = remaining <= 0;

  // Hero
  document.getElementById('detail-hero').innerHTML = `
    <button class="detail-back" onclick="goBack()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    </button>
    <div style="font-size:90px;position:relative;z-index:1">${e.emoji}</div>`;
  document.getElementById('detail-hero').style.background = e.bg;

  document.getElementById('detail-title').textContent = e.name;
  document.getElementById('detail-badges').innerHTML = `
    <span class="detail-badge">🎵 ${e.type}</span>
    <span class="detail-badge">📅 ${e.date}</span>`;

  document.getElementById('detail-info').innerHTML = `
    <div class="info-box"><div class="info-box-label">Local</div><div class="info-box-val">${e.location}</div></div>
    <div class="info-box"><div class="info-box-label">${soldOut ? 'Lotação' : 'Disponíveis'}</div>
      <div class="info-box-val" style="${soldOut ? 'color:#f87171' : ''}">${soldOut ? 'Esgotado' : remaining + ' bilhetes'}</div></div>`;

  // OpenStreetMap embed + Google Maps link
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${e.lng - 0.01},${e.lat - 0.007},${e.lng + 0.01},${e.lat + 0.007}&layer=mapnik&marker=${e.lat},${e.lng}`;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`;
  document.getElementById('detail-map').innerHTML = `
    <div class="map-embed" onclick="window.open('${gmapsUrl}','_blank')">
      <iframe src="${mapUrl}" scrolling="no" loading="lazy"></iframe>
      <div class="map-embed-overlay"><div class="map-link-btn">📍 Abrir no Google Maps</div></div>
    </div>`;

  // Ticket types
  if (soldOut) {
    document.getElementById('ticket-types').innerHTML = `
      <div style="text-align:center;padding:30px;color:#f87171;font-family:var(--font-head);font-size:18px;font-weight:700">
        🔴 Evento esgotado
      </div>`;
  } else {
    document.getElementById('ticket-types').innerHTML = e.types.map(t => {
      const typeRemaining = remaining; // shared pool
      return `
      <div class="ticket-selector">
        <div class="ticket-type-row">
          <div>
            <div class="ticket-type-name">${t.name}</div>
            <div style="font-size:12px;color:var(--muted)">${t.name === 'VIP' ? 'Acesso prioritário + áreas exclusivas' : 'Acesso geral ao recinto'}</div>
          </div>
          <div class="ticket-type-price">€${t.price}</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:13px;color:var(--muted)">Quantidade</span>
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="changeQty('${t.name}',-1)">−</button>
            <div class="qty-num" id="qty-${t.name.replace(/\s/g, '')}">0</div>
            <button class="qty-btn" onclick="changeQty('${t.name}',1)">+</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }
  updateCheckoutBar();
}

function changeQty(name, delta) {
  const remaining = selectedEvent.totalStock - getTotalSold(selectedEvent.id);
  const currentTotal = selectedEvent.types.reduce((s, t) => s + (ticketQtys[t.name] || 0), 0);
  const newVal = (ticketQtys[name] || 0) + delta;
  if (newVal < 0) return;
  if (delta > 0 && currentTotal >= remaining) {
    showToast(`Apenas ${remaining} bilhetes disponíveis`, 'error');
    return;
  }
  ticketQtys[name] = newVal;
  document.getElementById('qty-' + name.replace(/\s/g, '')).textContent = newVal;
  updateCheckoutBar();
}

function updateCheckoutBar() {
  const total = selectedEvent.types.reduce((s, t) => s + (ticketQtys[t.name] || 0) * t.price, 0);
  const bar = document.getElementById('checkout-bar');
  bar.style.display = total > 0 ? 'flex' : 'none';
  document.getElementById('checkout-total').textContent = '€' + total.toFixed(2);
}

function openPayModal() {
  const total = selectedEvent.types.reduce((s, t) => s + (ticketQtys[t.name] || 0) * t.price, 0);
  const lines = selectedEvent.types.filter(t => ticketQtys[t.name] > 0)
    .map(t => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
      <span>${ticketQtys[t.name]}× ${t.name}</span><span>€${(ticketQtys[t.name] * t.price).toFixed(2)}</span>
    </div>`).join('');
  document.getElementById('pay-summary').innerHTML = lines +
    `<div style="display:flex;justify-content:space-between;padding:12px 0;font-family:var(--font-head);font-weight:700;font-size:18px">
      <span>Total</span><span style="color:var(--accent2)">€${total.toFixed(2)}</span></div>`;
  openModal('modal-pay');
}

// Generate ticket code: initials of event name + random 4-9 digits
function generateTicketCode(eventName) {
  const initials = eventName.split(' ')
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .join('');
  const digits = Math.floor(Math.random() * 900000000 + 1000).toString().slice(0, 4 + Math.floor(Math.random() * 6));
  return initials + digits;
}

function confirmPurchase() {
  const method = document.getElementById('pay-method').value;
  selectedEvent.types.forEach(t => {
    for (let i = 0; i < (ticketQtys[t.name] || 0); i++) {
      const code = generateTicketCode(selectedEvent.name);
      const ticket = {
        id: Date.now() + Math.random(),
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        eventEmoji: selectedEvent.emoji,
        eventDate: selectedEvent.date,
        eventCity: selectedEvent.city,
        eventBg: selectedEvent.bg,
        type: t.name,
        price: t.price,
        code: code,
        valid: true,
        purchasedAt: new Date().toLocaleString('pt-PT')
      };
      saveTicket(currentUser.email, ticket);
      deductStock(selectedEvent.id, t.name, 1);
    }
  });
  closeModal('modal-pay');
  document.getElementById('checkout-bar').style.display = 'none';
  showToast('Compra realizada com sucesso! 🎉', 'success');
  setTimeout(() => goTo('tickets'), 1200);
}

// ============================================================
// TICKETS LIST
// ============================================================
function renderTickets() {
  const tickets = getTickets(currentUser.email);
  const c = document.getElementById('my-tickets-list');
  if (!tickets.length) {
    c.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎫</div>
        <div class="empty-title">Sem bilhetes</div>
        <div class="empty-sub">Ainda não compraste nenhum bilhete.<br/>Explora os eventos disponíveis!</div>
        <button class="btn btn-primary" style="max-width:200px" onclick="goTo('home')">Ver eventos</button>
      </div>`;
    return;
  }
  c.innerHTML = tickets.slice().reverse().map(t => `
    <div class="ticket-card" onclick="openTicketDetail('${t.code}')">
      <div class="ticket-card-top">
        <div class="ticket-thumb" style="background:${t.eventBg}">${t.eventEmoji}</div>
        <div>
          <div class="ticket-info-name">${t.eventName}</div>
          <div class="ticket-info-sub">📅 ${t.eventDate} · 📍 ${t.eventCity}</div>
          <span class="ticket-type-badge ${t.type === 'VIP' ? 'badge-vip' : 'badge-normal'}">${t.type}</span>
        </div>
      </div>
      <div class="ticket-card-footer">
        <div class="ticket-qr-preview">${t.code}</div>
        <div class="ticket-valid">✅ Válido</div>
      </div>
    </div>`).join('');
}

// ============================================================
// TICKET DETAIL (individual)
// ============================================================
function openTicketDetail(code) {
  const tickets = getTickets(currentUser.email);
  const ticket = tickets.find(t => t.code === code);
  if (!ticket) return;
  screenStack.push('ticket-detail');
  showScreen('ticket-detail');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticket.code)}&bgcolor=ffffff&color=000000&margin=10`;

  document.getElementById('ticket-detail-content').innerHTML = `
    <button class="detail-back" style="position:static;width:auto;height:auto;padding:10px 16px;border-radius:12px;font-size:14px;gap:6px;display:flex;align-items:center;background:var(--card);border:1px solid var(--border);color:var(--text);cursor:pointer;margin:20px 20px 0" onclick="goBack()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Voltar
    </button>
    <div class="ticket-detail-wrap">
      <div style="font-size:64px">${ticket.eventEmoji}</div>
      <div>
        <div class="ticket-detail-event">${ticket.eventName}</div>
        <div class="ticket-detail-sub">📅 ${ticket.eventDate} · 📍 ${ticket.eventCity}</div>
        <div style="text-align:center;margin-top:8px">
          <span class="ticket-type-badge ${ticket.type === 'VIP' ? 'badge-vip' : 'badge-normal'}" style="font-size:13px;padding:4px 14px">${ticket.type}</span>
        </div>
      </div>
      <div class="ticket-detail-qr">
        <img src="${qrUrl}" alt="QR Code ${ticket.code}" width="220" height="220"/>
      </div>
      <div class="ticket-detail-code">${ticket.code}</div>
      <div class="ticket-detail-info">
        <div class="ticket-detail-info-row"><span>Estado</span><span style="color:#4ade80">✅ Válido</span></div>
        <div class="ticket-detail-info-row"><span>Tipo</span><span>${ticket.type}</span></div>
        <div class="ticket-detail-info-row"><span>Preço pago</span><span>€${ticket.price.toFixed(2)}</span></div>
        <div class="ticket-detail-info-row"><span>Data de compra</span><span>${ticket.purchasedAt}</span></div>
      </div>
    </div>`;
}

// ============================================================
// WALLET
// ============================================================
function renderWallet() {
  const w = getWallet(currentUser.email);
  document.getElementById('wallet-balance-num').textContent = w.balance.toFixed(2);
  histFilter = 'all';
  document.querySelectorAll('.hist-filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('hist-filter-all').classList.add('active');
  renderHistory(w);
}

function filterHistory(type) {
  histFilter = type;
  document.querySelectorAll('.hist-filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('hist-filter-' + type).classList.add('active');
  renderHistory(getWallet(currentUser.email));
}

function renderHistory(w) {
  const hist = [...w.history].reverse();
  const filtered = histFilter === 'all' ? hist : hist.filter(h => h.type === histFilter);
  const c = document.getElementById('wallet-history');
  if (!filtered.length) {
    c.innerHTML = '<p style="color:var(--muted);text-align:center;padding:30px 0">Sem movimentos</p>';
    return;
  }
  c.innerHTML = filtered.map(h => `
    <div class="hist-item">
      <div class="hist-icon ${h.type}">${h.type === 'credit' ? '💳' : '🛒'}</div>
      <div class="hist-info">
        <div class="hist-name">${h.desc}</div>
        <div class="hist-date">${h.date}</div>
      </div>
      <div class="hist-amount ${h.type}">${h.type === 'credit' ? '+' : '−'}€${h.amount.toFixed(2)}</div>
    </div>`).join('');
}

function openTopupModal() {
  // Clear previous selection
  document.querySelectorAll('#topup-presets .filter-chip').forEach(c => c.classList.remove('active'));
  document.getElementById('topup-amount').value = '';
  openModal('modal-topup');
}

function setTopupAmount(val, el) {
  document.querySelectorAll('#topup-presets .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('topup-amount').value = val;
}

function onTopupManualInput() {
  // Deselect preset chips when user types manually
  document.querySelectorAll('#topup-presets .filter-chip').forEach(c => c.classList.remove('active'));
}

function confirmTopup() {
  const val = parseFloat(document.getElementById('topup-amount').value);
  if (!val || val < 5 || val > 200) { showToast('Valor inválido (€5 – €200)', 'error'); return; }
  const method = document.getElementById('topup-method').value;
  const w = getWallet(currentUser.email);
  w.balance += val;
  w.history.push({
    type: 'credit',
    desc: 'Carregamento via ' + method,
    amount: val,
    date: new Date().toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  });
  saveWallet(currentUser.email, w);
  closeModal('modal-topup');
  document.getElementById('wallet-balance-num').textContent = w.balance.toFixed(2);
  renderHistory(w);
  showToast(`€${val.toFixed(2)} adicionados à carteira ✅`, 'success');
}

// ============================================================
// PROFILE
// ============================================================
function renderProfile() {
  if (!currentUser) return;
  document.getElementById('profile-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('profile-name').textContent = currentUser.name;
  document.getElementById('profile-email').textContent = currentUser.email;
}

// ============================================================
// MODALS & TOAST
// ============================================================
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(o =>
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); }));
});

let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ============================================================
// INIT
// ============================================================
(function init() {
  const session = load('session');
  if (session) {
    const users = getUsers();
    const user = users.find(u => u.email === session);
    if (user) { currentUser = user; screenStack = ['home']; showScreen('home'); renderHome(); return; }
  }
  showScreen('auth');
})();
