#!/usr/bin/env python3
"""Build Cardholder wallet + RFP loyalty systems: the customer demo (demo-src/customer.html, unchanged source) with the
add-on (src/customer/cext.js), small hooks, embedded offer images and logos (taken from the LuneHub demo build),
and RFP requirement tooltips.  Usage: python3 src/customer/build_customer.py   ->  ./wallet-rfp.html"""
import json, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root, 'src', '_shared'))
from rfpids import used_ids
src = os.path.join(root, 'demo-src')
s = open(os.path.join(src, 'customer.html')).read()
hub = open(os.path.join(src, 'lunehub.html')).read()
ext = open(os.path.join(root, 'src', 'customer', 'cext.js')).read()
reqs = json.load(open(os.path.join(root, 'src', '_shared', 'rfp-reqs.effective.json')))
tips = open(os.path.join(root, 'src', '_shared', 'req-tips.js')).read()
def grab(name):
    i = hub.find('window.%s=' % name); j = hub.find('};', i)
    return json.loads(hub[i + len('window.%s=' % name):j + 1])
covers = {k: v for k, v in grab('__COVERS__').items() if k.startswith('nb-')}
logos = grab('__LOGOS__')
def patch(old, new, count=1):
    global s
    assert old in s, 'hook not found: ' + old[:90]
    s = s.replace(old, new, count)
# embedded assets: offer heroes and brand logos
patch("hero:`assets/offers/nb-${o.id}.jpg`", "hero:((window.__COVERS__||{})['nb-'+o.id]||`assets/offers/nb-${o.id}.jpg`)")
patch("const brandLogo=d=>LOGOS[d]||logoUrl(d);", "const brandLogo=d=>{const u=LOGOS[d]||logoUrl(d);return (window.__LOGOS__||{})[u]||u;};")

# Ajman Bank design ideas backed by our answers (13 Nov 2026): days-left badge on featured offers and an offer count per category (CL-6.14).
patch('<span class="brand">${logo(o,\'sm\')}${o.name}</span>', '<span class="brand">${logo(o,\'sm\')}${o.name}</span>${o.days<=7?`<span class="fdays" data-req="CL-6.14">${o.days<=1?\'Last day\':o.days+\' days left\'}</span>`:\'\'}')
patch('<span class="tile">${CAT_ICON[c.id]}</span><span>${c.label}</span></button>', '<span class="tile">${CAT_ICON[c.id]}</span><span>${c.label}</span><span class="cn" data-req="CL-6.14">${c.id===\'all\'?OFFERS.length:OFFERS.filter(x=>x.cat===c.id).length} offers</span></button>')
patch("</style>", ".feat .fdays{position:absolute;top:14px;right:14px;z-index:2;padding:4px 10px;border-radius:999px;background:rgba(16,16,16,.72);color:#fff;font:700 12px/1.2 system-ui,sans-serif}.cat .cn{display:block;font-size:11px;color:#7c8186;font-weight:500;margin-top:-2px}</style>")
# points header in points modes, new sheet types, and the app functions the add-on calls
s = s.replace("sc.innerHTML=header+", "sc.innerHTML=(window.CEXT?window.CEXT.header(header):header)+")
patch("    case 'bycat': return byCatSheet(sh,cls);", "    case 'bycat': return byCatSheet(sh,cls);\n    case 'cx-points': return window.CEXT.pointsSheet(sh,cls);\n    case 'cx-redeem': return window.CEXT.redeemSheet(sh,cls);\n    case 'cx-tier': return window.CEXT.tierSheet(sh,cls);\n    case 'cx-search': case 'cx-coll': case 'cx-fav': case 'cx-move': case 'cx-optout': return window.CEXT.sheet(sh,cls);")
patch('      ${st===\'fail\'?`<div class="banner error">${I.alert}<span>We couldn’t activate this offer. Check your connection and try again.</span></div>`:\'\'}', '      ${st===\'fail\'?`<div class="banner error">${I.alert}<span>We couldn’t activate this offer. Check your connection and try again.</span></div>`:\'\'}${window.CEXT?window.CEXT.offerExtra(o,st):\'\'}')
patch("setScenario('populated');\n", "setScenario('populated');\nwindow.__C={S,push,pop,layers,renderHome,showToast,OFFERS,CATS,brandLogo,rowCard,TX,earnedTotal,pendingTotal,CAT_ICON,I};\n")
# affiliate offer (CL-3.1, OM-2.3): the add-on draws the detail sheet from our answers, without the base demo's approval rates and cookie windows
patch("case 'offer': return isAff(byId(sh.id))?linkOfferSheet(sh):offerSheet(sh);", "case 'offer': return isAff(byId(sh.id))?(window.CEXT&&window.CEXT.affSheet?window.CEXT.affSheet(sh):linkOfferSheet(sh)):offerSheet(sh);")
patch("<div class=\"cap\">Store confirms in ~${o.hold} days</div>", "<div class=\"cap\">Online, through the offer link</div>")
# promo-code offer row (OM-1.1, OM-4.1): the benefit is the code, shown with the tracked link
patch("<div class=\"pct\">Up to ${o.pct}% Cashback</div><div class=\"cap\">Online, through the offer link</div>", "<div class=\"pct\">${o.promo?o.benefit:'Up to '+o.pct+'% Cashback'}</div><div class=\"cap\">${o.promo?'Online, with a promo code':'Online, through the offer link'}</div>")
patch("<div class=\"name\">${o.name}</div><div class=\"pct\">${o.pct}% Cashback</div><div class=\"cap\">Max cashback AED ${o.cap}</div>\n    <div class=\"act\">", "<div class=\"name\">${o.name}</div><div class=\"pct\">${o.promo?o.benefit:o.pct+'% Cashback'}</div><div class=\"cap\">${o.promo?'Online, with a promo code':`Max cashback AED ${o.cap}`}</div>\n    <div class=\"act\">")
patch("${isAff(o)?'Any card · tap through each time':`Max cashback AED ${o.cap}`}", "${`Max cashback AED ${o.cap}`}")
patch("<h2>Shop via link</h2><p>Tap through from here, pay with any card</p>", "<h2 data-req=\"CL-3.1\">Shop via link</h2><p>Open the store from this app. Purchases there earn cashback.</p>")
# original screens: show only what our answers commit to (audit 2026-11-10)
# no answer commits multi-category activation (CL-5.1 commits one offer or all offers in one step)
patch('<h2 style="white-space:nowrap">Browse by categories</h2><button class="sub-link" data-open="bycat" style="font-size:13px">Activate by category ${I.chevS}</button>', '<h2 style="white-space:nowrap">Browse by categories</h2>')
# crediting the card is the bank's own system: the platform marks cashback payable after the refund window (LAF-34, LAF-120)
patch("3. Cashback shows as pending, then is credited to your card after the ${o.hold}-day refund window.", "3. Cashback shows as pending until the ${o.hold}-day refund window ends.")
patch("the cashback shows here until it’s credited.", "the cashback shows here until its refund window ends.")
patch("Cashback moves here once its refund window ends and it’s added to your card.", "Cashback moves here once its refund window ends.")
patch("paid:`cashback credited on <b>${t.paidOn}</b>`,reversed:`cashback reversed on <b>${t.revOn}</b>`,late:'Taking longer than usual'}", "paid:`cashback payable from <b>${t.paidOn}</b>`,reversed:`cashback reversed on <b>${t.revOn}</b>`,late:'Pending confirmation'}")
# support and service-level promises are not in our answers
patch(":t.status==='late'?`<div class=\"banner info\" style=\"margin-top:22px\">${I.info}<span>Taking longer than usual. It’s usually credited within 5 working days.</span></div>`:'';", ":'';")
patch("reversed:['soft','Get help'],late:['soft','Contact support']}", "reversed:['soft','View Offer'],late:['soft','View Offer']}")
# "limit reached" is the exhausted offer state, in the delivery plan (CL-6.11). cext.js turns o.limit on only in plan mode.
patch("You’ve earned the maximum AED ${o.cap} cashback on this offer. It’ll stay in your history.", "You’ve earned the maximum AED ${o.cap} cashback on this offer. ${window.CEXT?window.CEXT.tag('CL-6.11'):''}")
# offer feed order: CL-4.6 (ML personal sort) conflicts with CL-4.2 and CL-4.3 (ML ranking in the plan). Neutral name until fixed.
patch('<div><h2>Recommended for you</h2><p>Based on your spending behaviour</p></div>', '<div><h2>Offers for your cards</h2></div>')
# Requirement tags (data-req) on original screens that had none. Each control names only the rows whose answer describes it.
req_patches = [
    # Home: the SDK offer feed (CL-6.2) in the bank's theme and name (CL-6.7). The span keeps the topbar markup that cext.js reads.
    ('<div class="topbar">${I.menu}<h1>Cashback</h1></div>', '<div class="topbar">${I.menu}<h1><span data-req="CL-6.2 CL-6.7">Cashback</span></h1></div>'),
    # Feed and categories come from the offer feed and categories APIs (CL-6.1) and read the live state (CL-6.10)
    ('<h2 style="white-space:nowrap">Browse by categories</h2>', '<h2 style="white-space:nowrap" data-req="CL-6.1">Browse by categories</h2>'),
    ('<div class="cats">${CATS.map(', '<div class="cats" data-req="CL-6.1">${CATS.map('),
    ('<div><h2>Offers for your cards</h2></div>', '<div><h2 data-req="CL-6.1 CL-6.10">Offers for your cards</h2></div>'),
    ('<h2>All offers</h2><button class="btn-sm" data-actall="all">', '<h2 data-req="CL-6.1 CL-6.10">All offers</h2><button class="btn-sm" data-actall="all" data-req="CL-5.1">'),
    ('data-actall="expiring">', 'data-actall="expiring" data-req="CL-5.1">'),
    ('data-actall="cat:${cat}">', 'data-actall="cat:${cat}" data-req="CL-5.1">'),
    ('data-actall="top">', 'data-actall="top" data-req="CL-5.1">'),
    ('<div class="s-head"><h2>${title}</h2>', '<div class="s-head"><h2 data-req="CL-6.1">${title}</h2>'),
    ('<div class="chips">${CHIPS.map', '<div class="chips" data-req="CL-6.1">${CHIPS.map'),
    # Activation: the customer activates in the bank's app (CL-5.2), the exact time is recorded (CL-5.6), one activation per offer (CL-5.9)
    ('<button class="pill ${wide?\'wide\':\'\'}" data-act="${o.id}">Activate</button>', '<button class="pill ${wide?\'wide\':\'\'}" data-act="${o.id}" data-req="CL-5.2">Activate</button>'),
    ('cta=`<button class="btn" data-act="${o.id}">Activate the offer</button>`', 'cta=`<button class="btn" data-act="${o.id}" data-req="CL-5.2 CL-5.6">Activate the offer</button>`'),
    ('cta=`<div class="btn done">${I.check} Offer activated</div>`', 'cta=`<div class="btn done" data-req="CL-5.9 CL-6.10">${I.check} Offer activated</div>`'),
    # Offer details: title, description, terms, cap, minimum spend, dates and channel (CL-6.13), validity and steps to get cashback (OM-6.4)
    ('${banner}\n      <h3>${o.title}</h3>\n      <div class="desc">${o.desc}</div>\n      <div class="terms">', '${banner}\n      <h3 data-req="CL-6.13 CL-6.2">${o.title}</h3>\n      <div class="desc">${o.desc}</div>\n      <div class="terms" data-req="CL-6.13">'),
    ('`<div class="kv"><span class="k">${I.cal} Valid till</span><span class="v">${o.valid}</span></div>`}', '`<div class="kv" data-req="CL-6.13 OM-6.4"><span class="k">${I.cal} Valid till</span><span class="v">${o.valid}</span></div>`}'),
    ('${o.valid}</span></div>`}\n      <div class="kv"><span class="k">${I.store} Applicable on</span>', '${o.valid}</span></div>`}\n      <div class="kv" data-req="CL-6.13"><span class="k">${I.store} Applicable on</span>'),
    ('<h4>How it works</h4>', '<h4 data-req="OM-6.4 CL-6.13">How it works</h4>'),
    # Activated toast: activation (CL-5.2) shows at once (CL-6.10). A repeated request creates no duplicate (CL-5.9).
    ("html+=`<div class=\"toast ${S.toast.bye?'bye':''}\">", "html+=`<div class=\"toast ${S.toast.bye?'bye':''}\"${/^Offer activated/.test(S.toast.text)?' data-req=\"CL-5.2 CL-6.10\"':/already activated/.test(S.toast.text)?' data-req=\"CL-5.9\"':/^Opening /.test(S.toast.text)?' data-req=\"CL-3.1 OM-2.3\"':/^Code copied/.test(S.toast.text)?' data-req=\"OM-6.8 OM-4.10\"':''}>"),
]
for old, new in req_patches:
    assert s.count(old) == 1, 'tag hook not unique: ' + old[:90]
    patch(old, new)
# v2 wallet (13 Nov 2026): offers-first home with three tabs drawn by the add-on, Lune typography, auto-activated offers (CL-5.1, OM-4.8),
# offers that stay activated across scenario resets (progress offers, CL-6.17), and the benefit text on the offer sheet.
patch("family=Inter:wght@400;500;600;700;800", "family=Plus+Jakarta+Sans:wght@400;500;600;700;800")
patch("function renderHome(){", "function renderHome(){if(window.CEXT&&window.CEXT.home)return window.CEXT.home();")
patch("OFFERS.forEach(o=>{o.activated=ACTIVATED.includes(o.id);});", "OFFERS.forEach(o=>{o.activated=ACTIVATED.includes(o.id)||!!o.pre;});")
patch("  if(isAff(o)) return shopBtn(o);\n", "  if(isAff(o)) return shopBtn(o);\n  if(o.auto) return `<span class=\"pill auto ${wide?'wide':''}\" data-req=\"CL-5.1 OM-4.8\">No activation needed</span>`;\n")
patch('cta=`<div class="btn done" data-req="CL-5.9 CL-6.10">${I.check} Offer activated</div>`', 'cta=o.auto?`<div class="btn done" data-req="CL-5.1 OM-4.8">${I.check} No activation needed</div>`:`<div class="btn done" data-req="CL-5.9 CL-6.10">${I.check} Offer activated</div>`')
patch('<span class="tag green">${o.pct}% Cashback</span>${st===', '<span class="tag green">${o.benefit||o.pct+\'% Cashback\'}</span>${st===')
# only the logos this wallet uses
line = [l for l in s.split('\n') if l.startswith('const LOGOS=')][0]
named = dict(re.findall(r"'([\w.\-]+)':LUNE_LOGO\+'([\w.\-]+)'", line))
doms = sorted(set(re.findall(r"domain:\s*'([\w.\-]+)'", s + ext)))
wanted = {('https://brandlogos.azureedge.net/media/brand_logos/' + named[d]) if d in named else ('https://img.logo.dev/%s?token=pk_PCfI5A2ISc2tZmQNIql7Ww&size=128&format=png&retina=true' % d) for d in doms}
# data before the app, add-on after it
used = [u for u in re.findall(r"https://[^'\"`\s]+", s) if u in logos]
ids = sorted(k for k in used_ids(ext + ''.join(n for _, n in req_patches)) if k in reqs)
head_js = "<script>window.__COVERS__=" + json.dumps(covers) + ";window.__LOGOS__=" + json.dumps({k: logos[k] for k in logos if k in wanted}) + ";window.RFP_REQS=" + json.dumps({k: reqs[k] for k in ids}, ensure_ascii=False).replace('</', '<\\/') + ";</script>"
i = s.rfind('<script>')
s = s[:i] + head_js + s[i:]
patch("</body>", "<script>" + ext + "</script><script>" + tips + "</script>\n</body>")
out = os.path.join(root, 'wallet-rfp.html')
import sys as _s; _s.path.insert(0, os.path.join(root, 'src', '_shared')); import rebrand  # demo merchants -> RFP offer set (13 Nov 2026)
s = rebrand.apply(s, 'wallet')
open(out, 'w').write(s)
print('built', out, os.path.getsize(out), 'rows', len(ids))
