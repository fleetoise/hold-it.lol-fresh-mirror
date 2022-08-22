const hilUtils = {}

hilUtils.clickOff = function() { document.getElementById('app').firstElementChild.click(); }

hilUtils.testRegex = function(str, re) {
    const match = str.match(re);
    return match !== null && match[0] == match.input;
}

hilUtils.kindaRandomChoice = function(array, seed = null) {
    if (seed === null) seed = Math.random();
    const x = Math.sin(seed++) * 10000; 
    const random = x - Math.floor(x);
    const i = Math.floor(random * array.length);
    return array[i];
}

hilUtils.getLabel = function(innerText) {
    return [].find.call(document.querySelectorAll('label'), label => label.innerText === innerText);
}

hilUtils.getTheme = function() {
    const themeInput = hilUtils.getLabel('Dark Mode').parentElement.querySelector('input');
    if (themeInput.ariaChecked == "true") {
        return 'theme--dark';
    } else {
        return 'theme--light';
    }
}

hilUtils.getInputContent = function() {
    return app.querySelector('.menuable__content__active:not([role="menu"])');
}

hilUtils.createButton = function(listener, text, classText, styleText) {
    const button = document.createElement('button');
    button.className = 'v-btn v-btn--has-bg v-size--default hil-row-btn hil-themed ' + theme;
    if (classText) button.className += ' ' + classText;
    if (styleText) button.style.cssText = styleText;
    button.innerText = text;

    if (listener) button.addEventListener('click', listener);

    return button
}

hilUtils.primaryButton = function(listener, classText, styleText, child) {
    const button = document.createElement('button');
    button.className = 'v-btn v-btn--depressed v-size--small primary ' + theme;
    if (classText) button.className += ' ' + classText;
    if (styleText) button.style.cssText += styleText;
    if (child) button.appendChild(child);

    if (listener) button.addEventListener('click', listener);

    return button;
}

hilUtils.iconToggleButton = function(listenerCheck, text, classText, styleText, defaultEnabled = false) {
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

hilUtils.injectScript = function(src, type = null) {
    const script = document.createElement('script');
    script.setAttribute("src", src);
    if (type) script.setAttribute("type", type);
    (document.head || document.documentElement).appendChild(script);
}

hilUtils.compareShallow = function(a, b, keys) {
    for (const key of keys) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

hilUtils.createIcon = function(iconClass, fontPx = 24, styleText = '', classText = '') {
    const icon = document.createElement('i');
    icon.className = classText + ' v-icon notranslate mdi hil-themed ' + hilUtils.getTheme();
    icon.classList.add('mdi-' + iconClass);
    if (fontPx && fontPx !== 24) icon.style.cssText = 'font-size: ' + fontPx + 'px;'
    if (styleText) icon.style.cssText += styleText;
    return icon;
}

hilUtils.createTooltip = function(text, anchorElement) {
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

hilUtils.htmlToElement = function(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

hilUtils.verifyStructure = function(obj, structure) {
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

hilUtils.setSlider = function(sliderContainer, value, min, max) {
    if (value > max) value = max;
    else if (value < min) value = min;
    const percentage = (value-min)/(max-min) * 100;
    sliderContainer.querySelector('.v-slider__track-fill').style.width = percentage + '%';
    sliderContainer.querySelector('.v-slider__thumb-container').style.left = percentage + '%';
    sliderContainer.querySelector('.v-slider__thumb-label span').textContent = value;
}

hilUtils.sliderListener = function(event, sliderContainer, min, max, callback) {
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

hilUtils.transparentSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';

window.postMessage(['utils_loaded']);
