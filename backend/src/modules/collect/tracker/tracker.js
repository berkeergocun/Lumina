/**
 * SmartAnalytics Tracker — v1.0.0
 * Gzip < 2 KB | Vanilla JS ES2017+
 * Kullanım: <script async defer src="..." data-site-id="YOUR_ID"></script>
 */
;(function () {
  'use strict'

  // ─── Yapılandırma ──────────────────────────────────────────────────────────
  var script = document.currentScript
  var SITE_ID = script ? script.getAttribute('data-site-id') : null
  var API_URL = script
    ? (script.getAttribute('data-api-url') || window.location.protocol + '//' + window.location.host)
    : ''
  var COLLECT_URL = API_URL + '/api/v1/collect'
  var RESPECT_DNT = script ? script.getAttribute('data-dnt') !== 'false' : true

  if (!SITE_ID) {
    console.warn('[SmartAnalytics] data-site-id eksik.')
    return
  }

  // Do Not Track kontrolü
  if (RESPECT_DNT && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) {
    return
  }

  // ─── Oturum Yönetimi ───────────────────────────────────────────────────────
  var SESSION_KEY = 'sa_session_' + SITE_ID
  var VISITOR_KEY = 'sa_visitor_' + SITE_ID

  function generateUUID() {
    if (crypto.randomUUID) return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  function getOrCreateSession() {
    try {
      var stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) return stored
      var id = generateUUID()
      sessionStorage.setItem(SESSION_KEY, id)
      return id
    } catch (_) {
      return generateUUID()
    }
  }

  function getOrCreateVisitor() {
    try {
      var stored = localStorage.getItem(VISITOR_KEY)
      if (stored) {
        var parsed = JSON.parse(stored)
        // 1 yıllık TTL
        if (Date.now() - parsed.ts < 365 * 24 * 60 * 60 * 1000) return parsed.id
      }
      var id = generateUUID()
      localStorage.setItem(VISITOR_KEY, JSON.stringify({ id: id, ts: Date.now() }))
      return id
    } catch (_) {
      return generateUUID()
    }
  }

  // ─── UTM Parametreleri ─────────────────────────────────────────────────────
  function getUTM() {
    var params = new URLSearchParams(window.location.search)
    var utm = {}
    var keys = ['source', 'medium', 'campaign', 'term', 'content']
    keys.forEach(function (k) {
      var v = params.get('utm_' + k)
      if (v) utm[k] = v
    })
    return Object.keys(utm).length ? utm : undefined
  }

  // ─── Veri Gönderimi ────────────────────────────────────────────────────────
  function send(payload) {
    var data = JSON.stringify(payload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(COLLECT_URL, new Blob([data], { type: 'application/json' }))
    } else {
      fetch(COLLECT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(function () {})
    }
  }

  // ─── Olay Gönder ──────────────────────────────────────────────────────────
  var sessionId = getOrCreateSession()

  function track(type, extra) {
    var payload = {
      siteId: SITE_ID,
      sessionId: sessionId,
      type: type,
      url: window.location.pathname + window.location.search,
      referrer: document.referrer || undefined,
      utm: extra && extra.utmOverride ? extra.utmOverride : getUTM(),
      screen: { width: screen.width, height: screen.height },
      language: navigator.language,
      timestamp: new Date().toISOString(),
    }
    if (extra && extra.name) { payload.name = extra.name }
    if (extra && extra.properties) { payload.properties = extra.properties }
    send(payload)
  }

  // ─── Sayfa Görüntüleme ─────────────────────────────────────────────────────
  function trackPageview() {
    track('pageview')
  }

  // İlk yükleme
  trackPageview()

  // SPA desteği — History API
  var _pushState = history.pushState
  var _replaceState = history.replaceState

  history.pushState = function () {
    _pushState.apply(history, arguments)
    trackPageview()
  }
  history.replaceState = function () {
    _replaceState.apply(history, arguments)
    trackPageview()
  }

  window.addEventListener('popstate', trackPageview)

  // Sayfa kapatılırken session_end gönder
  window.addEventListener('pagehide', function () {
    track('session_end')
  })

  // ─── Public API ────────────────────────────────────────────────────────────
  window.SmartAnalytics = {
    /**
     * Özel etkinlik takibi
     * @param {string} eventName - Etkinlik adı (max 64 karakter)
     * @param {object} [properties] - Etkinlik özellikleri (max 10 alan)
     */
    track: function (eventName, properties) {
      track('custom_event', { name: eventName, properties: properties })
    },

    /**
     * Manuel sayfa görüntüleme tetikle
     */
    pageview: function () {
      trackPageview()
    },
  }
})()
