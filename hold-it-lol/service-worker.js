'use strict';

import browser from 'webextension-polyfill';

function injectScripts(tabId) {
  console.log(`Injecting hil into ${tabId}`);

  browser.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["content/style.css"]
  });

  browser.scripting.executeScript({
    target: { tabId: tabId },
    files: ["content/main.js"]
  });
}

browser.webNavigation.onHistoryStateUpdated.addListener(event => {
  browser.tabs.sendMessage( event.tabId, {type: "PING"} )
         .then(response => {
           if (response && response.type === "PONG") {
             return;
           }

           injectScripts(event.tabId);
         }).catch((e) => {
           console.log(e);
           injectScripts(event.tabId);
         });
}, {url: [{urlMatches: ".*objection\\.lol\\/courtroom\\/..*"}]});


browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let [ action, data ] = request;
    if (action === 'create-asset-context-menu') {
        function callback() {
            browser.runtime.lastError;
        }
        browser.contextMenus.create({
            id: 'hil-save-sound',
            title: 'Add as Sound',
            contexts: [browser.contextMenus.ContextType.LINK],
            documentUrlPatterns: ['*://objection.lol/courtroom/*'],
        }, callback);
        browser.contextMenus.create({
            id: 'hil-save-music',
            title: 'Add as Music',
            contexts: [browser.contextMenus.ContextType.LINK],
            documentUrlPatterns: ['*://objection.lol/courtroom/*'],
        }, callback);
    } else if (action === 'tts-get-voices') {
        browser.tts.getVoices(function(voices) {
            sendResponse(voices.map(voice => {
                return {voiceName: voice.voiceName, lang: voice.lang}
            }));
        });
        return true;
    } else if (action === 'tts-speak') {
        const { text, voiceName, pitch } = data;
        browser.tts.speak(text, {voiceName, pitch});
    } else if (action === 'fetch-image') {
        if (data[0] === '/') data = 'https://objection.lol' + data;
        try {
            fetch(data)
            .then(response => response.arrayBuffer())
            .then(function(arrayBuffer) {
                let array = Array.from(new Uint8Array(arrayBuffer));
                sendResponse(array);
            })
            .catch(function() {
                sendResponse('error-fetch');
            });
        } catch {
            sendResponse(null);
        }
        return true;
    }
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
    browser.tabs.sendMessage(tab.id, ["save-asset", info]);
});
