(function () {
  const warningNode = document.querySelector('[data-admin-warning]');
  const dashboardNode = document.querySelector('[data-admin-dashboard]');
  const metricsNode = document.querySelector('[data-admin-metrics]');
  const listNode = document.querySelector('[data-admin-list]');
  const emptyNode = document.querySelector('[data-admin-empty]');
  const searchNode = document.querySelector('[data-admin-search]');
  const exportBtn = document.querySelector('[data-admin-export]');

  const REQUESTS_KEY = 'ae_requests';
  const VIEWS_KEY = 'ae_telemetry_views';

  let cachedItems = [];
  let cachedViews = [];

  function showWarning(message) {
    if (!warningNode) return;
    warningNode.textContent = message || '';
  }

  function ensureSessionGate() {
    try {
      const ok = sessionStorage.getItem('ae_admin_ok') === '1';
      if (!ok) return false;
      const at = Number(sessionStorage.getItem('ae_admin_ok_at') || '0');
      if (!at) return false;
      const ageMs = Date.now() - at;
      if (ageMs > 12 * 60 * 60 * 1000) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
    } catch (error) {
      return value || '-';
    }
  }

  function asText(value) {
    return String(value || '-');
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function loadRequests() {
    const raw = localStorage.getItem(REQUESTS_KEY);
    const items = Array.isArray(safeJsonParse(raw || '[]', [])) ? safeJsonParse(raw || '[]', []) : [];
    return items
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        created_at: item.created_at || item.createdAt || '',
        contact_name: item.contactName || item.contact_name || '',
        contact_email: item.contactEmail || item.contact_email || '',
        contact_phone: item.contactPhone || item.contact_phone || '',
        project_type: item.projectType || item.project_type || '',
        primary_goal: item.primaryGoal || item.primary_goal || '',
        budget_range: item.budgetRange || item.budget_range || '',
        timeline: item.timeline || '',
        preferred_contact: item.preferredContact || item.preferred_contact || '',
        features: Array.isArray(item.features) ? item.features : [],
        description: item.featureNotes || item.description || ''
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  function loadViews() {
    const raw = localStorage.getItem(VIEWS_KEY);
    const items = Array.isArray(safeJsonParse(raw || '[]', [])) ? safeJsonParse(raw || '[]', []) : [];
    return items
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        at: Number(item.at || 0),
        path: String(item.path || '')
      }))
      .filter((item) => item.at > 0 && item.path)
      .sort((a, b) => b.at - a.at);
  }

  function bucketCounts(items, keyFn) {
    const counts = new Map();
    items.forEach((item) => {
      const key = String(keyFn(item) || '').trim();
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }

  function withinDays(ts, days) {
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return ts >= cutoff;
  }

  function isToday(ts) {
    const now = new Date();
    const d = new Date(ts);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  function showDashboard() {
    if (!dashboardNode) return;
    dashboardNode.hidden = false;
  }

  function renderMetrics(requests, views) {
    if (!metricsNode) return;

    const total = requests.length;
    const today = requests.filter((r) => isToday(new Date(r.created_at).getTime())).length;
    const last7d = requests.filter((r) => withinDays(new Date(r.created_at).getTime(), 7)).length;
    const withFeatures = requests.filter((r) => Array.isArray(r.features) && r.features.length).length;

    const viewTotal = views.length;
    const viewToday = views.filter((v) => isToday(v.at)).length;
    const view7d = views.filter((v) => withinDays(v.at, 7)).length;

    metricsNode.innerHTML = `
      <div class="metric-card"><strong>${total}</strong><span>Anfragen</span></div>
      <div class="metric-card"><strong>${today}</strong><span>Anfragen heute</span></div>
      <div class="metric-card"><strong>${last7d}</strong><span>Anfragen 7 Tage</span></div>
      <div class="metric-card"><strong>${Math.round((withFeatures / Math.max(1, total)) * 100)}%</strong><span>mit Features</span></div>
      <div class="metric-card"><strong>${viewTotal}</strong><span>Seitenaufrufe</span></div>
      <div class="metric-card"><strong>${viewToday}</strong><span>Aufrufe heute</span></div>
      <div class="metric-card"><strong>${view7d}</strong><span>Aufrufe 7 Tage</span></div>
      <div class="metric-card"><strong>${bucketCounts(views, (v) => v.path)[0]?.[0] || '-'}</strong><span>Top Seite</span></div>
    `;
  }

  function filterItems(items, query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [
        item.contact_name,
        item.contact_email,
        item.contact_phone,
        item.project_type,
        item.primary_goal,
        item.budget_range,
        item.timeline,
        item.preferred_contact,
        item.description,
        Array.isArray(item.features) ? item.features.join(' ') : ''
      ]
        .map((x) => String(x || '').toLowerCase())
        .join(' ');
      return haystack.includes(q);
    });
  }

  function renderItems(items) {
    listNode.innerHTML = '';
    if (!items || !items.length) {
      emptyNode.style.display = 'block';
      return;
    }
    emptyNode.style.display = 'none';

    items.forEach((item) => {
      const features = Array.isArray(item.features) && item.features.length ? item.features.join(', ') : '-';
      const article = document.createElement('article');
      article.className = 'admin-item';
      article.innerHTML = `
        <div class="admin-item-top">
          <h3>${asText(item.contact_name)}</h3>
          <time>${formatDate(item.created_at)}</time>
        </div>
        <div class="admin-grid">
          <p><strong>E-Mail:</strong> ${asText(item.contact_email)}</p>
          <p><strong>Telefon:</strong> ${asText(item.contact_phone)}</p>
          <p><strong>Projekt:</strong> ${asText(item.project_type)}</p>
          <p><strong>Ziel:</strong> ${asText(item.primary_goal)}</p>
          <p><strong>Budget:</strong> ${asText(item.budget_range)}</p>
          <p><strong>Timing:</strong> ${asText(item.timeline)}</p>
          <p><strong>Kontaktweg:</strong> ${asText(item.preferred_contact)}</p>
          <p><strong>Features:</strong> ${features}</p>
          <p><strong>Notiz:</strong> ${asText(item.description)}</p>
        </div>
      `;
      listNode.appendChild(article);
    });
  }

  function updateDashboard() {
    cachedItems = loadRequests();
    cachedViews = loadViews();
    renderMetrics(cachedItems, cachedViews);
    const filtered = filterItems(cachedItems, searchNode ? searchNode.value : '');
    renderItems(filtered);
  }

  async function boot() {
    if (!ensureSessionGate()) {
      window.location.href = 'login.html';
      return;
    }

    showWarning('');
    showDashboard();
    updateDashboard();
  }

  if (searchNode) {
    searchNode.addEventListener('input', function () {
      const filtered = filterItems(cachedItems, searchNode.value);
      renderItems(filtered);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      const blob = new Blob([JSON.stringify({ requests: cachedItems, views: cachedViews }, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  window.addEventListener('storage', function (event) {
    if (!event || (event.key !== REQUESTS_KEY && event.key !== VIEWS_KEY)) return;
    updateDashboard();
  });

  boot();
})();

