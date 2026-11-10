chrome.runtime.onMessage.addListener((message)=>{if(message.action==='openQuest') chrome.tabs.create({url:chrome.runtime.getURL('quest.html')});});
