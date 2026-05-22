
const cfg = window.COACHLEAGUE_CONFIG;
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const fmtUsd = (n) => {
  if(n === null || n === undefined || isNaN(Number(n))) return "—";
  n = Number(n);
  if(n >= 1_000_000_000) return "$" + (n/1_000_000_000).toFixed(2) + "B";
  if(n >= 1_000_000) return "$" + (n/1_000_000).toFixed(2) + "M";
  if(n >= 1_000) return "$" + (n/1_000).toFixed(1) + "K";
  return "$" + n.toFixed(n < 1 ? 6 : 2);
};
const shortCa = (ca) => ca ? ca.slice(0,6) + "..." + ca.slice(-5) : "Add CA in config.js";

function pumpUrl(c){
  if(c.pumpfunUrl) return c.pumpfunUrl;
  if(c.contract) return `https://pump.fun/coin/${c.contract}`;
  return "#";
}
function dexUrl(c){
  if(c.dexPairUrl) return c.dexPairUrl;
  if(c.contract) return `https://dexscreener.com/solana/${c.contract}`;
  return "#";
}

function render(){
  const list = $("#coachList");
  list.innerHTML = "";
  const q = ($("#search").value || "").toLowerCase().trim();
  const sort = $("#sort").value;
  let coaches = [...cfg.coaches].filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.ticker.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q)
  );
  if(sort === "name") coaches.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort === "country") coaches.sort((a,b)=>a.country.localeCompare(b.country));
  if(sort === "marketcap") coaches.sort((a,b)=>(b.marketCap||0)-(a.marketCap||0));
  if(sort === "rank") coaches.sort((a,b)=>a.rank-b.rank);

  coaches.forEach(c => {
    const card = document.createElement("article");
    card.className = "coach-card";
    card.dataset.contract = c.contract || "";
    card.innerHTML = `
      <div class="rank">#${c.rank}</div>
      <img class="coach-img" src="${c.image}" alt="${escapeHtml(c.name)} meme poster">
      <div class="coach-info">
        <div class="coach-name">${escapeHtml(c.name)}</div>
        <div class="ticker">$${escapeHtml(c.ticker)}</div>
        <div class="country">${flagEmoji(c.country)} ${escapeHtml(c.country)}</div>
        <div class="mini-stats">
          <div class="mini-stat"><div class="label">Market Cap</div><div class="value mcap">—</div></div>
          <div class="mini-stat"><div class="label">24H Vol</div><div class="value vol">—</div></div>
        </div>
        <div class="price-line"><span class="label">Price Live</span> <span class="live-price price">—</span> <span class="up change"></span></div>
        <div class="contract"><span>${shortCa(c.contract)}</span><button class="copy-btn" title="Copy contract" data-copy="${escapeHtml(c.contract || '')}">⧉</button></div>
      </div>
      <a class="trade" href="${pumpUrl(c)}" target="_blank" rel="noopener">Trade <small>on Pump.fun</small></a>
    `;
    list.appendChild(card);
  });
  $("#shownCount").textContent = coaches.length;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

const flagMap = {
  "France":"🇫🇷","Spain":"🇪🇸","England":"🏴","United States":"🇺🇸","Mexico":"🇲🇽","Brazil":"🇧🇷","Argentina":"🇦🇷","Netherlands":"🇳🇱","Turkey":"🇹🇷","Portugal":"🇵🇹","Japan":"🇯🇵","Switzerland":"🇨🇭","Germany":"🇩🇪","South Korea":"🇰🇷","Belgium":"🇧🇪","Ivory Coast":"🇨🇮","Senegal":"🇸🇳","Austria":"🇦🇹","Croatia":"🇭🇷","Scotland":"🏴","Cape Verde":"🇨🇻","Panama":"🇵🇦","Norway":"🇳🇴","South Africa":"🇿🇦","Colombia":"🇨🇴","Congo":"🇨🇬","Iran":"🇮🇷","Uruguay":"🇺🇾","New Zealand":"🇳🇿","Egypt":"🇪🇬","Algeria":"🇩🇿","Haiti":"🇭🇹","Bosnia and Herzegovina":"🇧🇦","Canada":"🇨🇦","Jordan":"🇯🇴","Ecuador":"🇪🇨","Paraguay":"🇵🇾","Australia":"🇦🇺","Qatar":"🇶🇦","Iraq":"🇮🇶","Uzbekistan":"🇺🇿","Sweden":"🇸🇪","Czech Republic":"🇨🇿","Tunisia":"🇹🇳","Morocco":"🇲🇦","Ghana":"🇬🇭","Saudi Arabia":"🇸🇦","Curaçao":"🇨🇼"
};
function flagEmoji(country){ return flagMap[country] || "🏳️"; }

function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1800);
}

async function loadDexForToken(contract){
  if(!contract) return null;
  try{
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contract}`);
    if(!res.ok) return null;
    const data = await res.json();
    const pairs = (data.pairs || []).filter(p => (p.chainId || "").toLowerCase() === "solana");
    pairs.sort((a,b)=>(b.liquidity?.usd||0)-(a.liquidity?.usd||0));
    return pairs[0] || null;
  }catch(e){ return null; }
}

async function hydrateLiveData(){
  // Main coin
  if(cfg.main.contract){
    const p = await loadDexForToken(cfg.main.contract);
    if(p){
      $("#mainPrice").textContent = fmtUsd(p.priceUsd);
      $("#mainMcap").textContent = fmtUsd(p.marketCap || p.fdv);
      $("#mainVol").textContent = fmtUsd(p.volume?.h24);
      $("#mainChange").textContent = (p.priceChange?.h24 ? `${p.priceChange.h24 > 0 ? "+" : ""}${Number(p.priceChange.h24).toFixed(2)}%` : "");
      $("#mainChart").href = cfg.main.dexPairUrl || p.url || "#";
    }
  }
  for(const c of cfg.coaches){
    if(!c.contract) continue;
    const p = await loadDexForToken(c.contract);
    const card = [...$$(".coach-card")].find(el => el.dataset.contract === c.contract);
    if(!card || !p) continue;
    $(".price", card).textContent = fmtUsd(p.priceUsd);
    $(".mcap", card).textContent = fmtUsd(p.marketCap || p.fdv);
    $(".vol", card).textContent = fmtUsd(p.volume?.h24);
    $(".change", card).textContent = p.priceChange?.h24 ? `${p.priceChange.h24 > 0 ? "+" : ""}${Number(p.priceChange.h24).toFixed(2)}%` : "";
  }
}

document.addEventListener("click", e=>{
  const btn = e.target.closest("[data-copy]");
  if(btn){
    const v = btn.dataset.copy;
    if(!v) return toast("Add the CA in config.js first");
    navigator.clipboard.writeText(v);
    toast("Contract copied");
  }
});

document.addEventListener("DOMContentLoaded", ()=>{
  $("#coachTotal").textContent = cfg.coaches.length;
  $("#shownCount").textContent = cfg.coaches.length;
  $("#buyMain").href = cfg.main.pumpfunUrl || (cfg.main.contract ? `https://pump.fun/coin/${cfg.main.contract}` : "#");
  $("#mainChart").href = cfg.main.dexPairUrl || (cfg.main.contract ? `https://dexscreener.com/solana/${cfg.main.contract}` : "#");
  if(cfg.main.xUrl) $$(".x-link").forEach(a=>a.href = cfg.main.xUrl);
  if(cfg.main.telegramUrl) $("#telegram").href = cfg.main.telegramUrl;
  if(cfg.main.discordUrl) $("#discord").href = cfg.main.discordUrl;
  render();
  $("#search").addEventListener("input", render);
  $("#sort").addEventListener("change", render);
  hydrateLiveData();
});
