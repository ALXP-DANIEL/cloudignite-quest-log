(() => {
  let shown = false;
  function scan() {
    if (shown || !document.body) return;
    const text = document.body.innerText || '';
    if (!/knowledge check results/i.test(text) || !/your score\s*:\s*100\s*%/i.test(text) || !/congratulations|all the questions correctly/i.test(text)) return;
    shown = true;
    chrome.storage.local.get(['course','passed','activeKnowledgeCheck','soundOn'], data => {
      const active = data.activeKnowledgeCheck;
      if (active && Date.now()-active.at < 4*60*60*1000) {
        const matches=(data.course||[]).flatMap(m=>m.items).filter(item=>item.title.trim()===active.title);
        if(matches.length===1) {const passed=data.passed||{};passed[matches[0].id]=true;chrome.storage.local.set({passed});}
      }
      const overlay=document.createElement('div');overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');
      overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0a151bd9;display:grid;place-items:center;font-family:monospace;text-align:center';
      overlay.innerHTML='<div style="position:relative;background:#102019;color:white;border:4px solid #caff60;box-shadow:10px 10px #486b2b;padding:30px;max-width:420px;margin:20px"><button aria-label="Close celebration" style="position:absolute;right:10px;top:6px;border:0;background:none;color:white;font-size:26px;cursor:pointer">×</button><div style="color:#caff60;font-size:72px;text-shadow:4px 4px #ff944d">★</div><div style="color:#caff60;letter-spacing:3px;font-weight:bold">✦ PERFECT SCORE ✦</div><div style="font-size:42px;font-weight:900;margin:14px 0">FANTASTIC!</div><p>100% — you crushed this knowledge check!</p><button class="play" style="margin-top:14px;border:0;background:#caff60;color:#102019;padding:10px 18px;font-weight:bold;cursor:pointer">♪ PLAY FANFARE</button></div>';
      document.body.append(overlay);overlay.querySelector('[aria-label]').onclick=()=>overlay.remove();
      function fanfare(){try{const ctx=new AudioContext();ctx.resume();[523,659,784,1047].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.12;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.21)})}catch(_){}}
      overlay.querySelector('.play').onclick=fanfare;
      if(data.soundOn!==false){fanfare();if('speechSynthesis' in window){const voice=new SpeechSynthesisUtterance('Fantastic! Perfect score!');voice.pitch=1.15;window.speechSynthesis.speak(voice)}}
    });
  }
  scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
