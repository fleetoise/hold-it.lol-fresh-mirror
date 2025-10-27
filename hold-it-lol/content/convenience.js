import browser from 'webextension-polyfill';
import * as hdom from "../lib/utils/hdom.js";
import * as hdata from "../lib/utils/hdata.js";

// TODO
function onOptionUpdate(changes) {
  {}
}

async function stageOne() {
  let options = await hdata.getOptions();
  if (options["auto-record"]) record();
  // TODO
  if (options["save-last-character"]) {};
  if (options["unblur-low-res"]) {};
  if (options["disable-testimony-shortcut"]) {};
  if (options["now-playing"]) {};
  if (options["menu-auto-close"]) {};
  if (options["menu-hover"]) {};
  if (options["sound-insert"]) {};
}

function stageTwo() {
  browser.storage.onChanged.addListener(onOptionUpdate);
}

export async function initFeatureConvenience(root, staleOptions) {
  await stageOne();
  stageTwo();
}

function record() {
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
