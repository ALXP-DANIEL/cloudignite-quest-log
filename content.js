(() => {
  const id='cloudignite-quest-button';
  if(document.getElementById(id)) return;
  const button=document.createElement('button');
  button.id=id; button.textContent='⚡ QUEST LOG';
  Object.assign(button.style,{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'12px',maxWidth:'calc(100vw - 24px)',whiteSpace:'nowrap',zIndex:'2147483647',background:'#d2ff58',color:'#121a13',border:'0',borderRadius:'12px',padding:'14px 18px',fontWeight:'900',fontSize:'14px',cursor:'pointer',boxShadow:'0 8px 25px #0006'});
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
  if (/\/assignments\/\d+/.test(location.pathname)) {
    const rememberCheck = () => {
      const title=(document.querySelector('h1')?.innerText||'').trim();
      if (/^KC\s*[-–]/i.test(title)) chrome.storage.local.set({activeKnowledgeCheck: {title, at: Date.now()}});
    };
    rememberCheck(); setTimeout(rememberCheck, 1500);
  }
  // A slide counts as opened only after its actual Canvas item page loads.
  const match = location.pathname.match(/\/modules\/items\/(\d+)/);
  if (match && /successfully loaded|external tool/i.test(document.body.innerText)) {
    const key = 'context_module_item_' + match[1];
    chrome.storage.local.get(['course','opened'], data => {
      const item=(data.course||[]).flatMap(m=>m.items).find(i=>i.id===key);
      if (item && !/\blab\b|^KC\s*[-–]|quiz|survey/i.test(item.title)) {
        const opened=data.opened||{}; opened[key]=true; chrome.storage.local.set({opened});
      }
    });
  }
  // Grade snapshots are only interpreted as passed when Canvas explicitly shows full marks.
  if (/\/grades\/?$/.test(location.pathname)) {
    const scanGrades=()=>{
      const rows=[...document.querySelectorAll('#grades_summary tr')];
      if (!rows.length) return;
      chrome.storage.local.get(['course','passed'], data=>{
        const items=(data.course||[]).flatMap(m=>m.items), passed=data.passed||{};
        for(const row of rows){
          const link=row.querySelector('a[href*="/assignments/"]');
          if(!link || !/^KC\s*[-–]/i.test(link.textContent.trim())) continue;
          const matches=items.filter(i=>i.title.trim()===link.textContent.trim());
          const score=row.innerText.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)(?:\s|$)/);
          if(matches.length===1 && score && Number(score[2])>0 && Number(score[1])>=Number(score[2])) passed[matches[0].id]=true;
        }
        chrome.storage.local.set({passed});
      });
    };
    scanGrades(); new MutationObserver(scanGrades).observe(document.body,{childList:true,subtree:true});
  }
  if (!document.querySelector('#context_modules')) return;
  capture(); let timer; new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(capture,800)}).observe(document.querySelector('#context_modules')||document.body,{childList:true,subtree:true});
})();
