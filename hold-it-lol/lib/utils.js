import browser from 'webextension-polyfill';


export const transparentGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export async function getOptions() {
  return (await browser.storage.local.get('options')).options || {};
}

export function addMessageListenerAll(window, callback) {
    function listener(event) {
        let eventAction, eventData;
        try {
            [ eventAction, eventData ] = event.data;
        } catch {
            return;
        }
        if (typeof eventAction === 'string') {
            callback(eventAction, eventData);
        }
    }
    window.addEventListener('message', listener);
    return listener;
}

export function elementFromText(elementClass, str) {
  let returnList = []
  for (const item of document.querySelectorAll(`.${elementClass}`)) {
    if (item.textContent.trim() == str) {
      returnList.push(item);
    }
  }
  return returnList;
}

export function addMessageListener(window, action, callback, once=false) {
    const listener = hilUtils.addMessageListenerAll(window, function(eventAction, eventData) {
        if (eventAction !== action) return;
        callback(eventData);
        if (once) window.removeEventListener('message', listener);
    });
}

export function clickOff() { document.getElementById('app').firstElementChild.click(); }

export function testRegex(str, re) {
    const match = str.match(re);
    return match !== null && match[0] == match.input;
}

export function kindaRandomChoice(array, seed = null) {
    if (seed === null) seed = Math.random();
    const x = Math.sin(seed++) * 10000;
    const random = x - Math.floor(x);
    const i = Math.floor(random * array.length);
    return array[i];
}

export function getLabel(innerText) {
    return [].find.call(document.querySelectorAll('label'), label => label.innerText === innerText);
}

export function getTheme() {
    const themeInput = (hilUtils.getLabel('Dark Mode') || hilUtils.getLabel('Light Mode')).parentElement.querySelector('input');
    if (themeInput.ariaChecked == "true") {
        return 'theme--dark';
    } else {
        return 'theme--light';
    }
}

export function getInputContent() {
    return app.querySelector('.menuable__content__active:not([role="menu"])');
}

export function createButton(listener, text, classText, styleText) {
    const button = document.createElement('button');
    button.className = 'v-btn v-btn--has-bg v-size--default hil-row-btn hil-themed ' + hilUtils.getTheme();
    if (classText) button.className += ' ' + classText;
    if (styleText) button.style.cssText = styleText;
    button.innerText = text;

    if (listener) button.addEventListener('click', listener);

    return button
}

export function primaryButton(listener, classText, styleText, child) {
    const button = document.createElement('button');
    button.className = 'v-btn v-btn--depressed v-size--small primary ' + hilUtils.getTheme();
    if (classText) button.className += ' ' + classText;
    if (styleText) button.style.cssText += styleText;
    if (child) button.appendChild(child);

    if (listener) button.addEventListener('click', listener);

    return button;
}

export function iconToggleButton(listenerCheck, text, classText, styleText, defaultEnabled = false) {
    function toggle(enabled){
        if (enabled) {
            button.classList.add('success');
            button.firstElementChild.classList.remove('mdi-close');
            button.firstElementChild.classList.add('mdi-check');
        } else {
            button.classList.remove('success');
            button.firstElementChild.classList.add('mdi-close');
            button.firstElementChild.classList.remove('mdi-check');
        }
    }
    const button = createButton(function() {
        const enabled = listenerCheck();
        toggle(enabled);
    }, text, classText, styleText);
    button.prepend(createIcon('close', 18, 'margin-right: 8px;'));
    if (defaultEnabled) toggle(true);
    return button;
}

export function injectScript(src, type = null) {
    const script = document.createElement('script');
    script.setAttribute("src", src);
    if (type) script.setAttribute("type", type);
    (document.head || document.documentElement).appendChild(script);
}

export function compareShallow(a, b, keys) {
    for (const key of keys) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

export function createIcon(iconClass, fontPx = 24, styleText = '', classText = '') {
    const icon = document.createElement('i');
    icon.className = classText + ' v-icon notranslate mdi hil-themed ' + hilUtils.getTheme();
    icon.classList.add('mdi-' + iconClass);
    if (fontPx && fontPx !== 24) icon.style.cssText = 'font-size: ' + fontPx + 'px;'
    if (styleText) icon.style.cssText += styleText;
    return icon;
}

export function createTooltip(text, anchorElement) {
    const tooltip = document.createElement('div');
    tooltip.className = 'v-tooltip__content hil-small-tooltip hil-hide';
    tooltip.textContent = text;
    tooltip.realign = function (newText = null) {
        if (anchorElement === undefined) throw Error('Tooltip has no anchor anchorElement');
        if (newText !== null) tooltip.textContent = newText;
        const rect = anchorElement.getClientRects()[0];
        tooltip.style.left = (rect.x + rect.width / 2 - tooltip.clientWidth / 2) + 'px';
        tooltip.style.top = (rect.y + rect.height + 10) + 'px';
    }
    app.appendChild(tooltip);
    return tooltip;
}

export function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

export function verifyStructure(obj, structure) {
    if (!obj) obj = {};
    for (let key in structure) {
        let type = obj[key]?.constructor;
        const structureType = structure[key]?.constructor;

        if (!(key in obj) || (type !== structureType)) {
            obj[key] = structure[key];
        }

        type = obj[key]?.constructor;

        if (type === Object) {
            verifyStructure(obj[key], structure[key]);
        }
    }
    return obj;
}

export function setSlider(sliderContainer, value, min, max) {
    if (value > max) value = max;
    else if (value < min) value = min;
    const percentage = (value-min)/(max-min) * 100;
    sliderContainer.querySelector('.v-slider__track-fill').style.width = percentage + '%';
    sliderContainer.querySelector('.v-slider__thumb-container').style.left = percentage + '%';
    sliderContainer.querySelector('.v-slider__thumb-label span').textContent = value;
}

export function sliderListener(event, sliderContainer, min, max, callback) {
    sliderContainer.querySelector('.v-slider__thumb-container').classList.add('v-slider__thumb-container--active');
    const adjust = function(e) {
        const sliderRect = sliderContainer.querySelector('.v-slider').getClientRects()[0];
        const sliderPosition = (e.clientX - sliderRect.x) / sliderRect.width;
        let value = Math.round(sliderPosition * (max - min) + min);
        if (value > max) value = max;
        else if (value < min) value = min;
        hilUtils.setSlider(sliderContainer, value, min, max);
        if (callback) callback(value);
    }
    adjust(event);
    document.addEventListener('mousemove', adjust);
    document.addEventListener('mouseup', function () {
        sliderContainer.querySelector('.v-slider__thumb-container').classList.remove('v-slider__thumb-container--active');
        document.removeEventListener('mousemove', adjust);
    }, { once: true });
}

export function wait(duration = 0) {
    return new Promise(function(resolve) {
        setTimeout(resolve, duration);
    });
}


export function fixTagNesting(text) {
    REGEX_TAG = /\[#[^/[\]]*?\]$/
    REGEX_COLOR_TAG = /\[#\/[0-9a-zA-Z]*?\]$/
    REGEX_UNCOLOR_TAG = /\[\/#\]$/

    newText = "";
    inColorTag = false;
    currentColorTag = "";
    nestedColorTags = [];

    for (let char of text) {
        newText += char;
        if (newText.match(REGEX_COLOR_TAG)) {
            if (!inColorTag) {
                inColorTag = true;
            } else {
                nestedColorTags.push(currentColorTag);
                newText = newText.replace(REGEX_COLOR_TAG, "[/#]$&");
            }
            currentColorTag = newText.match(REGEX_COLOR_TAG)[0];
        } else if (inColorTag && newText.match(REGEX_TAG)) {
            newText = newText.replace(REGEX_TAG, "[/#]" + "$&" + currentColorTag);
        } else if (newText.match(REGEX_UNCOLOR_TAG)) {
            if (nestedColorTags.length > 0) {
                currentColorTag = nestedColorTags.pop();
                newText = newText.replace(REGEX_UNCOLOR_TAG, "$&" + currentColorTag);
            } else {
                inColorTag = false;
            }
        }
    }
    return newText
}

export function getHTMLOfSelection() { // https://stackoverflow.com/questions/5083682/get-selected-html-in-browser-via-javascript
    let container = document.createElement('div');
    let range;
    if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        html = range.htmlText;
        container.innerHTML = html;
    }
    else if (window.getSelection) {
        let selection = window.getSelection();
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            let clonedSelection = range.cloneContents();
            container.appendChild(clonedSelection);
        }
    }

    return container;
}

export function createSwitch(onchange, def=false) {
    const label = document.createElement('div');
    label.className = 'hil-toggle';
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.style.setProperty('display', 'none');

    label.set = function(val) {
        if (label.classList.contains('force-disabled')) return;
        if (input.checked == Boolean(val)) return;
        input.checked = val;
        onchange(input.checked);
    }
    if (def) label.set(true);

    label.addEventListener('mousedown', function (e) {
        label.set(!input.checked);
        e.preventDefault();
    });

    const span = document.createElement('span');
    span.className = 'switch';
    const handle = document.createElement('span');
    handle.className = 'handle';

    label.appendChild(input);
    label.appendChild(span);
    label.appendChild(handle);
    return label;
}

export function setValue(elem, text) {
    if (document.activeElement == elem) {
        elem.selectionEnd = 9999999;
        elem.selectionStart = 0;
        document.execCommand("insertText", false, text);
    } else {
        elem.value = text;
        elem.dispatchEvent(new Event('input'));
    }
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

window.postMessage(['loaded_utils']);
