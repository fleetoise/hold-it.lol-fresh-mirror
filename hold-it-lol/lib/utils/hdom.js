const _popperText = [
  "Insert Tag",
  "Small",
  "Medium",
  "Large",
  "Fade In",
  "Fade Out",
  "Stop",
  "Stop sounds tag",
];

export function htmlToElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

export function clickOff() {
  document.getElementById("app").firstElementChild.click();
}

export function getInputBox() {
  return document.querySelector(`.MuiInputBase-input:not([readonly])`);
}

export function addMessageListenerAll(window, callback) {
  function listener(event) {
    let eventAction, eventData;
    try {
      [eventAction, eventData] = event.data;
    } catch {
      return;
    }
    if (typeof eventAction === "string") {
      callback(eventAction, eventData);
    }
  }
  window.addEventListener("message", listener);
  return listener;
}

export function getPopButtons(node) {
  let buttons = Array.from(node.querySelectorAll("button.MuiButton-contained"));
  return buttons.filter((button) => _popperText.includes(button.textContent));
}

export function elementFromText(elementClass, str) {
  let returnList = [];
  for (const item of document.querySelectorAll(`.${elementClass}`)) {
    if (item.textContent.trim() == str) {
      returnList.push(item);
    }
  }
  return returnList;
}

export function addMessageListener(window, action, callback, once = false) {
  const listener = addMessageListenerAll(
    window,
    function (eventAction, eventData) {
      if (eventAction !== action) return;
      callback(eventData);
      if (once) window.removeEventListener("message", listener);
    },
  );
}

export function getLabel(innerText) {
  return [].find.call(
    document.querySelectorAll("label"),
    (label) => label.innerText === innerText,
  );
}

export function insertValue(elem, text, index) {
  if (document.activeElement == elem) {
    elem.selectionEnd = index;
    elem.selectionStart = index;
    document.execCommand("insertText", false, text);
  } else {
    const value = elem.value;
    setValue(elem, value.slice(0, index) + text + value.slice(index));
  }
}

export function setValue(elem, text) {
  if (document.activeElement == elem) {
    elem.selectionEnd = 9999999;
    elem.selectionStart = 0;
    document.execCommand("insertText", false, text);
  } else {
    elem.value = text;
    elem.dispatchEvent(new Event("input"));
  }
}

export function getHTMLOfSelection() {
  // https://stackoverflow.com/questions/5083682/get-selected-html-in-browser-via-javascript
  let container = document.createElement("div");
  let range;
  if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    html = range.htmlText;
    container.innerHTML = html;
  } else if (window.getSelection) {
    let selection = window.getSelection();
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      let clonedSelection = range.cloneContents();
      container.appendChild(clonedSelection);
    }
  }

  return container;
}

export function injectScript(src, type = null) {
  const script = document.createElement("script");
  script.setAttribute("src", src);
  if (type) script.setAttribute("type", type);
  (document.head || document.documentElement).appendChild(script);
}
