import { getLabel } from "./hdom.js";

export function getTheme() {
    const themeInput = (getLabel('Dark Mode') || getLabel('Light Mode')).parentElement.querySelector('input');
    if (themeInput.ariaChecked == "true") {
        return 'theme--dark';
    } else {
        return 'theme--light';
    }
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

export function primaryButton(listener, classText, styleText, child) {
    const button = document.createElement('button');
    button.className = 'v-btn v-btn--depressed v-size--small primary ' + hilUtils.getTheme();
    if (classText) button.className += ' ' + classText;
    if (styleText) button.style.cssText += styleText;
    if (child) button.appendChild(child);

    if (listener) button.addEventListener('click', listener);

    return button;
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
