import browser from 'webextension-polyfill';

import * as hdata from "../lib/utils/hdata.js";
import * as hdom from "../lib/utils/hdom.js";
import * as hstring from "../lib/utils/hstring.js";
import * as fconvenience from "./convenience.js";
import * as finterface from "./interface.js";
import * as fmessages from "./messages.js";
import * as fmusicPacks from "./music_packs.js";
import * as fenhancements from "./enhancements.js";
import * as fmoderation from "./moderation.js";


async function init() {
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

  fconvenience.initFeatureConvenience(root);
  finterface.initFeatureInterface(root);
  fmessages.initFeatureMessages(root);
  fmoderation.initFeatureModeration(root);
  fmusicPacks.initFeatureMusicPacks(root);
  fenhancements.initFeatureEnhancements(root);
}

browser.runtime.onMessage.addListener((request) => {
  if (request.type === "PING") {
    return Promise.resolve({ type: "PONG" });
  }
});

init();
