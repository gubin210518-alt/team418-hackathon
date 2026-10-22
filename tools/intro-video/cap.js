const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+process.cwd()+'/scene.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
const only=process.argv[2];
if(only){for(const t of only.split(',')){await p.evaluate(x=>render(x),+t);await p.screenshot({path:'peek-'+t+'.png'});}await b.close();return;}
fs.mkdirSync('f',{recursive:true});const FPS=30,N=15*FPS;
for(let i=0;i<N;i++){await p.evaluate(x=>render(x),i/FPS);await p.screenshot({path:`f/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
await b.close();})();
