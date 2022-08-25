'use strict';

// Beware: spaghetti code, all mushed into a single file oh noes

const { injectScript, getLabel, getTheme, getInputContent, createButton, primaryButton, iconToggleButton, clickOff, testRegex, kindaRandomChoice, htmlToElement, createIcon, createTooltip, verifyStructure, setSlider, sliderListener } = hilUtils;

const DEFAULT_TRANSITION = 'transition: .28s cubic-bezier(.4,0,.2,1);';

const MENUS_NOT_AUTO_CLOSE = ['Text Color'];
const SELECTORS_MENU_HOVER = ['.menuable__content__active', 'div.v-sheet.secondary', 'button.v-app-bar__nav-icon', '.mb-2.col-sm-4.col-md-6.col-lg-3.col-6'];
const PAUSE_PUNCTUATION = '.,!?:;';
const URL_REGEX = /((?:http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+(?:[\-\.]{1}[a-z0-9]+)*\.[a-z]{1,5}(?::[0-9]{1,5})?(?:\/.*?)?\w)(\W*?(?:\s|$))/gi;


const TAG_PAUSE_100 = '[#p100]';
const TAG_MUSIC_FADE_OUT = '[#bgmfo]';
const TAG_MUSIC_STOP = '[#bgms]';
const STOP_MUSIC_TEXT = '[Stop Music]';
const TEXT_EFFECT_DUAL_TITLE = 'Both Effects';
const TEXT_EFFECT_DUAL_DESCRIPTION = 'Perform flash and shake at a certain point';
const TEXT_EFFECT_FLASH_TITLE = 'Flash';
const TEXT_EFFECT_FLASH_DESCRIPTION = 'Perform flash at a certain point';
const UNDEFINED_POSE_NAME = 'Pose stored';
const EVIDENCE_MAX_LENGTH_NAME = 20;
const EVIDENCE_MAX_LENGTH_DESC = 300;
const EVIDENCE_DESC_SEPARATOR = ' | ';
const EVIDENCE_DESC_TOO_LONG = '… (View doc to read more)';

const sel = document.getSelection();
// let currentSelectionState = {};
let states = {};
let modifierKeys = {};
let theme;
let textArea;

let options;
let optionsLoaded = new Promise(function(resolve, reject) {
    chrome.storage.local.get('options', function(result) {
        options = result.options || {};
        resolve(options);
    });
});
let wrapperLoaded;


function setValue(elem, text) {
    elem.value = text;
    elem.dispatchEvent(new Event('input'));
}
function insertValue(elem, text, index) {
    const value = elem.value;
    setValue(elem, value.slice(0, index) + text + value.slice(index));
}
function insertReplaceValue(elem, text, index, index2 = null) {
    index2 = index2 ? index2 : index;
    setValue(elem, textArea.value.slice(0, index) + text + textArea.value.slice(index2));
    textArea.selectionStart = index + text.length;
    textArea.selectionEnd = textArea.selectionStart;
}
function insertTag(tag) {
    const end = textArea.selectionEnd;
    const text = textArea.value;
    insertValue(textArea, tag, end);

    textArea.selectionStart = textArea.selectionEnd = end + tag.length;
    textArea.focus();
}

// function updateSelectionState() {
//     currentSelectionState.baseNodeDiv = sel.baseNode && (sel.baseNode.nodeType == 1 ? sel.baseNode : sel.baseNode.parentElement);
//     currentSelectionState.baseOffset = sel.baseOffset;
//     currentSelectionState.extentNodeDiv = sel.extentNode && (sel.extentNode.nodeType == 1 ? sel.extentNode : sel.extentNode.parentElement);
//     currentSelectionState.extentOffset = sel.extentOffset;
// }

function optionSet(key, value) {
    options[key] = value;
    chrome.storage.local.get({ 'options': {} }, function (result) {
        const options = result.options;
        options[key] = value;
        chrome.storage.local.set({ 'options': options });
    });
}



function onLoad(options) {


    console.log('holdit.lol v0.7.1 beta - running onLoad()');
    
    if (options['smart-tn']) injectScript(chrome.runtime.getURL('inject/closest-match/closest-match.js'));
    if (options['testimony-mode'] || options['no-talk-toggle'] || options['smart-pre'] || options['smart-tn'] || options['now-playing'] || options['list-moderation'] || options['mute-character'] || options['fullscreen-evidence'] || options['volume-sliders'] || options['pose-icon-maker'] || options['disable-testimony-shortcut'] || options['unblur-low-res']) {
        injectScript(chrome.runtime.getURL('content/utils.js'));
        window.addEventListener('message', function listener(event) {
            const [action] = event.data;
            if (action !== 'loaded_utils') return;
            injectScript(chrome.runtime.getURL('inject/vue-wrapper.js'));
            window.removeEventListener('message', listener);
        });
    }

    const showTutorial = !options['seen-tutorial'] || !(Object.values(options).filter(x => x).length > 1);

    const app = document.getElementById('app');
    textArea = document.querySelector('.frameTextarea');
    const textValue = text => setValue(textArea, text);
    const textButton = textArea.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('.v-btn--has-bg.primary');
    const chatBox = document.querySelector('.chat');
    const chat = chatBox.firstElementChild;

    const mainWrap = document.querySelector('.v-main__wrap');
    const row1 = mainWrap.firstElementChild.firstElementChild.firstElementChild;
    const row2 = mainWrap.firstElementChild.firstElementChild.lastElementChild;

    let musicPlaying = false;


    const themeInput = getLabel('Dark Mode').parentElement.querySelector('input');
    if (themeInput.ariaChecked == "true") {
        theme = 'theme--dark';
    } else {
        theme = 'theme--light';
    }

    function themeUpdate() {
        if (themeInput.ariaChecked == "true") {
            theme = 'theme--dark';
        } else {
            theme = 'theme--light';
        }

        const elems = document.querySelectorAll('.hil-themed');
        for (let elem of elems) {
            elem.classList.remove('theme--dark');
            elem.classList.remove('theme--light');
            elem.classList.add(theme);
        }
        for (let elem of document.querySelectorAll('.hil-themed-text')) {
            if (theme == 'theme--dark') {
                elem.style.color = '#fff';
            } else {
                elem.style.color = '#000';
            }
        }
    }
    themeInput.parentElement.parentElement.addEventListener('click', themeUpdate);

    document.body.classList.add('hil-themed');
    document.body.classList.add(theme);


    const textBacklog = [];
    function sendText(text, persistent = false) {
        const oldValue = textArea.value;
        if (!textButton.classList.contains('v-btn--disabled')) {
            setValue(textArea, text);
            textButton.click();
            setValue(textArea, oldValue);
        } else if (persistent) {
            textBacklog.push(text);
        }
    }
    let textButtonObserver = new MutationObserver(function (mutations) {
        for (let mutation of mutations) {
            if (!textButton.classList.contains('v-btn--disabled') && textBacklog.length > 0) {
                const text = textBacklog.shift();
                sendText(text);
            }

        }
    });
    textButtonObserver.observe(textButton, { attributes: true, attributeFilter: ['class'] });


    let helperToggle;
    let helperDiv;
    let helperVisible = false;
    let toggleHelperDiv;
    if (showTutorial || options['testimony-mode'] || options['now-playing'] || options['smart-tn'] || options['tts']) {
        helperToggle = createIcon('dots-horizontal', 28, 'opacity: 70%; margin-top: 15px; right: calc(-100% + 46px); cursor: pointer;');
        row2.appendChild(helperToggle);

        helperDiv = document.createElement('div');
        helperDiv.className = 'hil-hide';
        helperDiv.style.cssText = 'transform: translateY(-10px); padding: 0 8px 0px;' + DEFAULT_TRANSITION;
        row2.appendChild(helperDiv);

        helperToggle.addEventListener('click', function () {
            toggleHelperDiv(!helperVisible)
        });

        toggleHelperDiv = function (visible) {
            helperVisible = visible;
            if (helperVisible) {
                helperDiv.classList.remove('hil-hide');
                helperDiv.style.removeProperty('transform');
            } else {
                helperDiv.classList.add('hil-hide');
                helperDiv.style.transform = 'translateY(-10px)';
            }
        }
    }


    if (showTutorial) {
        if (!options['seen-tutorial']) {
            toggleHelperDiv(true);
        }

        const div = document.createElement('div');
        div.style.cssText = 'width: 60%; text-align: center; margin: 0 auto; font-weight: 300;';

        const img = document.createElement('img');
        img.src = 'https://cdn.discordapp.com/attachments/873624494810484817/916742603339341824/holdit.png';
        img.style.width = '100%';
        div.appendChild(img);

        if (!options['seen-tutorial']) div.innerHTML += '<span style="font-weight: 400;">Thank you for installing Hold It.lol!</span><br>';
        div.innerHTML += '<span>Click on the </span><img src="https://cdn.discordapp.com/attachments/873624494810484817/916750432368480326/icon32.png" style="height: 24px;vertical-align: middle;user-select: all;"><span> icon in the </span><span style="font-weight: 400;">top-right of your browser</span><span> to check out your </span><span style="font-weight: 400;">Options</span><span>.</span>'

        helperDiv.appendChild(div);
    };


    function createRow(parent, transparent = false) {
        const div = document.createElement('div');
        div.className = 'hil-row';
        parent.appendChild(div);
        return div;
    }


    if (options['now-playing']) {
        const row = createRow(helperDiv);
        row.classList.add('hil-tab-row-now-playing');
        const span = document.createElement('span');
        span.innerHTML = 'Now Playing: …';
        row.appendChild(span);
    }


    const TabState = {
        NONE: {
            enabled: true,
            onEnable: function() {
                tabSeparator.classList.add('hil-hide');
            },
            onDisable: function() {
                tabSeparator.classList.remove('hil-hide');
            }
        },
        TESTIMONY: {},
        TN: {},
        TTS: {},
    }
    const tabRow = createRow(helperDiv);

    const tabSeparator = document.createElement('hr');
    tabSeparator.className = 'hil-row-separator hil-hide';
    helperDiv.appendChild(tabSeparator);
    
    const contentRow = createRow(helperDiv);
    contentRow.classList.add('hil-content-row')
    let tabState = TabState.NONE;
    function setState(state) {
        if (tabState.onDisable) tabState.onDisable();
        if (tabState.contentDiv) {
            tabState.contentDiv.classList.add('hil-hide');
        }
        if (tabState.tabButton) tabState.tabButton.classList.remove('hil-btn-tab-active');
        tabState.enabled = false;
        tabState = state;
        if (tabState.onEnable) tabState.onEnable();
        if (tabState.contentDiv) {
            tabState.contentDiv.classList.remove('hil-hide');
        }
        if (tabState.tabButton) tabState.tabButton.classList.add('hil-btn-tab-active');
        tabState.enabled = true;
    }
    function createTabDiv(state) {
        const div = document.createElement('div');
        div.className = 'hil-tab-content hil-hide';
        state.contentDiv = div;
        contentRow.appendChild(div);
        return div;
    }
    function createTabButton(state, text) {
        const button = createButton(function () {
            if (!state.enabled) setState(state);
            else setState(TabState.NONE);
        }, text, '', 'flex: 1 1 auto;max-width: 10rem;');
        tabRow.appendChild(button);
        state.tabButton = button;
        return button;
    }


    if (options['testimony-mode']) {
        const tabDiv = createTabDiv(TabState.TESTIMONY);
        const testimonyRow = createRow(tabDiv);

        const testimonyArea = document.createElement('textarea');
        testimonyArea.className = 'hil-themed-text';
        testimonyArea.style.cssText = 'display: none; width: 100%; height: 600px; resize: none; overflow: auto; padding: 5px; margin: 0; border: #552a2e 1px solid;';
        testimonyArea.placeholder = "Paste your testimony here.\nSeparate statements with line breaks.";
        textArea.parentElement.appendChild(testimonyArea);

        const testimonyDiv = document.createElement('div');
        testimonyDiv.className = 'hil-themed-text';
        testimonyDiv.style.cssText = 'display: none; width: 100%; height: 600px; overflow: auto; padding: 5px 0px; margin: 0; border: #7f3e44 1px solid;';
        textArea.parentElement.appendChild(testimonyDiv);

        let statements;
        let currentStatement;
        let statementCache = {};
        let lastStatementId = 0;
        function resetCache() {
            statementCache = {};
            lastStatementId = 0;
            window.postMessage(['clear_testimony_poses']);
        }
        
        let musicPlaying = false;
        
        let auto = false;
        let red = false;
        let crossExam = false;

        const primaryDiv = document.createElement('div');
        primaryDiv.style.cssText = 'display: none;' + DEFAULT_TRANSITION;

        let testimonyLocked = false;
        const lockTestimony = primaryButton(function () {
            if (!testimonyLocked && testimonyArea.value == "") return;
            testimonyLocked = !testimonyLocked;
            if (testimonyLocked) {

                lockTestimony.firstElementChild.classList.remove('mdi-check');
                lockTestimony.firstElementChild.classList.add('mdi-close');
                primaryDiv.style.display = 'block';

                testimonyArea.value = testimonyArea.value.trim();
                currentStatement = undefined;
                statements = testimonyArea.value.split('\n').filter(e => e.trim());

                let toResetCache = true;
                for (let statement of statements) {
                    if (!(statement in statementCache)) continue;
                    toResetCache = false;
                    break;
                }
                if (toResetCache) resetCache();

                testimonyDiv.textContent = '';
                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i];

                    const div = document.createElement('div');
                    div.style.cssText = 'position: relative; padding: 0px 0px 16px 5px; cursor: pointer; margin-bottom: 9px;' + DEFAULT_TRANSITION;
                    div.dataset.statement = i;

                    div.addEventListener('click', function () {
                        if (div.querySelector(':scope .pose-message:hover')) return;
                        toStatement(i);
                    });

                    div.appendChild(document.createElement('span'));
                    div.lastElementChild.innerText = statement;

                    const pose = document.createElement('div');
                    pose.className = 'hil-themed pose-message v-messages v-messages__message ' + theme;
                    pose.style.cssText = 'position: absolute;';
                    if (statement in statementCache) {
                        let poseName = statementCache[statement].poseName;
                        if (!poseName) poseName = UNDEFINED_POSE_NAME;
                        pose.innerText = poseName;
                        pose.dataset.pose = poseName;
                    }
                    pose.addEventListener('mouseenter', () => { if (pose.dataset.pose) pose.innerText = 'Click to clear pose'; });
                    pose.addEventListener('mouseleave', () => { if (pose.dataset.pose) pose.innerText = pose.dataset.pose; });
                    pose.addEventListener('click', () => {
                        pose.dataset.pose = '';
                        pose.innerText = '';
                        if (statementCache[statement] === undefined) return;
                        delete statementCache[statement].poseName;
                        window.postMessage([
                            'clear_testimony_pose',
                            statementCache[statement].id,
                        ]);
                    });
                    div.appendChild(pose);

                    testimonyDiv.appendChild(div);
                    setTimeout(function () {
                        div.style.marginBottom = '20px';
                        div.style.padding = '5px';
                    }, 1);
                }

                if (red && testimonyDiv.childElementCount != 0) {
                    testimonyDiv.firstElementChild.firstElementChild.style.color = '#f00';
                    testimonyDiv.lastElementChild.firstElementChild.style.color = '#f00';
                }

                testimonyArea.style.display = 'none';
                testimonyDiv.style.display = 'block';

            } else {

                lockTestimony.firstElementChild.classList.add('mdi-check');
                lockTestimony.firstElementChild.classList.remove('mdi-close');
                primaryDiv.style.display = 'none';

                testimonyArea.style.display = 'block';
                testimonyDiv.style.display = 'none';

            }
        }, '', 'display: none; background-color: #7f3e44 !important; margin: 0 4px;', createIcon('check'));
        textButton.parentElement.parentElement.insertBefore(lockTestimony, textButton.parentElement);

        const buttonNextStatement = primaryButton(undefined, '', 'background-color: #552a2e !important; margin-left: 4px;', createIcon('send'));
        const buttonPrevStatement = primaryButton(undefined, '', 'background-color: #552a2e !important; margin-left: 4px;', createIcon('send', 24, 'transform: scaleX(-1);'));
        primaryDiv.appendChild(buttonPrevStatement);
        primaryDiv.appendChild(buttonNextStatement);

        textButton.parentElement.parentElement.appendChild(primaryDiv);


        TabState.TESTIMONY.onEnable = function() {
            textArea.style.display = 'none';

            textButton.parentElement.style.display = 'none';
            lockTestimony.style.display = 'flex';
            if (testimonyLocked) {
                primaryDiv.style.display = 'flex';
                testimonyDiv.style.display = 'block';
            } else {
                testimonyArea.style.display = 'block';
            }
        }
        TabState.TESTIMONY.onDisable = function() {
            testimonyArea.style.display = 'none';
            testimonyDiv.style.display = 'none';
            textArea.style.display = 'block';

            textButton.parentElement.style.display = 'block';
            lockTestimony.style.display = 'none';
            primaryDiv.style.display = 'none';
        }
        createTabButton(TabState.TESTIMONY, 'Testimony Mode');


        const inputRow = createRow(tabDiv);
        function testimonyInput(id, placeholder, onchange = undefined) {
            const input = document.createElement('input');
            input.id = id;
            input.autocomplete = 'on';
            input.className = 'hil-themed hil-row-textbox v-size--default v-sheet--outlined hil-themed-text ' + theme;
            input.style.width = '10rem';
            input.placeholder = placeholder;
    
            input.addEventListener('click', () => input.setSelectionRange(0, input.value.length));
            if (onchange) input.addEventListener('change', onchange);
    
            inputRow.appendChild(input);
            return input;
        }
        const musicInput = testimonyInput('hil-tm-music', 'Testimony music', () => musicPlaying = false);
        const selectInput = testimonyInput('hil-tm-select', 'Cross-exam click sound');

        function inputToTag(value, tagName) {
            const match = value.match(/[0-9]+/g)
            if (match && ('[#' + tagName + '0]').includes(value.replaceAll(/[0-9]+/g, '0'))) {
                const id = match[0];
                return '[#' + tagName + id + ']';
            } else {
                return '';
            }
        }

        testimonyRow.appendChild(iconToggleButton(function() {
            red = !red;
            if (testimonyDiv.childElementCount > 0) {
                if (red) {
                    testimonyDiv.firstElementChild.firstElementChild.style.color = '#f00';
                    testimonyDiv.lastElementChild.firstElementChild.style.color = '#f00';
                } else {
                    testimonyDiv.firstElementChild.firstElementChild.style.removeProperty('color');
                    testimonyDiv.lastElementChild.firstElementChild.style.removeProperty('color');
                }
            }
            return red;
        }, 'Red Beginning/End', 'hil-testiony-btn'));
        testimonyRow.appendChild(iconToggleButton(function() { return crossExam = !crossExam; }, 'Cross-exam mode', 'hil-testiony-btn'));
        testimonyRow.appendChild(iconToggleButton(function() { return auto = !auto; }, 'Use < > from chat', 'hil-testiony-btn'));


        function setElemPoseName(statementElem, name) {
            statementElem.querySelector('div.pose-message').innerText = name;
            statementElem.querySelector('div.pose-message').dataset.pose = name;
        }

        function toStatement(statement) {
            let statementElem;
            if (currentStatement != statement) {
                currentStatement = statement;

                let added = false;
                let removed = false;
                for (let elem of testimonyDiv.children) {
                    if (!removed && elem.style.backgroundColor != '') {
                        elem.style.removeProperty('background-color');
                        removed = true;
                    } else if (!added && elem.dataset.statement == String(currentStatement)) {
                        elem.style.backgroundColor = '#552a2e';
                        statementElem = elem;
                        added = true;
                    }
                    if (removed && added) break;
                }
            } else {
                for (let elem of testimonyDiv.children) {
                    if (elem.dataset.statement != String(currentStatement)) continue;
                    statementElem = elem;
                    break;
                }
            }

            const statementText = statements[statement];
            const music = inputToTag(musicInput.value, 'bgm');
            const continueSound = inputToTag(selectInput.value, 'bgs');

            let text = statementText;

            let preText;
            if (red && (statement == 0 || statement == statements.length - 1)) {
                text = '[##nt][#/r]' + text + '[/#]';
            } else if (crossExam) {
                text = text.replaceAll(/\[#.*?\]/g, '');
                text = text.replaceAll('[/#]', '');
                text = continueSound + '[#/g]' + text + '[/#]';
            }
            if (!crossExam) {
                text = '[##tm]' + text;
            }

            if (!crossExam && statement == statements.length - 1) {
                if (red) {
                    text = TAG_MUSIC_FADE_OUT + text;
                    musicPlaying = false;
                } else {
                    text = text + TAG_MUSIC_FADE_OUT;
                    musicPlaying = false;
                }
            } else if (!musicPlaying && music && (!red || statement != 0)) {
                text = music + text;
                musicPlaying = true;
            } else if (!crossExam && statement == 0 && music) {
                text = TAG_MUSIC_STOP + text;
                musicPlaying = false;
            }

            if (statementCache[statementText] === undefined) {
                statementCache[statementText] = {
                    id: lastStatementId
                }
                lastStatementId += 1;
            } else if (statementCache[statementText].poseName) {
                setElemPoseName(statementElem, statementCache[statementText].poseName);
            }

            text = '[##tmid' + statementCache[statementText].id + ']' + text;
            sendText(text);
        }

        window.addEventListener('message', function(event) {
            const [action, data] = event.data;
            if (action !== 'set_statement_pose_name') return;
            const statementText = Object.keys(statementCache).find(text => statementCache[text].id === data.id);
            const statementObj = statementCache[statementText];
            statementObj.poseName = data.name;

            if (!testimonyLocked) return;

            for (let statementElem of testimonyDiv.children) {
                if (statementElem.querySelector('span').innerText !== statementText) continue;
                setElemPoseName(statementElem, data.name);
            }            
        });

        function loopTo(statement) { toStatement(statement); }

        function nextStatement() {
            const edges = crossExam && red && statements.length > 1;
            if (currentStatement == undefined) {
                toStatement(0);
            } else if (currentStatement >= statements.length - (edges ? 2 : 1)) {
                loopTo(edges ? 1 : 0);
            } else {
                toStatement(currentStatement + 1);
            }
        }
        function prevStatement() {
            const edges = crossExam && red && statements.length > 1;
            if (currentStatement == undefined) {
                toStatement(statements.length - 1);
            } else if (currentStatement <= edges ? 1 : 0) {
                loopTo(statements.length - (edges ? 2 : 1));
            } else {
                toStatement(currentStatement - 1);
            }
        }

        buttonNextStatement.addEventListener('click', nextStatement);
        buttonPrevStatement.addEventListener('click', prevStatement);

        let characterObserver = new MutationObserver(function (mutations) {
            for (let mutation of mutations) {
                if (mutation.attributeName != "style" || mutation.oldValue == undefined) continue;

                const oldIcon = mutation.oldValue.match(/background-image: (url\(\".*?\"\));/)[1];
                const newIcon = mutation.target.style.backgroundImage;
                if (oldIcon !== newIcon) {
                    resetCache();
                    for (let elem of document.querySelectorAll('.pose-message')) {
                        elem.dataset.pose = '';
                        elem.innerText = '';
                    }
                };
            }
        });

        new MutationObserver(function (mutations, observer) {
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    if (!node.matches('div.v-image__image[style*="background-image:"]')) continue;

                    characterObserver.observe(node, {
                        attributes: true,
                        attributeOldValue: true
                    });

                    observer.disconnect();
                }
            }
        }).observe(document.querySelector('div.col-sm-3.col-2 div.icon-character'), { childList: true });

        states.testimonyArrow = function(arrow) {
            if (TabState.TESTIMONY.enabled && testimonyLocked && auto) {
                if (arrow == '>') nextStatement();
                else if (arrow == '<') prevStatement();
            }
        }
        states.testimonyIndex = function(statement) {
            if (TabState.TESTIMONY.enabled && testimonyLocked && auto) {
                let statementI = statement - 1;
                if (red) statementI += 1;
                let max = statements.length;
                if (red) max -= 1;
                if (statementI < 0 || statementI >= max) return;
                toStatement(statementI);
            }
        }

        window.addEventListener('message', function(event) {
            const [action, data] = event.data;
            if (action !== 'plain_message') return;

            if (testRegex(data.text, '[> ]*') && data.text.indexOf('>') !== -1) states.testimonyArrow('>');
            else if (testRegex(data.text, '[< ]*') && data.text.indexOf('<') !== -1) states.testimonyArrow('<');
            else if (testRegex(data.text, '<[0-9]*?>')) states.testimonyIndex(Number(data.text.slice(1, -1)));
        });     
    }



    if (options['smart-tn']) {
        createTabButton(TabState.TN, 'TN animations');
        const tnDiv = createTabDiv(TabState.TN);
        const tnRow = createRow(tnDiv);
        
        const description = document.createElement('span');
        description.textContent = 'TN pose name keywords:'
        description.style.margin = 'auto 10px';
        description.style.whiteSpace = 'nowrap';
        tnRow.appendChild(description);

        // const patternInputs = document.createElement('div');
        // patternInputs.style.display = 'flex';
        // tnRow.appendChild(patternInputs);
        function addPatternInput(value = '') {
            const input = document.createElement('input');
            input.className = 'hil-themed hil-row-textbox v-size--default v-sheet--outlined hil-tn-pattern hil-themed-text ' + theme;
            input.placeholder = 'TN';
            input.value = value;
            input.addEventListener('click', () => input.setSelectionRange(0, input.value.length));
            input.addEventListener('change', onPatternsUpdate);
            tnRow.appendChild(input);
            return input;
        }
        function onPatternsUpdate() {
            const patterns = [];
            const toRemove = [];
            for (let input of tnRow.querySelectorAll('input')) {
                if (input.value === '') {
                    toRemove.push(input);
                    continue;
                }
                patterns.push(input.value);
            }
            toRemove.forEach(elem => elem.remove());
            addPatternInput('');

            optionSet('smart-tn-patterns', patterns);
            window.postMessage([
                'set_options',
                options
            ]);
        }

        const patterns = options['smart-tn-patterns'] || ['TN'];
        for (let pattern of patterns) {
            addPatternInput(pattern);
        }
        addPatternInput('');
    }



    const menuTitles = {};
    const assetWindowButtons = {};
    let dualEffectMode = false;

    function premakeMenus() {
        if (!document.querySelector('div.v-dialog__content > div.v-dialog > div.v-card.v-sheet:not(.v-card--flat)')) {
            document.body.classList.add('hil-loading-menus');
        }

        document.querySelector('.v-btn__content .mdi-menu').click();
        document.querySelector('.v-btn__content .mdi-cog').click();
        document.querySelector('.v-btn__content .mdi-bookshelf').click();

        for (let span of document.querySelectorAll('span.v-btn__content')) {
            if (span.textContent === ' Preload Resources ') {
                span.parentElement.previousElementSibling.firstElementChild.firstElementChild.click();
                break;
            }
        }

        const buttons = document.querySelector('.mdi-palette').parentElement.parentElement.parentElement.querySelectorAll('button');
        for (let button of buttons) {
            button.click();

            if (options['menu-hover']) {
                button.addEventListener('mouseenter', function () {
                    let toFocus = false;
                    if (document.activeElement == textArea) toFocus = true;
                    button.click();
                    if (toFocus) textArea.focus();
                });
            }
        }

        setTimeout(function () {

            const courtRecordContainer = [...document.querySelectorAll('span.my-auto')].find(span => span.textContent === ' Court Record ')?.parentElement;
            [...courtRecordContainer.querySelectorAll('.v-btn__content')].find(span => span.textContent === ' Close ')?.click();

            const menus = app.querySelectorAll(':scope > div[role="menu"]');
            for (let menu of menus) {
                const titleElem = menu.querySelector('.v-list-item__title') || menu.querySelector('.v-label');
                if (titleElem != null) {
                    const title = titleElem.innerText;
                    menuTitles[title] = menu;

                    if (options['menu-auto-close'] && !MENUS_NOT_AUTO_CLOSE.includes(title)) {
                        for (let button of menu.querySelectorAll('.v-btn:not(.success)')) {
                            if (button.querySelector('span.v-btn__content').textContent.slice(0, 6) === 'Manage') continue;
                            button.addEventListener('click', clickOff);
                        }
                    }
                };

                if (true) { // sound-search
                    for (let input of menu.querySelectorAll('input[type="text"]')) {
                        input.addEventListener('input', function () {
                            const inputContent = getInputContent();
                            if (inputContent) {
                                inputContent.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 40 }));
                            }
                        });
                    }
                }
            }

            for (let button of buttons) button.click();


            if (options['dual-button']) {
                function flashButtonListener(strength) {
                    if (dualEffectMode) {
                        setTimeout(function () {
                            const pos = textArea.selectionEnd;
                            const tag = '[#s' + strength + ']';
                            insertValue(textArea, tag, pos);
                        }, 1)
                    }
                }
                const flashButtons = menuTitles['Flash'].querySelectorAll('button');
                flashButtons[0].addEventListener('click', () => flashButtonListener('s'));
                flashButtons[1].addEventListener('click', () => flashButtonListener('m'));
                flashButtons[2].addEventListener('click', () => flashButtonListener('l'));
            }


            if (options['sound-insert']) {
                for (let menuTitle of ['Sound', 'Music']) {
                    const menu = menuTitles[menuTitle];
                    const combobox = menu.querySelector('[role="combobox"]');
                    assetWindowButtons[menuTitle] = menu.querySelector('.indigo');
                    const input = combobox.querySelector('input[type="text"]');
                    let defaultOption;
                    input.addEventListener('focus', function () {
                        defaultOption = input.value;
                    })
                    let menuObserver = new MutationObserver(function () {
                        setTimeout(function () {
                            if (!(combobox.ariaExpanded == "false" && input.value != defaultOption && !modifierKeys.shift)) return;
                            menu.querySelector('.v-btn.primary').click();
                            textArea.focus();
                        }, 1);
                    });
                    menuObserver.observe(combobox, {
                        attributes: true,
                        attributeFilter: ['aria-expanded']
                    });
                }
            }
        }, 1);
    }
    premakeMenus();



    const menuButtonFlash = document.querySelector('button .mdi-white-balance-sunny').parentElement.parentElement;
    const menuButtonShake = document.querySelector('button .mdi-vibrate').parentElement.parentElement;
    let menuButtonDual;

    if (options['dual-button']) {
        function configureDualButton() {

            menuButtonDual = menuButtonShake.cloneNode(true);
            {
                const icon = menuButtonDual.querySelector('i');
                icon.classList.remove('mdi-vibrate');
                icon.classList.add('mdi-blur-radial');
            }

            function listener(button, title, description) {
                const menu = menuTitles['Flash'];
                const rect = button.getBoundingClientRect();
                menu.style.left = rect.right + 'px';
                menu.style.top = rect.top + 'px';

                const titleDiv = menuTitles['Flash'].querySelector('.v-list-item__title');
                titleDiv.textContent = title;
                titleDiv.nextElementSibling.textContent = description;
            }

            const eventName = options['menu-hover'] ? 'mouseenter' : 'click';

            menuButtonFlash.addEventListener(eventName, function () {
                listener(menuButtonFlash, TEXT_EFFECT_FLASH_TITLE, TEXT_EFFECT_FLASH_DESCRIPTION);
                dualEffectMode = false;
            });

            menuButtonDual.addEventListener(eventName, function () {
                menuButtonFlash.click();
                listener(menuButtonDual, TEXT_EFFECT_DUAL_TITLE, TEXT_EFFECT_DUAL_DESCRIPTION);
                dualEffectMode = true;
            });

            menuButtonShake.parentElement.insertBefore(menuButtonDual, menuButtonShake.nextElementSibling);

        }
        configureDualButton();
    }

    setTimeout(() => {
        for (let label of document.querySelectorAll('label')) {
            if (label.textContent !== 'Pre-animate') continue;

            const preToggle = label.parentElement.parentElement.parentElement;
            const toggles = preToggle.parentElement;
            const testimonyToggle = toggles.parentElement.querySelector(':scope > .v-input--switch');
            toggles.classList.add('hil-message-toggles');

            if (options['no-talk-toggle'] || options['smart-tn']) {
                const activeToggleClasses = ['v-input--is-label-active', 'v-input--is-dirty', 'primary--text'];

                if (options['smart-pre']) {
                    const preToggle = label.parentElement.parentElement.parentElement;
                    const preToggleThumb = preToggle.querySelector('.v-input--switch__thumb');
                    preToggle.addEventListener('click', function() {
                        window.postMessage(['pre_animate_toggled']);
                    });
                    window.addEventListener('message', function(event) {
                        const action = event.data[0];
                        if (action !== 'pre_animate_locked') return;
                        preToggleThumb.className += ' mdi mdi-lock hil-toggle-thumb-lock';
                        preToggleThumb.classList.remove('v-input--switch__thumb');
                    });
                    new MutationObserver(function () {
                        if (!preToggleThumb.classList.contains('hil-toggle-thumb-lock')) return;
                        preToggleThumb.classList.remove('hil-toggle-thumb-lock');
                        preToggleThumb.classList.remove('mdi-lock');
                        preToggleThumb.classList.remove('mdi');
                        preToggleThumb.classList.add('v-input--switch__thumb');
                    }).observe(document.querySelector('.col-sm-9.col-10 > div > div.swiper-container,.col-sm-9.col-10 > div > div.v-text-field').parentElement, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                        attributeFilter: [ 'class' ],
                    });
                }

                const flipToggle = label.parentElement.parentElement.parentElement.nextElementSibling;
                
                function createToggle(onchange, text, checked = false) {
                    const newToggle = flipToggle.cloneNode(true);

                    for (let elem of [newToggle, ...newToggle.querySelectorAll('*')]) {
                        if (elem.className.includes('theme--')) elem.classList.add('hil-themed');
                    }
                    
                    const input = newToggle.querySelector('input');
                    input.removeAttribute('id');
                    const label = newToggle.querySelector('label');
                    label.removeAttribute('for')
                    label.textContent = text;
                    
                    newToggle.addEventListener('click', function() {
                        input.checked = !input.checked;
                        input.ariaChecked = input.checked;
                        if (input.checked) {
                            activeToggleClasses.forEach(cls => newToggle.classList.add(cls));
                            newToggle.querySelectorAll('.v-input--selection-controls__input div').forEach(div => div.classList.add('primary--text'));
                        } else {
                            activeToggleClasses.forEach(cls => newToggle.classList.remove(cls));
                            newToggle.querySelectorAll('.v-input--selection-controls__input div').forEach(div => div.classList.remove('primary--text'));
                        }
                        onchange(input.checked);
                    });

                    if (checked) {
                        activeToggleClasses.forEach(cls => newToggle.classList.add(cls));
                        newToggle.querySelectorAll('.v-input--selection-controls__input div').forEach(div => div.classList.add('primary--text'));
                    }

                    return newToggle;
                }

                const toggleData = [];
                options['no-talk-toggle'] && toggleData.push({label: 'No Talking', checked: false, onchange: function(checked) {
                    window.postMessage(['set_socket_state', {
                            [ 'no-talk' ]: checked
                        }]);
                }});
                options['smart-tn'] && toggleData.push({label: 'TN-animate', checked: options['tn-toggle-value'], onchange: function(checked) {
                    optionSet('tn-toggle-value', checked);
                    window.postMessage([
                        'set_options',
                        options
                    ]);
                }});
                for (let i = 0; i < toggleData.length; i++) {
                    const { label, checked, onchange } = toggleData[i];
                    const toggle = createToggle(function(checked) {
                        onchange(checked);
                    }, label, checked);

                    if (i !== toggleData.length - 1) toggle.classList.add('mr-4');
                    flipToggle.parentElement.appendChild(toggle);
                }
            }

            toggles.appendChild(testimonyToggle);
            for (let toggle of toggles.children) {
                toggle.style.cssText = 'margin-right:16px!important';
            }

            if (options['old-toggles']) {
                const optionsIcon = document.querySelector('.v-btn__content .v-icon.mdi-cog');
                optionsIcon.classList.remove('mdi-cog');
                optionsIcon.classList.add('mdi-tooltip-image');

                new MutationObserver(function () {
                    if (optionsIcon.classList.contains('mdi-cog')) {
                        optionsIcon.classList.remove('mdi-cog');
                        optionsIcon.classList.add('mdi-tooltip-image');
                    }
                }).observe(optionsIcon, { attributes: true, attributeFilter: ['class'] });

                optionsIcon.parentElement.parentElement.parentElement.parentElement.parentElement.prepend(toggles);
            }

            break;
        }

        if (options['fullscreen-evidence']) {
            for (let span of document.querySelectorAll('.v-btn__content')) {
                if (span.textContent !== ' Present ') continue;

                const presentButton = span.parentElement;
                presentButton.setAttribute('hil-button', 'present-evd');
                const fullscreenButton = presentButton.cloneNode(true);
                fullscreenButton.setAttribute('hil-button', 'fullscreen-evd');
                presentButton.parentElement.prepend(fullscreenButton);
                window.postMessage(['fullscreen_button_added']);

                fullscreenButton.removeAttribute('disabled');
                fullscreenButton.querySelector('i').classList.remove('mdi-hand-pointing-up');
                fullscreenButton.querySelector('i').classList.add('mdi-fit-to-screen');
                fullscreenButton.querySelector('span').lastChild.textContent = 'Show full';
                fullscreenButton.addEventListener('click', function () {
                    presentButton.click();
                    setTimeout(function() {
                        const text = textArea.value;
                        const match = text.match(/\[#evdi[0-9]+\]$/);
                        if (!match) return;
                        textArea.value = text.slice(0, match.index) + match[0].replace('[#evdi', '[#evd');
                    }, 1);
                });

                break;
            }
        }
    }, 1);


    if (options['comma-pause']) {
        function commaAutoPause() {
            textArea.addEventListener('input', function () {
                const typeIndex = textArea.selectionStart - 1;
                const value = textArea.value;
                const character = value[typeIndex];
                if (character == ',') {
                    if (PAUSE_PUNCTUATION.includes(value[typeIndex - 1])) {
                        const tag = TAG_PAUSE_100;
                        insertReplaceValue(textArea, tag, typeIndex, typeIndex + 1);
                    } else {
                        const match = value.slice(0, typeIndex).match(/\[#p([0-9]*)\]$/);
                        if (match) {
                            let n = Number(match[1]) + 100;
                            n = n < 5000 ? n : 5000;
                            const tag = '[#p' + n + ']';
                            textValue(value.slice(0, typeIndex - match[0].length) + tag + value.slice(typeIndex + 1));
                            textArea.selectionStart = typeIndex + tag.length - match[0].length;
                            textArea.selectionEnd = textArea.selectionStart;
                        }
                    }
                }
            });
        }
        commaAutoPause();
    }



    if (options['ctrl-effects']) {
        function check(event, keyCodeMax = 51, keyCodeMin = 49) {
            return (event.ctrlKey || event.metaKey) && event.keyCode >= keyCodeMin && event.keyCode <= keyCodeMax;
        }

        document.addEventListener('keydown', function (event) {
            if (check(event, 52)) {
                event.preventDefault();
            }
        })

        textArea.addEventListener('keydown', function (event) {
            if (check(event, 51)) {
                const pos = textArea.selectionEnd;
                let strength;
                switch (event.keyCode) {
                    case 49:
                        strength = 's';
                        break;
                    case 51:
                        strength = 'l';
                        break;
                    default:
                        strength = 'm';
                }
                const tag = '[#f' + strength + '][#s' + strength + ']';
                insertValue(textArea, tag, pos);
                textArea.selectionEnd = pos + tag.length;
                textArea.selectionStart = textArea.selectionEnd;
            }
        })
    }



    if (options['bulk-evidence']) {
        let buttonRow;
        for (let i of document.querySelectorAll('.mdi-restart')) {
            if (i.parentElement.textContent != " Clear ") continue;
            buttonRow = i.parentElement.parentElement.parentElement;
            break;
        }
        const inputRow = buttonRow.parentElement.parentElement.firstElementChild;
        const evidenceList = buttonRow.parentElement.parentElement.nextElementSibling.nextElementSibling;

        const tabButton = document.createElement('div');
        tabButton.className = 'hil-evidence-button v-btn v-btn--plain v-size--small primary--text ' + theme;
        tabButton.style.cssText = 'margin-left: 32px; cursor: pointer';
        const tabSpan = document.createElement('span');
        tabSpan.className = 'v-btn__content';
        tabSpan.textContent = 'Import From Table';
        const tabDiv = document.createElement('div');
        tabDiv.className = 'hil-evidence-card hil-hide hil-themed ' + theme;
        tabButton.appendChild(tabSpan);
        buttonRow.appendChild(tabButton);
        app.appendChild(tabDiv);

        let tabOpen = false;
        document.addEventListener('click', function () {
            if (!tabOpen && document.querySelector('.hil-evidence-button:hover')) {
                tabOpen = true;
                tabDiv.classList.remove('hil-hide');
                const box = tabButton.getClientRects()[0];
                tabDiv.style.top = buttonRow.getClientRects()[0].bottom + 'px';
                tabDiv.style.left = (box.left + box.width / 2 - tabDiv.clientWidth / 2) + 'px';
                return;
            }
            if (document.querySelector('.hil-evidence-card:hover')) return;
            tabOpen = false;
            tabDiv.classList.add('hil-hide');
        });


        tabDiv.innerHTML = '<div class="hil-evidence-title">Paste a table here</div><div id="hil-evidence-area" class="hil-themed ' + theme + '" contenteditable="true"></div><div class="hil-evidence-submit v-btn hil-themed ' + theme + '">Submit</div><div class="hil-evidence-error error--text"></div>';
        const pasteArea = tabDiv.querySelector('#hil-evidence-area');
        const error = tabDiv.querySelector('.hil-evidence-error');

        pasteArea.addEventListener("input", function () {
            for (let table of pasteArea.querySelectorAll(':not(:scope) > table')) {
                pasteArea.appendChild(table);
            }
            for (let table of pasteArea.querySelectorAll('table')) {
                if (table.querySelector('thead')) table.querySelector('thead').remove();
                if (table.querySelector('tfoot')) table.querySelector('tfoot').remove();
                const tbody = table.querySelector('tbody');
                if (tbody) {
                    while (tbody.children.length > 0) {
                        table.appendChild(tbody.children[0]);
                    }
                }

                for (let child of table.querySelectorAll(':scope > :not(tr):not(td):not(th)')) child.remove();
            }
            for (let node of pasteArea.childNodes) {
                if (node.nodeType === 1 && node.nodeName === 'TABLE') continue;
                node.remove();
            }
            for (let elem of pasteArea.querySelectorAll('.hil-evd-warning')) elem.classList.remove('hil-evd-warning');
            for (let elem of pasteArea.querySelectorAll('.hil-evd-error')) elem.classList.remove('hil-evd-error');
            for (let elem of pasteArea.querySelectorAll('.hil-evd-row')) elem.classList.remove('hil-evd-row');
            error.textContent = '';
        });


        const evidenceButton = buttonRow.firstElementChild;
        const evidenceBacklog = [];
        let adding = false;
        function addEvidence(name, image, desc) {
            if (!evidenceButton.classList.contains('v-btn--loading') && !adding) {
                const currentImgs = [].map.call(evidenceList.children, (elem) => elem.querySelector('.v-image__image')?.style.backgroundImage);
                if (currentImgs.includes('url("' + image + '")')) image += '?';

                setValue(inputRow.querySelector(':scope > :nth-child(1) input'), name);
                setValue(inputRow.querySelector(':scope > :nth-child(2) input'), image);
                setValue(inputRow.querySelector(':scope > :nth-child(5) textarea'), desc);
                adding = true;
                setTimeout(() => {
                    evidenceButton.click();
                    adding = false;
                }, 0);
            } else {
                evidenceBacklog.push([name, image, desc]);
            }
        }

        const evidenceButtonObserver = new MutationObserver(function (mutations) {
            for (let mutation of mutations) {
                if (!evidenceButton.classList.contains('v-btn--loading') && evidenceBacklog.length > 0) {
                    const tuple = evidenceBacklog.shift();
                    addEvidence(...tuple);
                }

            }
        });
        evidenceButtonObserver.observe(evidenceButton, { attributes: true, attributeFilter: ['class'] });


        const button = tabDiv.querySelector('.hil-evidence-submit');
        button.addEventListener('click', function () {

            const tableCellContents = [];
            for (let table of pasteArea.querySelectorAll(':scope > table')) {
                const rows = table.querySelectorAll(':scope > tr');
                const cellContentLengths = { 0: 0, 1: 0, 2: 0 };
                const cellContents = { contents: [] };
                tableCellContents.push(cellContents);
                for (let i = 0; i < rows.length; i++) {
                    const anchorRow = rows[i];
                    if (anchorRow.childElementCount < 2 || anchorRow.querySelector('img') == null) {
                        anchorRow.classList.add('hil-evd-warning');
                        continue;
                    };

                    let maxRowSpan = 1;
                    for (let cell of anchorRow.children) {
                        if (cell.rowSpan > maxRowSpan) maxRowSpan = cell.rowSpan;
                    }
                    anchorRow.classList.add('hil-evd-row');


                    const contents = {};
                    for (let j = 0; j < anchorRow.childElementCount; j++) {
                        const index = j > 2 ? 2 : j;
                        const cell = anchorRow.children[j];
                        if (cell.querySelector('img')) {
                            contents[index] = cell.querySelector('img').src;
                            continue;
                        }
                        cellContentLengths[index] = cellContentLengths[index] + cell.innerText.length;
                        if (j > 2) {
                            contents[index] += EVIDENCE_DESC_SEPARATOR + cell.innerText;
                        } else {
                            contents[index] = cell.innerText;
                        }
                    }
                    for (let j = 0; j < maxRowSpan - 1; j++) {
                        const row = rows[i + j + 1];
                        const childrenContents = [].map.call(row.children, td => td.innerText);
                        contents[2] += EVIDENCE_DESC_SEPARATOR + childrenContents.join(EVIDENCE_DESC_SEPARATOR);
                        const childrenLengths = childrenContents.map(text => text.length);
                        for (length in childrenLengths) {
                            cellContentLengths[2] += length;
                        }
                    }

                    cellContents.contents.push(contents);


                    i += maxRowSpan - 1;
                }
                let indexLengths = Object.keys(cellContentLengths).map(key => [key, cellContentLengths[key]]);
                indexLengths = indexLengths.sort((a, b) => a[1] - b[1]);
                cellContents.imageIndex = Number(indexLengths[0][0]);
                cellContents.nameIndex = Number(indexLengths[1][0]);
                cellContents.descIndex = Number(indexLengths[2][0]);


                const names = table.querySelectorAll(':scope > .hil-evd-row > :nth-child(' + (cellContents.nameIndex + 1) + ')');
                for (let i = 0; i < names.length; i++) {
                    const nameElem = names[i];
                    const text = nameElem.textContent;
                    if (text.length > EVIDENCE_MAX_LENGTH_NAME) {
                        nameElem.classList.add('hil-evd-error');
                        nameElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        error.textContent = 'Name on row ' + i + " can\'t be longer than " + EVIDENCE_MAX_LENGTH_NAME + '!';
                        return;
                    }
                }

            }

            for (let table of tableCellContents) {
                for (let tuple of table.contents) {
                    let name = tuple[table.nameIndex];
                    let image = tuple[table.imageIndex];
                    let descOrig = tuple[table.descIndex]
                    let desc = descOrig.replace(/\s\s+/g, ' ');

                    if (image.slice(-3) == '=s0') {
                        image = image.slice(0, -3);
                    }
                    if (desc.length > EVIDENCE_MAX_LENGTH_DESC) {
                        const cutDesc = descOrig.replace(/(\s)\s+/g, '$1').slice(0, EVIDENCE_MAX_LENGTH_DESC - EVIDENCE_DESC_TOO_LONG.length);

                        let cut;
                        if (cutDesc.lastIndexOf('\n') > 0) cut = cutDesc.lastIndexOf('\n');
                        else if (cutDesc.lastIndexOf(' ') > 0) cut = cutDesc.lastIndexOf(' ');
                        else cut = cutDesc.length;

                        desc = desc.slice(0, cut) + EVIDENCE_DESC_TOO_LONG;
                    }

                    addEvidence(name, image, desc);
                }
            }

        });
    }


    if (options['sound-insert']) {
        function checkModifierKeys(event) {
            modifierKeys.shift = event.shiftKey;
        }
        document.addEventListener('keydown', checkModifierKeys);
        document.addEventListener('keyup', checkModifierKeys);
    }


    const chatObserver = new MutationObserver(function () {
        if (options['convert-chat-urls']) {
            for (let messageNode of chat.children) {
                const messageIcon = messageNode.querySelector('i');
                if (!messageIcon.matches('.mdi-account,.mdi-crown,.mdi-account-tie')) continue;

                const messageTextDiv = messageNode.querySelector('.chat-text');
                const html = messageTextDiv.innerHTML;
                if (html.includes('</a>')) continue;

                const match = html.match(URL_REGEX);
                if (match === null) continue;

                let url = match[0];
                if (url.match('http:\/\/') !== null) url = 'https' + url.slice(4);
                else if (url.match('https:\/\/') === null) url = 'https://' + url;
                messageTextDiv.innerHTML = html.replaceAll(
                    URL_REGEX,
                    '<a target="_blank" href="' + url + '">$1</a>$2',
                );
            }
        }

        const messageNode = chat.lastElementChild;
        const messageIcon = messageNode.querySelector('i');
        const messageTextDiv = messageNode.querySelector('.chat-text');
        const messageText = messageTextDiv.innerText;

        if (musicPlaying && messageText.includes(STOP_MUSIC_TEXT)) {
            musicPlaying = false;
        }

        if (options['tts'] && states.ttsEnabled && states.ttsReadLogs && !messageIcon.matches('.mdi-account,.mdi-crown,.mdi-account-tie')) {
            chrome.runtime.sendMessage(["tts-speak", {text: messageNode.innerText.replaceAll('\n', ' ')}]);
        }

        // if (options['chat-fix']) {
        //     if (chatBox.scrollTop + chatBox.clientHeight > chatBox.scrollHeight - 25) {
        //         chatBox.scrollTop = chatBox.scrollHeight
        //     } else {
        //         chatBox.scrollTop -= messageNode.clientHeight
        //     }

        //     const baseNodeDiv = currentSelectionState.baseNodeDiv;
        //     const extentNodeDiv = currentSelectionState.extentNodeDiv;
        //     if (
        //         chat.children.length == 100 &&
        //         chat.contains(baseNodeDiv) &&
        //         chat.contains(extentNodeDiv) &&
        //         baseNodeDiv != null &&
        //         baseNodeDiv.parentElement.parentElement.parentElement.parentElement == chatBox
        //     ) {
        //         const newBaseAndExtent = [];
        //         for (let node of [baseNodeDiv, extentNodeDiv]) {
        //             const isChatText = node.matches('.chat-text');
        //             const prevMessage = node.parentElement.parentElement.previousElementSibling.lastElementChild;
        //             if (isChatText && prevMessage.querySelector('.chat-text')) {
        //                 newBaseAndExtent.push(prevMessage.querySelector('.chat-text').firstChild);
        //             } else {
        //                 newBaseAndExtent.push(prevMessage.firstElementChild.firstChild);
        //             }
        //         }
        //         sel.setBaseAndExtent(newBaseAndExtent[0], currentSelectionState.baseOffset, newBaseAndExtent[1], currentSelectionState.extentOffset)
        //     }
        // }
    });

    chatObserver.observe(chat, {
        childList: true,
        characterData: true,
        subtree: true
    });

    {
        let joinDialogShown = false;
        new MutationObserver(function (mutations, observer) {
            for (let mutation of mutations) {
                for (let node of mutation.removedNodes) {
                    if (states.spectating || node.nodeType !== 1 || !node.classList.contains('v-dialog__content')) continue;
                    const headline = node.querySelector('.headline');
                    if (!headline || headline.textContent != "Join Courtroom") continue;

                    if (options['auto-record']) document.querySelector('i.mdi-video').click();
                    
                    states.spectating = !document.querySelector('.frameTextarea');
                    if (states.spectating) {
                        window.postMessage(["room_spectated"]);

                        let volumeButton;
                        for (let span of document.querySelectorAll('span.v-btn__content')) {
                            if (span.textContent !== 'Join Room') continue;
                            volumeButton = span.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
                            break;
                        }
                        
                        if (!volumeButton) break;

                        volumeButton.click();
                        setTimeout(clickOff, 1);
                        if (options['spectator-preload']) {
                            let preload = true;
                            const preloadButton = iconToggleButton(function() {
                                preload = !preload;
                                window.postMessage(['set_preload', preload]);
                                return preload;
                            }, 'PRELOAD RESOURCES', 'error', '', true);
                            preloadButton.style.cssText = 'height:28px!important;margin-left:8px;';
                            volumeButton.parentElement.appendChild(preloadButton);
                        }

                        new MutationObserver(function(mutations) {
                            for (let mutation of mutations) {
                                for (let node of mutation.addedNodes) {
                                    if (node.nodeType !== 1) continue;
                                    const joinSpan = [...node.querySelectorAll('span.v-btn__content')].find(span => span.innerText === 'JOIN');
                                    if (joinSpan) joinSpan.innerText = 'RELOAD';
                                    break;
                                }
                            }
                        }).observe(app, {
                            childList: true,
                            subtree: true,
                        });

                    } else {
                        observer.disconnect();
                    }
                }
                if (joinDialogShown) continue;
                for (let node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    if (!node.firstElementChild?.firstElementChild?.matches('div.v-card.v-sheet:not(.v-card--flat)')) continue;
                    node.classList.add('hil-join-dialog');
                    document.body.classList.remove('hil-loading-menus');
                    joinDialogShown = true;
                }
            }
        }).observe(app, {
            childList: true,
        });
    }


    if (options['convert-chat-urls']) {
        chrome.runtime.sendMessage(["create-asset-context-menu"]);
        chrome.runtime.onMessage.addListener(function(event) {
            const [ action, data ] = event;
            if (action == "save-asset") {
                let buttonTitle;
                if (data.menuItemId == 'hil-save-sound') buttonTitle = 'Sound';
                if (data.menuItemId == 'hil-save-music') buttonTitle = 'Music';
                if (!buttonTitle) return;
                assetWindowButtons[buttonTitle].click();

                setTimeout(function() {
                    for (let label of document.querySelectorAll('.v-window-item--active label')) {
                        if (label.textContent !== 'URL') continue;
                        const input = label.parentElement.querySelector('input');
                        input.value = data.linkUrl;
                        input.dispatchEvent(new Event('input'));
                        setTimeout(() => label.parentElement.parentElement.parentElement.parentElement.previousElementSibling.querySelector('input').focus(), 25);
                    }
                }, 250);
            }
        });
    }

    if (options['tts']) {
        chrome.runtime.sendMessage(["tts-get-voices"], function(voices) {
            createTabButton(TabState.TTS, 'Text-to-speech');
            const tabDiv = createTabDiv(TabState.TTS);
            const tabRow = createRow(tabDiv);
            tabRow.classList.add('hil-tab-row-tts');

            states.ttsEnabled = false;
            let ttsReadNames = true;
            states.ttsReadLogs = true;
            tabRow.appendChild(iconToggleButton(function() {
                states.ttsEnabled = !states.ttsEnabled;
                window.postMessage(['set_socket_state', {
                    [ 'tts-enabled' ]: states.ttsEnabled
                }]);
                return states.ttsEnabled
            }, 'Speech enabled', '', 'min-width: 33%;'));
            tabRow.appendChild(iconToggleButton(function() { return ttsReadNames = !ttsReadNames; }, 'Names', '', '', true));
            tabRow.appendChild(iconToggleButton(function() { return states.ttsReadLogs = !states.ttsReadLogs; }, 'Logs', '', '', true));
            
            if (voices.length > 0) {
                const voiceDropdownButton = document.createElement('div');
                voiceDropdownButton.className = 'v-btn v-btn--has-bg v-size--default hil-row-btn hil-voice-dropdown hil-themed ' + theme;
                voiceDropdownButton.innerText = 'Voices used';
                tabRow.appendChild(voiceDropdownButton);
                
                voices.sort(function(voiceA, voiceB) {
                    const keyA = (voiceA.lang + voiceA.voiceName);
                    const keyB = (voiceB.lang + voiceB.voiceName);
                    if (keyA < keyB) return -1;
                    if (keyA > keyB) return 1;
                    return 0;
                });
                
                const voiceDropdown = document.createElement('div');
                voiceDropdown.className = 'hil-checkbox-list';
                voiceDropdown.style.cssText = 'opacity: 0; display: none;';
                for (let voice of voices) {
                    const item = document.createElement('div');
                    item.className = 'hil-themed ' + theme;
                    
                    const i = document.createElement('i');
                    i.className = 'v-icon notranslate mdi mdi-checkbox-blank-outline hil-themed ' + theme;
                    item.appendChild(i);
                    
                    const span = document.createElement('span');
                    span.textContent = '(' + voice.lang + ') ' + voice.voiceName;
                    item.appendChild(span);
                    
                    voice.uses = 0;
                    voice.enabled = false;
                    function onclick() {
                        voice.enabled = !voice.enabled;
                        if (voice.enabled) {
                            item.className += ' hil-active primary--text';
                            i.classList.remove('mdi-checkbox-blank-outline');
                            i.className += ' primary--text mdi-checkbox-marked';
                        } else {
                            item.classList.remove('primary--text');
                            item.classList.remove('hil-active');
                            i.classList.remove('primary--text');
                            i.classList.remove('mdi-checkbox-marked');
                            i.classList.add('mdi-checkbox-blank-outline');
                        }
                    }
                    item.addEventListener('click', onclick);
                    if (voice.lang.slice(0, 2) === 'en') onclick();
                    
                    voiceDropdown.appendChild(item);
                }
                voiceDropdownButton.appendChild(voiceDropdown);
                const firstActive = voiceDropdown.querySelector('.hil-active');
                if (firstActive) voiceDropdown.scrollTop = firstActive.offsetTop;

                voiceDropdownButton.addEventListener('mouseenter', function() {
                    voiceDropdown.style.removeProperty('display');
                    setTimeout(function() {
                        voiceDropdown.style.removeProperty('opacity');
                    }, 0);
                });
                voiceDropdownButton.addEventListener('mouseleave', function() {
                    voiceDropdown.style.setProperty('opacity', '0');
                    setTimeout(function() {
                        voiceDropdown.style.setProperty('display', 'none');
                    }, 280);
                });
            }
                
            const characterVoices = {};
            window.addEventListener('message', function(event) {
                if (!states.ttsEnabled) return;

                const [action, data] = event.data;
                if (action === 'plain_message') {
                    chrome.runtime.sendMessage(["tts-speak", {text: data.username + ' writes; ' + data.text}]);
                } else if (action === 'talking_started') {

                    let text = data.plainText;
                    if (ttsReadNames) text = data.username + ' says; ' + text;

                    if (voices.length > 0 === false) {
                        chrome.runtime.sendMessage(["tts-speak", {text: text}]);
                        return;
                    }
                    if (data.characterId in characterVoices === false || characterVoices[data.characterId].voiceObj.enabled === false) {
                        const enabledVoices = voices.filter(voice => voice.enabled);
                        let minUses = enabledVoices.reduce(function(min, current) {
                            return Math.min(min, current.uses);
                        }, Infinity);
                        const availableVoices = enabledVoices.filter(voice => voice.uses === minUses);

                        let chosenVoice = kindaRandomChoice(enabledVoices, data.characterId);
                        if (!availableVoices.includes(chosenVoice)) chosenVoice = kindaRandomChoice(availableVoices, data.characterId);
                        chosenVoice.uses += 1;
                        const pitch = Math.random() * (1.15 - 0.85) + 0.85;
                        characterVoices[data.characterId] = {
                            voiceName: chosenVoice.voiceName,
                            pitch,
                            voiceObj: chosenVoice,
                        };
                    }
                    const { voiceName, pitch } = characterVoices[data.characterId];
                    chrome.runtime.sendMessage(["tts-speak", {text, voiceName, pitch}]);
                    
                }
            });
        });
    }

    if (options['reload-ccs']) {
        const reloadCCButton = createButton(function() {
            window.postMessage(['reload_ccs']);
            reloadCCButton.classList.remove('primary');
            reloadCCButton.classList.add('v-btn--disabled');
            setTimeout(function() {
                reloadCCButton.classList.add('primary');
                reloadCCButton.classList.remove('v-btn--disabled');
            }, 5000);
        }, 'RELOAD CUSTOMS', '', 'height:28px!important;');

        reloadCCButton.className = 'v-btn v-btn--has-bg v-size--small primary hil-themed';
        reloadCCButton.prepend(createIcon('refresh', 18, 'margin-right: 8px;'));

        const reloadDataButton = [...document.querySelectorAll('.v-btn__content')].find(span => span.textContent === ' Reload Data ').parentElement;
        reloadDataButton.style.setProperty('margin-right', '16px')
        reloadDataButton.parentElement.appendChild(reloadCCButton);
    }

    if (options['pose-icon-maker']) {
        const AnimType = {
            IDLE: 0,
            SPEAK: 1,
            PRE: 2,
        };
        const CharacterAlignment = {
            CENTER: 0,
            LEFT: 1,
            RIGHT: 2,
        }
        
        let iconRenders = {};
        chrome.storage.local.get('icon-renders', function(storage) {
            iconRenders = storage['icon-renders'] || {};
        });
        chrome.storage.local.get('icon-editor', function(storage) {
            storage = verifyStructure(storage['icon-editor'], {
                characters: {},
                underlays: {},
                overlays: {},
            });
            wrapperLoaded.then(function() {
                window.postMessage(['set_custom_icon_characters', Object.keys(storage.characters)]);
            });
        });
        function customIconDisplayed(poseId) {
            if (!(poseId in iconRenders)) return false;
            const icon = document.querySelector('.p-image[data-pose-id="' + poseId + '"]');
            if (!icon) return false;

            return iconRenders[poseId];
        }

        new MutationObserver(function(mutations) {
            for (let mutation of mutations) {
                if (mutation.attributeName !== 'data-pose-id') continue;
                if (!(mutation.target.nodeType === 1 && mutation.target.nodeName === 'IMG')) continue;
                if (mutation.target.src !== hilUtils.transparentGif) continue;
                const poseId = mutation.target.dataset.poseId;
                if (iconRenders[poseId]) {
                    mutation.target.src = iconRenders[poseId];
                    mutation.target.dataset.hilIconOverwritten = '1';
                }
            }
        }).observe(document.querySelector('.col-sm-9.col-10 > div > div.swiper-container,.col-sm-9.col-10 > div > div.v-text-field').parentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-pose-id']
        });

        const editButton = htmlToElement(`<i
            class="v-icon notranslate mdi mdi-pencil hil-pose-edit-icon hil-hide hil-themed ${getTheme()}"
        >`);
        
        const tooltip = createTooltip('Pose Icon Editor', editButton);
        editButton.addEventListener('mouseenter', function () {
            tooltip.realign();
            tooltip.classList.remove('hil-hide');
        });
        editButton.addEventListener('mouseleave', () => tooltip.classList.add('hil-hide'));

        const charIconRow = document.querySelector('.row.mt-2.no-gutters .col-sm-3.col-2');
        charIconRow.style.setProperty('display', 'flex');
        charIconRow.appendChild(editButton);

        const editCard = htmlToElement(/*html*/`
            <div class="hil-hide hil-pose-edit-card hil-themed ${getTheme()}">
                <div>
                    <div class="d-flex">
                        <div class="headline hil-pose-title">Icon: </div>
                        <i class="mdi mdi-delete headline hil-pose-icon-delete hil-hide-on-load"></i>
                        <div class="hil-close-button">Close</div>
                    </div>
                    <hr class="v-divider hil-themed ${getTheme()}">
                    <div class="v-input__control hil-hide-on-load hil-hide">
                        <div class="v-slider v-slider--horizontal hil-themed ${getTheme()}">
                            <div class="v-slider__track-container">
                                <div class="v-slider__track-background"></div>
                                <div class="v-slider__track-fill primary" style="width: 0%;"></div>
                            </div>
                            <div class="v-slider__thumb-container primary--text" style="left: 0%;">
                                <div class="v-slider__thumb primary"></div>
                                <div class="v-slider__thumb-label primary">
                                    <span>0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="v-messages v-messages__message hil-hide hil-hide-on-load hil-themed ${getTheme()}">Idle animation</div>
                    <hr class="v-divider hil-themed ${getTheme()}">
                    <div class="hil-edit-columns hil-hide-on-load d-flex hil-hide">
                        <div style="width: 100%; overflow: hidden;">
                            <div class="hil-themed ${getTheme()}">Frame</div>
                            <div class="v-messages v-messages__message hil-themed ${getTheme()}"><b>0</b> total icons are affected by this frame</div>
                            <div class="hil-swiper-container hil-themed ${getTheme()}" style="height: 60px;">
                                <div class="hil-swiper hil-icon-frames">
                                    <i class="v-icon mdi mdi-plus-box hil-add-button hil-themed ${getTheme()}" style="font-size: 64px;"></i>
                                </div>
                            </div>
                            <div class="mb-2 hil-themed ${getTheme()}">Overlays</div>
                            <div class="hil-swiper-container hil-themed ${getTheme()}">
                                <div class="hil-swiper hil-icon-overlays">
                                    <i class="v-icon mdi mdi-plus-box hil-add-button hil-themed ${getTheme()}"></i>
                                    <i class="v-icon mdi mdi-archive hil-add-button hil-themed ${getTheme()}"></i>
                                    <input class="d-none" type="file" accept="image/*">
                                </div>
                            </div>
                            <div class="mb-2 hil-themed ${getTheme()}">Underlays</div>
                            <div class="hil-swiper-container hil-themed ${getTheme()}">
                                <div class="hil-swiper hil-icon-underlays">
                                    <i class="v-icon mdi mdi-plus-box hil-add-button hil-themed ${getTheme()}"></i>
                                    <i class="v-icon mdi mdi-archive hil-add-button hil-themed ${getTheme()}"></i>
                                    <input class="d-none" type="file" accept="image/*">
                                </div>
                            </div>
                        </div>
                        <div class="hil-canvas-column" style="margin-left: 16px;">
                            <canvas></canvas>
                            <div class="hil-hide">
                                <div><i class="v-icon mdi mdi-cursor-move" style="opacity: 0.6;"></i> Drag</div>
                                <div><i class="v-icon mdi mdi-resize" style="opacity: 0.6;"></i> Scroll</div>
                            </div>
                        </div>
                    </div>
                    <div class="mb-4 hil-icon-export-buttons hil-hide-on-load"></div>
                    <div class="hil-card-centered v-progress-circular v-progress-circular--indeterminate">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="23 23 46 46">
                            <circle fill="transparent" cx="46" cy="46" r="20" stroke-width="6" class="v-progress-circular__overlay"></circle>
                        </svg>
                    </div>
                    <div class="hil-card-centered hil-hide" style="text-align: center;white-space: nowrap;">
                        <i class="mdi mdi-alert-circle"></i>
                        <span></span>
                    </div>
                </div>
            </div>
        `);
        let exportCard;

        editButton.addEventListener('click', function() {
            editCard.querySelector('.hil-close-button').addEventListener('click', () => editCard.classList.add('hil-hide'));

            for (let swiperContainer of editCard.querySelectorAll('.hil-swiper-container')) {
                const swiper = swiperContainer.querySelector('.hil-swiper');
                let translateX = 0;
                function setX(x) {
                    translateX = x;
                    swiper.style.setProperty('transform', 'translateX(' + translateX + 'px)');
                }
                function enableDuration() {
                    swiper.style.setProperty('transition-duration', '300ms');
                    setTimeout(
                        () => swiper.style.removeProperty('transition-duration'),
                        300
                    );
                }

                const moveListener = function(event) {
                    setX(translateX + event.movementX);
                }
                swiperContainer.addEventListener('mousedown', function(event) {
                    event.preventDefault();
                    document.addEventListener('mousemove', moveListener);
                    document.addEventListener('mouseup', function() {
                        document.removeEventListener('mousemove', moveListener);
                        if (translateX > 0) {
                            setX(0);
                            enableDuration();
                        } else if (translateX < swiperContainer.clientWidth - swiper.scrollWidth) {
                            setX(swiperContainer.clientWidth - swiper.scrollWidth);
                            enableDuration();
                        }
                    }, { once: true });
                });
            }

            const poseNameDiv = editCard.querySelector('.hil-pose-title');
            const slider = editCard.querySelector('.v-slider');
            const editColumns = editCard.querySelector('.hil-edit-columns');
            const frameDiv = editCard.querySelector('.hil-icon-frames');
            const overlayDiv = editCard.querySelector('.hil-icon-overlays');
            const underlayDiv = editCard.querySelector('.hil-icon-underlays');
            const exportButtons = editCard.querySelector('.hil-icon-export-buttons');
            const messageAnim = editCard.querySelector(':scope > div > .v-messages');
            const messageFrameUses = editCard.querySelector('.hil-edit-columns .v-messages');
            const helpLines = editCard.querySelector('.hil-canvas-column > :nth-child(2)');
            const poseLoadIcon = editCard.querySelector('.v-progress-circular');
            const errorMessage = editCard.querySelector('.hil-card-centered:not(.v-progress-circular)');

            const iconCanvas = editCard.querySelector('.hil-canvas-column canvas');
            iconCanvas.width = 64;
            iconCanvas.height = 64;

            iconCanvas.addEventListener('mouseenter', () => helpLines.classList.remove('hil-hide'));
            iconCanvas.addEventListener('mouseleave', () => helpLines.classList.add('hil-hide'));

            function canvasDragListener(event) {
                const characterData = editorCache.storageCache.characters[openedCharacterId];
                const frameId = editorCache[openedPoseId].data.frame;
                const frame = characterData.frames[frameId];
                const img = editorCache[openedPoseId].selectedImage;

                const prevLeft = frame.left;
                const prevTop = frame.top;
                frame.left -= event.movementX / img.naturalWidth;
                frame.top -= event.movementY / img.naturalHeight;
                if (frame.left < 0) frame.left = 0;
                if (frame.top < 0) frame.top = 0;
                const limitLeft = (img.naturalWidth - frame.height * img.naturalHeight) / img.naturalWidth;
                if (prevLeft >= limitLeft && event.movementX <= 0) frame.left = prevLeft;
                if (prevLeft < limitLeft && frame.left > limitLeft) frame.left = limitLeft;
                if (prevTop >= 1 - frame.height && event.movementY <= 0) frame.top = prevTop;
                if (prevTop < 1 - frame.height && frame.top > 1 - frame.height) frame.top = 1 - frame.height;

                drawIcon(iconCanvas, openedPoseId);
                const frameCanvas = document.querySelector('.hil-icon-frames canvas[data-frame-id="' + frameId + '"]');
                if (frameCanvas) {
                    updateFrameCanvas(editorCache[openedPoseId].selectedImage, frameCanvas);
                }
                setTimeoutSave();
            }
            iconCanvas.addEventListener('mousedown', function(event) {
                if (event.button !== 0) return;

                iconCanvas.style.setProperty('cursor', 'none');
                iconCanvas.nextElementSibling.style.setProperty('opacity', '1');
                iconCanvas.requestPointerLock();
                iconCanvas.addEventListener('mousemove', canvasDragListener);
                
                document.addEventListener('mouseup', function() {
                    iconCanvas.style.removeProperty('cursor');
                    iconCanvas.nextElementSibling.style.removeProperty('opacity');
                    document.exitPointerLock();
                    iconCanvas.removeEventListener('mousemove', canvasDragListener)
                }, { once: true });
            });
            iconCanvas.addEventListener('mousewheel', function(event) {
                event.preventDefault();
                const characterData = editorCache.storageCache.characters[openedCharacterId];
                const frameId = editorCache[openedPoseId].data.frame;
                const frame = characterData.frames[frameId];
                const img = editorCache[openedPoseId].selectedImage;

                const prevHeight = frame.height;
                frame.height += event.deltaY / 5000;
                if (frame.height > 1) frame.height = 1;
                else if (frame.height < 0.01) frame.height = 0.01;

                const delta = frame.height - prevHeight;
                frame.left -= delta / 2 * img.naturalHeight / img.naturalWidth;
                frame.top -= delta / 2;
                const limitLeft = (img.naturalWidth - frame.height * img.naturalHeight) / img.naturalWidth;
                if (frame.left < 0) frame.left = 0;
                else if (frame.left > limitLeft) frame.left -= delta / 2 * img.naturalHeight / img.naturalWidth;
                if (frame.top < 0) frame.top = 0;
                else if (frame.top > 1 - frame.height) frame.top -= delta / 2;

                if (prevHeight !== frame.height) {
                    drawIcon(iconCanvas, openedPoseId);
                    const frameCanvas = document.querySelector('.hil-icon-frames canvas[data-frame-id="' + frameId + '"]');
                    if (frameCanvas) {
                        updateFrameCanvas(editorCache[openedPoseId].selectedImage, frameCanvas);
                    }
                    setTimeoutSave();
                    
                    iconCanvas.style.setProperty('cursor', 'none');
                    iconCanvas.nextElementSibling.style.setProperty('opacity', '1');
                    setTimeout(function() {
                        iconCanvas.style.removeProperty('cursor');
                        iconCanvas.nextElementSibling.style.removeProperty('opacity');
                    }, 500);
                }
            });

            app.appendChild(editCard);
            
            let editorCache = {};
            let openedCharacterId;
            let openedCharacter = {};
            let openedPoseId;
            let loadingPoseId;
            let saveTimeout = null;
            function saveFunc(poseId, characterId) {
                saveTimeout = null;
                editorCache.saving = true;
                chrome.storage.local.get('icon-editor', function(storage) {
                    storage = verifyStructure(storage['icon-editor'], {
                        characters: {},
                        underlays: {},
                        overlays: {},
                    });
                    storage.characters[characterId] = verifyStructure(storage.characters[characterId], {
                        icons: {},
                        frames: {},
                    });
                    storage.overlays = {...storage.overlays, ...editorCache.storageCache.overlays};
                    storage.underlays = {...storage.underlays, ...editorCache.storageCache.underlays};
                    for (let obj in [storage.overlays, storage.underlays]) {
                        for (let key of Object.keys(obj)) {
                            if (!obj[key]) delete obj[key];
                        }
                    }

                    const iconData = editorCache[poseId].data;
                    if (iconData) {
                        storage.characters[characterId].icons[poseId] = iconData;
                    } else {
                        delete storage.characters[characterId].icons[poseId];
                    }
                    storage.characters[characterId].frames = {...storage.characters[characterId].frames, ...editorCache.storageCache.characters[characterId].frames};
                    
                    const usedFrameIDs = {};
                    for (let iconData of Object.values(storage.characters[characterId].icons)) {
                        const frameId = iconData.frame;
                        usedFrameIDs[frameId] = true;
                    }
                    for (let id of Object.keys(storage.characters[characterId].frames)) {
                        if (!storage.characters[characterId].frames[id].hidden) continue;
                        if (!(id in usedFrameIDs)) delete storage.characters[characterId].frames[id];
                    }

                    editorCache.storageCache = storage;
                    chrome.storage.local.set({'icon-editor': storage}, function() {
                        editorCache.saving = false;
                    });
                });
                chrome.storage.local.get('icon-renders', function(storage) {
                    const renderStorage = storage['icon-renders'] || {};
                    renderStorage[poseId] = iconRenders[poseId];
                    if (renderStorage[poseId] === undefined) delete renderStorage[poseId];
                    chrome.storage.local.set({'icon-renders': renderStorage});
                });
            }
            function setTimeoutSave() {
                clearTimeout(saveTimeout);
                const poseId = openedPoseId;
                const characterId = openedCharacterId;
                saveTimeout = setTimeout(() => saveFunc(poseId, characterId), 5000);
            }

            editCard.querySelector('i.hil-pose-icon-delete').addEventListener('click', function() {
                if (openedPoseId) {
                    editorCache[openedPoseId].data = undefined;
                    iconRenders[openedPoseId] = undefined;
                    const poseIcon = document.querySelector('.p-image[data-pose-id="' + openedPoseId + '"]');
                    if (poseIcon) poseIcon.src = hilUtils.transparentGif;
                }
                for (let poseId in editorCache.storageCache.characters[openedCharacterId].icons) {
                    if (Number(poseId) === openedPoseId) continue;
                    const icon = document.querySelector('.p-image[data-pose-id="' + poseId + '"]');
                    if (icon) {
                        icon.click();
                        return;
                    }
                }

                clearTimeout(saveTimeout);
                saveFunc(openedPoseId, openedCharacterId);
                editCard.classList.add('hil-hide');
            });

            async function drawIcon(canvas, poseId) {
                const img = editorCache[poseId].selectedImage;
                if (img) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    const characterData = Object.values(editorCache.storageCache.characters).find(character => poseId in character.icons);
                    const frame = characterData.frames[
                        editorCache[poseId].data.frame
                    ];
                    const frameLeft = img.naturalWidth * Number(frame.left);
                    const frameTop = img.naturalHeight * Number(frame.top);
                    const frameHeight = img.naturalHeight * Number(frame.height);
                    const scaler = canvas.height / frameHeight;
                    
                    ctx.imageSmoothingQuality = "high";
                    for (let id of editorCache[poseId].data.underlays) {
                        const layer = editorCache.storageCache.underlays[id];
                        if (layer === undefined) continue;
                        const layerImg = new Image();
                        const promise = new Promise(resolve => layerImg.onload = resolve);
                        layerImg.src = layer.src;
                        await promise;
                        ctx.drawImage(layerImg, canvas.width - layerImg.naturalWidth, canvas.height - layerImg.naturalHeight);
                    }
                    ctx.drawImage(img, -frameLeft * scaler, -frameTop * scaler, img.naturalWidth * scaler, img.naturalHeight * scaler);
                    for (let id of editorCache[poseId].data.overlays) {
                        const layer = editorCache.storageCache.overlays[id];
                        if (layer === undefined) continue;
                        const layerImg = new Image();
                        const promise = new Promise(resolve => layerImg.onload = resolve);
                        layerImg.src = layer.src;
                        await promise;
                        ctx.drawImage(layerImg, canvas.width - layerImg.naturalWidth, canvas.height - layerImg.naturalHeight);
                    }

                    iconRenders[poseId] = canvas.toDataURL();
                    const icon = document.querySelector('img.p-image[data-pose-id="' + poseId + '"]');
                    if (icon && icon.dataset.hilIconOverwritten === '1') icon.src = iconRenders[poseId];
                }
            }

            function updateFrameCanvas(img, canvas) {
                const frame = editorCache.storageCache.characters[openedCharacterId].frames[canvas.dataset.frameId];
                if (!frame || frame.hidden) return;

                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.height = img.naturalHeight;
                canvas.width = img.naturalWidth;

                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.fillRect(0, 0, img.naturalWidth, img.naturalHeight);

                const frameLeft = img.naturalWidth * Number(frame.left);
                const frameTop = img.naturalHeight * Number(frame.top);
                const frameHeight = img.naturalHeight * Number(frame.height);
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = "#000";
                ctx.fillRect(frameLeft, frameTop, frameHeight, frameHeight);

                ctx.globalCompositeOperation = 'destination-over';
                ctx.drawImage(img, 0, 0);

                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = "#2096f3";
                ctx.lineWidth = canvas.height * 0.05;
                ctx.strokeRect(frameLeft - ctx.lineWidth * 0.5, frameTop - ctx.lineWidth * 0.5, frameHeight + ctx.lineWidth, frameHeight + ctx.lineWidth);
            }

            function onSliderSet(frameTimestamp) {
                const currentId = openedPoseId;
                let animTimestamp = frameTimestamp;
                if (frameTimestamp <= editorCache[openedPoseId].preFrames.length) {
                    messageAnim.innerHTML = '<b>Pre</b> animation';
                    editorCache[openedPoseId].data.animType = AnimType.PRE;
                } else if (frameTimestamp <= editorCache[openedPoseId].preFrames.length + editorCache[openedPoseId].idleFrames.length) {
                    messageAnim.innerHTML = '<b>Idle</b> animation';
                    editorCache[openedPoseId].data.animType = AnimType.IDLE;
                    animTimestamp -= editorCache[openedPoseId].preFrames.length;
                } else {
                    messageAnim.innerHTML = '<b>Talking</b> animation';
                    editorCache[openedPoseId].data.animType = AnimType.SPEAK;
                    animTimestamp -= editorCache[openedPoseId].preFrames.length;
                    animTimestamp -= editorCache[openedPoseId].idleFrames.length;
                }
                editorCache[openedPoseId].data.animTimestamp = animTimestamp;

                const img = new Image();
                img.onload = function() {
                    editorCache[currentId].selectedImage = img;
                    for (let canvas of frameDiv.querySelectorAll('canvas')) {
                        updateFrameCanvas(editorCache[currentId].selectedImage, canvas);
                    }
                    drawIcon(iconCanvas, currentId);
                }
                img.src = editorCache[currentId].allFrames[frameTimestamp - 1];
                setTimeoutSave();
            }
            slider.addEventListener('mousedown', function (event) {
                if (editorCache[openedPoseId].frameMax) sliderListener(event, slider.parentElement, 1, editorCache[openedPoseId].frameMax, onSliderSet);
            });

            function addDivider(leftPercent) {
                const divider = htmlToElement(`<div class="v-slider__track-fill hil-slider-divider" style="left: ${leftPercent}%;"></div>`);
                slider.querySelector('.v-slider__track-container').appendChild(divider);
                return divider;
            }

            function addFrame(frameId) {
                const frameContainer = htmlToElement(`
                    <div>
                        <canvas data-frame-id="${frameId}" height="192" width="256"></canvas>
                        <button class="v-btn v-btn--has-bg hil-icon-button hil-icon-button-corner hil-themed ${getTheme()}">
                            <i class="v-icon notranslate mdi mdi-delete hil-themed ${getTheme()}"></i>
                        </button>
                    </div>
                `);
                const frameCanvas = frameContainer.querySelector('canvas');
                frameCanvas.addEventListener('click', function() {
                    editorCache[openedPoseId].data.frame = frameId;
                    frameDiv.querySelector('.hil-selected')?.classList.remove('hil-selected');
                    frameContainer.classList.add('hil-selected');
                    drawIcon(iconCanvas, openedPoseId);

                    let count = 0;
                    for (let pose of Object.values(editorCache.storageCache.characters[openedCharacterId].icons)) {
                        if (pose.frame === frameId) count += 1;
                    }
                    if (count === 1) messageFrameUses.innerHTML = '<b>1</b> icon is affected by this frame';
                    else messageFrameUses.innerHTML = '<b>' + count + '</b> total icons are affected by this frame';
                    setTimeoutSave();
                });
                
                let deleteTimeout;
                frameContainer.querySelector('.mdi-delete').addEventListener('mousedown', function() {
                    frameCanvas.classList.add('hil-pose-edit-image-shake');

                    function documentListener() {
                        clearTimeout(deleteTimeout);
                        frameCanvas.classList.remove('hil-pose-edit-image-shake');
                    }
                    document.addEventListener('mouseup', documentListener, { once: true });

                    deleteTimeout = setTimeout(function() {
                        document.removeEventListener('mouseup', documentListener);
                        editorCache.storageCache.characters[openedCharacterId].frames[frameId].hidden = true;
                        setTimeoutSave();
                        frameContainer.classList.add('hil-hide');
                        setTimeout(function() {
                            frameContainer.classList.add('d-none');
                            frameContainer.classList.remove('hil-hide');
                        }, 280);
                    }, 3000);
                });
                frameDiv.insertBefore(frameContainer, frameDiv.querySelector(':scope > i'));
                return frameCanvas;
            }

            frameDiv.querySelector('.mdi-plus-box').addEventListener('click', function() {
                const frames = editorCache.storageCache.characters[openedCharacterId].frames;
                const currentFrameId = editorCache[openedPoseId].data.frame;
                for (let i = 0; i < 100000; i++) {
                    if (i in frames) continue;
                    frames[i] = JSON.parse(JSON.stringify(frames[currentFrameId]));
                    delete frames[i].hidden;
                    const frameCanvas = addFrame(i);
                    updateFrameCanvas(editorCache[openedPoseId].selectedImage, frameCanvas);
                    frameCanvas.click();
                    break;
                }
            });
            
            function addLayerIcon(layerId, layer, layerType) {
                const iconContainer = htmlToElement(
                    `<div class="hil-layer-icon" data-id="${layerId}">
                        <img src="${layer.src}">
                        <button class="v-btn v-btn--has-bg hil-icon-button hil-icon-button-corner hil-themed ${getTheme()}">
                            <i class="v-icon notranslate mdi mdi-archive hil-themed ${getTheme()}"></i>
                        </button>
                        <button class="v-btn v-btn--has-bg hil-icon-button hil-icon-button-corner hil-hide hil-themed ${getTheme()}" style="right:0;left:unset;">
                            <i class="v-icon notranslate mdi mdi-delete hil-themed ${getTheme()}"></i>
                        </button>
                    </div>`
                );
                iconContainer.addEventListener('click', function() {
                    iconContainer.classList.toggle('hil-selected');
                    if (iconContainer.classList.contains('hil-selected')) {
                        if (!editorCache[openedPoseId].data[layerType].includes(layerId)) editorCache[openedPoseId].data[layerType].push(layerId);
                    } else {
                        const index = editorCache[openedPoseId].data[layerType].indexOf(layerId);
                        if (index >= 0) editorCache[openedPoseId].data[layerType].splice(index, 1)
                    }
                    drawIcon(iconCanvas, openedPoseId);
                    setTimeoutSave();
                });
                if (editorCache[openedPoseId]?.data[layerType].includes(layerId)) iconContainer.classList.add('hil-selected');
                
                const archiveButton = iconContainer.querySelector('.mdi-archive').parentElement;
                archiveButton.addEventListener('click', function(event) {
                    const layerParent = iconContainer.parentElement;
                    const hidden = !editorCache.storageCache[layerType][layerId].hidden;
                    editorCache.storageCache[layerType][layerId].hidden = hidden;
                    if (hidden) {
                        archiveButton.classList.remove('mdi-archive');
                        archiveButton.classList.add('mdi-archive-off');
                        iconContainer.classList.add('hil-layer-hidden');
                        if (!layerParent.querySelector(':scope > .mdi-archive').classList.contains('hil-activated')) iconContainer.classList.add('hil-hide');
                        layerParent.appendChild(iconContainer);
                        iconContainer.querySelector('.mdi-delete').parentElement.classList.remove('hil-hide');
                    } else {
                        archiveButton.classList.add('mdi-archive');
                        archiveButton.classList.remove('mdi-archive-off');
                        iconContainer.classList.remove('hil-layer-hidden');
                        iconContainer.classList.remove('hil-hide');
                        layerParent.prepend(iconContainer);
                        iconContainer.querySelector('.mdi-delete').parentElement.classList.add('hil-hide');
                    }
                    event.stopPropagation();
                });

                let deleteTimeout;
                iconContainer.querySelector('.mdi-delete').parentElement.addEventListener('mousedown', function() {
                    iconContainer.querySelector('img').classList.add('hil-pose-edit-image-shake');

                    function documentListener() {
                        clearTimeout(deleteTimeout);
                        iconContainer.querySelector('img').classList.remove('hil-pose-edit-image-shake');
                    }
                    document.addEventListener('mouseup', documentListener, { once: true });

                    deleteTimeout = setTimeout(function() {
                        document.removeEventListener('mouseup', documentListener);
                        if (iconContainer.classList.contains('hil-selected')) iconContainer.click();
                        editorCache.storageCache[layerType][layerId] = undefined;
                        drawIcon(iconCanvas, openedPoseId);
                        setTimeoutSave();
                        iconContainer.classList.add('hil-hide');
                        setTimeout(function() {
                            iconContainer.remove();
                        }, 280);
                    }, 3000);
                });

                return iconContainer;
            }

            for (let [ layerParent, layerType ] of [[overlayDiv, 'overlays'], [underlayDiv, 'underlays']]) {
                layerParent.querySelector('.mdi-plus-box').addEventListener('click', function() {
                    layerParent.querySelector('input').click();
                });
                const archiveButton = layerParent.querySelector(':scope > .mdi-archive');
                archiveButton.addEventListener('click', function() {
                    archiveButton.classList.toggle('hil-activated');
                    const func = archiveButton.classList.contains('hil-activated') ? 'remove' : 'add';
                    layerParent.querySelectorAll('.hil-layer-hidden').forEach(elem => elem.classList[func]('hil-hide'));
                });
                const input = layerParent.querySelector('input');
                input.addEventListener('change', function() {
                    if (!editorCache.storageCache) return;
                    if (!input.files || !input.files[0]) return;
    
                    const reader = new FileReader();
                      
                    reader.addEventListener("load", function(event) {
                        const src = event.target.result;
                        if (src.slice(0, 11) !== 'data:image/') return;
                        const img = new Image();
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = 64;
                            canvas.height = 64;
                            let scaler;
                            if (img.naturalWidth > img.naturalHeight) {
                                scaler = canvas.height / img.naturalWidth;
                            } else {
                                scaler = canvas.height / img.naturalHeight;
                            }
                            const width = img.naturalWidth * scaler;
                            const height = img.naturalHeight * scaler
                            ctx.imageSmoothingQuality = "high";
                            ctx.drawImage(img, canvas.width - width, canvas.height - height, width, height);

                            const layerSrc = canvas.toDataURL();
                            const layerId = Date.now() - 1660899999999;
                            editorCache.storageCache[layerType][layerId] = {
                                src: layerSrc,
                                hidden: false,
                            }
                            setTimeoutSave();
                            const icon = addLayerIcon(layerId, editorCache.storageCache[layerType][layerId], layerType);
                            layerParent.prepend(icon);
                        }
                        img.src = src;
                    }); 
                      
                    reader.readAsDataURL(input.files[0]);
                });
            }

            const imageCache = {};
            async function fetchImage(url) {
                if (!url) {
                    return null;
                } else if (url in imageCache) {
                    return imageCache[url];
                } else {
                    const b64image = await chrome.runtime.sendMessage(["fetch-image", url]);
                    imageCache[url] = b64image;
                    return b64image;
                }
            }

            window.addEventListener('message', function(event) {
                const [action, pose] = event.data;
                if (action !== 'set_pose') return;
                if (editCard.classList.contains('hil-hide')) return;
                
                poseNameDiv.innerText = 'Icon: ' + pose.name;

                editCard.querySelectorAll('.hil-hide-on-load').forEach(elem => elem.classList.add('hil-hide'));
                errorMessage.classList.add('hil-hide');
                poseLoadIcon.classList.remove('hil-hide');

                loadingPoseId = pose.id;

                if (openedPoseId !== pose.id && saveTimeout) {
                    clearTimeout(saveTimeout);
                    saveFunc(openedPoseId, openedCharacterId);
                }

                if (pose.iconUrl) {
                    poseLoadIcon.classList.add('hil-hide');
                    errorMessage.querySelector('span').innerText = 'Pose already includes icon';
                    errorMessage.classList.remove('hil-hide');
                    return;
                }

                chrome.storage.local.get('icon-editor', function(storage) {
                    if (loadingPoseId !== pose.id) return;

                    if (editorCache.saving) {
                        storage = editorCache.storageCache;
                    } else {
                        const exists = storage['icon-editor'];
                        storage = verifyStructure(storage['icon-editor'], {
                            characters: {},
                            underlays: {},
                            overlays: {},
                        });
                        if (!exists) {
                            storage.overlays = {
                                0: {
                                    "src": "data:image/png;base64,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"
                                },
                                1: {
                                    "hidden": true,
                                    "src": "data:image/png;base64,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"
                                },
                                2: {
                                    "hidden": true,
                                    "src": "data:image/png;base64,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"
                                },
                                3: {
                                    "hidden": true,
                                    "src": "data:image/png;base64,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"
                                },
                                4: {
                                    "hidden": true,
                                    "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAACehJREFUeF7tWHtMVFcaP6NchLGdQVpklZ1WRGYcHZiBzM6AylKQgigVymPTFdEmLbtsfGyyMZiQ7D/7h4bEP0x0G2ssW6rW3dKhgF3sQFGiDTK8mamsDA+LO2lZYnn4uAgjM5vv5n7k9GaYzIjtP3MnOblzzz3nfOf7fb/vcY6EBPhPEuD6ExEAkQEBjoDoAgFOADEIii4gukCAIyC6QIATQMwCoguILhDgCIguEOAEELOA6AKiCwQ4AqILBDgBxCwguoDoAgGOgOgCAU4AMQuILvALuIA/ILt/gf38RIQ/m/N3b8td+0WBsdQ+uPWXu8mlQHnR6/oLhs/yfR7oo/k9reerDH+VFI73Vc7P5gLCDdDvwm++KOvLGF/s4g0Y93Oh5kGqJ2Wxz1cZtMJC5f0Fw5sxcPsvLAYIlacVh/++AOBJeezzpPxSgPhqiMW1fdmcN5p5Uh6VXsErLwTBm0LwjVacfod9+MKEpQzgyQ2X5QJLKQ+KCxs9dinLorLwdPHKCgH5CX29uCKCDk/aEPR8Ts7zMsCT8rTSKwkh2IQb8KYUKI5NCATNAG8uIGQg7ktoBJCzsFwAaGEoKIgQImwIAm1lIRNo5RcoILyxgQZCaHXcDxiCBgGBBRnPBYAnHwMBIAgUZ/gWTAiBBu/wDecJFaJBgU09g43xTyEj6LHCmEAbg2agkImwBq7v9JcBQuqjZWnlVxFCoIXwDUAAYGAs/GiKe1IeAHBSQCAbvLkEVrW01YUsRCOAfJAxD80fALz5PVoelAXFpVQLpViAANBK0ZQExaHB5mgQvDEB3UCoPDIRnggGyoe1n0JbDgBCgbTyLxFCXh4dHd0fHR1dClJZlv0uMTHxb4ODg5zv8c3d2dlp0Ov1f4ExDofjokKhqEbr8CDgWHQd4RMAQPov6YZ2u313bGzsn0HO+Ph49bp16z6AbfkKwFIpD/0LUAbLg7VBeRkhRD44OPh7pVJZgrmno6Pjc6PR2EYB4Lp165Zux44df4Ax9+7dq9m4ceO/CCFzAhbQDKABwP8wHeMQHYPAFbk4ZLVaM+Li4jhjOByOKwqF4jwh5PFyAEAGgEC0/mqwPCEkjBASfufOnaItW7b8DgFwOp1saWnpB9XV1SwPgqulpUWdnp6+D8bY7fYvVSpVHQ8AgIABkc4K6DJ0LBECgAEYngAC093dnZKYmFgMA8fGxkwbNmyoIoQ89AUA4RhhtEUA0PpyUJ4Q8orVas2Pi4t7my5Y7Ha7VaVStWIwvHbt2qZdu3bthTEDAwNfb9269SuKAQiANwbANwSAjkV0Fgpqb283Go3GfBg4MjLSsGnTpk8IIdPLAQDpD0IBZQh8YH0A4BVCSERfX1+eVqt9i4s8LtfCihUrVrrdbvepU6caysvLf4Rq7+rVq6/n5ORkwBir1fqNVqsFcNAFFkwm0+spKSkpcrl8A8MwLz979uzx9PS0vampqWn//v3fUeUx6BJUVlYmO378+J7169drGYZ5iWXZSavV2uVyudzbt2/fDXKGhoYalUrlZULIpL8A4Hg6AAIDaADWIAA9PT15CQkJnFCr1XonLi5OLZFIVkxMTExERkaCou66urpf5+bmbocxvb29nYmJiRAjuCxgs9m2aTSaN2gG4X+32+3q6uqqMxgMt5EBJSUlq8+dO/cnqVQaIZzDsuy0VCoF1wQAzEql8goh5McXDQAEPxDyKjCAByAbhJrN5o6oqKg1Go0mFt5NJlNXYWHh9yaTaV1+fv5voK+7u7tfr9d3AQD19fWKvXv35kD/06dPHzY0NDTW1dV9X1xc/FpmZuZuhmGAce4rV658sm/fvv9CELTb7W/GxsZya83MzExUVVVdt9lss0ePHtXodDqun481zSqV6p+EkAcvGgBwAWTA2p6enlxkgNlstpw9e/Z/NTU1WSEhIatYlp3Nzs6+deTIkYjCwsIE2FhHR8e3RqOxHwCYmprKCQsL4yx56dKlL0pKSkBJzt/NZrMqMzOTA/bBgwdjERERX0AqnJubKw0ODgZgyMmTJz+rqKiYwQp0fHw8KzIyUgHf7t69+7Varf5ZAIAUCAzgYkBvb2+eTqfjrNjU1NSWlZXlaGxs3JSdnZ3IKzwyNjb2uKioSAvvFovlP0lJSdacnByIDe9An9PpfBocHAy1AWQCruhJSkpa2dbW9keJRCKB2LJ27drzeXl5oRcuXHiXZwwbGhoKCi56jMVi0RgMBuNyAYD5eMSk63+IAZAFMAhCFni1v7//7fj4+FyY1NLScjMjI2MsPDw8eGho6M3w8PDwhYUFV1tb21BKSoqKB2TAaDTaysvLV1VWVuZB36NHj6ZkMlkNdUTm9jA/P/8uwzBQe5D8/PyqzZs3h5w4cYJLpw8fPpySy+XACvhx5XZra6syNTX1t5QLQAzw2wUQAAQBMgGdBqEOgCwAbhBus9kKNBpNAUxqbW1tTktLG4Ga4cyZM+sOHz7MUdjpdDoZhoE1SGdn57cGg6E/PT3d3dLSsp9iwMc0AMCA27dvl8F3ngEfZmVlrbp8+fJ70Dc3N8eGhIRAlEcAXL29vQk6nY5jAB8EP/U1CKLSSCdhHQBpkC6DuSoQQBgYGChSq9UclW/evHk1NTX1LgI2OjqaER0draRoCkGwV6/Xd0MBNDMzUyiTySCYQgz4vKSkxIEuwMcALrtMTEzci4yM5GLAkydP3pNKpSAfYsCnFRUVk/z6rsnJyYI1a9ZE8QBAGrzkaxpcCgAAQngKhADEnQP4UvgdpVJ5ABZob2//LDk5GQIcV6oeOnQo7PTp0+8HBQWB+3C//v7+dp1Ox5XK169f35KWlrYH+mdnZ2caGhq+rK2t/eHAgQOQBfYwDLMaaoqLFy/+4+DBgwCOxGazpWo0Go7m09PTP5w/f/7fg4OD7LFjx/RqtXobyuELIYgrU75kAdryNBjCWgBYAHFgEYTh4eHimJiY92FSd3f3x3q9voO+M+jr63tDq9XuQgE2m+16fHz8DaT78PBwdkxMTArNEvwPdYDFYjElJydbeGZIdu7cGVxbW1smk8leE85hWXZCKpWuhX6+FP4IsuXzAIAg0HEAS1AMhtxx+P79+wcVCsUhmGCz2f4eHx9/i2aN0WhcdePGjb+Ghob+CsbwZ4FGTHfQV19fr9y2bVuqXC6PCQoKWqwEm5ubvyouLh6jYgO3n6KiotDKysqcqKgoA8Mwsvn5+SmHw9HV19fXX1BQcBzW5A9DH0KM9QcA2vrC6yc8b2P9jSdDeHKHEepShC6hYR5eWcH6wtsiWs6i8XmL0+cD/IaZCddE/fAWCO4BoMyGw9gTaM8LgJAFIFgIwuJJjFKedhv62oreKH1pigDQ4ON34c0SfSdA3wFCP54g8SYILkNmof0fcGbVIWfLSGUAAAAASUVORK5CYII="
                                },
                                5: {
                                    "hidden": true,
                                    "src": "data:image/png;base64,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"
                                }
                            };
                        }
                    }

                    if (editorCache.storageCache === undefined) {
                        for (let [ layerStorage, layerParent, layerType ] of [[storage.overlays, overlayDiv, 'overlays'], [storage.underlays, underlayDiv, 'underlays']]) {
                            const ids = Object.keys(layerStorage).sort();
                            for (let id of ids.reverse()) {
                                const layer = layerStorage[id];
                                if (layer.hidden) continue;
                                const icon = addLayerIcon(id, layer, layerType);
                                layerParent.prepend(icon);
                            }
                            for (let id of ids) {
                                const layer = layerStorage[id];
                                if (!layer.hidden) continue;
                                const icon = addLayerIcon(id, layer, layerType);
                                icon.classList.add('hil-layer-hidden');
                                icon.classList.add('hil-hide');
                                const archiveButton = icon.querySelector('.mdi-archive').parentElement;
                                archiveButton.classList.remove('mdi-archive');
                                archiveButton.classList.add('mdi-archive-off');
                                icon.querySelector('.mdi-delete').parentElement.classList.remove('hil-hide');
                                layerParent.appendChild(icon);
                            }
                        }
                    }

                    let characterData = storage.characters[pose.characterId];
                    if (characterData === undefined) {
                        characterData = {
                            icons: {},
                            frames: {
                                0: {
                                    top: 0.1,
                                    left: 0.1,
                                    height: 0.8,
                                },
                            },
                        }
                        storage.characters[pose.characterId] = characterData;
                    }
                    window.postMessage(['set_custom_icon_characters', Object.keys(storage.characters)]);

                    if (openedCharacterId !== pose.characterId) {
                        for (let child of frameDiv.querySelectorAll(':scope > :not(i)')) {
                            child.remove();
                        }
                        for (let id in characterData.frames) {
                            const frameCanvas = addFrame(Number(id));
                            if (characterData.frames[id].hidden) frameCanvas.parentElement.classList.add('d-none');
                        }
                        frameDiv.appendChild(frameDiv.querySelector(':scope > i'));
                    }
                    
                    let iconData = characterData.icons[pose.id];
                    if (iconData === undefined) {
                        iconData = {
                            frame: 0,
                            overlays: [],
                            underlays: [],
                            animTimestamp: 1,
                            animType: AnimType.IDLE,
                        }
                        if (openedCharacterId === pose.characterId && editorCache[openedPoseId]?.data?.frame) {
                            iconData.frame = editorCache[openedPoseId]?.data?.frame;
                        }
                        characterData.icons[pose.id] = iconData;
                    }
                    if (!(pose.id in editorCache)) editorCache[pose.id] = {};
                    editorCache[pose.id].data = iconData;
                    editorCache.storageCache = storage;

                    for (let [ layerParent, layerType ] of [[overlayDiv, 'overlays'], [underlayDiv, 'underlays']]) {
                        for (let layerDiv of layerParent.children) {
                            if (iconData[layerType].includes(layerDiv.dataset.id)) {
                                layerDiv.classList.add('hil-selected');
                            } else {
                                layerDiv.classList.remove('hil-selected');
                            }
                        }
                    }

                    const promises = [fetchImage(pose.idleImageUrl), fetchImage(pose.speakImageUrl)];
                    for (let state of pose.states) {
                        promises.push(
                            fetchImage(state.imageUrl)
                        );
                    }
                    Promise.allSettled(promises).then(function(images) {
                        if (loadingPoseId !== pose.id) return;
                        openedPoseId = pose.id;
                        openedCharacterId = pose.characterId;
                        openedCharacter = pose.character;
                        frameDiv.querySelector('canvas[data-frame-id="' + iconData.frame + '"]')?.click();

                        editorCache[pose.id].preFrames = [];
                        editorCache[pose.id].idleFrames = [];
                        editorCache[pose.id].talkFrames = [];
                        for (let i = 0; i < images.length; i++) {
                            let frameList = editorCache[pose.id].preFrames;
                            if (i === 0) frameList = editorCache[pose.id].idleFrames;
                            else if (i === 1) frameList = editorCache[pose.id].talkFrames;

                            const image = images[i].value;
                            if (image) frameList.push(image);
                        }
                        editorCache[pose.id].frameMax = editorCache[pose.id].preFrames.length + editorCache[pose.id].idleFrames.length + editorCache[pose.id].talkFrames.length;
                        editorCache[pose.id].allFrames = editorCache[pose.id].preFrames.concat(editorCache[pose.id].idleFrames).concat(editorCache[pose.id].talkFrames);
                        let frameTimestamp = iconData.animTimestamp;
                        if (iconData.animType === AnimType.IDLE) frameTimestamp += editorCache[pose.id].preFrames.length;
                        if (iconData.animType === AnimType.SPEAK) frameTimestamp += editorCache[pose.id].idleFrames.length;
                        setSlider(slider, frameTimestamp, 1, editorCache[pose.id].frameMax);
                        onSliderSet(frameTimestamp);

                        slider.querySelectorAll('.hil-slider-divider').forEach(elem => elem.remove());
                        if (editorCache[pose.id].preFrames.length > 0) {
                            addDivider(editorCache[pose.id].preFrames.length / editorCache[pose.id].frameMax * 100);
                        }
                        if (editorCache[pose.id].talkFrames.length > 0) {
                            addDivider((editorCache[pose.id].preFrames.length + editorCache[pose.id].idleFrames.length) / editorCache[pose.id].frameMax * 100);
                        }

                        poseLoadIcon.classList.add('hil-hide');
                        errorMessage.classList.add('hil-hide');
                        editCard.querySelectorAll('.hil-hide-on-load').forEach(elem => elem.classList.remove('hil-hide'));
                    });
                });

            });

            exportCard = htmlToElement(/*html*/`
                <div class="hil-hide hil-pose-edit-card hil-icon-export-card hil-themed ${getTheme()}">
                    <div>
                        <div class="d-flex">
                            <div class="headline hil-pose-title">Export Options</div>
                            <div class="hil-close-button">Close</div>
                        </div>
                        <hr class="v-divider hil-themed ${getTheme()}">
                        <div class="mb-2 hil-hide-on-load hil-export-method-dropdown">
                            <label for="hil-export-method" class="hil-dropdown-label v-label v-label--active hil-themed ${getTheme()}">Export method</label>
                            <i class="v-icon notranslate mdi mdi-menu-down hil-themed ${getTheme()}"></i>
                            <select id="hil-export-method" class="hil-dropdown hil-themed ${getTheme()}">
                                <option value="zip">Download in ZIP</option>
                                <option value="discord">Host on discord</option>
                            </select>
                        </div>
                        <div class="v-messages v-messages__message hil-hide-on-load hil-themed ${getTheme()}">To import the icons back, keep the file names the same</div>
                        <div id="hil-discord-webhook" class="hil-export-textbox hil-hide-on-load d-none">
                            <label for="hil-export-method" class="hil-dropdown-label v-label v-label--active hil-themed theme--dark">Webhook URL</label>
                            <input class="mt-4 hil-row-textbox v-size--default v-sheet--outlined hil-themed hil-themed-text ${getTheme()}" placeholder="Paste URL here...">
                            <div class="v-messages v-messages__message hil-themed ${getTheme()}">Open the settings of your hosting channel > Integrations > Webhooks > New Webhook > Copy Webhook URL</div>
                        </div>
                        <div class="my-4 hil-hide-on-load hil-icon-export-buttons"></div>
                        <div class="hil-card-centered v-progress-circular v-progress-circular--indeterminate">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="23 23 46 46">
                                <circle fill="transparent" cx="46" cy="46" r="20" stroke-width="6" class="v-progress-circular__overlay"></circle>
                            </svg>
                        </div>
                    </div>
                </div>
            `);

            exportCard.querySelector('.hil-close-button').addEventListener('click', () => exportCard.classList.add('hil-hide'));

            exportButtons.appendChild(createButton(
                function() {
                    if (!openedPoseId) return;
                    const icon = document.querySelector('img.p-image[data-pose-id="' + openedPoseId + '"]');
                    if (icon.dataset.hilIconOverwritten !== '1') return;
                    const a = document.createElement('a');
                    a.href = iconRenders[openedPoseId];
                    a.download = openedPoseId + '.png';
                    a.click();
                },
                'Export One',
            ));
            exportButtons.appendChild(createButton(
                function() {
                    if (!(openedCharacterId && editorCache.storageCache?.characters[openedCharacterId]?.icons)) return;
                    editCard.classList.add('hil-hide');
                    exportCard.style.left = editCard.style.left;
                    exportCard.style.top = editCard.style.top;
                    exportCard.classList.remove('hil-hide');
                    exportCard.classList.remove('hil-export-loading');
                },
                'Export All',
            ));
            
            const methodDropdown = exportCard.querySelector('.hil-export-method-dropdown select');
            const messageFileName = exportCard.querySelector('.v-messages');
            const discordInput = exportCard.querySelector('#hil-discord-webhook');
            methodDropdown.addEventListener('input', function() {
                if (methodDropdown.value === 'zip') {
                    messageFileName.classList.remove('d-none');
                    discordInput.classList.add('d-none');
                } else if (methodDropdown.value === 'discord') {
                    messageFileName.classList.add('d-none');
                    discordInput.classList.remove('d-none');
                } else {
                    messageFileName.classList.add('d-none');
                    discordInput.classList.add('d-none');
                }
            });

            exportCard.querySelector('.hil-icon-export-buttons').appendChild(createButton(
                function() {
                    if (!(openedCharacterId && editorCache.storageCache?.characters[openedCharacterId]?.icons)) return;
                    const poseIds = {};
                    for (let poseId in editorCache.storageCache.characters[openedCharacterId].icons) {
                        if (!iconRenders[poseId]) continue;
                        const icon = document.querySelector('img.p-image[data-pose-id="' + poseId + '"]');
                        if (icon.dataset.hilIconOverwritten !== '1') continue;
                        poseIds[poseId] = iconRenders[poseId];
                    }

                    if (methodDropdown.value === 'zip') {
                        exportCard.classList.add('hil-export-loading');
                        function exportZip() {
                            window.postMessage(['zip_pose_icons', Object.keys(poseIds)]);
                        }

                        if (!states.jsZipLoaded) {
                            states.jsZipLoaded = true;
                            injectScript(chrome.runtime.getURL('inject/jsZip.min.js'));
                            window.addEventListener('message', function listener(event) {
                                const [action] = event.data;
                                if (action !== 'loaded_jszip') return;
                                window.removeEventListener('message', listener);
                                exportZip();
                            });
                        } else {
                            exportZip();
                        }
                    } else if (methodDropdown.value === 'discord') {
                        let url;
                        try {
                            url = new URL(discordInput.querySelector('input').value);
                        } catch {}
                        if (url.hostname !== 'discord.com' || url.pathname.slice(0, 14) !== '/api/webhooks/') return;

                        exportCard.classList.add('hil-export-loading');

                        function dataURLtoFile(dataurl, filename) {
                            // Source: https://stackoverflow.com/questions/35940290
                            let arr = dataurl.split(','),
                                mime = arr[0].match(/:(.*?);/)[1],
                                bstr = atob(arr[1]), 
                                n = bstr.length, 
                                u8arr = new Uint8Array(n);
                                
                            while(n--){
                                u8arr[n] = bstr.charCodeAt(n);
                            }
                            
                            return new File([u8arr], filename, {type:mime});
                        }

                        const attachmentLists = [];
                        const chunkCount = Math.ceil(Object.keys(poseIds).length / 10);
                        let messagesProcessed = 0;
                        let urlList = '';
                        for (let chunk = 0; chunk < chunkCount; chunk++) {
                            const formData = new FormData();
                            for (let i = 0; i < 10; i++) {
                                const id = Object.keys(poseIds)[i + chunk * 10];
                                if (!id) break;
                                const img = poseIds[id];
                                const file = dataURLtoFile(img, id + '.png');
                                formData.append("file[" + i + "]", file);
                            }
                            formData.append("content", "Pose icons: " + openedCharacter.name);

                            fetch(url.href + '?wait=true', {
                                method: 'post',
                                body: formData
                            })
                            .then(response => response.text())
                            .then(function(response) {
                                messagesProcessed += 1;
                                const message = JSON.parse(response);
                                attachmentLists.push(message.attachments);
                                if (messagesProcessed >= chunkCount) {
                                    attachmentLists.forEach(list => list.forEach(function(attachment) {
                                        urlList += attachment.url + '\n';
                                    }));
                                    window.postMessage(['set_pose_icon_url_list', urlList]);
                                    exportCard.classList.add('hil-hide');
                                }
                            });
                        }
                    }
                },
                'Export',
            ));

            app.appendChild(exportCard);

        }, { once: true });
        
        editButton.addEventListener('click', function() {
            window.postMessage(['get_current_pose']);
            if (editCard.classList.contains('hil-hide')) {
                const poseSelector = document.querySelector('.col-sm-9.col-10 > div > div.swiper-container,.col-sm-9.col-10 > div > div.v-text-field').parentElement;
                const rect = poseSelector.getClientRects()[0];
                editCard.style.left = rect.x + rect.width + 10 + 'px';
                if (rect.y + editCard.clientHeight < document.body.clientHeight) {
                    editCard.style.top = rect.y + 'px';
                } else {
                    editCard.style.top = document.body.clientHeight - editCard.clientHeight + 'px';
                }
                editCard.classList.remove('hil-hide');
            } else {
                editCard.classList.add('hil-hide');
            }
            exportCard.classList.add('hil-hide');
        });

        window.addEventListener('message', function(event) {
            const [action, data] = event.data;
            if (action !== 'check_iconless_pose_ids') return;
            for (let poseId in data) {
                if (!(poseId in iconRenders)) continue;
                window.postMessage(['warn_unexported_icons']);
                break;
            }
        });
    }


    themeUpdate();


}



wrapperLoaded = new Promise(function(resolve) {
    window.addEventListener('message', function listener(event) {
        const [action] = event.data;
        
        if (action === 'wrapper_loaded') {
            resolve();
            optionsLoaded.then(function(options) {
                window.postMessage([
                    'set_options',
                    options
                ]);
            });
            window.removeEventListener('message', listener);
        }
    });
});


window.addEventListener('load', function() {
    if (!tryMain()) {
        new MutationObserver(function(mutations, observer) {
            if (tryMain()) observer.disconnect();
        }).observe(document.getElementById('app'), {
            childList: true,
            subtree: true,
        });
    }
});

chrome.runtime.onMessage.addListener(function(event) {
    const [ action, data ] = event;
    if (action == "courtroom_state_loaded") {
        tryMain();
    }
});

function tryMain() {
    if (document.querySelector('.frameTextarea')) {
        optionsLoaded.then(function(options) {
            onLoad(options);
        });
        return true;
    }
    return false;
}
