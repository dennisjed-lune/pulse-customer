#!/usr/bin/env python3
"""Build the bank-demo wallet for pulse-customer (18 Nov 2026).
Base: the wallet as published on dennisjed-lune.github.io/pulse-customer (13 Nov build, pitch mode),
kept in rfp-work/pitch/wallet-base-1113.html. Adds:
  1. My offers as a grid, three tiles in each row.
  2. The demo setup screen from pulse-mobile-demo (vendor/setup.js) before the demo, with its country
     catalogue (vendor/country.js) and exchange rates (vendor/fx.js).
  3. wb-adapter.js, which applies the saved bank to the wallet.
Usage: python3 src/customer-demo/build_wallet_demo.py  ->  ./wallet-demo.html"""
import os
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(os.path.dirname(here))
s = open(os.path.join(root, 'rfp-work', 'pitch', 'wallet-base-1113.html')).read()
rd = lambda *p: open(os.path.join(here, *p)).read()

def patch(old, new, count=1):
    global s
    assert s.count(old) == count, (s.count(old), old[:80])
    s = s.replace(old, new)

# 1. My offers grid
patch("""  const row = (o, badge, sub, open = true) => `<button class="cx-mrow" ${open ? `data-offer="${o.id}"` : 'data-noop'}><span class="cx-lg"><img src="${logo(o)}" alt=""></span><div><b>${o.name} · ${rate(o)}</b><small>${sub}</small></div>${badge}</button>`;""",
      """  /* Grid, three tiles in each row (18 Nov 2026). */
  const row = (o, badge, sub, open = true) => `<button class="cx-mtile" ${open ? `data-offer="${o.id}"` : 'data-noop'}><span class="cx-lg"><img src="${logo(o)}" alt=""></span><b>${o.name}</b><span class="cx-mrate">${rate(o)}</span><small>${sub}</small>${badge}</button>`;""")
patch("<div>${list || `<div class=\"cx-empty\">", "<div${list ? ' class=\"cx-mgrid\"' : ''}>${list || `<div class=\"cx-empty\">")
GRID = (".cx-mgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}"
        ".cx-mtile{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:12px;background:var(--card,#fff);text-align:left;cursor:pointer;font:inherit;color:inherit}"
        ".cx-mtile[data-noop]{cursor:default;opacity:.7}"
        ".cx-mtile .cx-lg{width:36px;height:36px;margin-bottom:2px}"
        ".cx-mtile b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13px;line-height:17px;font-weight:600;word-break:break-word}"
        ".cx-mtile .cx-mrate{font-size:12px;line-height:16px;font-weight:700;color:var(--bank)}"
        ".cx-mtile small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;line-height:15px;color:#6b7280}"
        ".cx-mtile > :last-child{margin-top:auto;max-width:100%;white-space:normal;text-align:left}")
patch('</head>', '<style>' + GRID + '</style></head>')
# Pitch mode hides the RFP tooltips, so their question-mark cursor goes too (18 Nov 2026).
CURSOR = ('[data-req],.rid,.badge{cursor:inherit!important}'
          'button[data-req],a[data-req],[data-req][data-cx],[data-req][data-offer],[data-req][data-open],[data-req][data-shop]{cursor:pointer!important}')
# Bank colour looks: borders, light tint, or both (the default, set in wb-adapter.js). ?look=none shows the neutral look.
LOOKS = ('html[data-look=border] .device,html[data-look=both] .device{--line:color-mix(in srgb,var(--bank) 40%,#fff)}'
         'html[data-look=border] .cx-tabs,html[data-look=both] .cx-tabs,html[data-look=border] .cx-q,html[data-look=both] .cx-q{box-shadow:inset 0 0 0 1px var(--line)}'
         # the screen is white; wb-adapter.js wraps Expiring soon and All offers in tinted bands
         'html[data-look=tint] .device,html[data-look=both] .device{--bg:#fff}'
         'html[data-look=tint] .cx-tabs,html[data-look=both] .cx-tabs,html[data-look=tint] .cx-q,html[data-look=both] .cx-q{background:color-mix(in srgb,var(--bank) 10%,#fff)}'
         '.wb-sec{display:flex;flex-direction:column;gap:16px;margin:4px -18px;padding:20px 18px}'
         'html[data-look=tint] .wb-sec,html[data-look=both] .wb-sec{background:color-mix(in srgb,var(--bank) 8%,#fff)}'
         '.wb-sec.last{margin-bottom:-112px;padding-bottom:132px}')
patch('</head>', '<style>' + CURSOR + LOOKS + '</style></head>')


# 1b. Easier join (18 Nov 2026): the slide completes past 55% of the track, a tap anywhere on the track joins,
#     and the hint says so. Before, the thumb had to reach the very end or it sprang back.
patch("thumb.addEventListener('pointerup', () => { if (!down) return; down = false; if (max && x >= max - 4) { put(max); accept(); } else if (moved > 6) back(); });",
      "thumb.addEventListener('pointerup', () => { if (!down) return; down = false; if (max && x >= max * 0.55) { thumb.style.transition = 'transform .15s'; fill.style.transition = 'width .15s'; put(max); setTimeout(accept, 140); } else if (moved > 6) back(); });\n"
      "  track.addEventListener('click', (e) => { if (e.target === thumb || thumb.contains(e.target) || moved > 6) return; span(); thumb.style.transition = 'transform .2s'; fill.style.transition = 'width .2s'; put(max); setTimeout(accept, 180); });")
patch("<p class=\"cx-en-hint\">Drag the button to the right. You can also press Enter on it.</p>", "<p class=\"cx-en-hint\">Slide or tap to accept the terms and join.</p>")
patch(".cx-slide{position:relative;height:60px;border-radius:999px;", ".cx-slide{cursor:pointer;position:relative;height:60px;border-radius:999px;")
patch(".cx-thumb{position:absolute;left:4px;top:4px;", ".cx-thumb{will-change:transform;position:absolute;left:4px;top:4px;")

# 1c. Transactions page (18 Nov 2026): the base demo's "My Earnings" sheet becomes "Transactions", with
#     Pending and Received tabs, in cashback or points to match the programme. It opens from the balance at the
#     top of every tab and from Rewards. Amounts are text ("AED 12.00" or "1,200 pts"), not the dirham symbol,
#     so the demo setup's currency conversion reaches them.
patch("const money=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});",
      "const money=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});\n"
      "const PTM=()=>!!(window.CEXT&&window.CEXT.mode&&window.CEXT.mode()!=='cashback');\n"
      "const PU=()=>PTM()?'points':'cashback';\n"
      "const RW=n=>PTM()?Math.round(n*100).toLocaleString('en-US')+' pts':'AED '+money(n);")
def fn(name):
    i = s.index('function ' + name + '(')
    j = s.index('\nfunction ', i + 10)
    return i, j
def infn(name, pairs):
    global s
    i, j = fn(name); body = s[i:j]
    for old, new, n in pairs:
        assert body.count(old) == n, (name, old[:60], body.count(old))
        body = body.replace(old, new)
    s = s[:i] + body + s[j:]
infn('earningsSheet', [
    ("<h2>My Earnings</h2><p>Pending AED ${money(pendingTotal())} &nbsp;·&nbsp; Earned AED ${money(earnedTotal())}</p>",
     "<h2>Transactions</h2><p>Pending ${RW(pendingTotal())} &nbsp;·&nbsp; Received ${RW(earnedTotal())}</p>", 1),
    ("data-tab=\"earned\">Earned</button>", "data-tab=\"earned\">Received</button>", 1),
    ("${tab==='pending'?'Pending':'Earned'} cashback</div>", "${tab==='pending'?'Pending':'Received'} ${PU()}</div>", 1),
    ("${dirham()}${money(groupTotal(g.items))}", "${RW(groupTotal(g.items))}", 1),
    ("${tab==='pending'?'On its way':'Total earned'}", "${tab==='pending'?'On its way':'Total received'}", 1),
    ("<span>Merchant / Date</span><span>Cashback</span>", "<span>Merchant / Date</span><span>${PTM()?'Points':'Cashback'}</span>", 1),
    ("${dirham()}${money(t.amt)}", "${RW(t.amt)}", 3),
])
infn('txSheet', [
    ("`cashback payable from <b>${t.paidOn}</b>`", "`${PTM()?'Points':'Cashback'} received on <b>${t.paidOn}</b>`", 1),
    ("`cashback reversed on <b>${t.revOn}</b>`", "`${PTM()?'Points':'Cashback'} reversed on <b>${t.revOn}</b>`", 1),
    ("so this cashback was reversed.", "so the ${PU()} was reversed.", 1),
    ("${dirham()}${money(t.amt)}", "${RW(t.amt)}", 1),
])
infn('linkTxSheet', [
    ("`cashback credited on <b>${t.paidOn}</b>`", "`${PTM()?'Points':'Cashback'} received on <b>${t.paidOn}</b>`", 1),
    ("${dirham()}${money(t.amt)}", "${RW(t.amt)}", 1),
])
# entry points: balance pill on every tab, Rewards (cashback and points)
patch("`<button class=\"cx-bal\" data-cx=\"tab\" data-v=\"rewards\" data-req=", "`<button class=\"cx-bal\" data-open=\"earnings\" data-req=")
patch("data-open=\"earnings\">Cashback history</button>", "data-open=\"earnings\">Transactions</button>")
patch("data-cx=\"points\">History</button>", "data-open=\"earnings\">Transactions</button>")
# points: the pending balance matches the pending transactions (171.70 x 100 points)
patch("const BAL = { available: 29680, pending: 4120 };", "const BAL = { available: 29680, pending: 17170 };")

# 2. Hooks for the adapter
patch("const BANKS = [['nova', 'Nova Bank', '#1c3d7a'],", "const BANKS = [window.WB ? ['nova', WB.bank, WB.color] : ['nova', 'Nova Bank', '#1c3d7a'],")
patch("const progName = () => `${bankName()} ${isPoints() ? 'Points' : 'Cashback'}`;",
      "const progName = () => (window.WB && WB.prog) || `${bankName()} ${isPoints() ? 'Points' : 'Cashback'}`;")
patch("const brandLogo=d=>{", "const brandLogo=d=>{d=(window.WB_DOM||{})[d]||d;")

# 3. Setup screen: mount on the wallet, button bottom left (the demo panel is top left), language note
setup = rd('vendor', 'setup.js')
def sp(old, new):
    global setup
    assert setup.count(old) == 1, old[:80]
    setup = setup.replace(old, new)
sp('if (document.body && document.querySelector("[data-theme]")) mount();', 'if (document.body && document.getElementById("device")) mount();')
sp('applyTheme(saved.color || "#B9500F", saved.font, saved.fontAr);', '/* the wallet applies colour and font itself (wb-adapter.js) */')
sp('.lsu-fab{position:fixed;top:16px;left:16px;', '.lsu-fab{position:fixed;bottom:16px;left:16px;')
sp('try { document.title = saved.en + " Offers Assistant"; } catch (e) {}', '')
sp('for="lsu-lang">Language</label>', 'for="lsu-lang">Language <span style="font-weight:500;color:rgba(7,3,18,.5)">(English only in this wallet for now)</span></label>')

head = ''.join('<script>' + x.replace('</script', '<\\/script') + '</script>' for x in [rd('vendor', 'fx.js'), rd('vendor', 'country.js'), setup, rd('wb-adapter.js')])
i = s.find('<script')
s = s[:i] + head + s[i:]
s = s.replace('<title>Lune Pulse · Customer journey · Nova Bank</title>', '<title>Lune Pulse · Customer journey</title>')
out = os.path.join(root, 'wallet-demo.html')
open(out, 'w').write(s)
print('built', out, len(s))
