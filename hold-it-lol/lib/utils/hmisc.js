import browser from "webextension-polyfill";

import * as hdata from "./hdata.js";


// Converting this into a class might be a better design but
// this also does the job and doesn't have any major readability
// or efficiency problems
export async function featureInitialize(features) {
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
  await stageOne();
  stageTwo();
}

export const dummyObject = {
  enable: () => {},
  disable: () => {},
};



export function wait(duration = 0) {
  return new Promise(function (resolve) {
    setTimeout(resolve, duration);
  });
}
