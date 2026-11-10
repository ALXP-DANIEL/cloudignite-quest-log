(() => {
  if (window.top !== window || !new URL(location.href).searchParams.has('asnid')) return;
  const labId = new URL(location.href).searchParams.get('asnid');
  const pendingKey = `lab-end-${labId}`;
  const seenKey = `lab-celebrated-${labId}`;
  let ending = false, celebrating = false, scoreSeen = false, audioContext;
  const observed = new Set();

  function fanfare() {
    try {
      audioContext ||= new AudioContext();
      audioContext.resume().catch(() => {});
      const start = audioContext.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((frequency, i) => {
        const osc = audioContext.createOscillator(), gain = audioContext.createGain(), at = start + i * .11;
        osc.type = 'square'; osc.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(.04, at + .01);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .22);
        osc.connect(gain); gain.connect(audioContext.destination); osc.start(at); osc.stop(at + .23);
      });
    } catch (_) { /* Browser may require a click before audio is allowed. */ }
  }
  function showCelebration() {
    if (celebrating) return;
    celebrating = true;
    chrome.storage.local.remove(pendingKey);
    chrome.storage.local.set({[seenKey]: true});
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'status'); overlay.setAttribute('aria-live', 'polite');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:radial-gradient(circle,#263d1cdd,#080f1cbb);display:grid;place-items:center;font-family:monospace;text-align:center';
    overlay.innerHTML = '<div style="position:relative;background:#102019;color:white;border:4px solid #caff60;box-shadow:10px 10px #486b2b,-6px -6px #243e23;padding:30px;max-width:420px;margin:20px"><button aria-label="Close celebration" style="position:absolute;right:10px;top:6px;border:0;background:none;color:white;font-size:26px;cursor:pointer">×</button><div style="color:#caff60;font-size:72px;text-shadow:4px 4px #ff944d">★</div><div style="color:#caff60;font-size:12px;letter-spacing:3px;font-weight:bold">✦ LAB COMPLETE ✦</div><div style="font-size:42px;font-weight:900;margin:14px 0">FANTASTIC!</div><p style="font-size:15px;line-height:1.6">You submitted the lab and ended the session.<br>Keep that combo going!</p><div style="color:#caff60;letter-spacing:2px;font-weight:bold">+1 QUEST CLEARED</div><button class="replay" style="margin-top:20px;border:1px solid #caff60;background:#caff60;color:#102019;padding:10px 18px;font-weight:bold;cursor:pointer">♪ PLAY FANFARE</button></div>';
    document.body.append(overlay);
    overlay.querySelector('[aria-label]').onclick = () => overlay.remove();
    overlay.querySelector('.replay').onclick = fanfare;
    chrome.storage.local.get(['soundOn'], ({soundOn}) => {
      if (soundOn === false) return;
      fanfare();
      if ('speechSynthesis' in window) { const utterance = new SpeechSynthesisUtterance('Fantastic! Great job! Keep going!'); utterance.rate=1.1; utterance.pitch=1.15; utterance.volume=.65; window.speechSynthesis.speak(utterance); }
    });
  }
  function gradeRecorded() {
    for (const frame of document.querySelectorAll('iframe')) {
      try {
        const doc = frame.contentDocument;
        if (!doc || !/grades_review/.test(frame.src)) continue;
        if (/Total score\s*1\s*\/\s*1/i.test(doc.body?.innerText || '')) return true;
      } catch (_) {}
    }
    return false;
  }
  function check() {
    if (celebrating) return;
    if (gradeRecorded()) scoreSeen = true;
    const text = document.querySelector('#modal-table-report-aws')?.innerText || '';
    const ended = /resources are terminating|DELETE has been initiated|lab status:\s*(?:ended|terminated)/i.test(text) || /00:00:00/.test(document.querySelector('#idenav')?.innerText || '');
    if (ended && scoreSeen) showCelebration();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button, input[type=button], a');
    if (!button) return;
    if (button.id === 'startawslab') { scoreSeen = false; celebrating = false; ending = false; chrome.storage.local.remove([pendingKey, seenKey]); }
    if (button.id === 'endawslab') { ending = true; chrome.storage.local.set({[pendingKey]:true}); }
    if (button.id === 'gradesIdeBtn') ending && setTimeout(check, 1200);
    setTimeout(check, 500);
  }, true);
  function watchFrames() {
    for (const frame of document.querySelectorAll('iframe')) {
      if (observed.has(frame)) continue;
      observed.add(frame); frame.addEventListener('load', () => { setTimeout(check, 300); try { const doc=frame.contentDocument; if(doc && /grades_review/.test(frame.src)) new MutationObserver(check).observe(doc.documentElement,{childList:true,subtree:true,characterData:true}); } catch (_) {} });
    }
  }
  const observer = new MutationObserver(() => { watchFrames(); check(); });
  observer.observe(document.documentElement, {childList:true, subtree:true, characterData:true});
  chrome.storage.local.get([pendingKey, seenKey], data => { ending=!!data[pendingKey]; celebrating=!!data[seenKey]; watchFrames(); check(); });
})();
