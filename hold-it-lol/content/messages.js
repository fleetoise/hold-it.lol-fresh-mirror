import browser from "webextension-polyfill";
import * as hstring from "../lib/utils/hstring.js";
import * as hdom from "../lib/utils/hdom.js";
import * as hdata from "../lib/utils/hdata.js";

let chatInputBox;

function onOptionsUpdate(changes) {
  const changedOptions = Object.keys(changes);

  for (const option of changedOptions) {
    switch (option) {
      case "newlines":
        break;
      case "fix-tag-nesting":
        if (changes[option].newValue) {
          fixTagNestingOn();
        } else {
          fixTagNestingOff();
        }
      default:
        break;
    }
  }
}

async function stageOne() {
  let options = await hdata.getOptions();
  if (options["newlines"]) {
  }
  if (options["fix-tag-nesting"]) fixTagNestingOn();
  // TODO
  if (options["more-color-tags"]);
  if (options["no-talk-toggle"]);
  if (options["dont-delay-toggle"]);
  if (options["comma-pause"]);
  if (options["ctrl-effects"]);
  if (options["alt-colors"]);
  if (options["dual-button"]);
  if (options["smart-tn"]);
}

function stageTwo() {
  browser.storage.onChanged.addListener(onOptionsUpdate);
}

export async function initFeatureMessages(root) {
  chatInputBox = hdom.getInputBox();
  await stageOne();
  stageTwo();
}

function fixTagNesting(event) {
  chatInputBox.value = hstring.tagStringFixer(chatInputBox.value);
}

function fixTagNestingOn() {
  chatInputBox.addEventListener("input", fixTagNesting);
}

function fixTagNestingOff() {
  chatInputBox.removeEventListener("input", fixTagNesting);
}
