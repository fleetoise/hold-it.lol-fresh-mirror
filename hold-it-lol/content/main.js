import browser from 'webextension-polyfill';

import * as hilUtils from "../lib/utils.js";
import * as fconvenience from "./convenience.js";
import * as finterface from "./interface.js";
import * as fmessages from "./messages.js";
import * as fmusicPacks from "./music_packs.js";
import * as fenhancements from "./new_features.js";

async function init() {
  let root = document.getElementById('root');
  let options = await getOptions();
  new MutationObserver(function(mutations, observer) {
    for (const mutation of mutations) {
      for (const node of mutation.removedNodes) {
        if (node.textContent?.includes("Join Courtroom")) {
          console.log("joined courtroom");
          main(root, options);
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


function main(root, options) {
  console.log("holdit.lol --- Ready");
  fconvenience.initFeatureConvenience(root, options);
  finterface.initFeatureInterface(root, options);
  fmessages.initFeatureMessages(root, options);
  fmoderation.initFeatureModeration(root, options);
  fmusicPacks.initFeatureMusicPacks(root, options);
  fenhancements.initFeatureEnhancements(root, options);
}
init();
