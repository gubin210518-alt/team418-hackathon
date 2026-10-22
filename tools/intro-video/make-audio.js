// 15초 소개 영상 소리 만들기 — site/sfx.js 의 효과음 + 가벼운 배경 비트를 코드로 합성해요 (0원, 저작권 걱정 없음).
// 사용: (이 폴더에서) NODE_PATH=$(npm root -g) node make-audio.js  → audio.wav
//       ffmpeg -y -i ../../site/intro.mp4 -i audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest out.mp4
// 영상 장면 시각은 scene.html 의 render(t) 와 맞춰 놨어요.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const D=15,SR=44100;
function ev(){
  const E=[];const a=(t,n,o)=>E.push([t,n,o||{}]);
  // 1. 제목 (0~3.2): 양쪽에서 휙 → VS 쾅 → 제목 톡
  a(.12,'whoosh');a(.78,'boom');a(1.15,'pop');a(1.9,'flag');
  // 2. 쌤의 하루 (3~6.4): 카드 3장, 전화벨, 결재 도장
  a(3.0,'next');[3.3,3.65,4.0].forEach(t=>a(t,'pop'));a(4.25,'ring');a(5.25,'ring');
  for(let t=14/3;t<6.2;t+=1/3)a(t,'stamp');
  // 3. 고딩의 하루 (6.2~9.6): 카드 3장, 톡, 확인
  a(6.2,'next');[6.5,6.85,7.2].forEach(t=>a(t,'pop'));a(7.75,'tap');a(8.2,'ok');a(8.25,'msg');
  // 4. 신뢰 게이지 (9.4~12.8): 칸이 찰 때마다 한 음씩 올라가고 MAX
  a(9.4,'next');let prev=0;const eo=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3);
  for(let i=0;i<=600;i++){const t=9.8+i*2/600,n=Math.round(15*eo((t-9.8)/2));if(n>prev){a(t,'gtick',{i:n-1});prev=n;}}
  a(11.85,'max');
  // 5. 마무리 (12.6~15)
  a(12.6,'next');a(12.8,'pop');a(13.1,'stinger');a(13.62,'click');
  return E;
}
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();await p.goto('about:blank');
  await p.addScriptTag({path:path.join(__dirname,'../../site/sfx.js')});
  const data=await p.evaluate(async({E,D,SR})=>{
    const c=new OfflineAudioContext(2,D*SR,SR);const master=c.createGain();master.gain.value=1;master.connect(c.destination);
    // 배경 비트 (120bpm, 1.0~13.0초): 킥 · 하이햇 · 코드 패드 C-Am-F-G
    const bed=c.createGain();bed.gain.value=.55;bed.connect(master);
    const nb=c.createBuffer(1,SR,SR),nd=nb.getChannelData(0);let s=99;for(let i=0;i<SR;i++){s=(s*1664525+1013904223)>>>0;nd[i]=(s/4294967296)*2-1;}
    function kick(t){const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.32,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g);g.connect(bed);o.start(t);o.stop(t+.3);}
    function hat(t,v){const src=c.createBufferSource();src.buffer=nb;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=9000;f.Q.value=.8;
      const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.06);
      src.connect(f);f.connect(g);g.connect(bed);src.start(t);src.stop(t+.08);}
    function chord(t,ms,dur){ms.forEach(m=>[-8,8].forEach(cent=>{const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();
      o.type='sawtooth';o.frequency.value=440*Math.pow(2,(m-69)/12);o.detune.value=cent;lp.type='lowpass';lp.frequency.value=1100;
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.016,t+.15);g.gain.setValueAtTime(.016,t+dur-.25);g.gain.linearRampToValueAtTime(.0001,t+dur);
      o.connect(lp);lp.connect(g);g.connect(bed);o.start(t);o.stop(t+dur+.05);}));}
    function bass(t,m,dur){const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=440*Math.pow(2,(m-69)/12);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.12,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(bed);o.start(t);o.stop(t+dur+.05);}
    const prog=[[60,64,67,48],[57,60,64,45],[53,57,60,41],[55,59,62,43]];   // C Am F G
    for(let bar=0;bar<6;bar++){const t=1.0+bar*2,ch=prog[bar%4];chord(t,ch.slice(0,3),2);for(let k=0;k<4;k++){const bt=t+k*.5;kick(bt);hat(bt+.25,.05);bass(bt,ch[3],.4);}}
    // 효과음
    E.forEach(([t,n,o])=>SFX.schedule(c,master,n,t,o));
    const buf=await c.startRendering();
    return [Array.from(buf.getChannelData(0)),Array.from(buf.getChannelData(1))];
  },{E:ev(),D,SR});
  await b.close();
  // 16bit WAV 로 저장 (봉우리가 넘치지 않게 맞춤)
  let pk=0;for(const ch of data)for(const x of ch)pk=Math.max(pk,Math.abs(x));
  const g=pk>0.89?0.89/pk:1,n=data[0].length,buf=Buffer.alloc(44+n*4);
  buf.write('RIFF',0);buf.writeUInt32LE(36+n*4,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);
  buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(n*4,40);
  for(let i=0;i<n;i++)for(let ch=0;ch<2;ch++){const v=Math.max(-1,Math.min(1,data[ch][i]*g));buf.writeInt16LE(Math.round(v*32767),44+i*4+ch*2);}
  fs.writeFileSync(path.join(__dirname,'audio.wav'),buf);
  console.log('audio.wav 완료 · 봉우리',pk.toFixed(3),'→',(pk*g).toFixed(3));
})();
