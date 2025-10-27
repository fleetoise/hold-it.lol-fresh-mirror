import browser from 'webextension-polyfill';

import * as hdom from "../lib/utils/hdom.js"

export function initFeatureConvenience(root, options) {
  if (options["auto-record"]) record();

}
export function record() {
  let menuObserver = new MutationObserver(function(mutations, observer) {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.textContent?.includes("Record")) {
          hdom.elementFromText("MuiMenuItem-root", "Record")[0].click();
          observer.disconnect();
          break;
        }
      }
    }
  })
  document.querySelector(".MuiIconButton-edgeStart").click();
  menuObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });


}
