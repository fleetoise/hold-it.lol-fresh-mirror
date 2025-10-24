import 'webextension-polyfill';

import * as hilUtils from "./utils.js"
import * as convenience from "./convenience.js"

function init() {
  let root = document.getElementById('root');
  new MutationObserver(function(mutations, observer) {
    for (const mutation of mutations) {
      for (const node of mutation.removedNodes) {
        if (node.textContent?.includes("Join Courtroom")) {
          console.log("joined courtroom");
          main(root);
          observer.disconnect();
          break;
        }
      }
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });

}


function main(root) {
  console.log("holdit.lol --- Ready");
  convenience.record(root);
}

init();
