import browser from "webextension-polyfill";
import * as hdom from "../lib/utils/hdom.js";
import * as hdata from "../lib/utils/hdata.js";
import { dummyObject } from "../lib/utils/hmisc.js";

const activateOnHover = {
  enable: function () {},

  disable: function () {},
};

const autoCloseMenus = {
  enable: function () {},
  disable: function () {},
};

const displayPlayingMusic = {
  enable: function () {},
  disable: function () {},
};

const autoRecord = {
  enable: function () {
    let menuObserver = new MutationObserver(function (mutations, observer) {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.textContent?.includes("Record")) {
            hdom.elementFromText("MuiMenuItem-root", "Record")[0].click();
            observer.disconnect();
            break;
          }
        }
      }
    });
    document.querySelector(".MuiIconButton-edgeStart").click();
    menuObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
  disable: () => {},
};

const features = {
  "auto-record": autoRecord,
  "unblur-low-res": dummyObject,
  "disable-testimony-shortcut": dummyObject,
  "now-playing": dummyObject,
  "menu-auto-close": dummyObject,
  "menu-hover": dummyObject,
};

// TODO
function onOptionUpdate(changes) {
  {
  }
}

async function stageOne() {
  let options = await hdata.getOptions();
  for (const option in options) {
    if (option in features) {
      if (options[option]) features[option].enable();
    }
  }
}

function stageTwo() {
  browser.storage.onChanged.addListener(onOptionUpdate);
}

export async function initFeatureConvenience(root, staleOptions) {
  await stageOne();
  stageTwo();
}
