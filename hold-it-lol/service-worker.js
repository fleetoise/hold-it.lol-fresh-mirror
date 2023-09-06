'use strict';


chrome.webNavigation.onHistoryStateUpdated.addListener(e => {
    chrome.tabs.sendMessage( e.tabId, ["courtroom_state_loaded"] );
}, {url: [{urlMatches: ".*objection\\.lol\\/courtroom\\/..*"}]});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let [ action, data ] = request;
    if (action === 'create-asset-context-menu') {
        function callback() {
            chrome.runtime.lastError;
        }
        chrome.contextMenus.create({
            id: 'hil-save-sound',
            title: 'Add as Sound',
            contexts: [chrome.contextMenus.ContextType.LINK],
            documentUrlPatterns: ['*://objection.lol/courtroom/*'],
        }, callback);
        chrome.contextMenus.create({
            id: 'hil-save-music',
            title: 'Add as Music',
            contexts: [chrome.contextMenus.ContextType.LINK],
            documentUrlPatterns: ['*://objection.lol/courtroom/*'],
        }, callback);
    } else if (action === 'tts-get-voices') {
        chrome.tts.getVoices(function(voices) {
            sendResponse(voices.map(voice => {
                return {voiceName: voice.voiceName, lang: voice.lang}
            }));
        });
        return true;
    } else if (action === 'tts-speak') {
        const { text, voiceName, pitch } = data;
        chrome.tts.speak(text, {voiceName, pitch});
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

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    chrome.tabs.sendMessage(tab.id, ["save-asset", info]);
});
