/* Cardholder wallet + RFP loyalty systems. Add-on for the customer demo (lune-demo-48b.pages.dev/customer.html).
   v2 (13 Nov 2026): offers-first home in the Offers Assistant layout (Ajman design), three tabs (Offers, My offers, Rewards),
   Lune typography, neutral base with one primary colour from the bank theme (CL-6.7).
   One bank app, four programme types: Cashback, Points, Points + Tiers, Points + Bonus.
   Labels come from our answers in the RFP sheet plus triage decisions (window.RFP_REQS).
   Rule: show every customer-facing function our answers commit to, and nothing that no answer names. No map (CL-6.20). */
(() => {
'use strict';
const MODES = [['cashback', 'Cashback'], ['points', 'Points'], ['tiers', 'Points + Tiers'], ['bonus', 'Points + Bonus']];
const BANKS = [['nova', 'Nova Bank', '#1c3d7a'], ['copper', 'Copper bank', '#a3542a'], ['maroon', 'Maroon bank', '#7a1f3d'], ['ink', 'No brand colour', '#1f1e1c']];
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; };
const qs = new URLSearchParams(location.search);
let MODE = qs.get('programme') || store('walletProgramme') || 'cashback';
if (!MODES.some((m) => m[0] === MODE)) MODE = 'cashback';
let BANK = qs.get('bank') || store('walletBank') || 'nova';
if (!BANKS.some((b) => b[0] === BANK)) BANK = 'nova';
const PLAN = true;   // the wallet shows what Lune has ready now
let LABELS = store('walletLabels') !== 'off';
let TAB = qs.get('tab') || 'offers';
const PTS = 100;                     // sample point definition: 100 points = AED 1 (LAF-112)
const nf = (n) => Math.round(n).toLocaleString('en-US');
const pts = (n) => nf(n) + ' pts';
const isPoints = () => MODE !== 'cashback';
const aed = (n) => 'AED ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- labels from our answers ---------- */
const stat = (c) => (!c ? 'none' : /^Fully/.test(c) ? 'full' : /^Partial/.test(c) ? 'partial' : /^Not/.test(c) ? 'not' : 'none');
const tagText = (rows, part) => {
  const R = window.RFP_REQS || {}, ids = String(rows || '').split(/\s+/).filter(Boolean);
  if (!ids.length) return ['Available today', 'info'];
  const st = new Set(ids.map((i) => stat((R[i] || {}).c)));
  if (st.has('none')) return ['No answer yet', 'out'];
  if (st.size === 1 && st.has('not')) return ['Not Compliant', 'bad'];
  if (part === 'plan') { if (st.size === 1 && st.has('full')) return ['Fully Compliant', 'ok']; if (st.has('full')) return ['Answers conflict', 'bad']; return ['Partially Compliant', 'info']; }
  if (st.has('not')) return ['Answers conflict', 'bad'];
  return st.has('partial') ? ['Partially Compliant · available today', 'info'] : ['Fully Compliant', 'ok'];
};
const tag = (rows, part = 'today') => { const [t, k] = tagText(rows, part); return `<span class="cx-tag cx-${k}"${rows ? ` data-req="${rows}"` : ''}>${t}</span>`; };

/* ---------- theme: neutral base, bank primary, Lune typography (Plus Jakarta Sans, 14px medium body, 12px helper) ---------- */
const css = document.createElement('style');
css.textContent = `:root{--font:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,system-ui,sans-serif}
body{background:#e9e9e4!important}
.device{--bank:#1c3d7a;--tint:color-mix(in srgb,var(--bank) 9%,#fff);--tint2:color-mix(in srgb,var(--bank) 26%,#fff);
  --navy:var(--bank);--navy-deep:var(--bank);--navy-mid:var(--bank);--navy-light:var(--bank);--blue-tint:var(--tint);--blue-ink:var(--bank);
  --green:var(--bank);--green-tint:var(--tint);--bg:#fbf8f5;--card:#fff;--line:#ebe5e2;--chip:#f2ede9;--ink:#1f1916;--ink-2:#726a66;--ink-3:#8a817c;
  font-family:var(--font);font-size:14px;font-weight:500;color:var(--ink)}
.device .statusbar{color:#1f1916!important;background:linear-gradient(180deg,#fbf8f5 72%,rgba(251,248,245,0));height:58px}
.device .sec-h h2,.device .sheet .s-head h2{font-size:18px;font-weight:700;letter-spacing:-.2px}
.device .sec-h p,.device .sheet .s-head p{font-size:12px;color:var(--ink-2)}
.device .row{border-radius:16px;padding:12px 14px}.device .row .name,.device .tcard .name{font-size:14px;font-weight:600}
.device .row .pct,.device .tcard .pct{font-size:13px}.device .row .cap,.device .tcard .cap{font-size:12px}
.device .btn{font-size:14px;padding:15px}.device .pill{font-size:13px}.device .link,.device .view-all{font-size:14px}
.device .seg button{font-size:14px;padding:10px}.device .banner{font-size:13px}.device .o-body h3{font-size:18px}
.device .o-body .desc,.device .how,.device .kv{font-size:13px}.device .btn-sm{font-size:13px}
.device .toast{font-size:13px;bottom:104px}
.cx-tag{display:inline-flex;align-items:center;width:fit-content;white-space:nowrap;border-radius:999px;border:1px solid;padding:1px 8px;font:600 10.5px/15px var(--font);vertical-align:2px}
.cx-ok{background:#effef4;color:#08451f;border-color:#d0efdb}.cx-info{background:#eef2f6;color:#1e3a5f;border-color:#d8e1ea}.cx-warn{background:#fff7eb;color:#66440c;border-color:#ffeed2}.cx-bad{background:#ffecec;color:#621515;border-color:#fdd7d7}.cx-out{background:#fff;color:#656565;border-color:#e1e1e1}
.cx-nolabels .cx-tag{display:none!important}
.cx-bar{position:fixed;left:16px;top:16px;z-index:300;display:flex;flex-direction:column;align-items:flex-start;gap:8px;width:250px;padding:8px 10px;border-radius:14px;background:#fff;border:1px solid #e1e1e1;box-shadow:0 8px 24px rgba(0,0,0,.12);font:600 12px/1.2 var(--font);color:#383838}
.cx-bar .seg2{display:inline-flex;flex-wrap:wrap;gap:2px;background:#f5f5f5;border-radius:10px;padding:2px}.cx-bar button{border:0;background:transparent;border-radius:8px;padding:0 10px;min-height:32px;font:inherit;color:#656565;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.cx-bar button[aria-pressed=true]{background:#fff;color:#101010;box-shadow:0 1px 2px rgba(0,0,0,.1)}
@media (max-width:980px){.cx-bar{position:static;width:auto;flex-direction:row;flex-wrap:wrap;margin:0 auto 12px}}
.cx-bar .lab{font-size:11px;color:#8a817c;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
.cx-bar i.sw{width:12px;height:12px;border-radius:50%;display:inline-block}
.cx-scr{padding:58px 18px 112px;display:flex;flex-direction:column;gap:16px}
.cx-top{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:44px}
.cx-top h1{font-size:24px;font-weight:700;letter-spacing:-.3px}
.cx-bal{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--tint2);background:var(--tint);border-radius:999px;padding:5px 12px 5px 5px;min-height:36px;font:700 13px var(--font);color:var(--ink);cursor:pointer}
.cx-bal i{width:26px;height:26px;border-radius:50%;background:var(--bank);color:#fff;display:grid;place-items:center;font:700 11px var(--font);font-style:normal}
.cx-q{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;border-radius:999px;background:#f2ede9;border:1px solid var(--line);padding:0 16px;color:#8a817c;font:500 14px var(--font);text-align:left;cursor:pointer}
.cx-actpill{display:flex;align-items:center;gap:10px;width:100%;border:1px solid var(--tint2);background:var(--tint);border-radius:999px;padding:8px 14px 8px 8px;min-height:46px;font:600 13px var(--font);color:var(--ink);text-align:left;cursor:pointer}
.cx-stack{display:flex}.cx-stack span{width:28px;height:28px;border-radius:50%;margin-left:-9px;border:2px solid #fff;overflow:hidden;background:#fff}.cx-stack span:first-child{margin-left:0}.cx-stack img{width:100%;height:100%;object-fit:cover;display:block}
.cx-h{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.cx-h h2{font-size:16px;font-weight:700}.cx-h p{font-size:12px;color:var(--ink-2);width:100%;margin-top:-6px}
.cx-list{display:flex;flex-direction:column;gap:10px}
.cx-prog{display:flex;align-items:center;gap:12px;width:100%;background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 14px;text-align:left;font:500 13px var(--font);color:var(--ink);cursor:pointer}
.cx-prog .t{font-weight:600;display:block}.cx-prog small{display:block;color:var(--ink-2);font-size:12px;margin-top:2px}
.cx-prog .n{margin-left:auto;font-weight:700;color:var(--bank);white-space:nowrap}
.cx-segs{display:flex;gap:4px;margin-top:7px}.cx-segs i{height:5px;flex:1;max-width:30px;border-radius:3px;background:var(--tint2)}.cx-segs i.f{background:var(--bank)}
.cx-bar2{height:6px;border-radius:3px;background:var(--tint2);overflow:hidden;margin-top:8px}.cx-bar2 i{display:block;height:100%;border-radius:3px;background:var(--bank)}
.cx-lg{width:40px;height:40px;border-radius:12px;border:1px solid var(--line);overflow:hidden;flex:none;background:#fff;display:grid;place-items:center}.cx-lg img{width:100%;height:100%;object-fit:cover;display:block}
.cx-rail{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;margin:0 -18px;padding:0 18px 2px;scroll-snap-type:x mandatory}.cx-rail::-webkit-scrollbar{display:none}
.cx-oc{flex:none;width:156px;background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;text-align:left;cursor:pointer;scroll-snap-align:start}
.cx-oc .im{display:block;height:112px;position:relative;background:#e6e1da center/cover no-repeat}
.cx-oc .bdg{position:absolute;left:8px;top:8px;background:rgba(31,25,22,.74);color:#fff;border-radius:999px;padding:2px 9px;font:600 11px var(--font)}
.cx-oc .lgo{position:absolute;left:10px;bottom:-18px;width:42px;height:42px;border-radius:12px;border:2px solid #fff;background:#fff;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}.cx-oc .lgo img{width:100%;height:100%;object-fit:cover}
.cx-oc .bd{display:block;padding:24px 12px 12px}.cx-oc .bd b{display:block;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-oc .ft{display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:6px}.cx-oc .ft small{color:var(--bank);font-weight:700;font-size:13px}
.cx-plus{width:36px;height:36px;border-radius:50%;background:var(--bank);color:#fff;display:grid;place-items:center;font:500 22px/1 var(--font);flex:none;border:0;cursor:pointer}
.cx-plus.done{background:var(--tint);color:var(--bank);font-size:15px}
.cx-plus.busy{opacity:.55}
.cx-coll{position:relative;overflow:hidden;border-radius:18px;padding:16px;min-height:92px;color:#fff;display:flex;justify-content:space-between;align-items:flex-end;width:100%;text-align:left;cursor:pointer;background:#5b4a3a center/cover no-repeat;border:0}
.cx-coll::before{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(20,14,10,.74),rgba(20,14,10,.05))}
.cx-coll>*{position:relative}.cx-coll b{font-size:16px;font-weight:700;display:block}.cx-coll small{opacity:.9;font-size:12px}
.cx-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cx-tile{background:#fff;border:1px solid var(--line);border-radius:18px;padding:12px 10px;display:grid;gap:8px;text-align:left;cursor:pointer;font:500 13px var(--font);color:var(--ink)}
.cx-tile .ic{width:34px;height:34px;border-radius:10px;background:var(--tint);color:var(--bank);display:grid;place-items:center}.cx-tile .ic svg{width:20px;height:20px}
.cx-tile b{font-weight:600;display:block}.cx-tile small{font-size:11.5px;color:var(--ink-2)}
.cx-nav{position:absolute;left:14px;right:14px;bottom:24px;z-index:30;background:#fff;border-radius:28px;box-shadow:0 6px 20px rgba(7,3,18,.1),0 1px 3px rgba(7,3,18,.08);padding:6px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.cx-nav button{display:grid;justify-items:center;gap:2px;padding:8px 4px 7px;border-radius:22px;font:600 12px var(--font);color:var(--ink-2);border:0;background:none;cursor:pointer;min-height:52px}
.cx-nav button[aria-current=page]{background:var(--tint);color:var(--bank)}.cx-nav svg{width:22px;height:22px}
.cx-tabs{display:flex;gap:2px;background:#f2ede9;border-radius:999px;padding:4px}.cx-tabs button{flex:1;min-height:36px;border-radius:999px;border:0;background:none;font:600 12.5px var(--font);color:var(--ink-2);cursor:pointer;white-space:nowrap}.cx-tabs button[aria-pressed=true]{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(31,25,22,.08)}
.cx-mrow{display:flex;align-items:center;gap:12px;width:100%;padding:12px 0;border:0;border-bottom:1px solid var(--line);background:none;text-align:left;font:500 13px var(--font);color:var(--ink);cursor:pointer}
.cx-mrow div{flex:1;min-width:0}.cx-mrow b{font-weight:600;display:block}.cx-mrow small{color:var(--ink-2);display:block;font-size:12px;margin-top:2px}
.cx-st{font:700 11px var(--font);border-radius:999px;padding:3px 9px;white-space:nowrap}
.cx-st.a{background:var(--tint);color:var(--bank)}.cx-st.r{background:#f2ede9;color:#4a423d}.cx-st.x{background:#fdecec;color:#7a1b1b}.cx-st.e{background:#f2ede9;color:#8a817c}
.cx-card{border-radius:18px;background:#fff;border:1px solid var(--line);padding:14px 16px;display:flex;flex-direction:column;gap:10px;color:var(--ink);text-align:left}
.cx-card h3{margin:0;font-size:15px;font-weight:700}.cx-card p{margin:0;font-size:12px;color:var(--ink-2);line-height:1.4}
.cx-hero .lbl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2);font-weight:600}
.cx-big{font:700 30px/1.1 var(--font);letter-spacing:-.5px;color:var(--ink)}
.cx-row{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:13px}.cx-row b{font-weight:700}
.cx-btns{display:flex;gap:8px;flex-wrap:wrap}
.cx-b{min-height:44px;border-radius:999px;padding:0 18px;font:700 13px var(--font);border:1.5px solid var(--bank);background:#fff;color:var(--bank);cursor:pointer;flex:1}
.cx-b.pri{background:var(--bank);color:#fff}
.cx-lot{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:12px 0;border-bottom:1px solid #f0ece8;font-size:13px;line-height:1.45}.cx-lot small{color:#7c8186;font-size:12px}
.cx-lot>span:last-child{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.cx-lot>span:last-child br{display:none}
.cx-lot b{font-weight:700;color:var(--ink)}.cx-lot b.neg{color:#7a1b1b}
.cx-chip{border:1px solid var(--line);background:#fff;border-radius:999px;padding:0 12px;min-height:36px;font:600 12.5px var(--font);color:var(--ink);cursor:pointer}.cx-chip[aria-pressed=true]{background:var(--bank);border-color:var(--bank);color:#fff}
.cx-tiers{display:flex;flex-direction:column;gap:8px}.cx-tier{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:14px;padding:10px 12px}.cx-tier.on{border-color:var(--bank);background:var(--tint)}
.cx-tier .t{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font:800 12px var(--font);color:#fff}
.cx-acts{display:flex;gap:8px;margin-top:14px}.cx-acts button{flex:1;min-height:44px;border-radius:999px;border:1px solid var(--line);background:#fff;font:600 13px var(--font);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}.cx-acts button[aria-pressed=true]{border-color:var(--bank);color:var(--bank);background:var(--tint)}
.cx-in{width:100%;min-height:44px;border-radius:12px;border:1px solid #d6d6d6;padding:0 12px;font:500 14px var(--font);box-sizing:border-box}
.cx-lbl{display:block;font:600 12px var(--font);color:#383838;margin:12px 0 6px}
.cx-seg{display:flex;gap:4px;background:#f2ede9;border-radius:12px;padding:3px;margin-bottom:12px;flex-wrap:wrap}.cx-seg button{flex:1;min-height:36px;border:0;border-radius:9px;background:none;font:600 12px var(--font);color:#656565;cursor:pointer}.cx-seg button[aria-pressed=true]{background:#fff;color:#101010;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.cx-orow{display:flex;align-items:center;gap:12px;width:100%;border:0;border-bottom:1px solid #f0ece8;background:none;padding:10px 0;min-height:56px;font:500 13px var(--font);color:var(--ink);cursor:pointer}.cx-orow small{color:#7c8186;font-size:12px}
.cx-code{margin-top:12px;border:1.5px dashed var(--bank);border-radius:14px;background:var(--tint);padding:12px 14px;display:flex;flex-direction:column;gap:2px;align-items:center}.cx-code .c{font:800 22px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:3px;color:var(--bank)}.cx-code .s{font-size:12px;color:var(--bank)}
.cx-plain{margin:12px 0 0;font-size:12.5px;color:#383838;line-height:1.4}
.cx-empty{text-align:center;color:var(--ink-2);font-size:13px;padding:36px 12px}
.cx-enrol{position:absolute;inset:0;display:flex;flex-direction:column;gap:14px;padding:62px 18px 26px;background:var(--bg);box-sizing:border-box}
.cx-en-logo{width:44px;height:44px;border-radius:13px;background:var(--bank);color:#fff;display:grid;place-items:center;font:800 18px var(--font);flex:none}
.cx-enrol h1{font-size:23px;font-weight:700;letter-spacing:-.3px;margin:10px 0 0;line-height:1.22}
.cx-enrol>p{margin:0;font-size:14px;color:var(--ink-2);line-height:1.45}
.cx-en-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.cx-en-list li{display:flex;gap:10px;font-size:13.5px;line-height:1.4}
.cx-en-list li::before{content:"\\2713";color:var(--bank);font-weight:800;flex:none}
.cx-terms{flex:1;min-height:110px;overflow-y:auto;background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px 16px;font-size:12.5px;line-height:1.5;color:var(--ink-2)}
.cx-terms h2{font-size:13px;font-weight:700;color:var(--ink);margin:0 0 6px}
.cx-terms h3{font-size:12.5px;font-weight:700;color:var(--ink);margin:13px 0 3px}
.cx-terms p{margin:0}
.cx-slide{position:relative;height:60px;border-radius:999px;background:var(--tint);border:1px solid var(--tint2);overflow:hidden;touch-action:none;user-select:none;flex:none}
.cx-slide .fill{position:absolute;left:0;top:0;bottom:0;width:56px;background:var(--bank);opacity:.13}
.cx-slide .txt{position:absolute;inset:0 14px 0 60px;display:grid;place-items:center;font:700 14px var(--font);color:var(--bank);pointer-events:none;text-align:center}
.cx-thumb{position:absolute;left:4px;top:4px;width:52px;height:52px;border-radius:50%;border:0;background:var(--bank);color:#fff;font:600 21px/1 var(--font);display:grid;place-items:center;cursor:grab;touch-action:none}
.cx-thumb:active{cursor:grabbing}
.cx-thumb:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.cx-en-hint{margin:0;font-size:12px;color:var(--ink-3);text-align:center}
.cx-done{justify-content:center;gap:12px}
.cx-tick{width:64px;height:64px;border-radius:50%;background:var(--bank);color:#fff;display:grid;place-items:center;font:700 30px/1 var(--font);flex:none}
.cx-en-foot{position:absolute;left:18px;right:18px;bottom:26px}
.cx-en-foot .btn{width:100%}
.pill.auto{border-color:var(--tint2);background:var(--tint);color:var(--bank)}`;
document.head.appendChild(css);

/* ---------- sample loyalty data (Nova Bank) ---------- */
const BAL = { available: 29680, pending: 4120 };
const EXPIRY = [['31 Dec 2026', 1200], ['31 Mar 2027', 3400], ['30 Jun 2027', 5200], ['2 Nov 2027', 7500]];   // LAF-36, LAF-113, LAF-172
const LOTS = [
  { m: 'Carrefour', d: '2 Nov 2026', p: 4000, st: 'Pending', exp: '2 Nov 2027', kind: 'Base' },
  { m: 'Carrefour', d: '2 Nov 2026', p: 2000, st: 'Pending', exp: '2 Nov 2027', kind: 'Tier extra (Gold 1.5x)', tier: 1 },
  { m: 'Carrefour', d: '2 Nov 2026', p: 1500, st: 'Pending', exp: '2 Nov 2027', kind: 'Bonus campaign', bonus: 1 },
  { m: 'Nova Bank', d: '28 Oct 2026', p: 1000, st: 'Available', exp: '28 Oct 2027', kind: 'Birthday bonus', rows: 'LAF-210' },
  { m: 'Amazon', d: '18 Oct 2026', p: 2500, st: 'Available', exp: '18 Oct 2027', kind: 'Base' },
  { m: 'Nova Bank', d: '1 Oct 2026', p: 2000, st: 'Available', exp: '1 Oct 2027', kind: 'Salary account bonus', rows: 'LAF-209' },
  { m: 'Starbucks', d: '7 Oct 2026', p: 1840, st: 'Reversed', exp: '–', kind: 'Base', note: 'Refund in the refund window' },
  { m: 'Etihad', d: '3 Jan 2026', p: 1200, st: 'Available', exp: '31 Dec 2026', kind: 'Base' },
  { m: 'Points redeemed', d: '12 Sep 2026', p: -10000, st: 'Redeemed', exp: '–', kind: 'Redemption' },
  { m: 'Noon', d: '20 Nov 2025', p: 900, st: 'Expired', exp: '20 Nov 2026', kind: 'Base' }
];
const ST_CLS = { Available: 'a', Pending: 'r', Expired: 'e', Reversed: 'x', Redeemed: 'r' };
const TIERS = [['Base', '1x', 0, '#9e9e9e'], ['Silver', '1.25x', 6000, '#7c8186'], ['Gold', '1.5x', 15000, '#b8932a'], ['Platinum', '2x', 40000, '#2b2b2b']];
const ME = { tier: 2, earned12: 22400 };
/* Tier qualification (LAF-133, LAF-134, LAF-135): one measure, a rolling window, a monthly check. */
const TIERQ = { measure: 'Points earned', unit: 'points', window: 'the last 12 months', check: '1 Dec 2026' };
const tierNext = () => {
  const cur = TIERS[ME.tier], next = TIERS[ME.tier + 1];
  const from = cur[2], to = next ? next[2] : from;
  const pct = next ? Math.max(2, Math.min(100, (ME.earned12 - from) / (to - from) * 100)) : 100;
  return { cur, next, left: next ? Math.max(0, to - ME.earned12) : 0, pct };
};
const BONUS = [
  { m: 'Carrefour', t: 'Double points', d: 'Valid 14 Nov to 15 Nov 2026', rows: 'CL-3.6 LAF-121 LAF-149' },
  { m: 'Lulu', t: '2,000 bonus points on each purchase of AED 500 or more', d: 'Valid 1 Nov to 30 Nov 2026', rows: 'LAF-89 LAF-149' }
];
/* Missions, streaks and badges: Lune's team configures them, customers see progress and status in the app (LAF-205, LAF-206, LAF-207). */
const MISSIONS = [
  { t: '5 purchases this month', done: 3, goal: 5, cash: 'AED 20 bonus', pts: '500 points' },
  { t: 'Weekly shopper streak', s: 'A purchase every week for 4 weeks', done: 3, goal: 4, cash: 'AED 15 bonus', pts: '1,000 points' }
];
const BADGES = [{ t: 'Weekend regular', d: '4 weekend purchases in a row', on: true }, { t: 'Explorer', d: 'Use offers in 3 categories', on: false, done: 2, goal: 3 }];
const SAV = { month: { saved: 86.4, redeemed: 4 }, year: { saved: 1218.75, redeemed: 37 } };   // CL-6.21
/* Campaigns that ended recently (their cashback is in the base demo's history). Shown in My offers > Expired (CL-6.11). */
const ENDED = [
  { id: 'subway', name: 'Subway', domain: 'subway.com', title: 'Back to Work Lunch at Subway', pct: 10, ended: 'Ended 30 Oct 2026' },
  { id: 'mcdonalds', name: "McDonald's", domain: 'mcdonalds.com', title: "Summer Meals at McDonald's", pct: 10, ended: 'Ended 15 Oct 2026' }
];

/* ---------- app access ---------- */
const C2 = () => window.__C || {};
const C = () => window.__C;
const logo = (o) => (C2().brandLogo ? C2().brandLogo(o.domain) : '');
const offers = () => C2().OFFERS || [];
const isAff = (o) => o.mech === 'aff';
const catL = (id) => ((C2().CATS || []).find((c) => c.id === id) || {}).label || '';
const COVER_ALIAS = { Samsung: 'du' };   // the rebrand step renames the offer id du to Samsung
const cover = (o) => (window.__COVERS__ || {})['nb-' + (o.coverId || COVER_ALIAS[o.id] || o.id)] || o.hero || '';
const benefit = (o) => o.prog ? (isPoints() ? o.prog.pts : o.prog.cash) : o.benefit;
const rate = (o) => (o.benefit || o.prog) ? benefit(o) : isPoints() ? `${nf(o.pct * PTS / 100 * (MODE === 'tiers' ? 1.5 : 1))} pts / AED 1` : `${isAff(o) ? 'Up to ' : ''}${o.pct}%`;
const days = (o) => o.limit ? 'Limit reached' : o.days === 0 ? 'Last day' : `${o.days} days left`;

/* ---------- extra offers ---------- */
/* Affiliate offer (CL-3.1): Pulse uses the affiliate purchase record to attribute cashback. Trackable offer URL per offer (OM-2.3). Cashback mode only. */
const AFF_ID = 'expedia-link';
const affOffer = () => { const base = offers().find((o) => o.id === 'expedia') || {}; const like = offers().find((o) => o.days === 18) || base; return { ...base, id: AFF_ID, coverId: 'expedia', mech: 'aff', name: 'Expedia', domain: 'expedia.ae', site: 'expedia.com', pct: 20, cap: 100, min: 500, days: 18, valid: like.valid || base.valid, cat: '15', sub: '15-1', title: 'Hotel bookings on expedia.com', desc: 'Open Expedia from this offer and book your hotel online. Expedia sends the purchase record and you get cashback.', channel: 'Online', hold: 30, top: false, expiring: false, all: true, rec: 0, activated: false, limit: false, hero: cover({ id: 'expedia' }) }; };
/* Promo-code offer (OM-1.1, OM-4.1, OM-4.10): code and tracked link in the bank app. Code reveals are captured (OM-6.8). Cashback mode only. */
const PROMO_ID = 'namshi-code';
let CODE_SHOWN = false;
const promoOffer = () => { const base = offers().find((o) => o.id === 'expedia') || {}; return { ...base, id: PROMO_ID, mech: 'aff', promo: true, name: 'Namshi', domain: 'namshi.com', pct: 15, benefit: '15% off with code', code: 'NOVA15', codeType: 'Single-use', cap: 150, min: 200, days: 39, from: '1 Nov 2026', valid: '20 Dec 2026', cat: '11', sub: '11-1', title: '15% off with code, online', desc: 'Show the code, then open Namshi from this offer. Enter the code at checkout.', channel: 'Online', hold: 30, top: false, expiring: false, all: true, rec: 0, activated: false, limit: false, hero: '' }; };
/* Cumulative-spend and transaction-count offers with a progress tracker (CL-6.17). Activated (pre) in every programme. */
const progOffers = () => {
  const car = offers().find((o) => o.id === 'carrefour') || {}, sb = offers().find((o) => o.id === 'starbucks') || {};
  return [
    { ...car, id: 'carrefour-spend', coverId: 'carrefour', title: 'Spend AED 1,000 in total, get AED 100 back', desc: 'Pay with your linked card at Carrefour until the offer ends. When your total reaches AED 1,000, you get AED 100.', pct: 10, cap: 100, min: 1000, freq: 'Once', days: 17, valid: '30 Nov 2026', top: false, expiring: false, all: false, rec: 0, pre: true, activated: true, limit: false, prog: { kind: 'spend', done: 640, goal: 1000, cash: 'AED 100 back', pts: '10,000 points' } },
    { ...sb, id: 'starbucks-visits', coverId: 'starbucks', title: '5 purchases of AED 20 or more, get AED 25 back', desc: 'Pay with your linked card at Starbucks 5 times, AED 20 or more each time. After the fifth purchase you get AED 25.', pct: 10, cap: 25, min: 20, freq: 'Once', days: 21, valid: '4 Dec 2026', top: false, expiring: false, all: false, rec: 0, pre: true, activated: true, limit: false, prog: { kind: 'count', done: 3, goal: 5, cash: 'AED 25 back', pts: '2,500 points' } }
  ];
};
/* Auto-activated offer (CL-5.1, OM-4.8): no activation step. */
const AUTO_ID = 'shell';
const syncExt = () => {
  const O = offers(); if (!O.length) return;
  [[AFF_ID, affOffer, MODE === 'cashback'], [PROMO_ID, promoOffer, MODE === 'cashback']].forEach(([id, mk, on]) => { const i = O.findIndex((o) => o.id === id); if (on && i < 0) O.push(mk()); if (!on && i >= 0) O.splice(i, 1); });
  progOffers().forEach((p) => { if (!O.some((o) => o.id === p.id)) O.push(p); });
  O.forEach((o) => { if (/^assets\//.test(o.hero || '')) o.hero = cover(o); if (o.prog) o.benefit = benefit(o); if (o.id === AUTO_ID) { o.auto = true; o.pre = true; o.activated = true; } });
};
const progOf = (o) => o.prog ? { pct: o.prog.done / o.prog.goal * 100, txt: o.prog.kind === 'spend' ? `AED ${nf(o.prog.done)} of AED ${nf(o.prog.goal)}` : `${o.prog.done} of ${o.prog.goal} purchases`, left: o.prog.kind === 'spend' ? `AED ${nf(o.prog.goal - o.prog.done)} more` : `${o.prog.goal - o.prog.done} more purchases` } : null;
const segs = (done, goal) => `<span class="cx-segs">${Array.from({ length: goal }, (_, i) => `<i class="${i < done ? 'f' : ''}"></i>`).join('')}</span>`;

/* ---------- state for the add-on ---------- */
let SAVP = 'month', Q = '', QCAT = 'all', QSORT = 'rel', QST = 'all', MINE = 'active';
const FAV = { cats: ['6', '10'], brands: ['carrefour'] };
const SAVED = new Set(['lulu', 'etihad']);
let MOVE = 'transfer', REDEEM = 10000;
const MV = { partner: 'air', member: '', pts: '5000', to: '', err: '' };
let lastTab = TAB;

/* ---------- screens ---------- */
const ICON = {
  offers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  mine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M8 6V4h8v2M3 11h18"/></svg>',
  rewards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-8.8-8.8C2 8.2 3.8 5 7 5c2 0 3.4 1 5 2.8C13.6 6 15 5 17 5c3.2 0 5 3.2 3.8 6.2C19 15.6 12 20 12 20z"/></svg>',
  share: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>'
};
const nav = () => {
  let n = document.getElementById('cx-nav');
  if (!n) { n = document.createElement('nav'); n.id = 'cx-nav'; n.className = 'cx-nav'; n.setAttribute('aria-label', 'Offers'); document.getElementById('device').appendChild(n); }
  n.innerHTML = [['offers', 'Offers'], ['mine', 'My offers'], ['rewards', 'Rewards']].map(([k, l]) => `<button type="button" data-cx="tab" data-v="${k}"${TAB === k ? ' aria-current="page"' : ''}>${ICON[k]}${l}</button>`).join('');
};
const topHead = (title) => {
  const S = C2().S || {};
  const bal = S.loading || S.offline ? '' : isPoints() ? `${MODE === 'tiers' ? TIERS[ME.tier][0] + ' · ' : ''}${pts(BAL.available)}` : aed(C().earnedTotal());
  return `<div class="cx-top"><h1>${title}</h1>${bal && TAB !== 'rewards' ? `<button class="cx-bal" data-cx="tab" data-v="rewards" data-req="CL-6.5 ${isPoints() ? 'LAF-111' : 'LAF-34'}"><i>N</i>${bal}</button>` : ''}</div>`;
};
const ocard = (o) => {
  const C0 = C(), st = (C0.S.activating || {})[o.id], act = o.activated;
  const btn = isAff(o) ? `<span class="cx-plus done" aria-hidden="true">↗</span>`
    : o.auto ? `<span class="cx-plus done" title="No activation needed" data-req="CL-5.1 OM-4.8">✓</span>`
    : act ? `<span class="cx-plus done" title="Activated">✓</span>`
    : st === 'busy' ? `<span class="cx-plus busy">+</span>`
    : `<button class="cx-plus" data-act="${o.id}" aria-label="Activate ${o.name}" data-req="CL-5.2">+</button>`;
  return `<div class="cx-oc" role="button" tabindex="0" data-offer="${o.id}"><span class="im" style="background-image:url('${cover(o)}')"><span class="bdg">${days(o)}</span><span class="lgo"><img src="${logo(o)}" alt=""></span></span>
    <span class="bd"><b>${o.name}</b><span class="ft"><small>${rate(o)}</small>${btn}</span></span></div>`;
};
const progRow = (o) => { const p = progOf(o); return `<button class="cx-prog" data-offer="${o.id}" data-req="CL-6.17"><span class="cx-lg"><img src="${logo(o)}" alt=""></span><span style="flex:1;min-width:0"><span class="t">${o.name} · ${p.left} for ${benefit(o)}</span>${o.prog.kind === 'count' ? segs(o.prog.done, o.prog.goal) : `<span class="cx-bar2" style="display:block"><i style="width:${p.pct}%"></i></span>`}</span><span class="n">${o.prog.kind === 'count' ? `${o.prog.done}/${o.prog.goal}` : Math.round(p.pct) + '%'}</span></button>`; };
const missionRow = (m) => `<button class="cx-prog" data-cx="tab" data-v="rewards" data-req="LAF-205 LAF-207"><span class="cx-lg" style="background:var(--tint);color:var(--bank);font-weight:800">★</span><span style="flex:1;min-width:0"><span class="t">${m.t} · ${isPoints() ? m.pts : m.cash}</span>${segs(m.done, m.goal)}</span><span class="n">${m.done}/${m.goal}</span></button>`;

const offersTab = () => {
  const C0 = C(), S = C0.S, O = offers(), empty = S.scenario === 'empty';
  const of = (o) => (empty && !o.auto ? { ...o, activated: false } : o);
  const act = empty ? [] : O.filter((o) => o.activated && !o.auto);
  const endSoon = act.filter((o) => o.days <= 3).length;
  const progs = empty ? [] : O.filter((o) => o.prog && o.activated);
  const forYou = O.filter((o) => !isAff(o) && !o.prog).sort((a, b) => (a.rec || 99) - (b.rec || 99) || (a.activated - b.activated));
  const exp = O.filter((o) => o.expiring);
  const links = O.filter(isAff);
  const all = O.filter((o) => o.all && !isAff(o));
  const dining = O.filter((o) => o.cat === '10' && !o.prog);
  const cats = (C0.CATS || []).filter((c) => c.id !== 'all').map((c) => ({ ...c, n: O.filter((o) => o.cat === c.id && !o.prog).length })).filter((c) => c.n);
  return `<div class="cx-scr">${topHead('Offers')}
    <button class="cx-q" data-cx="sheet" data-v="cx-search" data-req="CL-6.14 OM-6.2">${ICON.search}Search offers and stores</button>
    ${act.length ? `<button class="cx-actpill" data-cx="tab" data-v="mine" data-req="OM-6.3 CL-6.21"><span class="cx-stack">${act.slice(0, 3).map((o) => `<span><img src="${logo(o)}" alt=""></span>`).join('')}</span>${act.length} offers active${endSoon ? ` · ${endSoon} end soon` : ''}<span style="margin-left:auto;color:var(--ink-2)">›</span></button>` : ''}
    ${empty ? '' : `<div class="cx-h"><h2>Almost there</h2>${tag('CL-6.17 LAF-205 LAF-207')}</div>
    <div class="cx-list">${progs.map(progRow).join('')}${missionRow(MISSIONS[0])}</div>`}
    <div class="cx-h"><h2 data-req="CL-6.1 CL-6.10">Offers for your cards</h2>${tag('CL-6.1 CL-6.10 CL-5.2')}</div>
    <div class="cx-rail">${forYou.map((o) => ocard(of(o))).join('')}</div>
    <div class="cx-h"><h2>Expiring soon</h2><button class="btn-sm" data-actall="expiring" data-req="CL-5.1">Activate all</button></div>
    <div>${exp.map((o) => C0.rowCard(of(o))).join('')}</div>
    <button class="cx-coll" data-cx="sheet" data-v="cx-coll" data-req="OM-6.2" style="background-image:url('${cover({ id: 'arabica' })}')"><span><b>Weekend dining</b><small>${dining.length} offers · collection</small></span><span>›</span></button>
    <div class="cx-h"><h2 data-req="CL-6.1">Browse</h2>${tag('CL-6.1 OM-6.2')}</div>
    <div class="cx-grid3">${cats.map((c) => `<button class="cx-tile" data-cat="${c.id}"><span class="ic">${(C0.CAT_ICON || {})[c.id] || ''}</span><span><b>${c.label}</b><small>${c.n} ${c.n === 1 ? 'offer' : 'offers'}</small></span></button>`).join('')}</div>
    ${links.length ? `<div class="cx-h"><h2 data-req="CL-3.1">Shop via link</h2>${tag('CL-3.1 OM-2.3 OM-4.1')}</div><div>${links.map((o) => C0.rowCard(o)).join('')}</div>` : ''}
    <div class="cx-h"><h2 data-req="CL-6.1 CL-6.10">All offers</h2><button class="btn-sm" data-actall="all" data-req="CL-5.1">Activate all</button></div>
    <div>${all.map((o) => C0.rowCard(of(o))).join('')}</div>
    <button class="view-all" data-open="cat:all" style="padding-bottom:8px">View all offers</button>
  </div>`;
};

const earnedOn = (o) => { const T = C().TX || {}; let paid = 0, pend = 0; [...(T.earned || []), ...(T.pending || [])].forEach((g) => g.items.forEach((t) => { if (t.domain === o.domain && t.status !== 'reversed') { if (t.status === 'paid') paid += t.amt; else pend += t.amt; } })); return { paid, pend }; };
const mineTab = () => {
  const O = offers(), empty = C().S.scenario === 'empty';
  const active = empty ? O.filter((o) => o.auto) : O.filter((o) => o.activated);
  const redeemed = empty ? [] : O.filter((o) => !o.prog && (earnedOn(o).paid > 0 || (o.promo && CODE_SHOWN)));
  const saved = O.filter((o) => SAVED.has(o.id));
  const counts = { active: active.length, saved: saved.length, redeemed: redeemed.length, expired: ENDED.length };
  const row = (o, badge, sub, open = true) => `<button class="cx-mrow" ${open ? `data-offer="${o.id}"` : 'data-noop'}><span class="cx-lg"><img src="${logo(o)}" alt=""></span><div><b>${o.name} · ${rate(o)}</b><small>${sub}</small></div>${badge}</button>`;
  let list = '';
  if (MINE === 'active') list = active.map((o) => { const e = earnedOn(o), p = progOf(o); const sub = o.auto ? 'No activation needed' : p ? `${p.txt} · ends ${o.valid}` : (o.prog ? '' : (e.paid + e.pend ? `${isPoints() ? pts((e.paid + e.pend) * PTS) : aed(e.paid + e.pend)} earned so far` : 'No purchase yet')) + ` · ends ${o.valid}`;
    return row(o, o.limit ? `<span class="cx-st x" data-req="CL-6.11">Limit reached</span>` : o.days <= 3 ? `<span class="cx-st x">${days(o)}</span>` : `<span class="cx-st a">Active</span>`, sub); }).join('');
  if (MINE === 'saved') list = saved.map((o) => row(o, o.activated ? `<span class="cx-st a">Active</span>` : `<span class="cx-st r">Saved</span>`, `${days(o)} · ${o.title}`)).join('');
  if (MINE === 'redeemed') list = redeemed.map((o) => { const e = earnedOn(o); return row(o, `<span class="cx-st r">Redeemed</span>`, o.promo ? 'Code shown at checkout' : `${isPoints() ? pts(e.paid * PTS) : aed(e.paid)} paid on this offer`); }).join('');
  if (MINE === 'expired') list = ENDED.map((o) => row(o, `<span class="cx-st e">Expired</span>`, o.ended, false)).join('');
  return `<div class="cx-scr">${topHead('My offers')}
    <div class="cx-tabs" role="group" aria-label="Offer state" data-req="CL-6.11 OM-6.3">${[['active', 'Active'], ['saved', 'Saved'], ['redeemed', 'Redeemed'], ['expired', 'Expired']].map(([k, l]) => `<button data-cx="mine" data-v="${k}" aria-pressed="${MINE === k}">${l} ${counts[k]}</button>`).join('')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${tag('CL-6.11 OM-6.3')}${MINE === 'saved' ? tag('CL-6.16') : ''}</div>
    <div>${list || `<div class="cx-empty">${MINE === 'saved' ? 'Tap Save on an offer to keep it here.' : 'No offers here yet.'}</div>`}</div>
  </div>`;
};

/* One card: the tier now, the next tier, the measure, what is left, the progress and the next check (LAF-131, LAF-133, LAF-134, LAF-135). */
const tierCard = () => {
  const t = tierNext();
  return `<div class="cx-card" data-req="LAF-131 LAF-133 LAF-134 LAF-92">
    <div class="cx-row"><h3>Your tier: ${t.cur[0]}</h3><span class="cx-st a">${t.cur[1]} points</span></div>
    ${t.next ? `<div class="cx-row"><span>Next tier: <b>${t.next[0]}</b></span><span>${t.next[1]} points</span></div>
      <div class="cx-bar2"><i style="width:${t.pct}%"></i></div>
      <div class="cx-row"><span>${nf(ME.earned12)} of ${nf(t.next[2])} ${TIERQ.unit}</span><b>${nf(t.left)} to go</b></div>
      <p>Your tier comes from ${TIERQ.measure.toLowerCase()} in ${TIERQ.window}. Next check ${TIERQ.check}. You get the highest tier you qualify for.</p>`
    : `<div class="cx-bar2"><i style="width:100%"></i></div>
      <p>You are in the highest tier. Your tier comes from ${TIERQ.measure.toLowerCase()} in ${TIERQ.window}. Next check ${TIERQ.check}.</p>`}
    <div class="cx-row">${tag('LAF-131 LAF-133 LAF-134 LAF-92')}<button class="btn-sm" data-cx="tier" style="min-height:44px">Tier details</button></div></div>`;
};
const rewardsTab = () => {
  const C0 = C(), empty = C0.S.scenario === 'empty';
  let h = `<div class="cx-scr">${topHead('Rewards')}`;
  if (!isPoints()) {
    const v = empty ? { saved: 0, redeemed: 0 } : SAV[SAVP];
    h += `<div class="cx-card cx-hero"><div class="cx-seg" role="group" aria-label="Period" style="margin:0">${[['month', 'This month'], ['year', 'Last 12 months']].map((p) => `<button data-cx="savp" data-v="${p[0]}" aria-pressed="${SAVP === p[0]}">${p[1]}</button>`).join('')}</div>
      <span class="lbl">Cashback ${SAVP === 'month' ? 'this month' : 'in the last 12 months'}</span><span class="cx-big">${aed(v.saved)}</span><p>${v.redeemed} offers redeemed · ${empty ? 0 : offers().filter((o) => o.activated && !o.auto).length} active</p>${tag('CL-6.21')}</div>
      <div class="cx-card"><div class="cx-row"><b>Payable</b><span>${aed(C0.earnedTotal())}</span></div><div class="cx-row"><b>Pending</b><span>${aed(C0.pendingTotal())}</span></div><p>Pending until the refund window of each purchase ends.</p>
        <div class="cx-btns"><button class="cx-b" data-open="earnings">Cashback history</button></div>${tag('CL-6.5 LAF-34 LAF-120')}</div>`;
  } else {
    h += `<div class="cx-card cx-hero"><span class="lbl">Points balance</span><span class="cx-big">${pts(BAL.available)}</span><p>Worth AED ${(BAL.available / PTS).toFixed(2)} when you redeem. ${nf(PTS)} points = AED 1. ${pts(BAL.pending)} pending.</p>
        <div class="cx-btns"><button class="cx-b pri" data-cx="redeem" data-req="LIT-11">Redeem points</button><button class="cx-b" data-cx="points">History</button></div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${tag('LAF-111 LAF-112 LAF-120')}${tag('LIT-11 LAF-116')}</div></div>
      <div class="cx-card"><h3 data-req="LAF-36">Points that expire</h3>${EXPIRY.map(([d, n]) => `<div class="cx-row"><span>${d}</span><b>${pts(n)}</b></div>`).join('')}${tag('LAF-36 LAF-113 LAF-172')}</div>`;
    if (MODE === 'tiers') h += tierCard();
    if (MODE === 'bonus') h += `<div class="cx-h"><h2>Bonus points</h2></div>${BONUS.map((b) => `<div class="cx-card"><h3>${b.m}: ${b.t}</h3><p>${b.d}</p>${tag(b.rows)}</div>`).join('')}`;
    if (PLAN) h += `<div class="cx-card"><h3>Use your points</h3><div class="cx-grid3">${[['transfer', 'Transfer'], ['buy', 'Buy'], ['gift', 'Gift']].map((x) => `<button class="cx-chip" style="border-radius:12px;min-height:44px" data-cx="movego" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>${tag('LAF-122 LAF-123 LAF-128', 'plan')}</div>`;
  }
  h += `<div class="cx-h"><h2>Missions and badges</h2>${tag('LAF-205 LAF-206 LAF-207')}</div><div class="cx-list">${MISSIONS.map((m) => `<div class="cx-prog" style="cursor:default"><span class="cx-lg" style="background:var(--tint);color:var(--bank);font-weight:800">★</span><span style="flex:1;min-width:0"><span class="t">${m.t}</span><small>${m.s ? m.s + ' · ' : ''}${isPoints() ? m.pts : m.cash}</small>${segs(m.done, m.goal)}</span><span class="n">${m.done}/${m.goal}</span></div>`).join('')}
    ${BADGES.map((b) => `<div class="cx-prog" style="cursor:default"><span class="cx-lg" style="background:${b.on ? 'var(--bank)' : '#f2ede9'};color:${b.on ? '#fff' : '#8a817c'};font-weight:800">◆</span><span style="flex:1;min-width:0"><span class="t">${b.t}</span><small>${b.d}</small></span><span class="n" style="color:${b.on ? 'var(--bank)' : 'var(--ink-2)'}">${b.on ? 'Earned' : `${b.done}/${b.goal}`}</span></div>`).join('')}</div>
    <button class="cx-prog" data-cx="sheet" data-v="cx-fav" data-req="CL-6.22"><span style="flex:1"><span class="t">Favourite categories and brands</span><small>${FAV.cats.map(catL).join(', ')}${FAV.brands.length ? ` · ${FAV.brands.length} brand${FAV.brands.length > 1 ? 's' : ''}` : ''}</small></span><span class="n">›</span></button>
    ${tag('CL-6.22 CL-6.16')}
    <button class="cx-prog" data-cx="optout" data-req="CL-1.6"><span style="flex:1"><span class="t">Leave the programme</span><small>You stop earning ${cur()}.</small></span><span class="n">&rsaquo;</span></button>
    ${tag('CL-1.6 CL-1.7')}
  </div>`;
  return h;
};

const home = () => {
  const sc = document.getElementById('screen'), S = C2().S || {};
  if (!sc || !window.__C) return;
  if (GATE) { const n0 = document.getElementById('cx-nav'); if (n0) n0.remove(); sc.innerHTML = GATE === 'done' ? doneScreen() : enrolScreen(); sc.scrollTop = 0; lastTab = TAB; if (GATE === 'terms') slideInit(); return; }
  nav();
  const keep = lastTab === TAB ? sc.scrollTop : 0; lastTab = TAB;
  if (S.offline) { sc.innerHTML = `<div class="cx-scr">${topHead('Offers')}<div class="empty" style="padding-top:48px"><div class="ico orange">${(C().I || {}).wifiOff || ''}</div><h3>Couldn’t load offers</h3><p>Check your internet connection and try again.</p><button class="btn mid" data-retry>Try again</button></div></div>`; return; }
  if (S.loading) { sc.innerHTML = `<div class="cx-scr">${topHead('Offers')}<div class="sk" style="height:48px;border-radius:999px"></div><div class="sk" style="height:46px;border-radius:999px"></div><div class="sk" style="height:66px;border-radius:16px"></div><div style="display:flex;gap:12px"><div class="sk" style="width:156px;height:200px;border-radius:18px"></div><div class="sk" style="width:156px;height:200px;border-radius:18px"></div></div></div>`; return; }
  syncExt();
  sc.innerHTML = TAB === 'mine' ? mineTab() : TAB === 'rewards' ? rewardsTab() : offersTab();
  sc.scrollTop = keep;
};

/* ---------- enrolment: the SDK entry point (CL-1.4, CL-1.17). The customer accepts the terms in the bank app before the wallet opens. ---------- */
const scr0 = (qs.get('screen') || (location.hash || '').replace(/^#\/?/, '')).toLowerCase();
let GATE = store('walletEnrolled') === 'yes' ? null : 'terms';
if (scr0 === 'enrol' || scr0 === 'terms') GATE = 'terms';
if (scr0 === 'enrol-done' || scr0 === 'joined') GATE = 'done';
if (scr0 === 'home') { GATE = null; store('walletEnrolled', 'yes'); }
/* Open a rewards sheet straight from the URL, for screenshots: ?screen=points, ?screen=tier, ?screen=redeem */
const SHEET0 = { points: 'cx-points', history: 'cx-points', tier: 'cx-tier', redeem: 'cx-redeem' }[scr0];
if (SHEET0) { GATE = null; store('walletEnrolled', 'yes'); TAB = 'rewards'; }
const bankName = () => { const b = BANKS.find((x) => x[0] === BANK); return (!b || b[0] === 'ink') ? 'Nova Bank' : b[1]; };
const progName = () => `${bankName()} ${isPoints() ? 'Points' : 'Cashback'}`;
const cur = () => (isPoints() ? 'points' : 'cashback');
const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const termsHtml = () => { const B = bankName(), c = cur(); return `<h2>Programme terms</h2>
  <h3>1. Joining</h3><p>You join the programme when you accept these terms. ${B} records the date and time of your acceptance.</p>
  <h3>2. Your cards</h3><p>The programme uses the ${B} cards that ${B} makes eligible. ${B} tells you which cards take part.</p>
  <h3>3. How you earn</h3><p>You earn ${c} on a purchase that matches an offer. Each offer states the rate and the conditions.</p>${isPoints() ? '<p>Your points convert to cashback when you redeem them.</p>' : ''}
  <h3>4. Activation</h3><p>Some offers need activation. Activate the offer before you pay.</p>
  <h3>5. Transactions</h3><p>The programme processes your transactions only after you join. Purchases before that date earn no ${c}.</p>
  <h3>6. Payment</h3><p>${isPoints() ? 'Your points stay' : 'Your cashback stays'} pending until the refund window of the purchase ends.</p>
  <h3>7. Your data</h3><p>${B} shares your card transactions with the programme. The programme matches them to offers.</p>
  <h3>8. Leaving</h3><p>You can leave the programme at any time in Rewards. You stop earning ${c} on that day.</p>
  <h3>9. Changes</h3><p>${B} can change these terms. ${B} tells you before a change starts.</p>`; };
const enrolScreen = () => `<div class="cx-enrol">
  <span class="cx-en-logo">${bankName()[0]}</span>
  <h1 data-req="CL-1.4">${progName()}</h1>
  <p>Join to get ${cur()} on offers in the ${bankName()} app.</p>
  <ul class="cx-en-list">
    <li>You get ${cur()} at the stores in the offers list.</li>
    <li>You activate an offer, then pay with your ${bankName()} card.</li>
    <li>${isPoints() ? 'Your points convert to cashback when you redeem them.' : 'Your cashback stays pending until the refund window ends.'}</li>
  </ul>
  <div class="cx-terms" id="cx-terms" tabindex="0" role="region" aria-label="Programme terms" data-req="CL-1.17">${termsHtml()}</div>
  <div class="cx-slide" id="cx-slide" data-req="CL-1.4 CL-1.17 CL-1.7"><span class="fill"></span><span class="txt" id="cx-slide-txt">Slide to accept and join</span>
    <button type="button" class="cx-thumb" id="cx-thumb" aria-label="Slide right to accept the terms and join. You can also press Enter.">&rarr;</button></div>
  <p class="cx-en-hint">Drag the button to the right. You can also press Enter on it.</p>
  <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${tag('CL-1.4 CL-1.17')}</div>
</div>`;
const doneScreen = () => `<div class="cx-enrol cx-done">
  <span class="cx-tick">&#10003;</span>
  <h1 data-req="CL-1.7">You joined ${progName()}</h1>
  <p>You accepted the terms on ${today()}.</p>
  <p>Activate an offer, then pay with your ${bankName()} card to earn ${cur()}.</p>
  <div style="display:flex;flex-wrap:wrap;gap:6px">${tag('CL-1.7 CL-1.2')}</div>
  <div class="cx-en-foot"><button class="btn" data-cx="enrolgo">See your offers</button></div>
</div>`;
const accept = () => { if (GATE !== 'terms') return; store('walletEnrolled', 'yes'); GATE = 'done'; C().renderHome(); };
const slideInit = () => {
  const track = document.getElementById('cx-slide'); if (!track) return;
  const thumb = document.getElementById('cx-thumb'), fill = track.querySelector('.fill'), txt = document.getElementById('cx-slide-txt');
  let max = 0, x = 0, down = false, moved = 0, startX = 0;
  const put = (v) => { x = v; thumb.style.transform = `translateX(${v}px)`; fill.style.width = (v + 56) + 'px'; if (txt) txt.style.opacity = max ? String(Math.max(0, 1 - v / max * 1.6)) : '1'; };
  const back = () => { thumb.style.transition = 'transform .18s'; fill.style.transition = 'width .18s'; put(0); setTimeout(() => { thumb.style.transition = ''; fill.style.transition = ''; }, 200); };
  const span = () => { max = Math.max(0, track.clientWidth - thumb.offsetWidth - 8); return max; };
  thumb.addEventListener('pointerdown', (e) => { down = true; moved = 0; span(); startX = e.clientX - x; try { thumb.setPointerCapture(e.pointerId); } catch (err) {} });
  thumb.addEventListener('pointermove', (e) => { if (!down) return; const v = Math.max(0, Math.min(max, e.clientX - startX)); moved = Math.max(moved, v); put(v); });
  thumb.addEventListener('pointerup', () => { if (!down) return; down = false; if (max && x >= max - 4) { put(max); accept(); } else if (moved > 6) back(); });
  thumb.addEventListener('pointercancel', () => { if (!down) return; down = false; back(); });
  thumb.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (moved > 6) { moved = 0; return; } accept(); });
  thumb.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); span(); put(max); accept(); } });
};

/* ---------- sheets ---------- */
const head = (title, sub) => `<div class="grab"></div><div class="s-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><button class="xbtn" data-close>✕</button></div>`;
const pointsSheet = (sh, cls) => {
  const lots = LOTS.filter((l) => (MODE === 'tiers' || !l.tier) && (MODE === 'bonus' || !l.bonus));
  const neg = (l) => l.p < 0 || l.st === 'Reversed' || l.st === 'Expired';
  return `<div class="sheet ${cls}">${head('Points history', `${pts(BAL.available)} available · worth AED ${(BAL.available / PTS).toFixed(2)} at redemption · ${pts(BAL.pending)} pending`)}<div class="s-body">
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 4px">${tag('LAF-110 LAF-34')}</div>
    ${lots.map((l) => `<div class="cx-lot"><span><b>${l.m}</b><br><small>${l.kind} · ${l.p > 0 ? 'earned ' : ''}${l.d}</small>${l.exp !== '–' ? `<br><small>Expires ${l.exp}</small>` : ''}${l.note ? `<br><small>${l.note}</small>` : ''}</span><span style="text-align:right"><b class="${neg(l) ? 'neg' : ''}">${l.p > 0 && l.st !== 'Reversed' && l.st !== 'Expired' ? '+' : '−'}${nf(Math.abs(l.p))}</b><br><span class="cx-st ${ST_CLS[l.st] || 'r'}">${l.st}</span><br>${l.rows ? tag(l.rows) : l.bonus ? tag('LAF-121') : l.tier ? tag('LAF-92') : l.st === 'Reversed' ? tag('LAF-117') : l.st === 'Redeemed' ? tag('LAF-116') : l.st === 'Expired' ? tag('LAF-36') : ''}</span></div>`).join('')}</div></div>`;
};
const redeemSheet = (sh, cls) => `<div class="sheet ${cls}">${head('Redeem points', `${pts(BAL.available)} available`)}<div class="s-body">
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">${[5000, 10000, 20000, BAL.available].map((v) => `<button class="cx-chip" data-cx="amt" data-v="${v}" aria-pressed="${REDEEM === v}">${v === BAL.available ? 'All' : nf(v)}</button>`).join('')}</div>
    <div class="cx-card" style="margin:14px 0"><div class="cx-row"><b>Points</b><span>${pts(REDEEM)}</span></div><div class="cx-row"><b>Value</b><span>AED ${(REDEEM / PTS).toFixed(2)}</span></div>${tag('LAF-112')}
      <div class="cx-row"><b>Used first</b><span>${pts(Math.min(REDEEM, EXPIRY[0][1]))} expiring ${EXPIRY[0][0]}</span></div>${tag('LAF-116')}</div>
    <button class="btn" data-cx="doredeem" style="margin-top:14px;width:100%">Redeem ${nf(REDEEM)} points</button><div style="margin-top:8px;display:flex;justify-content:center">${tag('LIT-11 LAF-116 LAF-118')}</div></div></div>`;
const tierSheet = (sh, cls) => `<div class="sheet ${cls}">${head('My tier', `${TIERS[ME.tier][0]} · ${TIERS[ME.tier][1]} points on the base rate`)}<div class="s-body">
    <div class="cx-tiers" style="margin-top:14px">${TIERS.map((t, i) => `<div class="cx-tier ${i === ME.tier ? 'on' : ''}"><span class="t" style="background:${t[3]}">${t[0][0]}</span><span style="flex:1"><b>${t[0]}</b><br><small style="color:#7c8186">${i ? `From ${nf(t[2])} points in 12 months` : 'Every customer'}${i === 2 ? ' or a Nova Platinum card' : ''}</small></span><b>${t[1]}</b></div>`).join('')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 14px">${tag('LAF-131 LAF-132 LAF-133')}${tag('LAF-92')}${tag('LAF-137')}</div>
    <div class="cx-card" style="margin:0"><div class="cx-row"><b>To Platinum</b><span>${nf(TIERS[3][2] - ME.earned12)} points to go</span></div><div class="cx-bar2"><i style="width:${ME.earned12 / TIERS[3][2] * 100}%"></i></div>
      <div class="cx-row"><span style="font-size:12px;color:#656565">${nf(ME.earned12)} points in the last 12 months</span>${tag('LAF-134 LAF-135')}</div></div></div></div>`;
const orow = (o, right = '') => `<button class="cx-orow" data-cx="open" data-v="${o.id}"><span class="cx-lg"><img src="${logo(o)}" alt=""></span><span style="flex:1;min-width:0;text-align:left"><b>${o.name}</b><br><small>${o.title}</small></span><span style="font-weight:700;color:var(--bank);white-space:nowrap">${right || rate(o)}</span></button>`;
/* Save (OM-6.3, CL-6.16) and Share a tracked offer link (OM-2.3, OM-6.8) */
const saveShare = (o) => `<div class="cx-acts"><button data-cx="save" data-v="${o.id}" aria-pressed="${SAVED.has(o.id)}" data-req="OM-6.3 CL-6.16">${ICON.heart}${SAVED.has(o.id) ? 'Saved' : 'Save'}</button><button data-cx="share" data-v="${o.id}" data-req="OM-2.3 OM-6.8">${ICON.share}Share</button></div>`;
const promoSheet = (o) => `<div class="sheet offer">
    <div class="o-hero" style="background:linear-gradient(135deg,#3a332d,#1f1916)"><div class="grab"></div><button class="xbtn" data-close>✕</button></div>
    <div class="o-logo logo"><img src="${logo(o)}" alt=""></div>
    <div class="o-head"><b>${o.name}</b><div class="tags"><span class="tag green">${o.benefit}</span><span class="tag amber">Promo code</span></div></div>
    <div class="o-body">
      <h3 data-req="OM-1.1 OM-4.1">${o.title}</h3>
      <div class="desc">${o.desc}</div>
      <div class="terms" data-req="OM-1.1 OM-4.10"><div><div class="k">Min Spend</div><div class="v">AED ${o.min}</div></div><div><div class="k">Code</div><div class="v">${o.codeType}</div></div><div><div class="k">Frequency</div><div class="v">Once per customer</div></div></div>
      <div class="kv" data-req="OM-4.10"><span class="k">Valid from</span><span class="v">${o.from}</span></div>
      <div class="kv" data-req="OM-4.10 OM-4.11"><span class="k">Valid till</span><span class="v">${o.valid}</span></div>
      <div class="kv" data-req="OM-4.1"><span class="k">Applicable on</span><span class="v">Online, with the code at checkout</span></div>
      <div class="kv"><span class="k">Category</span><span class="v">${catL(o.cat)}</span></div>
      ${CODE_SHOWN ? `<div class="cx-code" data-req="OM-4.10 OM-6.8"><span class="c">${o.code}</span><span class="s">Copied. Enter it at checkout.</span></div>` : `<button class="btn" data-cx="showcode" data-v="${o.id}" data-req="OM-6.8 OM-4.10" style="width:100%;margin-top:12px">Show code</button>`}
      <p class="cx-plain" data-req="OM-4.1 OM-4.11">Cashback is confirmed when the network reports your purchase.</p>
      ${saveShare(o)}
      <div style="margin:10px 0 2px">${tag('OM-4.1 OM-4.10 OM-4.11 CL-3.1')}</div>
      <h4 data-req="OM-6.4 CL-6.13">How it works</h4>
      <div class="how">1. Tap Show code. The code is copied for you.<br>2. Tap Shop at ${o.name}. The offer link is tracked for you.<br>3. Enter the code at checkout. The network reports your purchase and your cashback shows as pending.</div>
    </div>
    <div class="s-foot"><button class="btn" data-cx="shop" data-v="${o.id}" data-req="CL-3.1 OM-2.3 OM-4.1">Shop at ${o.name} ↗</button></div>
  </div>`;
const affSheet = (sh) => { const o = offers().find((x) => x.id === sh.id); if (!o) return ''; if (o.promo) return promoSheet(o); return `<div class="sheet offer">
    <div class="o-hero" style="${o.hero ? `background-image:url('${o.hero}')` : 'background:linear-gradient(135deg,#3a332d,#1f1916)'}"><div class="grab"></div><button class="xbtn" data-close>✕</button></div>
    <div class="o-logo logo"><img src="${logo(o)}" alt=""></div>
    <div class="o-head"><b>${o.name}</b><div class="tags"><span class="tag green">${o.pct}% Cashback</span><span class="tag amber">Affiliate offer</span></div></div>
    <div class="o-body">
      <h3 data-req="CL-3.1 OM-1.18">${o.title}</h3>
      <div class="desc">${o.desc}</div>
      <div class="terms" data-req="CL-3.3 OM-1.4"><div><div class="k">Min Spend</div><div class="v">AED ${o.min}</div></div><div><div class="k">Max Cashback</div><div class="v">AED ${o.cap}</div></div><div><div class="k">Frequency</div><div class="v">${o.freq || 'Per campaign'}</div></div></div>
      <div class="kv" data-req="CL-6.13 OM-6.4"><span class="k">Valid till</span><span class="v">${o.valid}</span></div>
      <div class="kv" data-req="CL-3.1"><span class="k">Applicable on</span><span class="v">Online, through the offer link</span></div>
      <div class="kv"><span class="k">Category</span><span class="v">${catL(o.cat)}</span></div>
      ${saveShare(o)}
      <div style="margin:10px 0 2px">${tag('CL-3.1 OM-2.3')}</div>
      <h4 data-req="OM-6.4 CL-6.13">How it works</h4>
      <div class="how">1. Tap Shop at ${o.name}. The offer link is tracked for you.<br>2. Book on ${o.name} in that visit.<br>3. ${o.name} sends the purchase record. Cashback shows as pending until the ${o.hold}-day refund window ends.</div>
    </div>
    <div class="s-foot"><button class="btn" data-cx="shop" data-v="${o.id}" data-req="CL-3.1 OM-2.3">Shop at ${o.name} ↗</button></div>
  </div>`; };
const offerExtra = (o, st) => {
  const act = st === 'done' || st === 'limit';
  let h = saveShare(o);
  const p = progOf(o);
  if (p) h += `<div class="cx-card" style="margin-top:14px" data-req="CL-6.17"><div class="cx-row"><b>Your progress</b><span style="color:var(--bank);font-weight:700">${p.txt}</span></div>${o.prog.kind === 'count' ? segs(o.prog.done, o.prog.goal) : `<div class="cx-bar2"><i style="width:${p.pct}%"></i></div>`}<p>${p.left} to get ${benefit(o)}.</p>${tag('CL-6.17')}</div>`;
  if (o.auto) h += `<div class="banner info" data-req="CL-5.1 OM-4.8"><span>No activation needed. Pay with your linked card and the offer applies.</span></div>`;
  const same = offers().filter((x) => x.cat === o.cat && x.id !== o.id && !x.prog).slice(0, 3);
  if (act && same.length) h += `<h4>More in ${catL(o.cat)} ${tag('CL-6.19')}</h4>${same.map((x) => orow(x)).join('')}`;
  return h;
};
const sheet = (sh, cls) => {
  const t = sh.type;
  if (t === 'cx-search') {
    const q = Q.trim().toLowerCase();
    let list = offers().filter((o) => (QCAT === 'all' || o.cat === QCAT) && (QST === 'all' || (QST === 'on' ? o.activated : !o.activated)) && (!q || (o.name + ' ' + o.title + ' ' + catL(o.cat)).toLowerCase().includes(q)));
    if (QSORT === 'end') list = list.slice().sort((a, b) => a.days - b.days);
    if (QSORT === 'rate') list = list.slice().sort((a, b) => b.pct - a.pct);
    if (QSORT === 'az') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="sheet ${cls}">${head('Search', `${list.length} offers`)}<div class="s-body">
      <input class="cx-in" id="cx-q" data-cx-in="q" value="${Q.replace(/"/g, '&quot;')}" placeholder="Store, offer or category" autocomplete="off" aria-label="Search offers" style="margin-top:14px">
      <span class="cx-lbl">Category</span><div style="display:flex;flex-wrap:wrap;gap:6px">${(C2().CATS || []).map((c) => `<button class="cx-chip" data-cx="qcat" data-v="${c.id}" aria-pressed="${QCAT === c.id}">${c.id === 'all' ? 'All' : c.label}</button>`).join('')}</div>
      <span class="cx-lbl">Status</span><div style="display:flex;flex-wrap:wrap;gap:6px">${[['all', 'All'], ['off', 'Not activated'], ['on', 'Activated']].map(([k, l]) => `<button class="cx-chip" data-cx="qst" data-v="${k}" aria-pressed="${QST === k}">${l}</button>`).join('')}</div>
      <span class="cx-lbl">Sort by</span><div style="display:flex;flex-wrap:wrap;gap:6px">${[['rel', 'For you'], ['end', 'Ending soon'], ['rate', 'Highest reward'], ['az', 'A to Z']].map(([k, l]) => `<button class="cx-chip" data-cx="qsort" data-v="${k}" aria-pressed="${QSORT === k}">${l}</button>`).join('')}</div>
      <div style="margin:10px 0 6px;display:flex;flex-wrap:wrap;gap:6px">${tag('CL-6.14')}${tag('OM-6.2')}</div>
      ${list.map((o) => orow(o)).join('') || '<p style="font-size:13px;color:#656565;padding:24px 0;text-align:center">No offers match. Try another word.</p>'}</div></div>`;
  }
  if (t === 'cx-optout') return `<div class="sheet ${cls}">${head('Leave the programme', progName())}<div class="s-body">
    <p class="cx-plain">You stop earning ${cur()} on your purchases. The programme stops processing your transactions.</p>
    <p class="cx-plain">Offers you activated stop earning ${cur()} on the same day.</p>
    <p class="cx-plain">You can join again at any time in the ${bankName()} app.</p>
    <div style="margin:14px 0 6px">${tag('CL-1.6 CL-1.7')}</div>
    <button class="btn" data-cx="dooptout" style="width:100%;margin-top:6px">Leave the programme</button>
    <button class="cx-b" data-close style="width:100%;margin-top:10px">Stay in the programme</button></div></div>`;
  if (t === 'cx-coll') {
    const list = offers().filter((o) => o.cat === '10' && !o.prog);
    return `<div class="sheet ${cls}">${head('Weekend dining', `${list.length} offers · collection`)}<div class="s-body"><div style="margin:12px 0">${tag('OM-6.2')}</div>${list.map((o) => C().rowCard(o)).join('')}</div></div>`;
  }
  if (t === 'cx-fav') {
    const cats = (C2().CATS || []).filter((c) => c.id !== 'all'), brands = offers().filter((o) => !o.prog && !isAff(o)).slice(0, 8);
    return `<div class="sheet ${cls}">${head('Your favourites', 'Choose the categories and brands you like')}<div class="s-body">
      <span class="cx-lbl">Categories</span><div style="display:flex;flex-wrap:wrap;gap:6px">${cats.map((c) => `<button class="cx-chip" data-cx="favc" data-v="${c.id}" aria-pressed="${FAV.cats.includes(c.id)}">${c.label}</button>`).join('')}</div>
      <span class="cx-lbl">Brands</span><div style="display:flex;flex-wrap:wrap;gap:6px">${brands.map((o) => `<button class="cx-chip" data-cx="favb" data-v="${o.id}" aria-pressed="${FAV.brands.includes(o.id)}">${o.name}</button>`).join('')}</div>
      <div style="margin:14px 0 6px">${tag('CL-6.22 CL-6.16')}</div>
      <button class="btn" data-cx="favsave" style="margin-top:14px;width:100%">Save favourites</button></div></div>`;
  }
  if (t === 'cx-move') {
    const T = [['transfer', 'Transfer', 'LAF-123'], ['buy', 'Buy', 'LAF-122'], ['gift', 'Gift', 'LAF-128']];
    let b = '';
    if (MOVE === 'transfer') b = `<span class="cx-lbl">Programme</span><select class="cx-in" data-cx-in="partner" aria-label="Programme"><option value="air"${MV.partner === 'air' ? ' selected' : ''}>Airline programme</option><option value="loyalty"${MV.partner === 'loyalty' ? ' selected' : ''}>Loyalty programme</option></select>
      <span class="cx-lbl">Your member number</span><input class="cx-in" data-cx-in="member" value="${MV.member}" autocomplete="off" inputmode="numeric"><span class="cx-lbl">Points to transfer</span><input class="cx-in" data-cx-in="pts" value="${MV.pts}" inputmode="numeric">
      <div style="margin-top:8px">${tag('LAF-123', 'plan')}</div>`;
    else if (MOVE === 'buy') b = `<span class="cx-lbl">Points to buy</span><div style="display:flex;flex-wrap:wrap;gap:6px">${['1000', '2500', '5000'].map((v) => `<button class="cx-chip" data-cx="mvpts" data-v="${v}" aria-pressed="${MV.pts === v}">${nf(+v)}</button>`).join('')}</div>
      <div style="margin-top:10px">${tag('LAF-122', 'plan')}</div>`;
    else b = `<span class="cx-lbl">Recipient account</span><input class="cx-in" data-cx-in="to" value="${MV.to}" autocomplete="off"><span class="cx-lbl">Points to gift</span><input class="cx-in" data-cx-in="pts" value="${MV.pts}" inputmode="numeric">
      <div style="margin-top:8px">${tag('LAF-128', 'plan')}</div>`;
    const cta = { transfer: 'Transfer points', buy: 'Buy points', gift: 'Send gift' }[MOVE];
    return `<div class="sheet ${cls}">${head('Use your points', `${pts(BAL.available)} available`)}<div class="s-body" style="padding-top:14px">
      <div class="cx-seg" role="group" aria-label="Action">${T.map((x) => `<button data-cx="move" data-v="${x[0]}" aria-pressed="${MOVE === x[0]}">${x[1]}</button>`).join('')}</div>${b}
      ${MV.err ? `<p style="font-size:12px;color:#9b1c2e;font-weight:600;margin-top:8px">${MV.err}</p>` : ''}<button class="btn" data-cx="domove" style="margin-top:14px;width:100%">${cta}</button></div></div>`;
  }
  return '';
};

/* ---------- demo bar above the phone ---------- */
const bar = document.createElement('div');
bar.className = 'cx-bar';
const drawBar = () => {
  bar.innerHTML = `<span class="lab">Programme</span><div class="seg2" role="group" aria-label="Programme type">${MODES.map(([k, l]) => `<button type="button" data-cx="mode" data-v="${k}" aria-pressed="${MODE === k}">${l}</button>`).join('')}</div>
    <span class="lab">Bank theme</span><div class="seg2" role="group" aria-label="Bank theme" data-req="CL-6.7">${BANKS.map(([k, l, c]) => `<button type="button" data-cx="bank" data-v="${k}" aria-pressed="${BANK === k}" title="${l}"><i class="sw" style="background:${c}"></i>${l}</button>`).join('')}</div>
    <button type="button" data-cx="labels" aria-pressed="${LABELS}" style="border:1px solid #e1e1e1">Answer labels</button>
    <span class="lab">Enrolment</span><button type="button" data-cx="enrolreset" style="border:1px solid #e1e1e1" data-req="CL-1.4">Reset enrolment</button>
    ${PLAN ? `<button type="button" data-cx="pushopen" style="border:1px solid #e1e1e1">Open an offer link</button>${tag('CL-6.15 CL-12.7', 'plan')}` : ''}`;
};
const applyBank = () => { const b = BANKS.find((x) => x[0] === BANK); document.getElementById('device').style.setProperty('--bank', b[2]); };
const applyLabels = () => document.body.classList.toggle('cx-nolabels', !LABELS);

/* ---------- points modes: rates as points in the base demo's rows and sheets ---------- */
const convert = (root) => {
  if (!isPoints() || !root) return;
  const mult = MODE === 'tiers' ? 1.5 : 1;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const edits = [];
  while (w.nextNode()) { const n = w.currentNode, t = n.nodeValue; if (/(\d+)% Cashback/.test(t) || /Max cashback AED\s*\d+/i.test(t)) edits.push(n); }
  edits.forEach((n) => { n.nodeValue = n.nodeValue.replace(/(\d+)% Cashback/g, (m, p) => `${nf(+p * PTS / 100 * mult)} pts per AED 1${mult > 1 ? ' (Gold 1.5x)' : ''}`).replace(/Max cashback AED\s*(\d+)/gi, (m, a) => `Max ${nf(+a * PTS * mult)} points`); });
};
const observe = () => {
  const dev = document.getElementById('device');
  const mo = new MutationObserver(() => { mo.disconnect(); convert(document.getElementById('screen')); convert(document.getElementById('layers')); mo.observe(dev, { childList: true, subtree: true }); });
  mo.observe(dev, { childList: true, subtree: true });
};

window.CEXT = { header: (h) => h, home, pointsSheet, redeemSheet, tierSheet, sheet, offerExtra, affSheet, tag, mode: () => MODE };
const rerender = () => { C().renderHome(); C().layers(); };
document.addEventListener('click', (e) => {
  const shopMsg = (id) => { const o = offers().find((x) => x.id === id) || {}; const site = o.site || o.domain || 'expedia.com'; return o.promo ? `Opening ${site} with your tracked link. Enter the code at checkout.` : `Opening ${site} with your tracked link. Purchases there earn cashback.`; };
  const shop = e.target.closest('[data-shop],[data-leave]');
  if (shop) { e.preventDefault(); e.stopPropagation(); return C().showToast(shopMsg(shop.dataset.shop || shop.dataset.leave)); }
  const t = e.target.closest('[data-cx]'); if (!t) return;
  e.preventDefault(); e.stopPropagation();
  const k = t.dataset.cx, v = t.dataset.v;
  if (k === 'enrolgo') { GATE = null; TAB = 'offers'; C().S.stack = []; return rerender(); }
  if (k === 'enrolreset') { store('walletEnrolled', 'no'); GATE = 'terms'; TAB = 'offers'; C().S.stack = []; return rerender(); }
  if (k === 'optout') return C().push({ type: 'cx-optout' });
  if (k === 'dooptout') { store('walletEnrolled', 'no'); GATE = 'terms'; TAB = 'offers'; C().S.stack = []; rerender(); return C().showToast('You left the programme. You stop earning ' + cur() + '.'); }
  if (k === 'tab') { TAB = v; C().S.stack = []; return rerender(); }
  if (k === 'mine') { MINE = v; return C().renderHome(); }
  if (k === 'shop') return C().showToast(shopMsg(v));
  if (k === 'showcode') { CODE_SHOWN = true; C().layers(); return C().showToast('Code copied'); }
  if (k === 'save') { if (SAVED.has(v)) SAVED.delete(v); else SAVED.add(v); rerender(); return C().showToast(SAVED.has(v) ? 'Saved. Find it in My offers.' : 'Removed from saved offers.'); }
  if (k === 'share') { const o = offers().find((x) => x.id === v) || {}; return C().showToast(`Link copied: novabank.ae/o/${(o.id || '').replace(/[^a-z]/g, '')}?src=share`); }
  if (k === 'mode') { MODE = v; store('walletProgramme', MODE); const u = new URL(location.href); u.searchParams.set('programme', MODE); history.replaceState(null, '', u); drawBar(); C().S.stack = []; return rerender(); }
  if (k === 'bank') { BANK = v; store('walletBank', BANK); drawBar(); return applyBank(); }
  if (k === 'labels') { LABELS = !LABELS; store('walletLabels', LABELS ? 'on' : 'off'); drawBar(); return applyLabels(); }
  if (k === 'sheet') return C().push({ type: v });
  if (k === 'open') return C().push({ type: 'offer', id: v });
  if (k === 'qcat') { QCAT = v; return C().layers(); }
  if (k === 'qst') { QST = v; return C().layers(); }
  if (k === 'qsort') { QSORT = v; return C().layers(); }
  if (k === 'savp') { SAVP = v; return C().renderHome(); }
  if (k === 'favc' || k === 'favb') { const a = k === 'favc' ? FAV.cats : FAV.brands, i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); return C().layers(); }
  if (k === 'favsave') { C().pop(); C().renderHome(); return C().showToast('Favourites saved.'); }
  if (k === 'pushopen') { TAB = 'offers'; C().S.stack = []; C().renderHome(); C().push({ type: 'offer', id: 'carrefour' }); return C().showToast('Opened novabank://offers/carrefour'); }
  if (k === 'movego') { MOVE = v; MV.err = ''; return C().push({ type: 'cx-move' }); }
  if (k === 'move') { MOVE = v; MV.err = ''; return C().layers(); }
  if (k === 'mvpts') { MV.pts = v; return C().layers(); }
  if (k === 'domove') { const n = +MV.pts; MV.err = !(n > 0) ? 'Enter a number of points above 0.' : MOVE !== 'buy' && n > BAL.available ? 'You do not have enough points.' : MOVE === 'transfer' && !MV.member.trim() ? 'Enter your member number.' : MOVE === 'gift' && !MV.to.trim() ? 'Enter the recipient account.' : ''; if (MV.err) return C().layers(); C().pop(); return C().showToast({ transfer: `Transfer of ${nf(n)} points sent.`, buy: `${nf(n)} points bought.`, gift: `${nf(n)} points sent as a gift.` }[MOVE]); }
  if (k === 'points') return C().push({ type: 'cx-points' });
  if (k === 'redeem') return C().push({ type: 'cx-redeem' });
  if (k === 'tier') return C().push({ type: 'cx-tier' });
  if (k === 'amt') { REDEEM = +v; return C().layers(); }
  if (k === 'doredeem') { C().S.stack = []; BAL.available -= REDEEM; C().showToast(`Redeemed ${nf(REDEEM)} points. Nova Bank credits AED ${(REDEEM / PTS).toFixed(2)} to your card.`); REDEEM = Math.min(REDEEM, BAL.available) || 0; return rerender(); }
}, true);
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.cx-oc')) { e.preventDefault(); e.target.click(); } });
document.addEventListener('input', (e) => { const t = e.target; if (!t.dataset || !t.dataset.cxIn) return; e.stopPropagation(); const k = t.dataset.cxIn;
  if (k === 'q') { Q = t.value; const pos = t.selectionStart; C().layers(); const n = document.getElementById('cx-q'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } else MV[k] = t.value; }, true);
document.addEventListener('change', (e) => { const t = e.target; if (t.dataset && t.dataset.cxIn === 'partner') MV.partner = t.value; }, true);
const start = () => { document.body.appendChild(bar); drawBar(); applyBank(); applyLabels(); observe(); if (window.__C) { syncExt(); window.__C.renderHome(); window.__C.layers(); if (SHEET0 && !GATE) window.__C.push({ type: SHEET0 }); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
})();
