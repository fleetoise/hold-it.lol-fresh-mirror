import browser from 'webextension-polyfill';
import { dummyObject, featureInitialize } from "../lib/utils/hmisc.js";


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



export async function initFeatureEnhancements(root){
  await featureInitialize(features);
}
