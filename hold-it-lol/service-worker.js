"use strict";

import browser from "webextension-polyfill";

function injectScripts(tabId) {
  console.log(`Injecting hil into ${tabId}`);

  browser.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["content/style.css"],
  });

  browser.scripting.executeScript({
    target: { tabId: tabId },
    files: ["content/main.js"],
  });
}

browser.webNavigation.onHistoryStateUpdated.addListener(
  (event) => {
    browser.tabs
      .sendMessage(event.tabId, { type: "PING" })
      .then((response) => {
        if (response && response.type === "PONG") {
          return;
        }

        injectScripts(event.tabId);
      })
      .catch((e) => {
        console.log(e);
        injectScripts(event.tabId);
      });
  },
  { url: [{ urlMatches: ".*objection\\.lol\\/courtroom\\/..*" }] },
);

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.type === "hil-notification") {
    const iconUrl = browser.runtime.getURL("assets/icon48.png");

    browser.notifications.create({
      type: "basic",
      iconUrl: iconUrl,
      title: request.title,
      message: request.message,
    });
  }
});

browser.contextMenus.onClicked.addListener(function (info, tab) {
  browser.tabs.sendMessage(tab.id, ["save-asset", info]);
});
