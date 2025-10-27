import browser from 'webextension-polyfill';
import * as hstring from '../lib/utils/hstring.js';
import * as hdom from '../lib/utils/hdom.js';

function onOptionUpdate(changes) {

}

function stageOne() {
  let options = await hdata.getOptions();
  if (options["newlines"]) {};
  if (options["fix-tag-nesting"]) fixTagNestingOn();
  // TODO
  if (options["more-color-tags"]) {};
  if (options["no-talk-toggle"]) {};
  if (options["dont-delay-toggle"]) {};
  if (options["comma-pause"]) {};
  if (options["ctrl-effects"]) {};
  if (options["alt-colors"]) {};
  if (options["dual-button"]) {};
  if (options["smart-tn"]) {};
}

function stageTwo() {
  browser.storage.onChange.addListener(onOptionsUpdate);
}

export function initFeatureMessages(root){
  let chatInputBox = hdom.getInputBox();
  if (options["fix-tag-nesting"]) fixTagNesting();
}

function fixTagNesting(event) {

}

function fixTagNestingOn() {

}

function fixTagNestingOff() {

}
