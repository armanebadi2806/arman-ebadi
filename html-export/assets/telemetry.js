(function () {
  try {
    const key = 'ae_telemetry_views';
    const path = location.pathname.split('/').pop() || location.pathname || 'unknown';
    const item = { at: Date.now(), path: path };

    const raw = localStorage.getItem(key);
    let items = [];
    try {
      items = JSON.parse(raw || '[]');
      if (!Array.isArray(items)) items = [];
    } catch (e) {
      items = [];
    }

    items.unshift(item);
    // keep last 2000 events
    if (items.length > 2000) items = items.slice(0, 2000);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
})();

