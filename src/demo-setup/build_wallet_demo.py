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
         'html[data-look=tint] .device,html[data-look=both] .device{--bg:color-mix(in srgb,var(--bank) 8%,#fff)}'
         'html[data-look=tint] .cx-tabs,html[data-look=both] .cx-tabs,html[data-look=tint] .cx-q,html[data-look=both] .cx-q{background:color-mix(in srgb,var(--bank) 14%,#fff)}'
         # white bands between tinted sections (wb-adapter.js wraps Browse and All offers)
         '.wb-sec{display:flex;flex-direction:column;gap:16px;margin:4px -18px;padding:20px 18px}'
         'html[data-look=tint] .wb-sec,html[data-look=both] .wb-sec{background:#fff}'
         '.wb-sec.last{margin-bottom:-112px;padding-bottom:132px}'
         '.wb-sec.top{margin:-58px -18px 4px;padding:58px 18px 20px}')
patch('</head>', '<style>' + CURSOR + LOOKS + '</style></head>')


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
