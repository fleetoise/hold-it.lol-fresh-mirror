const patchCode = `
(function() {
    const OriginalWebSocket = window.WebSocket;

    const PatchedWebSocket = function(url, protocols) {

        const ws = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

        const originalAddEventListener = ws.addEventListener;
        ws.addEventListener = function(type, listener, options) {
            if (type === 'message') {
                const wrappedListener = function(event) {
                    console.log(event.data);
                    window.postMessage({
                        source: 'hil-ws-sniffer',
                        direction: 'in',
                        data: event.data,
                    })
                    listener.apply(this, arguments);
                };
                originalAddEventListener.call(this, type, wrappedListener, options);
            } else {
                originalAddEventListener.apply(this, arguments);
            }
        };

        Object.defineProperty(ws, 'onmessage', {
            set: function(callback) {
                ws.addEventListener('message', callback);
            }
        });

        return ws;
    };

    Object.assign(PatchedWebSocket, OriginalWebSocket);

    window.WebSocket = PatchedWebSocket;

    console.log('Hil: WebSocket API has been patched');
})();
`;

try {
  const script = document.createElement('script');
  script.textContent = patchCode;
  (document.head || document.documentElement).appendChild(script);

  script.remove();
} catch (e) {
  console.error('Hold-it-lol: error injecting WebSocket patch:', e);
}
