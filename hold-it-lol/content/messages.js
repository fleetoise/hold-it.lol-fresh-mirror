import browser from "webextension-polyfill";
import * as hstring from "../lib/utils/hstring.js";
import * as hdom from "../lib/utils/hdom.js";
import * as hdata from "../lib/utils/hdata.js";
import * as hmisc from "../lib/utils/hmisc.js";

let chatInputBox;

const fixTagNesting = {
  insertFixedTags: function (event) {
    chatInputBox.value = hstring.tagStringFixer(chatInputBox.value);
  },

  enable: function () {
    chatInputBox.addEventListener("input", this.insertFixedTags);
  },

  disable: function () {
    chatInputBox.removeEventListener("input", this.insertFixedTags);
  },
};

const features = {
  newlines: hmisc.dummyObject,
  "fix-tag-nesting": fixTagNesting,
  "more-color-tags": hmisc.dummyObject,
  "no-talk-toggle": hmisc.dummyObject,
  "dont-delay-toggle": hmisc.dummyObject,
  "comma-pause": hmisc.dummyObject,
  "ctrl-effects": hmisc.dummyObject,
  "alt-colors": hmisc.dummyObject,
  "dual-button": hmisc.dummyObject,
  "smart-tn": hmisc.dummyObject,
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
    if (option in Object.keys(features)) {
      if (options[option]) features[option].enable();
    }
  }
}

function stageTwo() {
  browser.storage.onChanged.addListener(onOptionsUpdate);
}

export async function initFeatureMessages(root) {
  chatInputBox = hdom.getInputBox();
  await stageOne();
  stageTwo();
}
