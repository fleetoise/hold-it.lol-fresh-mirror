import browser from 'webextension-polyfill';
import { dummyObject } from "../lib/utils/hmisc.js";


const testimonyMode = {
  enable: function () {},
  disable: function () {}
}

const features = {
  "export-cc-images": dummyObject,
  "testimony-mode": dummyObject,
  "bulk-evidence": dummyObject,
  "extended-log": dummyObject,
  "quick-sfx": dummyObject,
  "tts": dummyObject,
  "pose-icon-maker": dummyObject,
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

export async function initFeatureEnhancements(root){
  await stageOne();
  stageTwo();
}
