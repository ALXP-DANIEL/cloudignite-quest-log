(() => {
  const id='cloudignite-quest-button';
  if(document.getElementById(id)) return;
  const button=document.createElement('button');
  button.id=id; button.textContent='⚡ QUEST LOG';
  Object.assign(button.style,{position:'fixed',right:'18px',bottom:'20px',zIndex:'2147483647',background:'#d2ff58',color:'#121a13',border:'0',borderRadius:'12px',padding:'14px 18px',fontWeight:'900',fontSize:'14px',cursor:'pointer',boxShadow:'0 8px 25px #0006'});
  button.onclick=()=>chrome.runtime.sendMessage({action:'openQuest'});
  document.body.append(button);
  function capture(){
    const modules=[...document.querySelectorAll('[id^="context_module_"]')].filter(e=>/^context_module_\d+$/.test(e.id));
    const data=modules.map(m=>{
      const heading=m.querySelector('h2,h3');
      const items=[...m.querySelectorAll('[id^="context_module_item_"]')].map(row=>{
        const a=row.querySelector('a[href*="/modules/items/"],a[href*="/assignments/"],a[href*="/quizzes/"]');
        const title=(a?.innerText||row.querySelector('.item_name')?.innerText||'').trim();
        return {id:row.id,title,url:a?.href||'',done:!!row.querySelector('.completed,[title*="omplet"],[aria-label*="omplet"]')||/Module item submitted and is complete/i.test(row.innerText)};
      }).filter(x=>x.title);
      return {id:m.id,title:heading?.innerText.trim()||'Module',items};
    }).filter(m=>m.items.length);
    if(data.length) chrome.storage.local.get(['course'], old => {
      const existing = new Map((old.course || []).map(m => [m.id, m]));
      data.forEach(m => existing.set(m.id, m));
      const order = modules.map(m => m.id);
      const merged = [...existing.values()].sort((a,b) => order.indexOf(a.id)-order.indexOf(b.id));
      chrome.storage.local.set({course:merged,snapshotAt:new Date().toISOString()});
    });
  }
  if (!/^\/courses\/4611\/modules(?:\/|$)/.test(location.pathname)) return;
  capture(); let timer; new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(capture,800)}).observe(document.querySelector('#context_modules')||document.body,{childList:true,subtree:true});
})();
