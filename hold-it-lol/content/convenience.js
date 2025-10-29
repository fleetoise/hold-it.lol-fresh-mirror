import browser from "webextension-polyfill";
import * as hdom from "../lib/utils/hdom.js";
import * as hdata from "../lib/utils/hdata.js";
import { dummyObject } from "../lib/utils/hmisc.js";

const displayPlayingMusic = {
  enable: function () {},

  disable: function () {},
};

const autoCloseMenus = {
  enable: function () {},
  disable: function () {},
};

const activateOnHover = {
  _buttons: null,
  buttonListener: function (event) {
    event.target.click();
    hdom.getInputBox().focus();
  },
  enable: function () {
    this._buttons = document.querySelector("[data-testid=PaletteIcon]").parentElement.parentElement.querySelectorAll("button");
    for (const button of this._buttons) {
      button.addEventListener("mouseenter", this.buttonListener);
    }
  },
  disable: function () {
    for (const button of this._buttons) {
      button.removeEventListener("mouseenter", this.buttonListener);
    }
  },
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

const disableTestimonyShortcut = {
  interceptShortcut: function (event) {
    if (document.activeElement != hdom.getInputBox()) {
      event.stopImmediatePropagation();
    }
  },
  enable: function () {
    document.addEventListener("keydown", this.interceptShortcut, true);
  },
  disable: function () {
    document.removeEventListener("keydown", this.interceptShortcut, true);
  }
}

const features = {
  "auto-record": autoRecord,
  "unblur-low-res": dummyObject,
  "disable-testimony-shortcut": disableTestimonyShortcut,
  "now-playing": dummyObject,
  "menu-auto-close": dummyObject,
  "menu-hover": activateOnHover,
};

function onOptionsUpdate(changes) {
  if (changes.options) {
    const changedOptions = changes.options.newValue;

    for (const option in changedOptions) {
      if (option in features) {
        if (changedOptions[option]) {
          features[option].enable();
        } else {
          features[option].disable();
        }
      }
    }
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
  browser.storage.onChanged.addListener(onOptionsUpdate);
}

export async function initFeatureConvenience(root, staleOptions) {
  await stageOne();
  stageTwo();
}
