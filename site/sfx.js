/* TEAM 418 효과음 v2 — 파일 없이 코드(Web Audio)로 합성한 소리. 저작권 걱정 없음, 0원.
   같은 코드를 영상 소리(tools/intro-video/make-audio.js)에서도 써요.
   SFX.play('up')  /  SFX.setMuted(true)  /  SFX.schedule(ctx, dest, 'up', 시각) */
(function(root){
  'use strict';
  var KEY='team418-sfx-muted';

  /* ---------- 공용 믹서: 압축기 + 잔향(리버브) ---------- */
  function bus(c,dest){
    var k='__t418bus',B=c[k];if(B&&B.dest===dest)return B;
    var comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.003;comp.release.value=.2;
    var dry=c.createGain();dry.gain.value=1;
    var conv=c.createConvolver(),len=Math.floor(c.sampleRate*1.6),ir=c.createBuffer(2,len,c.sampleRate),s=777;
    for(var ch=0;ch<2;ch++){var d=ir.getChannelData(ch),lp=0;for(var i=0;i<len;i++){s=(s*1664525+1013904223)>>>0;var n=(s/4294967296)*2-1;lp=lp*.55+n*.45;d[i]=lp*Math.pow(1-i/len,3.2);}}
    conv.buffer=ir;var wet=c.createGain();wet.gain.value=.5;
    dry.connect(comp);conv.connect(wet);wet.connect(comp);comp.connect(dest);
    B={dest:dest,dry:dry,rev:conv};c[k]=B;return B;
  }
  function out(c,B,node,rev){node.connect(B.dry);if(rev){var g=c.createGain();g.gain.value=rev;node.connect(g);g.connect(B.rev);}}
  function env(g,t,a,d,peak){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(peak,0.0002),t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);}
  function stop(o,t){o.start(t[0]);o.stop(t[1]);}

  /* ---------- 악기 ---------- */
  /* 종소리(글로켄슈필 느낌): 배음 비율이 살짝 어긋나게 */
  function bell(c,B,t,f,v,dur,rev){
    [[1,1,1],[2.76,.32,.55],[5.4,.12,.3],[8.93,.05,.18]].forEach(function(p){
      var o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f*p[0];
      env(g,t,.002,dur*p[2],v*p[1]);o.connect(g);out(c,B,g,rev);stop(o,[t,t+dur+.05]);});
  }
  /* 칼림바·마림바 느낌: 필터가 빠르게 닫히는 튕김 소리 */
  function pluck(c,B,t,f,v,dur,rev){
    var o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),g2=c.createGain(),lp=c.createBiquadFilter();
    o.type='triangle';o.frequency.value=f;o2.type='sine';o2.frequency.value=f*2;g2.gain.value=.35;
    lp.type='lowpass';lp.Q.value=2;lp.frequency.setValueAtTime(f*8,t);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+dur*.6);
    env(g,t,.003,dur,v);o.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);out(c,B,g,rev);
    stop(o,[t,t+dur+.05]);stop(o2,[t,t+dur+.05]);
  }
  /* 부드러운 화음 바닥(패드): 살짝 어긋난 두 톱니파 + 필터 */
  function pad(c,B,t,fs,v,dur,rev){
    fs.forEach(function(f){[-7,7].forEach(function(cent){
      var o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;o.detune.value=cent;
      lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.linearRampToValueAtTime(2200,t+dur*.4);
      g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v/fs.length,t+.06);g.gain.setValueAtTime(v/fs.length,t+dur*.5);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(lp);lp.connect(g);out(c,B,g,rev);stop(o,[t,t+dur+.05]);});});
  }
  /* 미끄러지는 소리 (+비브라토) */
  function glide(c,B,t,o){
    var os=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();os.type=o.type||'sine';
    os.frequency.setValueAtTime(o.f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+(o.slide||o.d));
    if(o.vib){var l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=o.f*.025;l.connect(lg);lg.connect(os.frequency);stop(l,[t,t+o.d+.1]);}
    lp.type='lowpass';lp.frequency.setValueAtTime(o.lp||8000,t);if(o.lp2)lp.frequency.exponentialRampToValueAtTime(o.lp2,t+o.d);
    env(g,t,o.a||.006,o.d,o.v);os.connect(lp);lp.connect(g);out(c,B,g,o.rev);stop(os,[t,t+(o.a||.006)+o.d+.05]);
  }
  var _nb=null;
  function noiseBuf(c){
    if(_nb&&_nb.sampleRate===c.sampleRate)return _nb;
    var n=c.sampleRate,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0),s=12345;
    for(var i=0;i<n;i++){s=(s*1664525+1013904223)>>>0;d[i]=(s/4294967296)*2-1;}
    return (_nb=b);
  }
  function noise(c,B,t,o){
    var src=c.createBufferSource();src.buffer=noiseBuf(c);src.loop=true;
    var f=c.createBiquadFilter();f.type=o.ft||'bandpass';f.frequency.setValueAtTime(o.f,t);
    if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+o.d);f.Q.value=o.q||1;
    var g=c.createGain();env(g,t,o.a||.01,o.d,o.v);src.connect(f);f.connect(g);out(c,B,g,o.rev);stop(src,[t,t+(o.a||.01)+o.d+.05]);
  }
  function sub(c,B,t,f,v,dur){glide(c,B,t,{f:f,d:dur,v:v,a:.01});}

  var n=function(m){return 440*Math.pow(2,(m-69)/12);};   /* 음 번호 → 주파수 (60=도) */
  var C4=60,E4=64,F4=65,G4=67,A4=69,C5=72,D5=74,E5=76,F5=77,G5=79,A5=81,C6=84,D6=86,E6=88,G6=91,A6=93,C7=96,E7=100;

  /* ---------- 소리 목록 ---------- */
  var L={
    click:function(c,B,t){pluck(c,B,t,n(A6),.10,.07,.08);},
    select:function(c,B,t){pluck(c,B,t,n(G5),.13,.12,.15);pluck(c,B,t+.05,n(D6),.13,.16,.2);},
    next:function(c,B,t){noise(c,B,t,{f:350,f2:3200,d:.24,q:.9,v:.07,rev:.3});pluck(c,B,t+.16,n(C6),.05,.15,.3);},
    typing:function(c,B,t){pluck(c,B,t,n(E7),.022,.03,0);},
    start:function(c,B,t){[C5,E5,G5,C6,E6].forEach(function(m,i){bell(c,B,t+i*.055,n(m),.09,.6,.35);});
      pad(c,B,t+.05,[n(C4),n(E4),n(G4)],.07,.9,.4);noise(c,B,t,{f:600,f2:5000,d:.35,q:.6,v:.05,rev:.3});},
    up:function(c,B,t){[C6,E6,G6].forEach(function(m,i){pluck(c,B,t+i*.055,n(m),.14,.32,.3);});bell(c,B,t+.17,n(C7),.05,.5,.5);},
    up3:function(c,B,t){[C5,E5,G5,C6,E6,G6].forEach(function(m,i){pluck(c,B,t+i*.045,n(m),.13,.35,.3);});
      [C7,G6,E7].forEach(function(m,i){bell(c,B,t+.28+i*.07,n(m),.045,.7,.6);});
      pad(c,B,t+.22,[n(C5),n(E5),n(G5)],.06,1,.5);noise(c,B,t+.25,{f:7500,q:.7,d:.5,v:.025,rev:.4});},
    down:function(c,B,t){
      glide(c,B,t,{type:'square',f:n(E5),f2:n(D5),d:.17,v:.09,lp:2200,lp2:500,rev:.15});
      glide(c,B,t+.18,{type:'square',f:n(C5),f2:n(A4),slide:.3,d:.34,v:.095,lp:1800,lp2:350,vib:6,rev:.15});},
    flag:function(c,B,t){bell(c,B,t,n(G6),.1,.9,.5);bell(c,B,t+.09,n(D6)*2,.06,.8,.5);},
    msg:function(c,B,t){bell(c,B,t,n(A5),.09,.35,.25);bell(c,B,t+.1,n(E6),.09,.45,.25);},
    max:function(c,B,t){[C5,E5,G5,C6].forEach(function(m,i){pluck(c,B,t+i*.08,n(m),.14,.3,.3);});
      pad(c,B,t+.34,[n(C4),n(G4),n(C5),n(E5),n(G5)],.1,1.6,.5);sub(c,B,t+.34,n(36),.14,1.2);
      [C7,G6,E7,C7].forEach(function(m,i){bell(c,B,t+.4+i*.12,n(m),.04,.8,.6);});},
    zero:function(c,B,t){glide(c,B,t,{type:'sawtooth',f:n(G4),f2:n(C4)/2,d:.9,v:.06,lp:1200,lp2:200,rev:.3});sub(c,B,t,n(40),.12,.4);},
    endGood:function(c,B,t){
      [G5,C6,E6,G6].forEach(function(m,i){pluck(c,B,t+i*.13,n(m),.14,.4,.3);bell(c,B,t+i*.13,n(m),.05,.5,.4);});
      var T=t+.55;pad(c,B,T,[n(C4),n(G4),n(D5),n(E5),n(71)],.08,2.4,.6);sub(c,B,T,n(36),.08,1.8);
      [E7,C7,G6,D6].forEach(function(m,i){bell(c,B,T+.15+i*.16,n(m),.035,1,.7);});
      noise(c,B,T,{f:8000,q:.7,d:1,v:.02,rev:.5});},
    endNormal:function(c,B,t){[F5,A5,C6,E6].forEach(function(m,i){pluck(c,B,t+i*.16,n(m),.11,.45,.35);});
      pad(c,B,t+.5,[n(F4),n(A4),n(C5),n(E5)],.08,1.6,.5);},
    endBad:function(c,B,t){
      [[G4,0],[66,.28],[F4,.56]].forEach(function(p){glide(c,B,t+p[1],{type:'sawtooth',f:n(p[0]),d:.26,v:.12,lp:1000,lp2:500,rev:.25});});
      glide(c,B,t+.86,{type:'sawtooth',f:n(E4),f2:n(E4)*.84,slide:1.1,d:1.2,v:.13,lp:1000,lp2:250,vib:5.5,rev:.3});},
    /* 영상용 */
    boom:function(c,B,t){glide(c,B,t,{f:130,f2:34,d:.8,v:.5,a:.004});noise(c,B,t,{f:180,ft:'lowpass',d:.4,v:.22,rev:.5});
      bell(c,B,t+.02,n(E6),.05,.9,.7);noise(c,B,t,{f:5000,q:.7,d:.25,v:.05,rev:.6});},
    whoosh:function(c,B,t){noise(c,B,t,{f:250,f2:3800,d:.55,q:.6,v:.11,a:.2,rev:.35});},
    ring:function(c,B,t){for(var k=0;k<2;k++){var s=t+k*.48;for(var i=0;i<9;i++){bell(c,B,s+i*.04,i%2?1650:1320,.065,.07,.15);}}},
    stamp:function(c,B,t){glide(c,B,t,{f:150,f2:55,d:.2,v:.45,a:.002});noise(c,B,t,{f:1400,d:.09,q:.7,v:.14,rev:.2});},
    tap:function(c,B,t){pluck(c,B,t,n(E6)*1.5,.12,.06,.1);},
    ok:function(c,B,t){bell(c,B,t,n(E6),.09,.4,.35);bell(c,B,t+.1,n(A6),.09,.7,.4);},
    pop:function(c,B,t){glide(c,B,t,{f:380,f2:900,slide:.06,d:.1,v:.13,rev:.12});},
    stinger:function(c,B,t){pad(c,B,t,[n(C4),n(G4),n(C5),n(E5),n(G5)],.12,2.2,.6);sub(c,B,t,n(36),.18,1.8);
      [C6,G6,C7,E7].forEach(function(m,i){bell(c,B,t+i*.11,n(m),.06,1.2,.6);});noise(c,B,t,{f:9000,q:.7,d:.8,v:.02,rev:.5});},
    gtick:function(c,B,t,o){var sc=[C5,D5,E5,G5,A5],i=(o&&o.i)||0,m=sc[i%5]+12*Math.floor(i/5);pluck(c,B,t,n(m),.11,.18,.25);}
  };

  /* ---------- 사이트에서 쓰는 부분 ---------- */
  var ctx=null,muted=false,last={};
  try{muted=localStorage.getItem(KEY)==='1';}catch(e){}
  function ensure(){
    if(ctx)return ctx;var AC=root.AudioContext||root.webkitAudioContext;if(!AC)return null;
    try{ctx=new AC();}catch(e){ctx=null;}return ctx;
  }
  var SFX={
    names:Object.keys(L),
    muted:function(){return muted;},
    setMuted:function(m){muted=!!m;try{localStorage.setItem(KEY,muted?'1':'0');}catch(e){}
      Array.prototype.forEach.call(document.querySelectorAll('[data-sfx-toggle]'),function(b){SFX.paint(b);});},
    paint:function(b){b.setAttribute('aria-pressed',muted?'false':'true');b.textContent=muted?'🔇 소리 꺼짐':'🔊 소리 켜짐';},
    unlock:function(){var c=ensure();if(c&&c.state==='suspended')c.resume();},
    play:function(name,opt){
      if(muted||!L[name])return;var c=ensure();if(!c)return;if(c.state==='suspended')c.resume();
      var now=c.currentTime;if(last[name]&&now-last[name]<0.04)return;last[name]=now;
      try{L[name](c,bus(c,c.destination),now+0.015,opt);}catch(e){}
    },
    schedule:function(c,dest,name,t,opt){if(L[name])L[name](c,bus(c,dest),t,opt);}
  };
  root.SFX=SFX;
  if(root.document){
    root.document.addEventListener('pointerdown',SFX.unlock,{once:true,passive:true});
    root.document.addEventListener('keydown',SFX.unlock,{once:true});
  }
})(typeof window!=='undefined'?window:globalThis);
