/* ============================================================
   API endpoint configuration.
   - On this PC (localhost) → backend at localhost:8001
   - On your phone over Wi-Fi → backend at <PC-IP>:8001 (same host the
     page was opened from, port 8001)
   - Hosted online later → change the last line to your backend URL.
   ============================================================ */
window.CA_CONFIG = {
  API_BASE: (function () {
    var h = location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '') {
      return 'http://localhost:8001/api';
    }
    // Private LAN address (phone on the same Wi-Fi): reach the backend on the same machine.
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) {
      return 'http://' + h + ':8001/api';
    }
    // Hosted online (reverse-proxied under /api). Replace if backend is on another domain.
    return location.origin + '/api';
  })()
};
