import browser from "webextension-polyfill";
import Autolinker from "autolinker";
import * as hstring from "../lib/utils/hstring.js";
import * as hdom from "../lib/utils/hdom.js";
import * as hdata from "../lib/utils/hdata.js";
import * as hmisc from "../lib/utils/hmisc.js";


const clickableChatLinks = {
  _observer: null,
  _autolinker: new Autolinker(),
  enable: function () {
    this._observer = hdom.chatMessageObserver((node) => {
      if (
        node instanceof Element &&
        node.classList.contains("MuiListItem-root")
      ) {
        node.querySelectorAll("p")[1].innerHTML = this._autolinker.link(node.querySelectorAll("p")[1].innerHTML);
      }
    });
  },
  disable: function () {
    if (this._observer) {
      this._observer.disconnect();
    }
  },
};

const features = {
  "old-toggles": hmisc.dummyObject,
  "old-bubbles": hmisc.dummyObject,
  "convert-chat-urls": clickableChatLinks,
  "volume-sliders": hmisc.dummyObject,
  "full-screen-evidence": hmisc.dummyObject,
  "spectator-preload": hmisc.dummyObject,
  "reload-ccs": hmisc.dummyObject,
  "drag-pair-offset": hmisc.dummyObject,
  "chat-timestamps": hmisc.dummyObject,
  "chat-backlog-indicator": hmisc.dummyObject,
};

export async function initFeatureInterface(root) {
  await hmisc.featureInitialize(features);
}
