import browser from "webextension-polyfill";
import * as hstring from "../lib/utils/hstring.js";
import * as hdom from "../lib/utils/hdom.js";
import * as hdata from "../lib/utils/hdata.js";
import * as hmisc from "../lib/utils/hmisc.js";
import * as hui from "../lib/utils/hui.js";


const colorHotkeys = {
  chatInputBox: null,
  applyColorTag: function (color) {
    const chatInputBox = self.chatInputBox;
    const start = chatInputBox.selectionStart;
    const end = chatInputBox.selectionEnd;
    const _value = chatInputBox.value;

    const event = new Event('input', { bubbles: true });

    const openTag = `[#/${color}]`;
    const closeTag = `[/#]`;

    if (start == end) {
      chatInputBox.value =
        _value.substring(0, start) + openTag + closeTag + _value.substring(end);

      chatInputBox.dispatchEvent(event); // could I technically just add this after the if block instead of repeating twice?
      // maybe.  But currently I'm lazy and would rather not think, instead inserting this unnecessarily long comment
    } else {
      chatInputBox.value =
        _value.substring(0, start) +
        openTag +
        _value.substring(start, end) +
        closeTag +
        _value.substring(end);

        chatInputBox.dispatchEvent(event);
    }
  },

  handleHotKey: function (event) {
    if (!event.altKey) return;

    const colorMap = {
      "1": "r",
      "2": "g",
      "3": "b",
    };

    const color = colorMap[event.key];

    if (color) {
      event.preventDefault();
      event.stopPropagation();

      this.applyColorTag(color);
    }
  },

  enable: function () {
    self.chatInputBox = hdom.getInputBox();
    this._handleHotKey = this.handleHotKey.bind(this);
    self.chatInputBox.addEventListener("keydown", this._handleHotKey, true);
  },
  disable: function () {
    if (this._handleHotKey) {
      self.chatInputBox.removeEventListener("keydown", this._handleHotKey, true);
    }
  },
};

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
  "alt-colors": colorHotkeys,
  "dual-button": hmisc.dummyObject,
  "smart-tn": hmisc.dummyObject,
};


export async function initFeatureMessages(root) {
  await hmisc.featureInitialize(features);
}
