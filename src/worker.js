// Serves the non-sensitive /api endpoints. Everything else is a static asset from public/.
// Contract addresses stay null until the prototypes are deployed to Base Sepolia (see docs/DEPLOY.md).
const CONFIG={chainId:84532,chainName:'Base Sepolia',rpcUrl:'https://sepolia.base.org',contracts:{factory:null,token:null,vault:null,orderBook:null,swapAdapter:null},token:{symbol:'YDXT',decimals:18,maxSupply:'230000000'},mode:'testnet-demo'};
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});

export default {
  async fetch(request,env){
    const {pathname}=new URL(request.url);
    if(request.method==='GET'&&pathname==='/api/health')return json({ok:true,app:'YODEX',mode:CONFIG.mode,chainId:CONFIG.chainId,contractsDeployed:Object.values(CONFIG.contracts).some(Boolean)});
    if(request.method==='GET'&&pathname==='/api/config')return json(CONFIG);
    if(pathname.startsWith('/api/'))return json({error:'Not found'},404);
    return env.ASSETS.fetch(request);
  }
};
