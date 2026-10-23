'use strict';

// Demo fixtures. Prices are in USD; GBP display uses a fixed illustrative rate.
const TOKENS={
  ETH:{price:3200,icon:'Ξ',class:'eth',name:'Ethereum',color:'#c9d1d9'},
  USDC:{price:1,icon:'$',class:'usdc',name:'USD Coin',color:'#3ee0a5'},
  cbBTC:{price:68000,icon:'₿',class:'cb',name:'Coinbase Wrapped BTC',color:'#f0c46a'}
};
const FX={USD:1,GBP:0.76};
const VAULT_CAP=10000;
const DEFAULT={balances:{ETH:1.85,USDC:4250,cbBTC:0.035},vault:850,orders:[],activity:[{type:'Welcome',desc:'Demo wallet initialised',date:'Just now',amount:'—'}],permissions:{swap:true,automation:false,vault:true},wallet:null,ccy:'GBP'};
const KEY='yodex-mvp-v1';
let state=load();
let page='overview';
let activeOrder='buy';
let range='1M';

function load(){try{let v=JSON.parse(localStorage.getItem(KEY));return v&&v.balances?{...structuredClone(DEFAULT),...v}:structuredClone(DEFAULT)}catch{return structuredClone(DEFAULT)}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function ccy(){return FX[state.ccy]?state.ccy:'GBP'}
function money(usd,opts={}){return new Intl.NumberFormat('en-GB',{style:'currency',currency:ccy(),minimumFractionDigits:2,maximumFractionDigits:2,...opts}).format(Number(usd)*FX[ccy()])}
function usd(n){return new Intl.NumberFormat('en-GB',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}
function fmt(n){return Number(n).toLocaleString('en-GB',{maximumFractionDigits:6})}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function now(){return new Date().toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}

function toast(s){const el=document.getElementById('toast');el.textContent=s;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3500)}
function activity(type,desc,amountUsd){state.activity.unshift({type,desc,date:now(),amountUsd});state.activity=state.activity.slice(0,35)}
function walletTotal(){return Object.entries(state.balances).reduce((a,[t,n])=>a+n*TOKENS[t].price,0)}
function total(){return walletTotal()+state.vault}
function openOrders(){return state.orders.filter(x=>x.status==='Open').length}

// Stroke icons (24px grid)
const ICON={
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  swap:'<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>',
  trade:'<path d="M4 4v16h16"/><path d="m8 15 4-4 3 3 5-6"/>',
  vault:'<rect x="3" y="5" width="18" height="15" rx="2.5"/><circle cx="11" cy="12.5" r="3"/><path d="M17 10v5"/>',
  wallet:'<path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4h-12A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20H20a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H5.5A2.5 2.5 0 0 1 3 6.5"/><path d="M16.5 13.5h.01"/>',
  activity:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield:'<path d="M12 3 4.5 6v6c0 4.4 3.2 8.2 7.5 9 4.3-.8 7.5-4.6 7.5-9V6z"/><path d="m9 12 2 2 4-4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  flip:'<path d="M7 4v16M3 16l4 4 4-4"/><path d="M17 20V4M13 8l4-4 4 4"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  inbox:'<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/>'
};
function icon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`}

const menu=[['overview','home','Overview','Home'],['swap','swap','Swap','Swap'],['trade','trade','Trade & Orders','Trade'],['vault','vault','Vaults','Vaults'],['wallet','wallet','Smart Wallet','Wallet'],['activity','activity','Activity','Activity']];
const titles={risk:'Risk summary'};

function go(p){page=p;render();window.scrollTo({top:0,behavior:'smooth'})}

function render(){
  const navBtn=([id,ic,label])=>`<button type="button" class="${page===id?'active':''}" data-page="${id}" ${page===id?'aria-current="page"':''}>${icon(ic)}<span>${label}</span></button>`;
  document.getElementById('nav').innerHTML=menu.map(navBtn).join('');
  document.getElementById('tabbar').innerHTML=menu.map(([id,ic,,short])=>navBtn([id,ic,short])).join('');
  const name=titles[page]||menu.find(x=>x[0]===page)[2];
  document.getElementById('crumb').textContent=name;
  document.getElementById('pageTitle').textContent=name;
  document.title=`${name} · YODEX`;
  const c=document.getElementById('connect');
  if(state.wallet)c.textContent=state.wallet.slice(0,6)+'…'+state.wallet.slice(-4);else c.innerHTML='Connect<span class="hide-sm"> MetaMask</span>';
  c.classList.toggle('connected',!!state.wallet);
  document.querySelectorAll('[data-ccy]').forEach(b=>{b.classList.toggle('on',b.dataset.ccy===ccy());b.setAttribute('aria-pressed',b.dataset.ccy===ccy())});
  const content=document.getElementById('content');
  content.dataset.title=name;
  content.innerHTML=({overview,swap,trade,vault,wallet,activity:history,risk})[page]();
  wire();
}

function stat(label,value,foot){return `<div class="card stat"><div class="label">${label}</div><div class="value num">${value}</div><div class="foot">${foot}</div></div>`}

function tokenRows(){return Object.entries(state.balances).map(([t,n])=>`<div class="list-row"><div class="row-main"><div class="coin ${TOKENS[t].class}">${TOKENS[t].icon}</div><div><div class="row-title">${t}</div><div class="row-sub">${TOKENS[t].name}</div></div></div><div class="right"><div class="row-title num">${money(n*TOKENS[t].price)}</div><div class="row-sub num">${fmt(n)} ${t}</div></div></div>`).join('')}

function actIcon(type){return /swap/i.test(type)?'swap':/order/i.test(type)?'trade':/vault/i.test(type)?'vault':/welcome/i.test(type)?'shield':'activity'}
function actAmount(x){if(typeof x.amountUsd==='number')return money(x.amountUsd);return safe(x.amountUsd??x.amount??'—')}
function activityRows(limit=20){
  if(!state.activity.length)return `<div class="empty">${icon('inbox')}<div>No activity yet.</div></div>`;
  return state.activity.slice(0,limit).map(x=>`<div class="list-row"><div class="row-main"><div class="act-ico">${icon(actIcon(x.type))}</div><div><div class="row-title">${safe(x.type)}</div><div class="row-sub">${safe(x.desc)} · ${safe(x.date)}</div></div></div><div class="right row-title num">${actAmount(x)}</div></div>`).join('');
}

// Illustrative trend line ending at the current total. Seeded so it is stable per range.
function series(){
  const n={'1W':28,'1M':30,'3M':45,'1Y':52}[range];
  let seed={'1W':7,'1M':31,'3M':90,'1Y':365}[range];
  const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const pts=[1];
  for(let i=1;i<n;i++)pts.push(pts[i-1]*(1+(rnd()-.42)*.035));
  const end=pts[pts.length-1];
  return pts.map(p=>p/end*total()*FX[ccy()]);
}
function chartSvg(){
  const s=series(),W=720,H=220,pad=10;
  const min=Math.min(...s),max=Math.max(...s),span=max-min||1;
  const x=i=>i/(s.length-1)*W, y=v=>pad+(1-(v-min)/span)*(H-pad*2-14);
  const line=s.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const grid=[0.25,0.5,0.75].map(f=>`<line x1="0" x2="${W}" y1="${(H*f).toFixed(0)}" y2="${(H*f).toFixed(0)}" stroke="#25292f" stroke-dasharray="3 5"/>`).join('');
  const lx=x(s.length-1),ly=y(s[s.length-1]);
  return {change:(s[s.length-1]-s[0])/s[0]*100,svg:`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Illustrative portfolio trend"><defs><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#3ee0a5" stop-opacity=".22"/><stop offset="1" stop-color="#3ee0a5" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${line} L${W} ${H} L0 ${H}Z" fill="url(#fade)"/><path d="${line}" fill="none" stroke="#3ee0a5" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="${lx}" cy="${ly}" r="4.5" fill="#3ee0a5" stroke="#0a0b0d" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`};
}

function heroValue(){const s=money(total());const i=s.lastIndexOf('.');return i>0?`${s.slice(0,i)}<span class="pence">${s.slice(i)}</span>`:s}

function allocation(){
  const parts=[...Object.entries(state.balances).map(([t,n])=>[t,n*TOKENS[t].price,TOKENS[t].color]),['Vault',state.vault,'#5f666e']];
  const sum=parts.reduce((a,p)=>a+p[1],0)||1;
  return `<div class="alloc-bar">${parts.map(([,v,c])=>`<span style="width:${(v/sum*100).toFixed(2)}%;background:${c}"></span>`).join('')}</div><div class="legend">${parts.map(([n,v,c])=>`<div class="legend-row"><span class="nm"><span class="sw" style="background:${c}"></span>${n==='Vault'?'USDC Vault':n}</span><span class="num">${(v/sum*100).toFixed(1)}% · ${money(v)}</span></div>`).join('')}</div>`;
}

function overview(){
  const c=chartSvg();
  return `
  <div class="grid two">
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="hero-label">Total portfolio · ${ccy()} <span class="chip">Demo</span></div>
          <div class="hero-value num">${heroValue()}</div>
          <div class="hero-meta">
            <span class="chip">Wallet ${money(walletTotal())}</span>
            <span class="chip">Vault ${money(state.vault)}</span>
            <span class="chip ${openOrders()?'chip-mint':''}">${openOrders()} open order${openOrders()===1?'':'s'}</span>
          </div>
        </div>
      </div>
      <div class="hero-actions">
        <button class="action primary" type="button" data-jump="swap"><span class="ico">${icon('swap')}</span>Swap</button>
        <button class="action" type="button" data-jump="trade"><span class="ico">${icon('trade')}</span>Order</button>
        <button class="action" type="button" data-jump="vault"><span class="ico">${icon('down')}</span>Deposit</button>
        <button class="action" type="button" data-jump="wallet"><span class="ico">${icon('wallet')}</span>Wallet</button>
      </div>
    </section>
    <section class="card">
      <div class="card-head"><h2>Allocation</h2><span class="chip">Fixed demo rates</span></div>
      ${allocation()}
    </section>
  </div>

  <section class="card section">
    <div class="card-head">
      <div><h2>Portfolio trend</h2><div class="card-sub">Illustrative only. There is no historical data feed.</div></div>
      <div class="range" role="group" aria-label="Chart range">${['1W','1M','3M','1Y'].map(r=>`<button type="button" data-range="${r}" class="${r===range?'on':''}">${r}</button>`).join('')}</div>
    </div>
    <div class="chart">${c.svg}</div>
    <div class="chart-foot"><span>Decorative trend ending at today's demo balance</span><span class="num">${c.change>=0?'+':''}${c.change.toFixed(2)}% (illustrative)</span></div>
  </section>

  <div class="grid stats section">
    ${stat('Wallet assets',money(walletTotal()),'3 supported demo assets')}
    ${stat('Vault deposits',money(state.vault),'Simulated USDC vault')}
    ${stat('Demo vault APY','4.2%','Illustrative, not guaranteed')}
    ${stat('Open orders',openOrders(),'Stored in this browser')}
  </div>

  <div class="grid two-even section">
    <section class="card">
      <div class="card-head"><h2>My assets</h2><button class="link" type="button" data-jump="swap">Swap</button></div>
      ${tokenRows()}
    </section>
    <section class="card">
      <div class="card-head"><h2>Recent activity</h2><button class="link" type="button" data-jump="activity">View all</button></div>
      ${activityRows(5)}
    </section>
  </div>

  <div class="notice section">${icon('info').replace('<svg','<svg style="width:15px;height:15px;vertical-align:-3px;margin-right:6px"')}Smart wallet status: <b>${state.wallet?'MetaMask signer connected':'Demo only'}</b>. Wallet controls are mock policy settings, not on-chain enforcement.</div>`;
}

function options(selected){return Object.keys(TOKENS).map(t=>`<option ${t===selected?'selected':''}>${t}</option>`).join('')}

function swap(){return `
  <div class="grid two">
    <section class="card">
      <div class="card-head"><div><h2>Swap tokens</h2><div class="card-sub">Instant local simulation with a 0.30% illustrative fee. No blockchain transaction is sent.</div></div></div>
      <div class="swap-box">
        <div class="field"><div class="row"><label for="swapAmount">You pay</label><span class="tiny muted num" id="available"></span></div>
          <div class="split"><div class="input-group"><input class="input num" id="swapAmount" type="number" inputmode="decimal" min="0" step="any" placeholder="0.00" value="0.1"/><button class="btn btn-dark btn-sm suffix" id="max" type="button">Max</button></div><select id="from" aria-label="From token">${options('ETH')}</select></div>
        </div>
      </div>
      <div class="swap-mid"><button type="button" id="flip" aria-label="Swap direction">${icon('flip')}</button></div>
      <div class="swap-box">
        <div class="field"><label for="to">You receive (estimated)</label>
          <div class="split"><div class="input num" id="receive" aria-live="polite">0</div><select id="to" aria-label="To token">${options('USDC')}</select></div>
        </div>
      </div>
      <div class="space"></div>
      <div class="kv" id="quote"></div>
      <div class="space"></div>
      <button class="btn btn-primary btn-block" id="doSwap" type="button">Preview & execute demo swap</button>
    </section>
    <section class="card">
      <div class="card-head"><h2>Wallet balances</h2><span class="chip">Fixed demo rates</span></div>
      ${tokenRows()}
      <div class="space"></div>
      <div class="notice">The quote uses hard-coded demonstration rates. Real execution requires audited routing, live quotes, allowance management and on-chain slippage enforcement.</div>
    </section>
  </div>`}

function trade(){return `
  <div class="grid two">
    <section class="card">
      <div class="card-head"><div><h2>Create demo limit order</h2><div class="card-sub">Orders are stored in your browser. They are not monitored or executed by a keeper.</div></div></div>
      <div class="tabs" role="group" aria-label="Order side"><button type="button" class="buy ${activeOrder==='buy'?'selected':''}" data-order="buy">Buy ETH</button><button type="button" class="sell ${activeOrder==='sell'?'selected':''}" data-order="sell">Sell ETH</button></div>
      <div class="field"><label for="orderAmount">ETH amount</label><input class="input num" type="number" inputmode="decimal" id="orderAmount" value="0.1" min="0" step="any"/></div>
      <div class="field"><label for="orderPrice">Target ETH price (USDC)</label><input class="input num" type="number" inputmode="decimal" id="orderPrice" value="3000" min="0" step="any"/></div>
      <div class="kv" id="orderSummary"></div>
      <div class="space"></div>
      <div class="notice">Reference ETH price: ${usd(TOKENS.ETH.price)} (static fixture). This order will not fill automatically.</div>
      <div class="space"></div>
      <button class="btn btn-primary btn-block" id="placeOrder" type="button">Create local ${activeOrder} order</button>
    </section>
    <section class="card">
      <div class="card-head"><h2>Orders</h2><span class="chip ${openOrders()?'chip-mint':''}">${openOrders()} open</span></div>
      ${state.orders.length?state.orders.map(x=>`<div class="list-row"><div class="row-main"><div class="act-ico ${x.side==='buy'?'positive':'negative'}">${icon(x.side==='buy'?'down':'up')}</div><div><div class="row-title">${x.side==='buy'?'Buy':'Sell'} ${fmt(x.amount)} ETH</div><div class="row-sub">Target ${usd(x.price)} · ≈ ${money(x.price*x.amount)}</div></div></div><div class="right">${x.status==='Open'?`<button class="btn btn-ghost btn-sm" type="button" data-cancel="${x.id}">Cancel</button>`:`<span class="chip">${x.status}</span>`}</div></div>`).join(''):`<div class="empty">${icon('inbox')}<div>No orders yet. Create your first demo order.</div></div>`}
    </section>
  </div>`}

function vault(){return `
  <div class="grid stats">
    ${stat('Your deposits',money(state.vault),'Simulated principal')}
    ${stat('Demo APY','4.2%','Illustrative, not guaranteed')}
    ${stat('Available USDC',money(state.balances.USDC),'Demo balance')}
    ${stat('Strategy','USDC','No real lending integration')}
  </div>
  <div class="grid two section">
    <section class="card">
      <div class="card-head"><div><h2>YODEX USDC Vault</h2><div class="card-sub">A prototype interface inspired by ERC-4626. No contract deposits, real interest or yield calculations.</div></div></div>
      <div class="tabs" role="group" aria-label="Vault action"><button type="button" id="depositTab" class="selected">Deposit</button><button type="button" id="withdrawTab">Withdraw</button></div>
      <div class="field"><label id="vaultLabel" for="vaultAmount">Deposit amount (USDC)</label><input class="input num" type="number" inputmode="decimal" id="vaultAmount" min="0" step="any" value="100"/></div>
      <div class="notice" id="vaultAvailable"></div>
      <div class="space"></div>
      <button class="btn btn-primary btn-block" id="vaultSubmit" type="button">Deposit demo USDC</button>
    </section>
    <section class="card">
      <div class="card-head"><h2>Vault breakdown</h2><span class="chip chip-mint">Active</span></div>
      <div class="big num">${money(state.vault)}</div>
      <div class="muted tiny">Current simulated deposit</div>
      <div class="progress"><div style="width:${Math.min(100,state.vault/VAULT_CAP*100)}%"></div></div>
      <div class="tiny muted">${fmt(state.vault/VAULT_CAP*100)}% of illustrative ${money(VAULT_CAP,{maximumFractionDigits:0,minimumFractionDigits:0})} personal cap</div>
      <div class="space"></div>
      <div class="notice">A production vault must implement audited share accounting, ERC-4626 preview methods, liquidity constraints and withdrawal safeguards.</div>
    </section>
  </div>`}

function wallet(){return `
  <div class="banner"><span class="chip chip-mint">Smart account</span><h2>YODEX Smart Account</h2><p>This demo connects to an injected MetaMask provider as a signer only. It does not deploy an ERC-4337 account or issue UserOperations.</p></div>
  <div class="grid two-even">
    <section class="card">
      <div class="card-head"><h2>Connection</h2><span class="chip ${state.wallet?'chip-mint':''}">${state.wallet?'Connected':'Not connected'}</span></div>
      <div class="field"><label>Signer address</label><div class="notice addr">${state.wallet?safe(state.wallet):'No MetaMask signer connected'}</div></div>
      <div class="field"><label>Target network</label><div class="notice">Base Mainnet · Chain ID 8453<br>Base Sepolia · Chain ID 84532</div></div>
      <div class="grid" style="gap:10px"><button class="btn btn-primary btn-block" id="walletConnect" type="button">Connect MetaMask</button><button class="btn btn-ghost btn-block" id="disconnect" type="button">Disconnect local session</button></div>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Demo policy switches</h2><div class="card-sub">Saved locally. These switches do not constrain actual wallet transactions.</div></div></div>
      ${[['swap','Token swaps','Allow swaps from this dashboard'],['automation','Automated orders','Allow keeper-driven order fills'],['vault','Vault deposits','Allow deposits and withdrawals']].map(([id,label,sub])=>`<label class="list-row" style="cursor:pointer"><div><div class="row-title">${label}</div><div class="row-sub">${sub}</div></div><input type="checkbox" class="switch" data-policy="${id}" ${state.permissions[id]?'checked':''} aria-label="${label}"/></label>`).join('')}
      <div class="space"></div>
      <div class="notice">Production permissions require smart-account validation modules, per-session caps, expiry, nonce isolation and revocation enforced in Solidity.</div>
    </section>
  </div>
  <div class="grid two-even section">
    <section class="card">
      <div class="card-head"><div><h2>Base Sepolia testnet</h2><div class="card-sub">Connects MetaMask to chain 84532 and reads your test ETH balance. No transactions are sent.</div></div><span class="chip ${sepolia.ok?'chip-mint':''}">${sepolia.ok?'Connected':'Testnet'}</span></div>
      <div class="notice" id="sepoliaStatus" aria-live="polite">${safe(sepolia.text)}</div>
      <div class="space"></div>
      <button class="btn btn-dark btn-block" id="sepoliaConnect" type="button">Connect to Base Sepolia</button>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>YDXT token allocation</h2><div class="card-sub">Fixed supply of 230,000,000 YDXT (18 decimals), minted once at deployment. Not yet deployed.</div></div><span class="chip">Testnet spec</span></div>
      <div class="alloc-bar">${YDXT.map(([,p,c])=>`<span style="width:${p}%;background:${c}"></span>`).join('')}</div>
      <div class="legend">${YDXT.map(([n,p,c])=>`<div class="legend-row"><span class="nm"><span class="sw" style="background:${c}"></span>${n}</span><span class="num">${p}% · ${(230e6*p/100).toLocaleString('en-GB')} YDXT</span></div>`).join('')}</div>
      <div class="space"></div>
      <div class="notice">No pre-sale contract or vesting exists. The public pre-sale is not live, and promoting it in the UK requires FCA-compliant approval.</div>
    </section>
  </div>`}

function history(){return `<section class="card"><div class="card-head"><h2>Demo activity log</h2><span class="chip">Local browser data</span></div>${activityRows(35)}</section>`}

function risk(){return `
  <section class="card">
    <div class="card-head"><div><h2>Key risks of cryptoassets</h2><div class="card-sub">Estimated reading time: 2 minutes. Demo copy: have it reviewed by your compliance adviser before any real promotion.</div></div></div>
    <div class="risk-list">
      <div><h3>1. You could lose all the money you invest</h3><p>The performance of most cryptoassets can be highly volatile, with their value dropping as quickly as it can rise. You should be prepared to lose all the money you invest.</p></div>
      <div><h3>2. You should not expect to be protected if something goes wrong</h3><p>The Financial Services Compensation Scheme (FSCS) does not protect this type of investment, and you are unlikely to have access to the Financial Ombudsman Service (FOS) if something goes wrong.</p></div>
      <div><h3>3. You may not be able to sell your investment when you want to</h3><p>There is no guarantee that investments in cryptoassets can be easily sold at any given time.</p></div>
      <div><h3>4. Cryptoasset investments can be complex</h3><p>Investments in cryptoassets can be complex, making it difficult to understand the risks associated with the investment.</p></div>
      <div><h3>5. Don't put all your eggs in one basket</h3><p>Putting all your money into a single type of investment is risky. Spreading your money across different investments makes you less dependent on any one to do well.</p></div>
    </div>
    <div class="space"></div>
    <button class="btn btn-ghost" type="button" data-jump="overview">Back to overview</button>
  </section>`}

function wire(){
  document.querySelectorAll('[data-page]').forEach(b=>b.onclick=e=>{e.preventDefault();go(b.dataset.page)});
  document.querySelectorAll('[data-jump]').forEach(x=>x.onclick=()=>go(x.dataset.jump));
  document.querySelectorAll('[data-range]').forEach(x=>x.onclick=()=>{range=x.dataset.range;render()});
  if(page==='swap')wireSwap();if(page==='trade')wireTrade();if(page==='vault')wireVault();if(page==='wallet')wireWallet();
}

function wireSwap(){
  const from=document.getElementById('from'),to=document.getElementById('to'),amount=document.getElementById('swapAmount');
  function quote(){
    const a=Number(amount.value),rate=TOKENS[from.value].price/TOKENS[to.value].price,out=a>0?a*rate*.997:0;
    document.getElementById('available').textContent=`Balance: ${fmt(state.balances[from.value])} ${from.value}`;
    document.getElementById('receive').textContent=fmt(out);
    document.getElementById('quote').innerHTML=`<div><span>Rate</span><span class="num">1 ${from.value} = ${fmt(rate)} ${to.value}</span></div><div><span>Value</span><span class="num">${money(a>0?a*TOKENS[from.value].price:0)}</span></div><div><span>Demo fee</span><span class="num">0.30%</span></div><div><span>Gas & slippage</span><span>Not simulated</span></div>`;
  }
  [from,to,amount].forEach(x=>x.oninput=quote);
  document.getElementById('max').onclick=()=>{amount.value=state.balances[from.value];quote()};
  document.getElementById('flip').onclick=()=>{[from.value,to.value]=[to.value,from.value];quote()};
  document.getElementById('doSwap').onclick=()=>{
    const a=Number(amount.value),f=from.value,t=to.value;
    if(!state.permissions.swap)return toast('Enable swaps in Smart Wallet demo policies');
    if(f===t)return toast('Select different tokens');
    if(!Number.isFinite(a)||a<=0||a>state.balances[f])return toast('Enter an amount within your demo balance');
    const received=a*TOKENS[f].price/TOKENS[t].price*.997;
    state.balances[f]-=a;state.balances[t]+=received;
    activity('Swap',`${fmt(a)} ${f} → ${fmt(received)} ${t}`,a*TOKENS[f].price);
    save();render();toast('Demo swap completed. No real funds moved.');
  };
  quote();
}

function wireTrade(){
  const amt=document.getElementById('orderAmount'),price=document.getElementById('orderPrice');
  function summary(){const a=Number(amt.value)||0,p=Number(price.value)||0;document.getElementById('orderSummary').innerHTML=`<div><span>Order value</span><span class="num">${usd(a*p)} · ≈ ${money(a*p)}</span></div><div><span>vs reference</span><span class="num ${p<=TOKENS.ETH.price?'positive':'negative'}">${p?((p/TOKENS.ETH.price-1)*100).toFixed(2):'0.00'}%</span></div>`}
  [amt,price].forEach(x=>x.oninput=summary);summary();
  document.querySelectorAll('[data-order]').forEach(x=>x.onclick=()=>{activeOrder=x.dataset.order;render()});
  document.getElementById('placeOrder').onclick=()=>{
    const a=Number(amt.value),p=Number(price.value);
    if(!Number.isFinite(a)||!Number.isFinite(p)||a<=0||p<=0)return toast('Enter valid positive values');
    if(a>1000||p>10000000)return toast('Demo order exceeds allowed size');
    state.orders.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2),side:activeOrder,amount:a,price:p,status:'Open'});
    activity('Order created',`${activeOrder} ${fmt(a)} ETH @ ${usd(p)}`,'Pending');
    save();render();toast('Demo order saved locally');
  };
  document.querySelectorAll('[data-cancel]').forEach(x=>x.onclick=()=>{
    const o=state.orders.find(o=>o.id===x.dataset.cancel);
    if(o){o.status='Cancelled';activity('Order cancelled',`${o.side} ${fmt(o.amount)} ETH`,'—');save();render();toast('Order cancelled')}
  });
}

function wireVault(){
  let mode='deposit';
  const label=document.getElementById('vaultLabel'),available=document.getElementById('vaultAvailable'),submit=document.getElementById('vaultSubmit');
  function update(){
    document.getElementById('depositTab').classList.toggle('selected',mode==='deposit');
    document.getElementById('withdrawTab').classList.toggle('selected',mode==='withdraw');
    label.textContent=(mode==='deposit'?'Deposit':'Withdraw')+' amount (USDC)';
    const n=mode==='deposit'?state.balances.USDC:state.vault;
    available.innerHTML=`Available: <b class="num">${fmt(n)} USDC</b> · ≈ ${money(n)}`;
    submit.textContent=(mode==='deposit'?'Deposit':'Withdraw')+' demo USDC';
  }
  document.getElementById('depositTab').onclick=()=>{mode='deposit';update()};
  document.getElementById('withdrawTab').onclick=()=>{mode='withdraw';update()};
  submit.onclick=()=>{
    const a=Number(document.getElementById('vaultAmount').value);
    if(!state.permissions.vault)return toast('Enable vaults in Smart Wallet demo policies');
    if(!Number.isFinite(a)||a<=0)return toast('Enter a valid positive amount');
    if(mode==='deposit'){if(a>state.balances.USDC||state.vault+a>VAULT_CAP)return toast('Insufficient USDC or demo vault cap exceeded');state.balances.USDC-=a;state.vault+=a}
    else{if(a>state.vault)return toast('Withdrawal exceeds demo deposits');state.vault-=a;state.balances.USDC+=a}
    activity(mode==='deposit'?'Vault deposit':'Vault withdrawal',`${fmt(a)} USDC`,a);
    save();render();toast('Demo vault '+mode+' completed');
  };
  update();
}

async function connect(){
  if(!window.ethereum){toast('MetaMask not detected. Install the extension to connect; the demo works without it.');return}
  try{const a=await window.ethereum.request({method:'eth_requestAccounts'});if(a?.[0]){state.wallet=a[0];save();render();toast('MetaMask signer connected. No transaction sent.')}}
  catch(e){toast('Connection cancelled or unavailable')}
}
// Base Sepolia (chain 84532) connection: wallet requests only, nothing is signed or sent.
const SEPOLIA={chainId:'0x14a34',chainName:'Base Sepolia',nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18},rpcUrls:['https://sepolia.base.org'],blockExplorerUrls:['https://sepolia.basescan.org']};
let sepolia={ok:false,text:'Not connected'};
const YDXT=[['Liquidity',30,'#3ee0a5'],['Treasury',25,'#c9d1d9'],['Community',15,'#6cf0c0'],['Public pre-sale',15,'#f0c46a'],['Development',10,'#8a929b'],['Team',5,'#5f666e']];
async function connectSepolia(){
  const show=(text,ok=false)=>{sepolia={ok,text};render()};
  if(!window.ethereum)return show('MetaMask browser extension not detected');
  try{
    const accounts=await window.ethereum.request({method:'eth_requestAccounts'});
    try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:SEPOLIA.chainId}]})}
    catch(e){if(e.code===4902)await window.ethereum.request({method:'wallet_addEthereumChain',params:[SEPOLIA]});else throw e}
    const balance=await window.ethereum.request({method:'eth_getBalance',params:[accounts[0],'latest']});
    show(`${accounts[0].slice(0,6)}…${accounts[0].slice(-4)} · ${(Number(BigInt(balance))/1e18).toFixed(5)} Sepolia ETH · dashboard actions remain simulated`,true);
  }catch(e){show('Wallet connection failed: '+(e.message||'unknown error'))}
}
function wireWallet(){
  document.getElementById('sepoliaConnect').onclick=connectSepolia;
  document.getElementById('walletConnect').onclick=connect;
  document.getElementById('disconnect').onclick=()=>{state.wallet=null;save();render();toast('Local session disconnected')};
  document.querySelectorAll('[data-policy]').forEach(x=>x.onchange=()=>{state.permissions[x.dataset.policy]=x.checked;save();toast('Demo-only policy updated')});
}

document.getElementById('connect').onclick=connect;
document.querySelectorAll('[data-ccy]').forEach(b=>b.onclick=()=>{state.ccy=b.dataset.ccy;save();render()});
document.getElementById('reset').onclick=()=>{if(confirm('Reset all YODEX demo balances, orders and activity?')){state=structuredClone(DEFAULT);save();go('overview');toast('Demo data reset')}};
if(window.ethereum?.on){window.ethereum.on('accountsChanged',a=>{state.wallet=a?.[0]||null;save();render()})}
render();
