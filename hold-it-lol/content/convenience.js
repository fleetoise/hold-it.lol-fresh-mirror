import browser from "webextension-polyfill";
import * as hdom from "../lib/utils/hdom.js";
import * as hdata from "../lib/utils/hdata.js";
import { dummyObject } from "../lib/utils/hmisc.js";

const displayPlayingMusic = {
  enable: function () {},

  disable: function () {},
};

const autoCloseMenus = {
  _buttons: null,
  _popObserver: null,
  buttonListener: function (event) {
    document.body.click();
  },
  enable: function () {
    this._popObserver = new MutationObserver((mutations, observer) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node instanceof Element &&
            node.classList.contains("MuiPopper-root")
          ) {
            this._buttons = hdom.getPopButtons(node);
            for (const button of this._buttons) {
              button.addEventListener("click", this.buttonListener);
            }
          }
        }
      }
    });

    this._popObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
  disable: function () {
    if (this._popObserver) {
      this._popObserver.disconnect();
      for (const button of this._buttons) {
        button.removeEventListener("click", this.buttonListener);
      }
    }
  },
};

const activateOnHover = {
  _buttons: null,
  buttonListener: function (event) {
    event.target.click();
    hdom.getInputBox().focus();
  },
  enable: function () {
    this._buttons = document
      .querySelector("[data-testid=PaletteIcon]")
      .parentElement.parentElement.querySelectorAll("button");
    for (const button of this._buttons) {
      button.addEventListener("mouseenter", this.buttonListener);
    }
  },
  disable: function () {
    if (this._buttons) {
      for (const button of this._buttons) {
        button.removeEventListener("mouseenter", this.buttonListener);
      }
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

const messageBell = {
  _bellText: "",
  _containsBellText: function (node) {
    if (this._bellText && this._bellText.length > 0) {
      return node.textContent?.includes(this._bellText);
    }
    return false;
  },
  _observer: null,
  _storageListener: function (changes, area) {
    if (area == "local" && changes.bellText) {
      this._bellText = changes.bellText.newValue || "";
    }
  },
  enable: function () {
    browser.storage.local.get(["bellText"]).then((result) => {
      if (result.bellText) {
        this._bellText = result.bellText || "";
      }
    });

    browser.storage.onChanged.addListener(this._storageListener.bind(this));

    this._observer = hdom.chatMessageObserver((node) => {
      if (
        node instanceof Element &&
        node.classList.contains("MuiListItem-root") &&
        this._containsBellText(node)
      ) {
        browser.runtime.sendMessage({
          type: "hil-notification",
          title: "Holdit.lol Notification",
          message: "Bell text found in courtroom chat log",
        });
      }
    });
  },

  disable: function () {
    if (this._storageListener) {
      browser.storage.onChanged.removeListener(this._storageListener);
    }
    this._observer.disconnect();
  },
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
  },
};

const features = {
  "auto-record": autoRecord,
  "message-bell": messageBell,
  "unblur-low-res": dummyObject,
  "disable-testimony-shortcut": disableTestimonyShortcut,
  "now-playing": dummyObject,
  "menu-auto-close": autoCloseMenus,
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
