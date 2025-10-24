import 'webextension-polyfill';

import * as hilUtils from "./utils.js"

export function record() {
  let menuObserver = new MutationObserver(function(mutations, observer) {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.textContent?.includes("Record")) {
          hilUtils.elementFromText("MuiMenuItem-root", "Record")[0].click();
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
