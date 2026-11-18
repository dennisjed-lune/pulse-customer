/* Wallet demo setup adapter (18 Nov 2026).
   The setup screen (vendor/setup.js, from pulse-mobile-demo) saves the bank in localStorage and reloads.
   This file reads that bank and applies it to the cardholder wallet: name, logo, colour, programme name,
   card name, programme type, font, currency and the merchants of the bank's country.
   It runs before the wallet scripts. Data hooks: window.WB (read by the wallet's BANKS and progName),
   window.WB_DOM (read by brandLogo). Everything else is a text pass on the rendered screen. */
(function () {
  var KEY = 'lune-oa-bank-v1';
  /* Bank colour look (18 Nov 2026): borders + light tint by default. ?look=none|border|tint|both changes it for the visit. */
  var lk = 'both';
  try { var q = new URLSearchParams(location.search).get('look'); if (q) sessionStorage.setItem('wb-look', q); lk = sessionStorage.getItem('wb-look') || lk; } catch (e) {}
  document.documentElement.setAttribute('data-look', lk);
  var cfg = null;
  try { cfg = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!cfg || !cfg.en) return;

  var WB = window.WB = {
    bank: cfg.en,
    logo: cfg.logo || '',
    color: cfg.color || '#1c3d7a',
    prog: cfg.rewards || '',
    credit: cfg.credit || '',
    unit: cfg.unit === 'points' ? 'points' : 'cashback',
    cur: cfg.cur || 'AED',
    fx: cfg.cur && cfg.cur !== 'AED' ? (cfg.fx || (window.FX_RATES || {})[cfg.cur] || null) : null,
    region: cfg.region || 'me',
    font: cfg.font || ''
  };

  /* A new setup starts the pitch at the bank's join screen, with the chosen programme type. */
  var stamp = JSON.stringify([cfg.en, cfg.unit, cfg.region, cfg.cur, cfg.color]);
  try {
    if (localStorage.getItem('wb-stamp') !== stamp) {
      localStorage.setItem('wb-stamp', stamp);
      localStorage.setItem('walletProgramme', WB.unit);
      localStorage.setItem('walletBank', 'nova');
      localStorage.setItem('walletEnrolled', 'no');
    }
  } catch (e) {}

  /* ---------- country merchants ---------- */
  /* Each wallet offer takes the brand of one slot in the country catalogue. The UAE keeps the RFP offer set. */
  var R = (window.LUNE_REGIONS || {})[WB.region];
  var TEXT = [];          // [from, to], longest first
  var DOM = window.WB_DOM = {};
  if (R && WB.region !== 'me') {
    var slot = function (k) { var o = (R.offers || {})[k] || {}; var lg = (R.logos || {})[k]; return { brand: o.brand || '', dom: lg && lg !== 'uber' ? lg.replace(/^ld:/, '') : (lg === 'uber' ? 'uber.com' : '') }; };
    var pick = function (keys, fb) { for (var i = 0; i < keys.length; i++) { var s = slot(keys[i]); if (s.brand) return { brand: s.brand, dom: s.dom || fb.dom }; } return fb; };
    var airDom = ((R.logos || {}).etihad || (R.logos || {}).emirates || '').replace(/^ld:/, '');
    var MAP = [
      ['Grandiose', 'grandiose.ae', pick(['carrefour'], { brand: 'Carrefour', dom: 'carrefour.com' })],
      ['Jones the Grocer', 'jonesthegrocer.com', pick(['waitrose'], { brand: 'Whole Foods Market', dom: 'wholefoodsmarket.com' })],
      ['Cafe Rider', 'caferider.com', pick(['spinneys'], { brand: 'Spinneys', dom: 'spinneys.com' })],
      ['Chowking', 'chowking.ph', pick(['shakeshack'], { brand: 'Shake Shack', dom: 'shakeshack.com' })],
      ['Krush Burger', 'krushburger.com', pick(['namshi'], { brand: 'Deliveroo', dom: 'deliveroo.com' })],
      ['Sharaf DG', 'sharafdg.com', pick(['noon', 'amazon'], { brand: 'Amazon', dom: 'amazon.com' })],
      ['Flynas', 'flynas.com', pick(['emirates'], { brand: 'Emirates', dom: 'emirates.com' })],
      ['WashOn', 'washon.ae', pick(['careem'], { brand: 'Uber', dom: 'uber.com' })],
      ['Coffee Planet', 'coffeeplanet.com', { brand: 'Starbucks', dom: 'starbucks.com' }],
      ['Booking.com', 'booking.com', pick(['booking'], { brand: 'Booking.com', dom: 'booking.com' })]
    ];
    if (airDom) MAP[6][2].dom = MAP[6][2].dom === 'emirates.com' || !MAP[6][2].dom ? airDom : MAP[6][2].dom;
    var ride = MAP[7][2].brand;
    /* The car wash slot becomes the country's ride app, so its copy changes too. */
    TEXT.push(['Car wash by WashOn', 'Rides with ' + ride], ['Book a WashOn car wash', 'Book a ride with ' + ride], ['WashOn car wash', ride + ' ride']);
    MAP.forEach(function (m) { var to = m[2]; if (!to.brand || to.brand === m[0]) return; TEXT.push([m[0], to.brand]); if (to.dom) DOM[m[1]] = to.dom; });
    if (R.city) TEXT.push(['Dubai', R.city]);
  }

  /* ---------- names ---------- */
  if (WB.credit) TEXT.push(['Nova Platinum Credit', WB.credit], ['Nova Platinum', WB.credit]);
  TEXT.push(['Nova Bank', WB.bank]);
  TEXT.sort(function (a, b) { return b[0].length - a[0].length; });
  var escRx = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  var rxText = TEXT.length ? new RegExp(TEXT.map(function (t) { return escRx(t[0]); }).join('|'), 'g') : null;
  var TO = {}; TEXT.forEach(function (t) { TO[t[0]] = t[1]; });

  /* ---------- currency ---------- */
  var digits = 2;
  try { digits = new Intl.NumberFormat('en-US', { style: 'currency', currency: WB.cur }).resolvedOptions().maximumFractionDigits; } catch (e) {}
  /* AED amounts written without decimals (caps, targets, fixed rewards) round to a figure a person would set: whole units,
     or steps of 5 from 100. Amounts with decimals (earned, pending, balances) convert exactly. */
  var money = function (n, whole) {
    var v = n * WB.fx, d = digits;
    if (whole && v >= 10) { v = v >= 100 ? Math.round(v / 5) * 5 : Math.round(v); d = 0; }
    return WB.cur + ' ' + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  var rxMoney = /AED\s?(\d[\d,]*(?:\.\d+)?)/g;

  var fix = function (s) {
    var o = s;
    if (rxText) s = s.replace(rxText, function (m) { return TO[m]; });
    if (WB.fx) s = s.replace(rxMoney, function (m, n) { var v = parseFloat(n.replace(/,/g, '')); return money(v, n.indexOf('.') < 0); }).replace(/\bAED\b/g, WB.cur);
    return s === o ? null : s;
  };
  var busy = false;
  var walk = function (root) {
    if (!root || busy) return;
    busy = true;
    try {
      if (root.nodeType === 3) { var r0 = fix(root.nodeValue); if (r0 !== null) root.nodeValue = r0; return; }
      if (root.nodeType !== 1 || root.closest && root.closest('.lsu,script,style')) return;
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentNode; return p && /^(SCRIPT|STYLE)$/.test(p.nodeName) ? 2 : 1; } });
      var n, edits = [];
      while ((n = w.nextNode())) { var r = fix(n.nodeValue); if (r !== null) edits.push([n, r]); }
      edits.forEach(function (e) { e[0].nodeValue = e[1]; });
      root.querySelectorAll && root.querySelectorAll('input[value],[aria-label],[title]').forEach(function (el) {
        ['value', 'aria-label', 'title'].forEach(function (a) { var v = el.getAttribute(a); if (v) { var r2 = fix(v); if (r2 !== null) el.setAttribute(a, r2); } });
      });
    } finally { busy = false; }
  };

  /* ---------- look: logo, font ---------- */
  var css = '';
  if (WB.logo) css += '.cx-en-logo,.cx-bal i{background:#fff center/78% no-repeat url("' + WB.logo + '")!important;color:transparent!important;border:1px solid rgba(0,0,0,.08)}';
  if (WB.font) {
    css += ':root{--font:"' + WB.font + '",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}';
    if (!/^(Source Sans 3|Plus Jakarta Sans)$/.test(WB.font)) {
      var l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=' + WB.font.replace(/ /g, '+') + ':wght@400;500;600;700;800&display=swap';
      document.head.appendChild(l);
    }
  }
  if (css) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }

  /* Section bands (18 Nov 2026): the screen is white. On the Offers screen, Expiring soon (with the collection below it)
     and All offers sit on a light bank tint, full width; All offers runs to the bottom of the screen.
     Each band holds its heading and everything up to the next heading. */
  var BANDS = /^(Expiring soon|All offers)/;
  var band = function () {
    document.querySelectorAll('.cx-scr').forEach(function (scr) {
      [].slice.call(scr.children).forEach(function (h) {
        if (!h.classList || !h.classList.contains('cx-h') || !BANDS.test((h.textContent || '').trim())) return;
        var wrap = document.createElement('div'); wrap.className = 'wb-sec';
        scr.insertBefore(wrap, h);
        var n = h;
        while (n && !(n !== h && n.classList && (n.classList.contains('cx-h') || n.classList.contains('wb-sec')))) { var nx = n.nextElementSibling; wrap.appendChild(n); n = nx; }
        if (!wrap.nextElementSibling) wrap.classList.add('last');
      });
    });
  };

  var start = function () {
    band();
    walk(document.body);
    try { document.title = WB.bank + ' · Customer journey'; } catch (e) {}
    new MutationObserver(function (ms) {
      if (busy) return;
      band();
      ms.forEach(function (m) {
        if (m.type === 'characterData') walk(m.target);
        else m.addedNodes.forEach(function (nd) { walk(nd); });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
