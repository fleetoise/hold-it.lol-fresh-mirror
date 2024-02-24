"use strict";

const { addMessageListener, addMessageListenerAll, compareShallow, setValue, getLabel, createButton, createIcon, createTooltip, setSlider, sliderListener, htmlToElement, wait, fixTagNesting, getHTMLOfSelection, createSwitch } = hilUtils;

function main() {

    const socketStates = {
        options: undefined
    }
    socketStates.optionsLoaded = new Promise(function (resolve, reject) {
        socketStates.optionsLoadedResolve = resolve;
    });
    const modifierKeys = {};
    const muteCharacters = {
        defense: { characterId: 669437, poseId: 8525792 },
        prosecution: { characterId: 669438, poseId: 8525810 },
        witness: { characterId: 669439, poseId: 8525809 },
        counsel: { characterId: 669440, poseId: 8525795 },
        judge: { characterId: 669441, poseId: 8525794 },
        fallback: { characterId: 669439, poseId: 8525809 },
    }

    const app = document.querySelector('#app');
    const appState = app.__vue__.$store.state;
    const socket = document.querySelector('.v-main__wrap > div').__vue__.$socket;
    const roomInstance = document.querySelector('div.v-card--flat.v-sheet[style="max-width: 960px;"]').parentElement.__vue__;
    const toolbarInstance = document.querySelector('div.v-card--flat.v-sheet[style="max-width: 960px;"] header').__vue__.$parent; // toolbarInstance.$snotify.info(''); toolbarInstance.$snotify.warning(''); toolbarInstance.$snotify.error(''); toolbarInstance.$snotify.success(''); 
    const characterInstance = document.querySelector('.v-main__wrap > div > div.row > div:nth-child(1) > div').__vue__;
    const characterListInstance = document.querySelector('div.v-main__wrap > div > div.text-center').__vue__;
    const userInstance = document.querySelector('.v-main__wrap > div').__vue__;
    const poseInstance = document.querySelector('.col-sm-9.col-10 > div > div.swiper-container,.col-sm-9.col-10 > div > div.v-text-field').parentElement.__vue__;
    const courtContainer = document.querySelector('.court-container');
    const frameInstance = courtContainer.parentElement.parentElement.__vue__;
    const chatInstance = document.querySelector('.chat').parentElement.__vue__;
    const getLastTabInstance = () => document.querySelector('.v-window.v-item-group.v-tabs-items').firstElementChild.lastElementChild.firstElementChild.__vue__;
    function getAssetManagerInstance() {
        return app.__vue__.$children.find(function(component) {
            const tag = component.$vnode.tag;
            const name = tag.slice(tag.lastIndexOf('-'));
            return name === '-assetsManager';
        });
    }
    let muteInputInstance;
    for (let label of document.querySelectorAll('.v-select--chips.v-text-field label')) {
        if (label.textContent !== 'Muted Users') continue;
        muteInputInstance = label.parentElement.parentElement.parentElement.parentElement.__vue__;
        break;
    }

    const themeInput = (getLabel('Dark Mode') || getLabel('Light Mode')).parentElement.querySelector('input');
    function getTheme() {
        if (themeInput.ariaChecked == "true") {
            return 'theme--dark';
        } else {
            return 'theme--light';
        }
    }

    function getPresetCharacterFromPose(poseId) {
        const presetChar = characterListInstance.allCharacters.find(
            char => char.poses.find(
                pose => pose.id === poseId
            ) !== undefined
        );
        if (presetChar) return presetChar;
        else return null;
    }

    function getFrameCharacterId(frame) {
        if (frame.characterId >= 1000) return frame.characterId;

        return getPresetCharacterFromPose(frame.poseId).id;
    }

    function getMuteCharacter(charId, poseId) {
        let muteCharacter;
        if (frameInstance.customCharacters[charId]) {
            muteCharacter = muteCharacters[frameInstance.customCharacters[charId].side];
        } else if (charId < 1000) {
            muteCharacter = muteCharacters[characterListInstance.allCharacters[charId].side];
        } else if (charId === null) {
            muteCharacter = muteCharacters[getPresetCharacterFromPose(poseId).side];
        } else {
            muteCharacter = muteCharacters.fallback;
        }
        return muteCharacter
    }

    function getIDFromUsername(username, userList = muteInputInstance.items) {
        return userList.find(user => user.username === username)?.id;
    }

    const customPoseIconCCs = {};
    function updateCustomPoseIconCCs() {
        if (socketStates['customIconCharacters'] === undefined) return;
        for (let id in customPoseIconCCs) {
            if (socketStates['customIconCharacters'].includes(id)) continue;
            const character = characterListInstance.customList.find(character => character.id === Number(id));
            if (character === undefined) continue;
            if (character.poses[0].iconUrl === hilUtils.transparentGif) character.poses[0].iconUrl = '';
        }
        for (let id of socketStates['customIconCharacters']) {
            const character = characterListInstance.customList.find(character => character.id === Number(id));
            if (character === undefined) continue;
            if (character.poses[0] === undefined) continue;
            if (character.poses[0].iconUrl) continue;
            character.poses[0].iconUrl = hilUtils.transparentGif;
            customPoseIconCCs[character.id] = true;
        }
    }

    function preloadHiddenCharacters() {
        frameInstance.customCharacters[669437] = {
            "partial": true,
            "id": 669437,
            "name": "Hidden (Defense)",
            "namePlate": "Hidden",
            "side": "defense",
            "blipUrl": "/Audio/blip.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 189,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525792,
                    "name": "Stand",
                    "idleImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/DefenseA.webp",
                    "speakImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/DefenseB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669437
                }
            ],
            "bubbles": []
        };
        frameInstance.customCharacters[669438] = {
            "partial": true,
            "id": 669438,
            "name": "Hidden (Prosecution)",
            "namePlate": "Hidden",
            "side": "prosecution",
            "blipUrl": "/Audio/blip.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 194,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525810,
                    "name": "Stand",
                    "idleImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/ProsecutionA.webp",
                    "speakImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/ProsecutionB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669438
                }
            ],
            "bubbles": []
        };
        frameInstance.customCharacters[669439] = {
            "partial": true,
            "id": 669439,
            "name": "Hidden (Witness)",
            "namePlate": "Hidden",
            "side": "witness",
            "blipUrl": "/Audio/blip-female.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 197,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525809,
                    "name": "Stand",
                    "idleImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/WitnessA.webp",
                    "speakImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/WitnessB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669439
                }
            ],
            "bubbles": []
        };
        frameInstance.customCharacters[669440] = {
            "partial": true,
            "id": 669440,
            "name": "Hidden (Counsel)",
            "namePlate": "Hidden",
            "side": "counsel",
            "blipUrl": "/Audio/blip.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 187,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525795,
                    "name": "Stand",
                    "idleImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/CounselA.webp",
                    "speakImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/CounselB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669440
                }
            ],
            "bubbles": []
        };
        frameInstance.customCharacters[669441] = {
            "partial": true,
            "id": 669441,
            "name": "Hidden (Judge)",
            "namePlate": "Hidden",
            "side": "judge",
            "blipUrl": "/Audio/blip.wav",
            "iconUrl": null,
            "galleryImageUrl": null,
            "galleryAJImageUrl": null,
            "backgroundId": 192,
            "limitWidth": true,
            "alignment": null,
            "offsetX": 0,
            "offsetY": 0,
            "objectionVolume": 1,
            "poses": [
                {
                    "id": 8525794,
                    "name": "Stand",
                    "idleImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/JudgeA.webp",
                    "speakImageUrl": "https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Characters/Hidden/JudgeB.webp",
                    "isSpeedlines": false,
                    "iconUrl": "",
                    "order": 0,
                    "musicFileName": "Trial",
                    "states": [],
                    "audioTicks": [],
                    "functionTicks": [],
                    "characterId": 669441
                }
            ],
            "bubbles": []
        };
        if (socketStates.options['reload-ccs']) {
            socketStates.noReloadCCs[669437] = true;
            socketStates.noReloadCCs[669438] = true;
            socketStates.noReloadCCs[669439] = true;
            socketStates.noReloadCCs[669440] = true;
            socketStates.noReloadCCs[669441] = true;
        }
    }


    window.postMessage(['wrapper_loaded']);
    addMessageListenerAll(window, async function(action, data) {
        if (action === 'set_options') {
            socketStates.options = data;
            socketStates.optionsLoadedResolve();
        } else if (action === 'set_socket_state') {
            for (const key in data) {
                socketStates[key] = data[key];
            }
        } else if (action === 'snotify') {
            toolbarInstance.$snotify[data[0]](...data.slice(1));
        } else if (action === 'clear_testimony_poses') {
            socketStates.testimonyPoses = {};
        } else if (action === 'clear_testimony_pose') {
            delete socketStates.testimonyPoses[data];
        } else if (action === 'fullscreen_button_added') {
            const presentButton = document.querySelector('[hil-button="present-evd"]');
            const fullscreenButton = document.querySelector('[hil-button="fullscreen-evd"]');
            presentButton.__vue__.$watch('classes', function () {
                fullscreenButton.className = presentButton.className;
            });
        } else if (action === 'set_preload') {
            appState.courtroom.settings.preloadEnabled = data;
        } else if (action === 'reload_ccs') {
            for (let id in frameInstance.customCharacters) {
                if (!(id in socketStates.noReloadCCs)) {
                    delete frameInstance.customCharacters[id];
                }
            };
        } else if (action === 'set_custom_icon_characters') {
            socketStates['customIconCharacters'] = data;
            updateCustomPoseIconCCs();
        } else if (action === 'zip_pose_icons') {
            const zip = new JSZip();
            for (let poseId of data) {
                const icon = document.querySelector('img.p-image[data-pose-id="' + poseId + '"]');
                if (!icon) continue;
                zip.file(
                    poseId + ".png",
                    icon.src.slice(22),
                    {base64: true}
                );
            }

            zip.generateAsync({type:"blob"}).then(function (blob) {
                const a = document.createElement('a');
                const url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = 'icons.zip';
                a.click();
                window.URL.revokeObjectURL(url);
            });

            document.querySelector('.hil-icon-export-card').classList.add('hil-hide');
        } else if (action === 'set_pose_icon_url_list') {
            characterListInstance.showAssets();
            await wait();
            const component = getAssetManagerInstance();
            if (component) {
                let char = characterInstance.currentCharacter;
                component.selectCharacter(char.id);
                component.$refs.characterPreviewer.manageCharacter();
                await new Promise(function(resolve) {
                    new MutationObserver(function(mutationRecord, observer) {
                        for (let mutation of mutationRecord) {
                            for (let elem of mutation.target.querySelectorAll('.v-window-item')) {
                                const toolbar = elem.parentElement.parentElement.parentElement.querySelector('.v-toolbar__title');
                                if (!toolbar) continue;
                                const label = toolbar.textContent;
                                const index = Array.from(elem.parentElement.childNodes).indexOf(elem);
                                if (label === 'Manage Character') {
                                    observer.disconnect();
                                    resolve();
                                }
                            }
                        }
                    }).observe(app, {
                        childList: true,
                        subtree: true,
                    });
                });
                const tabs = document.querySelectorAll('.v-slide-group__content.v-tabs-bar__content .v-tab');
                Array.from(tabs).find(tab => tab.textContent === 'Poses').click();
                await wait();
                const textArea = document.querySelector('textarea.hil-pose-icon-import');
                textArea.value = data;
                const button = document.querySelector('button.hil-pose-icon-import');
                button.click();
            }
        } else if (action === 'warn_unexported_icons') {
            socketStates['lastShareContent'].textContent += '(Warning: Has un-exported custom icons)';
        }
    });

    socketStates.optionsLoaded.then(function () {
        if (socketStates.options['testimony-mode']) socketStates['testimonyPoses'] = {};
        if (socketStates.options['list-moderation'] && socketStates.options['mute-character']) socketStates['mutedCharUsers'] = {};
        if (socketStates.options['remute']) socketStates.mutedLeftCache = {};
        if (socketStates.options['reload-ccs']) socketStates.noReloadCCs = {};
        if (socketStates.options['mute-character']) {
            socketStates['hiddenLeftCache'] = {};
            preloadHiddenCharacters(frameInstance);
        }

        app.__vue__.$watch('$store.state.assets.character.loading', function(charactersLoading) {
            if (charactersLoading) return;
            if (socketStates.options['reload-ccs']) {
                for (let character of appState.assets.character.customList) {
                    socketStates.noReloadCCs[character.id] = true;
                };
            }
        })

        if (socketStates.options['save-last-character']) {
            const storedId = localStorage['hil-last-character-id'];
            if (storedId >= 1000) {
                characterListInstance.customList.push(JSON.parse(localStorage['hil-last-cc-json']));
                characterListInstance.setCustomCharacter(storedId);
            } else if (storedId > 1) {
                characterListInstance.setCharacter(storedId);
            }

            characterInstance.$watch('currentCharacter.id', function (id) {
                localStorage['hil-last-character-id'] = id;
                if (id < 1000) return;
                localStorage['hil-last-cc-json'] = JSON.stringify(characterInstance.currentCharacter);
            });
        }
        
        if (socketStates.options['now-playing']) {
            frameInstance.$watch('musicPlayer.currentMusicUrl', function(url) {
                const musicObj = Object.values(frameInstance.$parent.$parent.musicCache).find(music => music.url === url);
                const musicSpan = document.querySelector('div.hil-tab-row-now-playing > span');
                if (musicObj && musicObj.name) {
                    const text = musicObj.name ? musicObj.name : 'Unnamed';
                    musicSpan.innerHTML = 'Now Playing: <b>"<a target="_blank" href="' + musicObj.url + '">' + text + '</a>"</b>';
                } else {
                    musicSpan.innerHTML = 'Now Playing: …';
                }
            });
        }

        if (socketStates.options['tts']) {
            const dialogueBox = document.querySelector('.v-main div.chat-box');
            let lastProcessedFrame;
            new MutationObserver(function (mutations) {
                for (let mutation of mutations) {
                    if (dialogueBox.style.display !== '') continue;
                    if (frameInstance.frame === lastProcessedFrame) continue;
                    window.postMessage([
                        'talking_started',
                        {
                            plainText: frameInstance.plainText,
                            characterId: getFrameCharacterId(frameInstance.frame),
                            username: frameInstance.frame.username,
                        }
                    ]);
                    lastProcessedFrame = frameInstance.frame;
                }
            }).observe(
                dialogueBox,
                {
                    childList: true,
                    subtree: true,
                }
            );
        }

        if (socketStates.options['list-moderation'] || socketStates.options['chat-moderation']) {
            function userActionButton(onclick, iconName, tooltipText = null, classText = '', cssText = '') {
                const button = document.createElement('button');
                button.className = classText + ' v-btn v-btn--has-bg hil-icon-button hil-icon-button-hover hil-themed ' + getTheme();
                if (cssText) button.style.cssText = cssText;

                button.appendChild(createIcon(iconName));

                if (onclick) button.addEventListener('click', () => onclick(button));
                if (tooltipText) {
                    button.addEventListener('mouseenter', function () {
                        if (button.tooltip === undefined) button.tooltip = createTooltip(tooltipText, button);
                        button.tooltip.realign();
                        button.tooltip.classList.remove('hil-hide');
                    });
                    button.addEventListener('mouseleave', () => button.tooltip.classList.add('hil-hide'));
                }

                return button;
            }

            function userActionButtonSet(usernameGetter, constantId = false) {
                const container = document.createElement('div');
                container.className = 'hil-user-action-buttons';

                const initialId = getIDFromUsername(usernameGetter());
                container.dataset.userId = initialId;
                const getId = function () {
                    if (constantId) return initialId;
                    return getIDFromUsername(usernameGetter());
                }

                const isMod = roomInstance.users.find(user => user.id === initialId)?.isMod;
                const isMuted = muteInputInstance.selectedItems.find(item => item.username === usernameGetter());

                container.appendChild(userActionButton(function () {
                    const id = getId();
                    if (id === undefined) return;

                    const mods = roomInstance.users.filter(user => user.isMod).map(user => user.id);
                    if (!mods.includes(id)) {
                        mods.push(id);
                        toolbarInstance.$snotify.info(`Made ${usernameGetter()} a moderator.`);
                    } else {
                        mods.splice(mods.indexOf(id), 1);
                        toolbarInstance.$snotify.info(`${usernameGetter()} is no longer a moderator.`);
                    }

                    socket.emit('set_mods', mods);
                },
                    isMod ? 'account-arrow-down' : 'crown',
                    isMod ? 'Remove moderator' : 'Make moderator',
                    'hil-userlist-mod',
                    userInstance.isOwner ? '' : 'display: none;')
                );

                container.appendChild(userActionButton(function () {
                    let banList = getLastTabInstance().getBanUsers.map(user => user.id);
                    banList = banList.filter(id => !roomInstance.users.map(user => user.id).includes(id));
                    banList.push(getId());
                    socket.emit('set_bans', banList);
                    toolbarInstance.$snotify.info(`Banned ${usernameGetter()}.`);
                }, 'skull', 'Ban', 'hil-userlist-ban', userInstance.isOwner || userInstance.isMod ? '' : 'display: none;'));

                container.appendChild(userActionButton(function (button) {
                    const id = getId();
                    if (id === undefined) return;
                    muteInputInstance.selectItem(id);

                    const muted = !muteInputInstance.selectedItems.find(item => item.id === id); // Counter-intuitive but trust it
                    if (muted) {
                        toolbarInstance.$snotify.info(`Muted ${usernameGetter()}.`);
                    } else {
                        toolbarInstance.$snotify.info(`Unmuted ${usernameGetter()}.`);
                    }

                    const mutedIndicatorMethod = muted ? 'add' : 'remove';
                    const unmutedIndicatorMethod = !muted ? 'add' : 'remove';
                    for (let button of document.querySelectorAll('div.hil-user-action-buttons[data-user-id="' + id + '"] .hil-userlist-mute')) {
                        button.querySelector('i').classList[unmutedIndicatorMethod]('mdi-volume-off');
                        button.querySelector('i').classList[mutedIndicatorMethod]('mdi-volume-high');
                        container.parentElement.querySelector('.hil-user-action-icons .mdi-volume-off')?.classList[unmutedIndicatorMethod]('hil-hide');
                        button.tooltip?.realign(muted ? 'Unmute' : 'Mute');
                    }
                },
                    isMuted ? 'volume-high' : 'volume-off',
                    isMuted ? 'Unmute' : 'Mute',
                    'hil-userlist-mute')
                );

                if (socketStates.options['mute-character']) {
                    const isCharacterMuted = initialId in socketStates['mutedCharUsers'];
                    container.appendChild(userActionButton(function (button) {
                        const id = getId();
                        if (id === undefined) return;

                        let currentlyMuted = id in socketStates['mutedCharUsers'];
                        if (currentlyMuted) {
                            delete socketStates['mutedCharUsers'][id];
                            toolbarInstance.$snotify.info(`Unhid ${usernameGetter()}'s character.`);
                        } else {
                            socketStates['mutedCharUsers'][id] = true;
                            toolbarInstance.$snotify.info(`Hid ${usernameGetter()}'s character.`);
                        }

                        for (const mutedId in socketStates['mutedCharUsers']) {
                            if (muteInputInstance.items.find(item => item.id === mutedId)) continue;
                            delete socketStates['mutedCharUsers'][mutedId];
                        }

                        currentlyMuted = id in socketStates['mutedCharUsers'];
                        const mutedIndicatorMethod = currentlyMuted ? 'add' : 'remove';
                        const unmutedIndicatorMethod = !currentlyMuted ? 'add' : 'remove';
                        for (let button of document.querySelectorAll('div.hil-user-action-buttons[data-user-id="' + id + '"] .hil-userlist-mute-char')) {
                            button.querySelector('i').classList[unmutedIndicatorMethod]('mdi-eye-off');
                            button.querySelector('i').classList[mutedIndicatorMethod]('mdi-eye');
                            container.parentElement.querySelector('.hil-user-action-icons .mdi-eye-off')?.classList[unmutedIndicatorMethod]('hil-hide');
                            button.tooltip?.realign(currentlyMuted ? 'Show character' : 'Hide character');
                        }
                    },
                        isCharacterMuted ? 'eye' : 'eye-off',
                        isCharacterMuted ? 'Show character' : 'Hide character',
                        'hil-userlist-mute-char')
                    );
                }

                container.removeWithTooltips = function () {
                    container.querySelectorAll('.hil-icon-button-hover').forEach(button => button.tooltip?.remove());
                    container.remove();
                }
                return container;
            }

            function userActionIconSet() {
                const container = document.createElement('div');
                container.className = 'hil-user-action-icons';
                container.appendChild(createIcon('volume-off', undefined, undefined, 'hil-hide'));
                if (socketStates.options['mute-character']) container.appendChild(createIcon('eye-off', undefined, undefined, 'hil-hide'));
                return container;
            }

            if (socketStates.options['list-moderation']) {
                function processUserListItem(userItem) {
                    const usernameElement = userItem.querySelector('.v-list-item__title');
                    if (usernameElement.innerText === userInstance.currentUser.username) return;
                    userItem.appendChild(userActionButtonSet(() => usernameElement.innerText, true));
                    const icons = userActionIconSet();
                    userItem.appendChild(icons);
                    if (muteInputInstance.selectedItems.find(user => user.username === usernameElement.innerText)) {
                        icons.querySelector('.mdi-volume-off').classList.remove('hil-hide');
                    }
                    if (socketStates.options['mute-character'] && getIDFromUsername(usernameElement.innerText) in socketStates['mutedCharUsers']) {
                        icons.querySelector('.mdi-eye-off').classList.remove('hil-hide');
                    }
                }
                
                function reloadUserList() {
                    for (let userItem of userList.children) {
                        userItem.querySelector('.hil-user-action-buttons')?.removeWithTooltips();
                        userItem.querySelector('.hil-user-action-buttons')?.removeWithTooltips();
                        processUserListItem(userItem);
                    }
                }
                
                let userList;
                const userListButton = document.querySelector('.v-icon--left.mdi-account').parentElement.parentElement;
                userListButton.addEventListener('click', function () {
                    for (let title of document.querySelectorAll('.v-toolbar__title')) {
                        if (title.innerText !== 'Users') continue;
                        
                        userList = title.parentElement.parentElement.parentElement.querySelector('.v-list');
                        for (let userItem of userList.children) {
                            processUserListItem(userItem);
                        }
                        
                        new MutationObserver(function (mutations) {
                            for (let mutation of mutations) {
                                for (let node of mutation.addedNodes) {
                                    processUserListItem(node);
                                }
                                for (let node of mutation.removedNodes) {
                                    node.querySelector('.hil-user-action-buttons')?.removeWithTooltips();
                                    reloadUserList();
                                }
                            }
                        }).observe(
                            userList, { childList: true }
                        );
                        
                        break;
                    }
                });
                
                userInstance.$watch('currentUser', function (user) {
                    if (!document.contains(userList)) return;
                    
                    if (user.isOwner) userList.querySelectorAll('.hil-userlist-mod').forEach(button => button.style.removeProperty('display'));
                    else userList.querySelectorAll('.hil-userlist-mod').forEach(button => button.style.setProperty('display', 'none'));
                    if (user.isOwner || user.isMod) userList.querySelectorAll('.hil-userlist-ban').forEach(button => button.style.removeProperty('display'));
                    else userList.querySelectorAll('.hil-userlist-ban').forEach(button => button.style.setProperty('display', 'none'));
                }, { deep: true });
            }

            if (socketStates.options['chat-moderation']) {
                const chat = document.querySelector('.chat').firstElementChild;
                let gotTo100 = false;
                const chatObserver = new MutationObserver(function(mutations) {
                    for (let mutation of mutations) {
                        if (mutation.target !== chat && !mutation.target.matches('.v-list-item__content') && !mutation.target.parentElement.matches('.v-list-item__content')) continue;

                        if (chat.childElementCount === 100) {
                            if (gotTo100) {
                                chat.firstElementChild.querySelector('.hil-user-action-buttons')?.removeWithTooltips();
                                for (let buttons of chat.querySelectorAll('div.hil-user-action-buttons')) {
                                    buttons.parentElement.previousElementSibling.appendChild(buttons);
                                }
                            }
                            gotTo100 = true;
                        }
                        
                        const messageNode = chat.lastElementChild;
                        if (messageNode.querySelector('i').matches('.mdi-account,.mdi-crown,.mdi-account-tie')) {
                            const username = messageNode.querySelector('.v-list-item__title').innerText;
                            if (username === userInstance.currentUser.username) {
                                const paddingDiv = document.createElement('div');
                                paddingDiv.className = 'hil-user-action-buttons';
                                let buttonCount = 2;
                                if (userInstance.isOwner) buttonCount += 1;
                                if (userInstance.isOwner || userInstance.isMod) buttonCount += 1;
                                paddingDiv.style.width = buttonCount * 42 + "px";
                                paddingDiv.removeWithTooltips = paddingDiv.remove;
                                messageNode.appendChild(paddingDiv);
                            } else {
                                const buttons = userActionButtonSet(() => username, true);
                                messageNode.appendChild(buttons);
                            }
                        }

                        break;
                    }
                });

                chatObserver.observe(chat, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        }

        if (socketStates.options['volume-sliders']) {
            function processVolumeSliders() {
                for (let elem of document.querySelectorAll('.v-input__slider .mdi-volume-source:not([hil-slider-processed="1"])')) {
                    elem.setAttribute('hil-slider-processed', '1');
                    const masterSliderContainer = elem.parentElement.parentElement.parentElement;

                    function customVolumeSlider(iconClass) {
                        const sliderContainer = masterSliderContainer.cloneNode(true);
                        sliderContainer.querySelector('.mdi-volume-source').classList.add(iconClass);
                        sliderContainer.querySelector('.mdi-volume-source').classList.remove('mdi-volume-source');
                        sliderContainer.querySelector('.v-slider__track-background').style.width = '100%';
                        masterSliderContainer.parentElement.appendChild(sliderContainer);
                        return sliderContainer;
                    }
                    const bgsSliderContainer = customVolumeSlider('mdi-volume-high');
                    const bgmSliderContainer = customVolumeSlider('mdi-music');
                    for (let child of masterSliderContainer.parentElement.children) {
                        child.style.marginBottom = '20px';
                    }
                    masterSliderContainer.parentElement.lastElementChild.style.removeProperty('margin-bottom');

                    const masterIcon = masterSliderContainer.querySelector('.mdi-volume-source');
                    masterIcon.classList.remove('mdi');
                    masterIcon.classList.remove('mdi-volume-source');
                    masterIcon.textContent = 'All';
                    masterIcon.style.fontSize = '120%';

                    let bgmVolume = 'hil-bgm-volume' in localStorage ? parseInt(localStorage['hil-bgm-volume']) : 99;
                    let bgsVolume = 'hil-bgs-volume' in localStorage ? parseInt(localStorage['hil-bgs-volume']) : 99;

                    function howlIsMusic(howl) {
                        return howl._loop || howl._src.slice(0, 13) === '/audio/music/';
                    }

                    bgmSliderContainer.querySelector('.v-slider').addEventListener('mousedown', function (event) {
                        sliderListener(event, bgmSliderContainer, 0, 99, function (value) {
                            bgmVolume = value;
                            localStorage['hil-bgm-volume'] = value;
                            for (let howl of Howler._howls) {
                                if (!howlIsMusic(howl)) continue;
                                howl.volume(howl._hilOrigVolume * bgmVolume / 100);
                            }
                        })
                    });
                    setSlider(bgmSliderContainer, bgmVolume, 0, 99);

                    bgsSliderContainer.querySelector('.v-slider').addEventListener('mousedown', function (event) {
                        sliderListener(event, bgsSliderContainer, 0, 99, function (value) {
                            bgsVolume = value;
                            localStorage['hil-bgs-volume'] = value;
                            for (let howl of Howler._howls) {
                                if (howlIsMusic(howl)) continue;
                                howl.volume(howl._hilOrigVolume * bgsVolume / 100);
                            }
                        })
                    });
                    setSlider(bgsSliderContainer, bgsVolume, 0, 99);

                    Howler._howls.push = function (...args) {
                        Array.prototype.push.call(Howler._howls, ...args);
                        for (let howl of Howler._howls) {
                            if (howl._hilProcessed) continue;
                            howl._hilProcessed = true;
                            const getHilVolume = howlIsMusic(howl) ? () => bgmVolume : () => bgsVolume;

                            howl._hilOrigVolume = howl.volume();
                            howl.volume(howl._hilOrigVolume * getHilVolume() / 100);
                            const origFade = howl.fade.bind(howl);
                            howl.fade = function (from, to, dur) {
                                origFade(from * getHilVolume() / 100, to * getHilVolume() / 100, dur);
                            }
                        }
                    };
                }
            }
            processVolumeSliders();
            addMessageListener(window, 'room_spectated', processVolumeSliders);
        }

        let resolvedCharacters = {};
        function resolveCharacter(characterId) {
            return new Promise(function(resolve) {
                if (characterId in resolvedCharacters) {
                    const character = frameInstance.customCharacters[characterId];
                    if (character) {
                        resolve(character);
                    } else {
                        resolve(resolvedCharacters[characterId]);
                    }
                    return;
                }
                
                const character = frameInstance.customCharacters[characterId];
                if (character) {
                    for (let pose of character.poses) {
                        if (pose.states.length === 0) continue;
                        resolvedCharacters[characterId] = character;
                        resolve(character);
                        return;
                    }
                }
                    
                fetch('https://api.objection.lol/character/getcharacters', {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({
                        ids: [characterId]
                    })
                })
                .then(res => res.json())
                .then(function([ character ]) {
                    resolvedCharacters[characterId] = character;
                    resolve(character);
                });
            });
        }
        if (socketStates.options['pose-icon-maker']) {
            function checkIfIconsEditable() {
                const editButton = document.querySelector('.hil-pose-edit-icon');
                if (!editButton) return;
                if (characterInstance.currentCharacter.id > 1000 && characterInstance.currentCharacter.poses.find(pose => !pose.iconUrl)) {
                    editButton.classList.remove('hil-hide');
                } else {
                    editButton.classList.add('hil-hide');
                    const editCard = document.querySelector('.hil-pose-edit-card');
                    if (editCard) document.querySelector('.hil-pose-edit-card').classList.add('hil-hide');
                }
            }
            checkIfIconsEditable();
            characterInstance.$watch('currentCharacter', checkIfIconsEditable);

            function onPoseSet() {
                const characterId = characterInstance.currentCharacter.id;
                const characterResolved = resolveCharacter(characterId);

                characterResolved.then(function(character) {
                    if (character === undefined) return;
                    const currentPose = character.poses.find(
                        pose => pose.id === poseInstance.currentPoseId
                    );
                    if (currentPose === undefined) return;
                    currentPose.character = {
                        name: character.name,
                    }
                    window.postMessage([
                        'set_pose',
                        currentPose,
                    ]);
                });
            }
            onPoseSet();
            poseInstance.$watch('currentPoseId', onPoseSet);

            addMessageListener(window, 'get_current_pose', onPoseSet);

            characterListInstance.$watch('customList', function() {
                updateCustomPoseIconCCs();
            }, { deep: true });

            new MutationObserver(function(mutations) {
                for (let mutation of mutations) {
                    for (let node of mutation.addedNodes) {
                        if (!(node.nodeType === 1 && node.nodeName === 'IMG')) continue;
                        const poseId = node.parentElement.__vue__.poseId;
                        node.dataset.poseId = poseId;
                    }
                }
            }).observe(poseInstance.$el, {
                childList: true,
                subtree: true,
            });
        }

        if (socketStates.options['pose-icon-maker'] || socketStates.options['export-cc-images']) {
            function simplifyPoseName(name) {
                name = name.trim();
                name = name.toLowerCase();
                name = name.replaceAll(/[^a-zA-Z0-9_]/g, '_');
                name = name.replaceAll(/\s+/g, '-');
                return name;
            }

            function getFileNameFromURL(url) {
                return url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
            }

            new MutationObserver(function(mutationRecord) {
                for (let mutation of mutationRecord) {
                    if (socketStates.options['pose-icon-maker']) {
                        for (let node of mutation.addedNodes) {
                            if (!(node.nodeType === 1 && node.nodeName === 'DIV' && node.matches('.v-alert'))) continue;
                            if (!node.querySelector('.mdi-share-circle.success--text')) continue;
                            const content = node.querySelector('.v-alert__content');
                            socketStates['lastShareContent'] = content;
                            
                            let iconlessPoseIds = {};
                            for (let pose of node.__vue__.$parent.selectedCharacter.poses) {
                                if (!pose.iconUrl || pose.iconUrl === hilUtils.transparentGif) iconlessPoseIds[pose.id] = true;
                            }
                            window.postMessage(['check_iconless_pose_ids', iconlessPoseIds]);
                            break;
                        }
                    }
                    for (let elem of mutation.target.querySelectorAll('.v-window-item:not([data-hil-processed])')) {
                        elem.dataset.hilProcessed = '1';
                        const toolbar = elem.parentElement.parentElement.parentElement.querySelector('.v-toolbar__title');
                        if (!toolbar) continue;
                        const label = toolbar.textContent;
                        const index = Array.from(elem.parentElement.childNodes).indexOf(elem);
                        if (label === 'Manage Character' && index === 1) {
                            const col = elem.querySelector('.col');
                            const buttonRow = htmlToElement(/*html*/`
                                <div class="d-flex" style="gap: 4px"></div>
                            `);
    
                            for (let [ condition, className, openText, importText, textareaPlaceholder, descriptionMessage, importCallback ] of [
                                [
                                    socketStates.options['pose-icon-maker'],
                                    "hil-pose-icon-import",
                                    "Pose icon importing",
                                    "Import icons",
                                    "Paste your list of pose icons here, one URL per line.",
                                    "If you exported some icons from the pose icon maker, paste a list of the image file URLs here to add them to the character. Make sure the names are unchanged from how they were exported.",
                                    function(urls) {
                                        const manageCharacterInstance = document.querySelector('#app > div.v-application--wrap > div.container.pa-0.pa-lg-2.container--fluid > div.v-dialog__container').__vue__.$parent;
                                        const char = manageCharacterInstance.editingCharacter;
                                        if (!char) return;
                                        for (let pose of char.poses) {
                                            if (pose.iconUrl) continue;
                                            pose.iconUrl = urls[pose.id];
                                            const edit = app.__vue__.$store._actions['assets/character/editPose'][0];
                                            edit(pose);
                                        }
                                        manageCharacterInstance.goBack();
                                    }
                                ],
                                [
                                    socketStates.options['export-cc-images'],
                                    "hil-pose-image-import",
                                    "Backup pose image importing",
                                    "Import archived pose images",
                                    "Paste your list of pose images, one URL per line.",
                                    "If you archived the character's images, paste a list of the image file URLs here to replace the character's current images. Make sure the archived names are unchanged from how they were saved.",
                                    function(urls) {
                                        const manageCharacterInstance = document.querySelector('#app > div.v-application--wrap > div.container.pa-0.pa-lg-2.container--fluid > div.v-dialog__container').__vue__.$parent;
                                        const char = manageCharacterInstance.editingCharacter;
                                        if (!char) return;
                                        for (let fileName in urls) {
                                            const url = urls[fileName];
                                            const dash1 = fileName.indexOf('-');
                                            const dash2 = fileName.lastIndexOf('-');
                                            const id = fileName.slice(0, dash1);
                                            const name = fileName.slice(dash1 + 1, dash2);
                                            const type = fileName.slice(dash2 + 1);

                                            let pose = char.poses.find(pose => pose.id == id);
                                            if (!pose) {
                                                pose = char.poses.find(pose => simplifyPoseName(pose.name) == name);
                                            };
                                            if (!pose) continue;
                                            
                                            if (type === 'a') {
                                                pose.idleImageUrl = url;
                                            } else if (type === 'b') {
                                                pose.speakImageUrl = url;
                                            } else if (parseInt(type) !== NaN && pose.states[parseInt(type)]) {
                                                pose.states[parseInt(type)].imageUrl = url;
                                            }
                                        }
                                        for (let pose of char.poses) {
                                            const edit = app.__vue__.$store._actions['assets/character/editPose'][0];
                                            edit(pose);
                                        }
                                        manageCharacterInstance.goBack();
                                    },
                                ],
                            ]) {
                                if (!condition) continue;
                                const importDiv = htmlToElement(/*html*/`
                                    <div class="mb-4 hil-import-div d-none" style="transition:var(--default-transition)">
                                        <div class="v-messages v-messages__message mb-2 hil-themed ${getTheme()}" style="font-size: 16px; line-height: 24px">${descriptionMessage}</div>
                                        <textarea class="${className}" placeholder="${textareaPlaceholder}" style="width: 100%;height: 150px;resize: none;padding: 5px 5px 1px;color: #fff;border: thin solid rgba(255, 255, 255, 0.12);border-radius: 0px !important;white-space: nowrap;"></textarea>
                                    </div>
                                `);
                                const textArea = importDiv.querySelector('textarea');
        
                                importDiv.appendChild(hilUtils.createButton(
                                    function() {
                                        const urls = {};
                                        for (let value of textArea.value.split('\n')) {
                                            let url;
                                            try {
                                                url = new URL(value).href;
                                            } catch {}
                                            if (!url) continue;
                                            const fileName = url.slice(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
                                            urls[fileName] = url;
                                        }
                                        importCallback(urls);
                                    },
                                    importText,
                                    'primary mb-2',
                                    'width:100%'
                                ));
                                col.prepend(importDiv);
        
                                const button = hilUtils.createButton(
                                    function() {
                                        const toOpen = importDiv.classList.contains('d-none');
                                        col.querySelectorAll('.hil-import-div').forEach(div => div.classList.add('d-none'));
                                        col.querySelectorAll(':scope > :nth-child(1) > .primary').forEach(div => div.classList.remove('primary'));
                                        if (toOpen) importDiv.classList.remove('d-none');
                                        if (toOpen) button.classList.add('primary');
                                    },
                                    openText,
                                    'mb-2 ' + className,
                                    'height:22.25px!important;flex:1;'
                                );
                                buttonRow.appendChild(button);
                            }

                            col.prepend(buttonRow);
                        } else if (socketStates.options['export-cc-images'] && label === 'My Assets' && index === 1) {
                            const shareButton = elem.querySelector('.v-btn.info');
                            
                            const loadingBarContainer = htmlToElement(/*html*/`
                                <div class="mt-2 hil-cc-loading-bar hil-disabled">
                                    <div style="width: 0%;"></div>
                                    <div class="d-none"></div>
                                </div>
                            `);
                            shareButton.parentElement.parentElement.parentElement.appendChild(loadingBarContainer);
                            const loadingBar = loadingBarContainer.children[0];
                            const loadingScroll = loadingBarContainer.children[1];

                            function toggleLoadingUI(enabled) {
                                button.classList.toggle('v-btn--disabled', enabled);
                                loadingBarContainer.classList.toggle('hil-disabled', !enabled);
                                loadingBar.style.width = '0';
                                if (enabled) loadingScroll.classList.add('d-none');
                            }

                            const button = hilUtils.createButton(
                                async function() {
                                    toggleLoadingUI(true);
                                    const assetManager = getAssetManagerInstance();
                                    if (!assetManager) return;
                                    const characterId = assetManager.$refs.characterPreviewer.selected;
                                    const character = await resolveCharacter(characterId);

                                    const fileUrls = [];
                                    const addFile = (url, name) => fileUrls.push({url, name});
                                    for (let pose of character.poses) {
                                        const id = pose.id;
                                        let name = id + '-' + simplifyPoseName(pose.name);
                                        addFile(pose.idleImageUrl, 'poses/' + name + '-a');
                                        if (pose.speakImageUrl) addFile(pose.speakImageUrl, 'poses/' + name + '-b');
                                        if (pose.iconUrl) addFile(pose.iconUrl, 'icons/' + name);
                                        for (let i = 0; i < pose.states.length; i++) {
                                            const imageUrl = pose.states[i].imageUrl;
                                            addFile(imageUrl, 'poses/' + name + '-' + i);
                                        }
                                        for (let sound of pose.audioTicks) {
                                            if (sound.fileName) addFile(sound.fileName, 'sounds/' + getFileNameFromURL(sound.fileName));
                                        }
                                    }
                                    for (let bubble of character.bubbles) {
                                        const name = simplifyPoseName(bubble.name);
                                        if (bubble.imageUrl) addFile(bubble.imageUrl, 'bubbles/' + name);
                                        if (bubble.soundUrl) addFile(bubble.soundUrl, 'sounds/' + getFileNameFromURL(bubble.soundUrl));
                                    }
                                    for (let item of ['blip', 'galleryAJImage', 'galleryImage', 'icon']) {
                                        const key = item + 'Url';
                                        if (character[key]) addFile(character[key], item);
                                    }

                                    window.postMessage(['fetch_cc_files', fileUrls]);
                                    const files = await new Promise(function(resolve) {
                                        addMessageListener(window, 'cc_files_fetched', function(data) {
                                            resolve(data);
                                        });
                                    });
                                    setTimeout(() => loadingScroll.classList.remove('d-none'), 500);

                                    const zip = new JSZip();
                                    for (let file of files) {
                                        zip.file(file.name, file.array);
                                    }
                                    zip.file('char.json', JSON.stringify(character, null, 4));

                                    zip.generateAsync({type:"blob"}).then(function (blob) {
                                        const a = document.createElement('a');
                                        const url = window.URL.createObjectURL(blob);
                                        a.href = url;
                                        let name = character.name + '.zip';
                                        name = name.replaceAll(/\s/g, ' ');
                                        name = name.replaceAll(/[|~<>?/:*]/g, '');
                                        a.download = name;
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        toggleLoadingUI(false);
                                    });
                                },
                                'Archive'
                            )
                            button.className = 'mt-2 ml-2 v-btn v-btn--has-bg v-size--small hil-cc-arhiver warning hil-themed ' + getTheme();
                            shareButton.parentElement.appendChild(button);
                        }
                    }
                }
            }).observe(app, {
                childList: true,
                subtree: true,
            });
        }

        if (socketStates.options['disable-testimony-shortcut']) {
            const shortcutDiv = document.querySelector('.v-main__wrap > div');
            shortcutDiv.addEventListener('shortkey', function(event) {
                if (event.srcKey !== 't' || event.hilIgnore === true) return;
    
                const newEvent = new CustomEvent('shortkey');
                newEvent.srcKey = event.srcKey;
                newEvent.hilIgnore = true;
                shortcutDiv.dispatchEvent(newEvent);
            });
        }

        if (socketStates.options['unblur-low-res']) {
            function checkImage(node) {
                if (!(node.nodeType === 1 && node.nodeName === 'IMG')) return;
                if (!(node.classList.contains('character') || node.classList.contains('image-sd') || node.classList.contains('custom-bubble'))) return;
                const img = node;
                if (img.naturalHeight <= 300) {
                    img.classList.add('hil-pixel-img');
                } else {
                    img.classList.remove('hil-pixel-img');
                }
            }

            new MutationObserver(function (mutations) {
                for (let mutation of mutations) {
                    if (mutation.type === 'attributes') {
                        checkImage(mutation.target);
                    } else {
                        for (let node of mutation.addedNodes) {
                            checkImage(node);
                        }
                    }
                }
            }).observe(courtContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src'],
            });
        }

        function musicListListener(musicList) {
            if (socketStates.options['ost-pw'] && !musicList.find(music => music.id === 168947)) musicList.push({"id":168947,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Ambience%20-%20Literally%20Just%20Bird%20Noises.mp3","fileSize":2577137,"name":"[PW] Ambience - Literally Just Bird Noises","volume":1},{"id":168948,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Reminiscences%20-%20The%20SL-9%20Incident.mp3","fileSize":3113545,"name":"[PW] Reminiscences - The SL-9 Incident","volume":1},{"id":168949,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Detention%20Center%20-%20The%20Security%20Guards'%20Elegy.mp3","fileSize":2923214,"name":"[PW] Detention Center - The Security Guards' Elegy","volume":1},{"id":168950,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Defendant%20Lobby%20-%20So%20it%20Begins.mp3","fileSize":2526921,"name":"[PW] Defendant Lobby - So it Begins","volume":1},{"id":168951,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Rise%20from%20the%20Ashes%20-%20Ending.mp3","fileSize":4555337,"name":"[PW] Rise from the Ashes - Ending","volume":1},{"id":168952,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Credits%20Theme%20-%20Turnabout%20Sisters%20Instrumental.mp3","fileSize":2996546,"name":"[PW] Credits Theme - Turnabout Sisters Instrumental","volume":1},{"id":168953,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Maya%20Fey%20-%20Turnabout%20Sisters%202001.mp3","fileSize":5668267,"name":"[PW] Maya Fey - Turnabout Sisters 2001","volume":1},{"id":168954,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Damon%20Gant%20-%20Swimming%2C%20Anyone%3F.mp3","fileSize":4536000,"name":"[PW] Damon Gant - Swimming, Anyone?","volume":1},{"id":168955,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Pursuit%20-%20Corner%20the%20Culprit%20(Variation)%20%5BPursuit%202001%5D.mp3","fileSize":3056140,"name":"[PW] Pursuit - Corner the Culprit (Variation) [Pursuit 2001]","volume":1},{"id":168956,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Pursuit%20-%20Corner%20the%20Culprit%20%5BPursuit%202001%5D.mp3","fileSize":3259276,"name":"[PW] Pursuit - Corner the Culprit [Pursuit 2001]","volume":1},{"id":168957,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Dick%20Gumshoe%20-%20That's%20%22Detective%20Gumshoe,%22%20Pal!.mp3","fileSize":3859113,"name":"[PW] Dick Gumshoe - That's \"Detective Gumshoe,\" Pal!","volume":1},{"id":168958,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Heart%20of%20the%20Investigation%20%5BCore%202001%5D.mp3","fileSize":3994301,"name":"[PW] Heart of the Investigation [Core 2001]","volume":1},{"id":168959,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Suspense%202001.mp3","fileSize":2933597,"name":"[PW] Suspense 2001","volume":1},{"id":168960,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/The%20Ballad%20of%20Turnabout%20Sisters.mp3","fileSize":3507191,"name":"[PW] The Ballad of Turnabout Sisters","volume":1},{"id":168961,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Simple%20Folk.mp3","fileSize":2190939,"name":"[PW] Simple Folk","volume":1},{"id":168962,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Marvin%20Grossberg%20-%20Reckonings%20and%20Regrets%20of%20an%20Aged%20Attorney.mp3","fileSize":2920550,"name":"[PW] Marvin Grossberg - Reckonings and Regrets of an Aged Attorney","volume":1},{"id":168963,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Reminiscences%20-%20The%20Class%20Trial.mp3","fileSize":1862309,"name":"[PW] Reminiscences - The Class Trial","volume":1},{"id":168964,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/The%20Steel%20Samurai%20-%20Warrior%20of%20Neo%20Olde%20Tokyo.mp3","fileSize":3524511,"name":"[PW] The Steel Samurai - Warrior of Neo Olde Tokyo","volume":1},{"id":168965,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Jake%20Marshall%20-%20Renegade%20Sheriff.mp3","fileSize":3601621,"name":"[PW] Jake Marshall - Renegade Sheriff","volume":1},{"id":168966,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Court%20is%20Now%20in%20Session%20%5BTrial%202001%5D.mp3","fileSize":3500704,"name":"[PW] Court is Now in Session [Trial 2001]","volume":1},{"id":168967,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Ema%20Skye%202005%20-%20Turnabout%20Sisters.mp3","fileSize":3773103,"name":"[PW] Ema Skye 2005 - Turnabout Sisters","volume":1},{"id":168968,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Reminiscences%20-%20The%20DL-6%20Incident.mp3","fileSize":3578806,"name":"[PW] Reminiscences - The DL-6 Incident","volume":1},{"id":168969,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Phoenix%20Wright%20Ace%20Attorney%20-%20Opening.mp3","fileSize":1356341,"name":"[PW] Phoenix Wright Ace Attorney - Opening","volume":1},{"id":168970,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/The%20Blue%20Badger%20-%20I%20Want%20to%20Protect%20You.mp3","fileSize":1356940,"name":"[PW] The Blue Badger - I Want to Protect You","volume":1},{"id":168971,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Cross-Examination%20-%20Moderato%202001.mp3","fileSize":3536964,"name":"[PW] Cross-Examination - Moderato 2001","volume":1},{"id":168972,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Ringtone%20-%20Phoenix%20Wright.mp3","fileSize":823516,"name":"[PW] Ringtone - Phoenix Wright","volume":1},{"id":168973,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Reminiscences%20-%20The%20Two%20Faces%20of%20a%20Studio.mp3","fileSize":2294376,"name":"[PW] Reminiscences - The Two Faces of a Studio","volume":1},{"id":168974,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Rise%20from%20the%20Ashes%20-%20Opening.mp3","fileSize":738657,"name":"[PW] Rise from the Ashes - Opening","volume":1},{"id":168975,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Initial%20Investigation%20%5BOpening%202001%5D.mp3","fileSize":3213390,"name":"[PW] Initial Investigation [Opening 2001]","volume":1},{"id":168976,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Phoenix%20Wright%20-%20Objection%202001.mp3","fileSize":2845696,"name":"[PW] Phoenix Wright - Objection 2001","volume":1},{"id":168977,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Reminiscences%20-%20Maya's%20Sorrow.mp3","fileSize":3917533,"name":"[PW] Reminiscences - Maya's Sorrow","volume":1},{"id":168978,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Cross-Examination%20-%20Allegro%202001.mp3","fileSize":4600576,"name":"[PW] Cross-Examination - Allegro 2001","volume":1},{"id":168979,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Credits%20Theme%20(Unused).mp3","fileSize":3050374,"name":"[PW] Credits Theme (Unused)","volume":1},{"id":168980,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Victory!%20-%20Our%20First%20Win%20%5BVictory%202001%5D.mp3","fileSize":3539122,"name":"[PW] Victory! - Our First Win [Victory 2001]","volume":1},{"id":168981,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Tricks%20and%20Deductions%20%5BTrick%202001%5D.mp3","fileSize":5519681,"name":"[PW] Tricks and Deductions [Trick 2001]","volume":1},{"id":168982,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Phoenix%20Wright%20Ace%20Attorney%20-%20Ending.mp3","fileSize":5062542,"name":"[PW] Phoenix Wright Ace Attorney - Ending","volume":1},{"id":168983,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/Title%20Theme.mp3","fileSize":5285983,"name":"[PW] Title Theme","volume":1},{"id":168984,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PW/The%20Truth%20Revealed%20%5BTruth%202001%5D.mp3","fileSize":2760056,"name":"[PW] The Truth Revealed [Truth 2001]","volume":1});
            if (socketStates.options['ost-jfa'] && !musicList.find(music => music.id === 168910)) musicList.push({"id":168910,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Heart%20of%20the%20Investigation%20%5BCore%202002%5D.mp3","fileSize":3916232,"name":"[JFA] Heart of the Investigation [Core 2002]","volume":1},{"id":168911,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Magic%20and%20Tricks%20%5BTrick%202002%5D.mp3","fileSize":4098833,"name":"[JFA] Magic and Tricks [Trick 2002]","volume":1},{"id":168912,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Initial%20Investigation%20%5BOpening%202002%5D.mp3","fileSize":2741884,"name":"[JFA] Initial Investigation [Opening 2002]","volume":1},{"id":168913,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Detention%20Center%20-%20The%20Security%20Camera's%20Elegy.mp3","fileSize":4255254,"name":"[JFA] Detention Center - The Security Camera's Elegy","volume":1},{"id":168914,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Ringtone%20-%20Richard%20Wellington.mp3","fileSize":411850,"name":"[JFA] Ringtone - Richard Wellington","volume":1},{"id":168915,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Berry%20Big%20Circus.mp3","fileSize":3578048,"name":"[JFA] Berry Big Circus","volume":1},{"id":168916,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Hotline%20of%20Fate.mp3","fileSize":2109510,"name":"[JFA] Hotline of Fate","volume":1},{"id":168917,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Justice%20for%20All%20-%20Opening.mp3","fileSize":1514558,"name":"[JFA] Justice for All - Opening","volume":1},{"id":168918,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Phoenix%20Wright%20-%20Objection%202002.mp3","fileSize":3009935,"name":"[JFA] Phoenix Wright - Objection 2002","volume":1},{"id":168919,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Justice%20for%20All%20-%20Ending.mp3","fileSize":6006073,"name":"[JFA] Justice for All - Ending","volume":1},{"id":168920,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Psyche-Locks.mp3","fileSize":2676432,"name":"[JFA] Psyche-Locks","volume":1},{"id":168921,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Defendant%20Lobby%20-%20So%20it%20Begins%20Again.mp3","fileSize":2994305,"name":"[JFA] Defendant Lobby - So it Begins Again","volume":1},{"id":168922,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Pearl%20Fey%20-%20With%20Pearly.mp3","fileSize":2468866,"name":"[JFA] Pearl Fey - With Pearly","volume":1},{"id":168923,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Eccentrics.mp3","fileSize":3611608,"name":"[JFA] Eccentrics","volume":1},{"id":168924,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Maya%20Fey%20-%20Turnabout%20Sisters%202002.mp3","fileSize":4153384,"name":"[JFA] Maya Fey - Turnabout Sisters 2002","volume":1},{"id":168925,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/The%20Truth%20Revealed%20%5BTruth%202002%5D.mp3","fileSize":3192943,"name":"[JFA] The Truth Revealed [Truth 2002]","volume":1},{"id":168926,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Court%20is%20Now%20in%20Session%20%5BTrial%202002%5D.mp3","fileSize":3234347,"name":"[JFA] Court is Now in Session [Trial 2002]","volume":1},{"id":168927,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Reminiscences%20-%20Fire-Licked%20Scars.mp3","fileSize":4585534,"name":"[JFA] Reminiscences - Fire-Licked Scars","volume":1},{"id":168928,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Triumphant%20Return%20-%20Franziska%20von%20Karma%20(Variation).mp3","fileSize":2777656,"name":"[JFA] Triumphant Return - Franziska von Karma (Variation)","volume":1},{"id":168929,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Triumphant%20Return%20-%20Miles%20Edgeworth.mp3","fileSize":3036292,"name":"[JFA] Triumphant Return - Miles Edgeworth","volume":1},{"id":168930,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/More%20Simple%20Folk.mp3","fileSize":3056369,"name":"[JFA] More Simple Folk","volume":1},{"id":168931,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Cross-Examination%20-%20Moderato%202002.mp3","fileSize":3083840,"name":"[JFA] Cross-Examination - Moderato 2002","volume":1},{"id":168932,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Reminiscences%20-%20Ballad%20of%20The%20Steel%20Samurai.mp3","fileSize":3950319,"name":"[JFA] Reminiscences - Ballad of The Steel Samurai","volume":1},{"id":168933,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Further%20Investigation%20%5BMiddle%202002%5D.mp3","fileSize":3620732,"name":"[JFA] Further Investigation [Middle 2002]","volume":1},{"id":168934,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Pursuit%20-%20Confront%20the%20Culprit%20(Variation)%20%5BPursuit%202002%5D.mp3","fileSize":3098517,"name":"[JFA] Pursuit - Confront the Culprit (Variation) [Pursuit 2002]","volume":1},{"id":168935,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Fabulous!.mp3","fileSize":542169,"name":"[JFA] Fabulous!","volume":1},{"id":168936,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/One%20Prosecutor's%20Musings%20-%20Until%20We%20Meet%20Again.mp3","fileSize":1811225,"name":"[JFA] One Prosecutor's Musings - Until We Meet Again","volume":1},{"id":168937,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Shelly%20de%20Killer%20-%20A%20Deadly%20Gentleman's%20Delight.mp3","fileSize":3248042,"name":"[JFA] Shelly de Killer - A Deadly Gentleman's Delight","volume":1},{"id":168940,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Cross-Examination%20-%20Allegro%202002.mp3","fileSize":3532763,"name":"[JFA] Cross-Examination - Allegro 2002","volume":1},{"id":168941,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Pursuit%20-%20Confront%20the%20Culprit%20%5BPursuit%202002%5D.mp3","fileSize":3087718,"name":"[JFA] Pursuit - Confront the Culprit [Pursuit 2002]","volume":1},{"id":168942,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Kurain%20Village.mp3","fileSize":3413492,"name":"[JFA] Kurain Village","volume":1},{"id":168943,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Victory!%20-%20Another%20Win%20%5BVictory%202002%5D.mp3","fileSize":4438363,"name":"[JFA] Victory! - Another Win [Victory 2002]","volume":1},{"id":168944,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Triumphant%20Return%20-%20Franziska%20von%20Karma.mp3","fileSize":3221611,"name":"[JFA] Triumphant Return - Franziska von Karma","volume":1},{"id":168945,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/JFA/Reminiscences%20-%20Pure%20Pain.mp3","fileSize":4799137,"name":"[JFA] Reminiscences - Pure Pain","volume":1});
            if (socketStates.options['ost-t&t'] && !musicList.find(music => music.id === 168875)) musicList.push({"id":168875,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Cross-Examination%20-%20Allegro%202004.mp3","fileSize":5641014,"name":"[T&T] Cross-Examination - Allegro 2004","volume":1},{"id":168876,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Court%20is%20Now%20in%20Session%20%5BTrial%202004%5D.mp3","fileSize":4298618,"name":"[T&T] Court is Now in Session [Trial 2004]","volume":1},{"id":168877,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Defendant%20Lobby%20-%20So%20it%20Will%20Always%20Begin.mp3","fileSize":3638939,"name":"[T&T] Defendant Lobby - So it Will Always Begin","volume":1},{"id":168878,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Cross-Examination%20-%20Moderato%202004.mp3","fileSize":6544218,"name":"[T&T] Cross-Examination - Moderato 2004","volume":1},{"id":168879,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Furio%20Tigre%20-%20Swingin'%20Tiger.mp3","fileSize":3784220,"name":"[T&T] Furio Tigre - Swingin' Tiger","volume":1},{"id":168880,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Further%20Investigation%20%5BMiddle%202004%5D.mp3","fileSize":4845847,"name":"[T&T] Further Investigation [Middle 2004]","volume":1},{"id":168881,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Detention%20Center%20-%20The%20Prisoner's%20Elegy.mp3","fileSize":4179989,"name":"[T&T] Detention Center - The Prisoner's Elegy","volume":1},{"id":168882,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Dahlia%20Hawthorne%20-%20The%20Visage%20of%20What%20Once%20Was.mp3","fileSize":2207362,"name":"[T&T] Dahlia Hawthorne - The Visage of What Once Was","volume":1},{"id":168883,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Elise%20Deauxnim%20-%20A%20Gentle%20Melody.mp3","fileSize":5121253,"name":"[T&T] Elise Deauxnim - A Gentle Melody","volume":1},{"id":168884,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Godot%20-%20The%20Fragrance%20of%20Darkness;%20That%20is%20Coffee.mp3","fileSize":4908682,"name":"[T&T] Godot - The Fragrance of Darkness; That is Coffee","volume":1},{"id":168885,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Mask%E2%98%86DeMasque%20-%20Please%20Listen%20to%20Meeeee!.mp3","fileSize":3165729,"name":"[T&T] Mask☆DeMasque - Please Listen to Meeeee!","volume":1},{"id":168886,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Hazakura%20Temple.mp3","fileSize":5319801,"name":"[T&T] Hazakura Temple","volume":1},{"id":168887,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Larry%20Butz%20-%20When%20Something%20Smells,%20It's%20Usually%20Me.mp3","fileSize":3934165,"name":"[T&T] Larry Butz - When Something Smells, It's Usually Me","volume":1},{"id":168888,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Luke%20Atmey%20-%20Look%20at%20Me.mp3","fileSize":3539809,"name":"[T&T] Luke Atmey - Look at Me","volume":1},{"id":168889,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Initial%20Investigation%20%5BOpening%202004%5D.mp3","fileSize":3758314,"name":"[T&T] Initial Investigation [Opening 2004]","volume":1},{"id":168890,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Lordly%20Tailor.mp3","fileSize":4443098,"name":"[T&T] Lordly Tailor","volume":1},{"id":168891,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Phoenix%20Wright%20-%20Objection%202004.mp3","fileSize":3859827,"name":"[T&T] Phoenix Wright - Objection 2004","volume":1},{"id":168892,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Pursuit%20-%20Corner%20the%20Culprit%202004.mp3","fileSize":3463640,"name":"[T&T] Pursuit - Corner the Culprit 2004","volume":1},{"id":168893,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Pursuit%20-%20Catch%20the%20Culprit%20%5BPursuit%202004%5D.mp3","fileSize":4701201,"name":"[T&T] Pursuit - Catch the Culprit [Pursuit 2004]","volume":1},{"id":168894,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Pursuit%20-%20Catch%20the%20Culprit%20(Variation)%20%5BPursuit%202004%5D.mp3","fileSize":4506604,"name":"[T&T] Pursuit - Catch the Culprit (Variation) [Pursuit 2004]","volume":1},{"id":168895,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Pursuit%20-%20Corner%20the%20Culprit%202004%20(Variation).mp3","fileSize":3232487,"name":"[T&T] Pursuit - Corner the Culprit 2004 (Variation)","volume":1},{"id":168896,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Recipe%20for%20Turnabout.mp3","fileSize":1424636,"name":"[T&T] Recipe for Turnabout","volume":1},{"id":168897,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Ringtone%20-%20Godot.mp3","fileSize":1292082,"name":"[T&T] Ringtone - Godot","volume":1},{"id":168898,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Reminiscences%20-%20Violetta%20Vitriol.mp3","fileSize":5296974,"name":"[T&T] Reminiscences - Violetta Vitriol","volume":1},{"id":168899,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Reminiscences%20-%20The%20View%20from%20Dusky%20Bridge.mp3","fileSize":6726275,"name":"[T&T] Reminiscences - The View from Dusky Bridge","volume":1},{"id":168900,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Reminiscences%20-%20The%20Bitterness%20of%20Truth.mp3","fileSize":4557383,"name":"[T&T] Reminiscences - The Bitterness of Truth","volume":1},{"id":168901,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/The%20Stolen%20Turnabout.mp3","fileSize":1296855,"name":"[T&T] The Stolen Turnabout","volume":1},{"id":168902,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Trials%20and%20Tribulations%20-%20Ending.mp3","fileSize":5879849,"name":"[T&T] Trials and Tribulations - Ending","volume":1},{"id":168903,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T%26T/Tre%CC%81s%20Bien.mp3","fileSize":3998161,"name":"[T&T] Trés Bien","volume":1},{"id":168904,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/The%20Truth%20Revealed%20%5BTruth%202004%5D.mp3","fileSize":4059899,"name":"[T&T] The Truth Revealed [Truth 2004]","volume":1},{"id":168905,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Trials%20and%20Tribulations%20-%20Opening.mp3","fileSize":950862,"name":"[T&T] Trials and Tribulations - Opening","volume":1},{"id":168906,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Turnabout%20Memories.mp3","fileSize":918849,"name":"[T&T] Turnabout Memories","volume":1},{"id":168907,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Turnabout%20Beginnings.mp3","fileSize":1597521,"name":"[T&T] Turnabout Beginnings","volume":1},{"id":168908,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Victor%20Kudo%20-%20Martial%20Anthem%20of%20Misery.mp3","fileSize":3473260,"name":"[T&T] Victor Kudo - Martial Anthem of Misery","volume":1},{"id":168909,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/T&T/Victory!%20-%20An%20Eternal%20Win%20%5BVictory%202004%5D.mp3","fileSize":5421220,"name":"[T&T] Victory! - An Eternal Win [Victory 2004]","volume":1});
            if (socketStates.options['ost-aj'] && !musicList.find(music => music.id === 168778)) musicList.push({"id":168778,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Kitaki%20Family.mp3","fileSize":4194763,"name":"[AJ] Kitaki Family","volume":1},{"id":168779,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Drew%20Studio.mp3","fileSize":6304506,"name":"[AJ] Drew Studio","volume":1},{"id":168780,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Lamiroir%20-%20Landscape%20Painter%20in%20Sound.mp3","fileSize":5474227,"name":"[AJ] Lamiroir - Landscape Painter in Sound","volume":1},{"id":168781,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Apollo%20Justice%20Ace%20Attorney%20-%20Opening.mp3","fileSize":1156977,"name":"[AJ] Apollo Justice Ace Attorney - Opening","volume":1},{"id":168782,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Apollo%20Justice%20-%20A%20New%20Era%20Begins!%20%5BObjection%202007%5D.mp3","fileSize":3488909,"name":"[AJ] Apollo Justice - A New Era Begins! [Objection 2007]","volume":1},{"id":168783,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Psyche-Locks%202007.mp3","fileSize":2677831,"name":"[AJ] Psyche-Locks 2007","volume":1},{"id":168784,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/%22Turnabout%20Corner%22.mp3","fileSize":670255,"name":"[AJ] \"Turnabout Corner\"","volume":1},{"id":168785,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Heart%20of%20the%20Investigation%20%5BCore%202007%5D.mp3","fileSize":4203621,"name":"[AJ] Heart of the Investigation [Core 2007]","volume":1},{"id":168786,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/%22Turnabout%20Succession%22%20(I)%20(MASON%20System).mp3","fileSize":1001751,"name":"[AJ] \"Turnabout Succession\" (I) (MASON System)","volume":1},{"id":168787,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Perceive%20-%20Surge,%20Eyes.mp3","fileSize":1818798,"name":"[AJ] Perceive - Surge, Eyes","volume":1},{"id":168788,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Ema%20Skye%202007%20-%20The%20Scientific%20Detective.mp3","fileSize":2901280,"name":"[AJ] Ema Skye 2007 - The Scientific Detective","volume":1},{"id":168789,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Initial%20Investigation%20%5BOpening%202007%5D.mp3","fileSize":2986485,"name":"[AJ] Initial Investigation [Opening 2007]","volume":1},{"id":168790,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Eccentrics%202007.mp3","fileSize":3413660,"name":"[AJ] Eccentrics 2007","volume":1},{"id":168851,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Victory!%20-%20Our%20Win%20%5BVictory%202007%5D.mp3","fileSize":4375969,"name":"[AJ] Victory! - Our Win [Victory 2007]","volume":1},{"id":168852,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Reminiscences%20-%20Wounded%20Foxes.mp3","fileSize":4687041,"name":"[AJ] Reminiscences - Wounded Foxes","volume":1},{"id":168853,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Trucy's%20Theme%20-%20Child%20of%20Magic%202007.mp3","fileSize":3284515,"name":"[AJ] Trucy's Theme - Child of Magic 2007","volume":1},{"id":168854,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Cross-Examination%20-%20Allegro%202007.mp3","fileSize":3170891,"name":"[AJ] Cross-Examination - Allegro 2007","volume":1},{"id":168855,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Troupe%20Gramarye.mp3","fileSize":3729774,"name":"[AJ] Troupe Gramarye","volume":1},{"id":168856,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Detention%20Center%20-%20Tragicomic%20Meeting.mp3","fileSize":7093694,"name":"[AJ] Detention Center - Tragicomic Meeting","volume":1},{"id":168857,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Ringtone%20-%20Klavier%20Gavin.mp3","fileSize":775732,"name":"[AJ] Ringtone - Klavier Gavin","volume":1},{"id":168858,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/The%20Truth%20Revealed%20%5BTruth%202007%5D.mp3","fileSize":3465663,"name":"[AJ] The Truth Revealed [Truth 2007]","volume":1},{"id":168859,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Reminiscences%20-%20Forgotten%20Legend.mp3","fileSize":4763835,"name":"[AJ] Reminiscences - Forgotten Legend","volume":1},{"id":168860,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/%22Turnabout%20Succession%22%20(II).mp3","fileSize":1166856,"name":"[AJ] \"Turnabout Succession\" (II)","volume":1},{"id":168861,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Suspense%202007.mp3","fileSize":1720926,"name":"[AJ] Suspense 2007","volume":1},{"id":168862,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Pursuit%20-%20Overtaken%20%5BPursuit%202007%5D.mp3","fileSize":3262017,"name":"[AJ] Pursuit - Overtaken [Pursuit 2007]","volume":1},{"id":168863,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Klavier%20Gavin%20-%20Guilty%20Love.mp3","fileSize":2994247,"name":"[AJ] Klavier Gavin - Guilty Love","volume":1},{"id":168864,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Cross-Examination%20-%20Moderato%202007.mp3","fileSize":2815968,"name":"[AJ] Cross-Examination - Moderato 2007","volume":1},{"id":168865,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Trance%20Logic%20%5BTrick%202007%5D.mp3","fileSize":3701809,"name":"[AJ] Trance Logic [Trick 2007]","volume":1},{"id":168866,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/The%20Guitar's%20Serenade.mp3","fileSize":5429135,"name":"[AJ] The Guitar's Serenade","volume":1},{"id":168867,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Court%20is%20Now%20in%20Session%20(Variation)%20%5BTrial%202007%5D.mp3","fileSize":4046954,"name":"[AJ] Court is Now in Session (Variation) [Trial 2007]","volume":1},{"id":168868,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Solitary%20Confinement%20-%20Darkness%20Theme.mp3","fileSize":3686691,"name":"[AJ] Solitary Confinement - Darkness Theme","volume":1},{"id":168869,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/The%20Guitar's%20Serenade%20(Instrumental).mp3","fileSize":1134806,"name":"[AJ] The Guitar's Serenade (Instrumental)","volume":1},{"id":168870,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Apollo%20Justice%20Ace%20Attorney%20-%20Ending.mp3","fileSize":4822413,"name":"[AJ] Apollo Justice Ace Attorney - Ending","volume":1},{"id":168871,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Defendant%20Lobby%20-%20New%20Beginning.mp3","fileSize":2270164,"name":"[AJ] Defendant Lobby - New Beginning","volume":1},{"id":168872,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Court%20is%20Now%20in%20Session%20%5BTrial%202007%5D.mp3","fileSize":4160633,"name":"[AJ] Court is Now in Session [Trial 2007]","volume":1},{"id":168873,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Pursuit%20-%20Overtaken%20(Variation)%20%5BPursuit%202007%5D.mp3","fileSize":3111685,"name":"[AJ] Pursuit - Overtaken (Variation) [Pursuit 2007]","volume":1},{"id":168874,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AJ/Reminiscences%20-%20Fate%20Smeared%20by%20Tricks%20and%20Gimmicks.mp3","fileSize":4390161,"name":"[AJ] Reminiscences - Fate Smeared by Tricks and Gimmicks","volume":1});
            if (socketStates.options['ost-dd'] && !musicList.find(music => music.id === 168710)) musicList.push({"id":168710,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Gavinners%20-%20Twilight%20Gig%22.mp3","fileSize":726149,"name":"[DD] \"Gavinners - Twilight Gig\"","volume":1},{"id":168711,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Breakaway%22.mp3","fileSize":769824,"name":"[DD] \"Breakaway\"","volume":1},{"id":168712,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22I,%20Athena,%20Will%20Take%20on%20Your%20Defense%22.mp3","fileSize":724771,"name":"[DD] \"I, Athena, Will Take on Your Defense\"","volume":1},{"id":168713,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22The%20Murder%20Commited%20by%20a%20Youkai%22.mp3","fileSize":311011,"name":"[DD] \"The Murder Commited by a Youkai\"","volume":1},{"id":168714,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22The%20Depths%20of%20the%20Depths%20of%20the%20Heart%22.mp3","fileSize":1052684,"name":"[DD] \"The Depths of the Depths of the Heart\"","volume":1},{"id":168715,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Countdown%20to%20Tomorrow%22.mp3","fileSize":2629495,"name":"[DD] \"Countdown to Tomorrow\"","volume":1},{"id":168716,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Turnabout%20for%20Tomorrow%22.mp3","fileSize":3362810,"name":"[DD] \"Turnabout for Tomorrow\"","volume":1},{"id":168717,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/(Bonus)%20Pursuit%20-%20Last%20Promotion%20Version.mp3","fileSize":5405341,"name":"[DD] (Bonus) Pursuit - Last Promotion Version","volume":1},{"id":168718,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Swashbuckler%20Spectacular%20Song%22%20-%20Athena's%20Sea%20of%20Adventure%20is%20Here!.mp3","fileSize":1391125,"name":"[DD] \"Swashbuckler Spectacular Song\" - Athena's Sea of Adventure is Here!","volume":1},{"id":168719,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Heart%20of%20the%20Investigation%20%5BCore%202013%5D.mp3","fileSize":5847814,"name":"[DD] Heart of the Investigation [Core 2013]","volume":1},{"id":168720,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Florent%20L'Belle%20-%20Je%20Suis%20L'Belle.mp3","fileSize":5262255,"name":"[DD] Florent L'Belle - Je Suis L'Belle","volume":1},{"id":168721,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Athena%20Cykes%20-%20Courtroom%20Re%CC%81volutionnaire.mp3","fileSize":5558008,"name":"[DD] Athena Cykes - Courtroom Révolutionnaire","volume":1},{"id":168722,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Apollo%20Under%20Attack%22.mp3","fileSize":519934,"name":"[DD] \"Apollo Under Attack\"","volume":1},{"id":168723,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Investigation%20-%20Examination.mp3","fileSize":3891911,"name":"[DD] Investigation - Examination","volume":1},{"id":168724,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Illegality%20of%20Fate.mp3","fileSize":4204726,"name":"[DD] Illegality of Fate","volume":1},{"id":168725,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Turnabout%20Reclaimed%22.mp3","fileSize":1753306,"name":"[DD] \"Turnabout Reclaimed\"","volume":1},{"id":168726,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Go%20Forth!%20The%20Amazing%20Nine-Tails.mp3","fileSize":5477581,"name":"[DD] Go Forth! The Amazing Nine-Tails","volume":1},{"id":168727,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Apollo%20Justice%20-%20I'm%20Fine!.mp3","fileSize":5295863,"name":"[DD] Apollo Justice - I'm Fine!","volume":1},{"id":168728,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/(Bonus)%20Pursuit%20-%20Demo%20PV%20Version.mp3","fileSize":2304205,"name":"[DD] (Bonus) Pursuit - Demo PV Version","volume":1},{"id":168729,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22For%20Those%20I%20Must%20Protect%22.mp3","fileSize":654718,"name":"[DD] \"For Those I Must Protect\"","volume":1},{"id":168730,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22The%20Monstrous%20Turnabout%22.mp3","fileSize":1148182,"name":"[DD] \"The Monstrous Turnabout\"","volume":1},{"id":168731,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Prosecutor%20with%20Handcuffs%22.mp3","fileSize":390445,"name":"[DD] \"Prosecutor with Handcuffs\"","volume":1},{"id":168732,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22A%20Splendid%20Visitor%22.mp3","fileSize":1303172,"name":"[DD] \"A Splendid Visitor\"","volume":1},{"id":168733,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Dual%20Destinies%20-%20Opening.mp3","fileSize":3923747,"name":"[DD] Dual Destinies - Opening","volume":1},{"id":168734,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Proof%20of%20Friendship%22.mp3","fileSize":1821906,"name":"[DD] \"Proof of Friendship\"","volume":1},{"id":168735,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Swashbuckler%20Spectacular%20Song%22%20-%20The%20Writer%20Who%20Snatches%20Away%20the%20Truth.mp3","fileSize":1241771,"name":"[DD] \"Swashbuckler Spectacular Song\" - The Writer Who Snatches Away the Truth","volume":1},{"id":168736,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Apollo%20Justice%20-%20A%20New%20Era%20Begins!%202013.mp3","fileSize":6958712,"name":"[DD] Apollo Justice - A New Era Begins! 2013","volume":1},{"id":168737,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/%22Turnabout%20Academy%22.mp3","fileSize":562466,"name":"[DD] \"Turnabout Academy\"","volume":1},{"id":168738,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Defendant%20Lobby%20-%20Tomorrow%20Begins.mp3","fileSize":5142270,"name":"[DD] Defendant Lobby - Tomorrow Begins","volume":1},{"id":168739,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Psyche-Locks%202013.mp3","fileSize":2675697,"name":"[DD] Psyche-Locks 2013","volume":1},{"id":168740,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Mysterious!%20The%20Legend%20of%20Tenma%20Taro.mp3","fileSize":4209484,"name":"[DD] Mysterious! The Legend of Tenma Taro","volume":1},{"id":168741,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Nine-Tails%20Vale%20-%20Hometown%20of%20the%20Yokai.mp3","fileSize":5329288,"name":"[DD] Nine-Tails Vale - Hometown of the Yokai","volume":1},{"id":168742,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Yuri%20Cosmos%20-%20Head%20of%20the%20Center%20of%20the%20Cosmos.mp3","fileSize":6480087,"name":"[DD] Yuri Cosmos - Head of the Center of the Cosmos","volume":1},{"id":168743,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/The%20Dark%20Age%20of%20the%20Law.mp3","fileSize":6501055,"name":"[DD] The Dark Age of the Law","volume":1},{"id":168744,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Shipshape%20Aquarium%20-%20A%20Refreshing%20Sea.mp3","fileSize":6241689,"name":"[DD] Shipshape Aquarium - A Refreshing Sea","volume":1},{"id":168745,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Initial%20Investigation%20%5BOpening%202013%5D.mp3","fileSize":3958612,"name":"[DD] Initial Investigation [Opening 2013]","volume":1},{"id":168746,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Suspense%202013.mp3","fileSize":3068837,"name":"[DD] Suspense 2013","volume":1},{"id":168747,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Court%20is%20Now%20in%20Session%20%5BTrial%202013%5D.mp3","fileSize":5288093,"name":"[DD] Court is Now in Session [Trial 2013]","volume":1},{"id":168748,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Logic%20Trinity%20%5BTrick%202013%5D.mp3","fileSize":4191160,"name":"[DD] Logic Trinity [Trick 2013]","volume":1},{"id":168749,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Dual%20Destinies%20-%20Ending.mp3","fileSize":7328914,"name":"[DD] Dual Destinies - Ending","volume":1},{"id":168750,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Difficult%20Folk.mp3","fileSize":3796787,"name":"[DD] Difficult Folk","volume":1},{"id":168751,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/The%20Truth%20Revealed%20%5BTruth%202013%5D.mp3","fileSize":4123345,"name":"[DD] The Truth Revealed [Truth 2013]","volume":1},{"id":168752,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Reminiscences%20-%20Departure%20from%20Regret.mp3","fileSize":4325799,"name":"[DD] Reminiscences - Departure from Regret","volume":1},{"id":168753,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Pursuit%20-%20Keep%20Pressing%20On%20(Variation)%20%5BPursuit%202013%5D.mp3","fileSize":5120548,"name":"[DD] Pursuit - Keep Pressing On (Variation) [Pursuit 2013]","volume":1},{"id":168754,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Cap'n%20Orla's%20Swashbucklers%20-%20We%20Love%20to%20Sail%20the%20Seven%20Seas.mp3","fileSize":5227289,"name":"[DD] Cap'n Orla's Swashbucklers - We Love to Sail the Seven Seas","volume":1},{"id":168755,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Themis%20Legal%20Academy%20-%20Our%20Precious%20School.mp3","fileSize":4510273,"name":"[DD] Themis Legal Academy - Our Precious School","volume":1},{"id":168756,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Victory!%20-%20Everyone's%20Win%20%5BVictory%202013%5D.mp3","fileSize":3724500,"name":"[DD] Victory! - Everyone's Win [Victory 2013]","volume":1},{"id":168757,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Cross-Examination%20-%20Allegro%202013.mp3","fileSize":4367961,"name":"[DD] Cross-Examination - Allegro 2013","volume":1},{"id":168758,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Robot%20Laboratory%20-%20The%20Past%20That%20Doesn't%20Disappear.mp3","fileSize":6978535,"name":"[DD] Robot Laboratory - The Past That Doesn't Disappear","volume":1},{"id":168759,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Revisualization%20-%20Synaptic%20Resonance.mp3","fileSize":3706789,"name":"[DD] Revisualization - Synaptic Resonance","volume":1},{"id":168760,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Simon%20Blackquill%20-%20Twisted%20Swordsmanship.mp3","fileSize":4252214,"name":"[DD] Simon Blackquill - Twisted Swordsmanship","volume":1},{"id":168761,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Phantom%20-%20UNKNOWN.mp3","fileSize":4668186,"name":"[DD] Phantom - UNKNOWN","volume":1},{"id":168762,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/The%20Cosmic%20Turnabout.mp3","fileSize":696523,"name":"[DD] The Cosmic Turnabout","volume":1},{"id":168763,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Athena%20Cykes%20-%20Let's%20Do%20This!.mp3","fileSize":4789380,"name":"[DD] Athena Cykes - Let's Do This!","volume":1},{"id":168764,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Suspicious%20Folk.mp3","fileSize":3695075,"name":"[DD] Suspicious Folk","volume":1},{"id":168765,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Miles%20Edgeworth%20-%20Triumphant%20Return%202013.mp3","fileSize":5829147,"name":"[DD] Miles Edgeworth - Triumphant Return 2013","volume":1},{"id":168766,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Pearl%20Fey%20-%20With%20Pearly%202013.mp3","fileSize":3638391,"name":"[DD] Pearl Fey - With Pearly 2013","volume":1},{"id":168767,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Cross-Examination%20-%20Moderato%202013.mp3","fileSize":4216709,"name":"[DD] Cross-Examination - Moderato 2013","volume":1},{"id":168768,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Running%20Wild%20-%20Mood%20Matrix%20-%20Get%20a%20Grip%20on%20Yourself!.mp3","fileSize":4532065,"name":"[DD] Running Wild - Mood Matrix - Get a Grip on Yourself!","volume":1},{"id":168769,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Reminiscences%20-%20Wandering%20Heart.mp3","fileSize":4443296,"name":"[DD] Reminiscences - Wandering Heart","volume":1},{"id":168770,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Mood%20Matrix%20-%20Now%20Commencing%20Psychoanalysis.mp3","fileSize":4547987,"name":"[DD] Mood Matrix - Now Commencing Psychoanalysis","volume":1},{"id":168771,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Detention%20Center%20-%20The%20Bulletproof%20Glass's%20Elegy.mp3","fileSize":3155257,"name":"[DD] Detention Center - The Bulletproof Glass's Elegy","volume":1},{"id":168772,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Trucy's%20Theme%20-%20Child%20of%20Magic%202013.mp3","fileSize":3188888,"name":"[DD] Trucy's Theme - Child of Magic 2013","volume":1},{"id":168773,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Bobby%20Fulbright%20-%20In%20Justice%20We%20Trust!.mp3","fileSize":6040784,"name":"[DD] Bobby Fulbright - In Justice We Trust!","volume":1},{"id":168774,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Reminiscences%20-%20A%20Sad%20Memory.mp3","fileSize":5841348,"name":"[DD] Reminiscences - A Sad Memory","volume":1},{"id":168775,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Pursuit%20-%20Keep%20Pressing%20On%20%5BPursuit%202013%5D.mp3","fileSize":5178454,"name":"[DD] Pursuit - Keep Pressing On [Pursuit 2013]","volume":1},{"id":168776,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Phoenix%20Wright%20-%20Objection%202013.mp3","fileSize":4948534,"name":"[DD] Phoenix Wright - Objection 2013","volume":1},{"id":168777,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/DD/Lively%20Folk.mp3","fileSize":4683760,"name":"[DD] Lively Folk","volume":1});
            if (socketStates.options['ost-soj'] && !musicList.find(music => music.id === 168636)) musicList.push({"id":168636,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/A%20Cornered%20Heart.mp3","fileSize":4597228,"name":"[SOJ] A Cornered Heart","volume":1},{"id":168637,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Andistan'dhin%20-%20Head-Banging.mp3","fileSize":3102223,"name":"[SOJ] Andistan'dhin - Head-Banging","volume":1},{"id":168638,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Initial%20Investigation%20%5BOpening%202016%5D.mp3","fileSize":3663987,"name":"[SOJ] Initial Investigation [Opening 2016]","volume":1},{"id":168639,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Defendant%20Lobby%20-%20Beginning%20of%20the%20Revolution.mp3","fileSize":4664905,"name":"[SOJ] Defendant Lobby - Beginning of the Revolution","volume":1},{"id":168640,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Pursuit%20-%20Cornering%20Together%20(Variation)%20%5BPursuit%202016%5D.mp3","fileSize":5626586,"name":"[SOJ] Pursuit - Cornering Together (Variation) [Pursuit 2016]","volume":1},{"id":168641,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Andistan'dhin%20-%20Ethnic%20Music.mp3","fileSize":3002695,"name":"[SOJ] Andistan'dhin - Ethnic Music","volume":1},{"id":168642,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Rayfa%20Padma%20Khura'in%20-%20The%20Unyielding%20Medium%20Princess.mp3","fileSize":6096311,"name":"[SOJ] Rayfa Padma Khura'in - The Unyielding Medium Princess","volume":1},{"id":168643,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Detention%20Center%20-%20The%20Iron-Bars'%20Elegy.mp3","fileSize":3411693,"name":"[SOJ] Detention Center - The Iron-Bars' Elegy","volume":1},{"id":168644,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Reminiscences%20-%20A%20Final%20Conversation.mp3","fileSize":4953754,"name":"[SOJ] Reminiscences - A Final Conversation","volume":1},{"id":168645,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Phoenix%20Wright%20-%20Objection%202016.mp3","fileSize":5909506,"name":"[SOJ] Phoenix Wright - Objection 2016","volume":1},{"id":168646,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Courtroom%20Revolution%20-%20Gather%20Under%20the%20Flag.mp3","fileSize":7238300,"name":"[SOJ] Courtroom Revolution - Gather Under the Flag","volume":1},{"id":168647,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/A%20Quiet%20Prayer.mp3","fileSize":1667465,"name":"[SOJ] A Quiet Prayer","volume":1},{"id":168648,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Heart%20of%20the%20Investigation%20%5BCore%202016%5D.mp3","fileSize":4923987,"name":"[SOJ] Heart of the Investigation [Core 2016]","volume":1},{"id":168649,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Cheerful%20Folk.mp3","fileSize":3405405,"name":"[SOJ] Cheerful Folk","volume":1},{"id":168650,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Khura'inese%20Bazaar%20-%20A%20Foreign%20Trip.mp3","fileSize":4830495,"name":"[SOJ] Khura'inese Bazaar - A Foreign Trip","volume":1},{"id":168651,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Athena%20Cykes%20-%20Courtroom%20Re%CC%81volutionnaire%202016.mp3","fileSize":7420722,"name":"[SOJ] Athena Cykes - Courtroom Révolutionnaire 2016","volume":1},{"id":168652,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Audience%20Chamber.mp3","fileSize":6443608,"name":"[SOJ] Audience Chamber","volume":1},{"id":168653,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Cross-Examination%20-%20Allegro%202016.mp3","fileSize":4934153,"name":"[SOJ] Cross-Examination - Allegro 2016","volume":1},{"id":168654,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Reminiscences%20-%20Farewell,%20Once%20Again.mp3","fileSize":1331385,"name":"[SOJ] Reminiscences - Farewell, Once Again","volume":1},{"id":168655,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Lady%20Kee'ra%20-%20The%20Guardian%20of%20Khura'in.mp3","fileSize":5544939,"name":"[SOJ] Lady Kee'ra - The Guardian of Khura'in","volume":1},{"id":168656,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Paul%20Atishon%20-%20A%20Vote%20for%20Atishon!.mp3","fileSize":4360569,"name":"[SOJ] Paul Atishon - A Vote for Atishon!","volume":1},{"id":168657,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Ema%20Skye%20-%20The%20Scientific%20Detective%202016.mp3","fileSize":4640642,"name":"[SOJ] Ema Skye - The Scientific Detective 2016","volume":1},{"id":168658,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Logic%20Construct%20%5BTrick%202016%5D.mp3","fileSize":6212187,"name":"[SOJ] Logic Construct [Trick 2016]","volume":1},{"id":168659,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Reminiscences%20-%20Each%20of%20Their%20Feelings.mp3","fileSize":6507082,"name":"[SOJ] Reminiscences - Each of Their Feelings","volume":1},{"id":168660,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Larry%20Butz%20-%20When%20Something%20Smells,%20It's%20Usually%20Me%202016.mp3","fileSize":4125185,"name":"[SOJ] Larry Butz - When Something Smells, It's Usually Me 2016","volume":1},{"id":168661,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Defendant%20Lobby%20-%20Beginning%20of%20the%20Truth.mp3","fileSize":3553812,"name":"[SOJ] Defendant Lobby - Beginning of the Truth","volume":1},{"id":168662,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/It's%20show%20time!.mp3","fileSize":3085778,"name":"[SOJ] It's show time!","volume":1},{"id":168663,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Pursuit%20-%20Cornering%20Together%20%5BPursuit%202016%5D.mp3","fileSize":5754448,"name":"[SOJ] Pursuit - Cornering Together [Pursuit 2016]","volume":1},{"id":168664,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Divination%20Se%CC%81ance%20-%20The%20Spirit's%20Accusation.mp3","fileSize":4091077,"name":"[SOJ] Divination Séance - The Spirit's Accusation","volume":1},{"id":168665,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Maya%20Fey%20-%20Turnabout%20Sisters%202016.mp3","fileSize":5486426,"name":"[SOJ] Maya Fey - Turnabout Sisters 2016","volume":1},{"id":168666,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Mr.%20Reus%20-%20The%20Masked%20Magician.mp3","fileSize":5863033,"name":"[SOJ] Mr. Reus - The Masked Magician","volume":1},{"id":168667,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Nahyuta%20Sahdmadhi%20-%20The%20Last%20Rites%20Prosecutor.mp3","fileSize":6188445,"name":"[SOJ] Nahyuta Sahdmadhi - The Last Rites Prosecutor","volume":1},{"id":168668,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Inner%20Sanctum.mp3","fileSize":5674112,"name":"[SOJ] Inner Sanctum","volume":1},{"id":168669,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Apollo%20Justice%20-%20A%20New%20Era%20Begins!%202016.mp3","fileSize":7392346,"name":"[SOJ] Apollo Justice - A New Era Begins! 2016","volume":1},{"id":168670,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Kurain%20Village%202016.mp3","fileSize":3567860,"name":"[SOJ] Kurain Village 2016","volume":1},{"id":168671,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Detention%20Center%20-%20The%20Cold-Glass's%20Elegy.mp3","fileSize":4392593,"name":"[SOJ] Detention Center - The Cold-Glass's Elegy","volume":1},{"id":168672,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Heart%20of%20the%20Investigation%20Abroad%20%5BCore%202016%5D.mp3","fileSize":4526103,"name":"[SOJ] Heart of the Investigation Abroad [Core 2016]","volume":1},{"id":168673,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Divination%20Se%CC%81ance%20-%20Last%20Sights.mp3","fileSize":5168186,"name":"[SOJ] Divination Séance - Last Sights","volume":1},{"id":168674,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Initial%20Investigation%20Abroad%20%5BOpening%202016%5D.mp3","fileSize":3792295,"name":"[SOJ] Initial Investigation Abroad [Opening 2016]","volume":1},{"id":168675,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Cross-Examination%20-%20Moderato%202016.mp3","fileSize":4453672,"name":"[SOJ] Cross-Examination - Moderato 2016","volume":1},{"id":168676,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Odd%20Folk.mp3","fileSize":3981300,"name":"[SOJ] Odd Folk","volume":1},{"id":168677,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Dhurke%20-%20A%20Dragon%20Never%20Yields.mp3","fileSize":5343438,"name":"[SOJ] Dhurke - A Dragon Never Yields","volume":1},{"id":168678,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Ellen%20Wyatt%20-%20Walking%20Down%20the%20Aisle.mp3","fileSize":4552916,"name":"[SOJ] Ellen Wyatt - Walking Down the Aisle","volume":1},{"id":168692,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Will%20You%20Marry%20Me%3F.mp3","fileSize":3476812,"name":"[SOJ] Will You Marry Me?","volume":1},{"id":168693,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Reminiscences%20-%20Inherited%20Hopes.mp3","fileSize":4788166,"name":"[SOJ] Reminiscences - Inherited Hopes","volume":1},{"id":168694,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/The%20Plumed%20Punisher%20-%20Warrior%20of%20Neo%20Twilight%20Realm.mp3","fileSize":4191187,"name":"[SOJ] The Plumed Punisher - Warrior of Neo Twilight Realm","volume":1},{"id":168695,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/The%20Dance%20of%20Devotion.mp3","fileSize":3247185,"name":"[SOJ] The Dance of Devotion","volume":1},{"id":168696,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Reminiscences%20-%20Smile,%20No%20Matter%20What.mp3","fileSize":3482997,"name":"[SOJ] Reminiscences - Smile, No Matter What","volume":1},{"id":168697,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Spirit%20of%20Justice%20-%20Opening.mp3","fileSize":1308660,"name":"[SOJ] Spirit of Justice - Opening","volume":1},{"id":168698,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Spirit%20of%20Justice%20-%20Court%20is%20Now%20in%20Session%20Abroad%20%5BTrial%202016%5D.mp3","fileSize":4665906,"name":"[SOJ] Spirit of Justice - Court is Now in Session Abroad [Trial 2016]","volume":1},{"id":168699,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Spirit%20of%20Justice%20-%20Court%20is%20Now%20in%20Session%20%5BTrial%202016%5D.mp3","fileSize":4158622,"name":"[SOJ] Spirit of Justice - Court is Now in Session [Trial 2016]","volume":1},{"id":168700,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/The%20Holy%20Mother%20-%20Teachings%20of%20Khura'in.mp3","fileSize":5752882,"name":"[SOJ] The Holy Mother - Teachings of Khura'in","volume":1},{"id":168701,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/The%20Court%20of%20Resignation.mp3","fileSize":6355409,"name":"[SOJ] The Court of Resignation","volume":1},{"id":168702,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Uendo%20Toneido%20-%20Whirlwind%20of%20Laughter.mp3","fileSize":4114816,"name":"[SOJ] Uendo Toneido - Whirlwind of Laughter","volume":1},{"id":168703,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/The%20Truth%20Revealed%20%5BTruth%202016%5D.mp3","fileSize":6321369,"name":"[SOJ] The Truth Revealed [Truth 2016]","volume":1},{"id":168704,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Spirit%20of%20Justice%20-%20Ending.mp3","fileSize":7284715,"name":"[SOJ] Spirit of Justice - Ending","volume":1},{"id":168705,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/The%20Revolutionaries%20-%20Defiant%20Dragons.mp3","fileSize":7322594,"name":"[SOJ] The Revolutionaries - Defiant Dragons","volume":1},{"id":168706,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/The%20Basics%20of%20the%20Case.mp3","fileSize":4032812,"name":"[SOJ] The Basics of the Case","volume":1},{"id":168707,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Troupe%20Gramarye%202016.mp3","fileSize":5167780,"name":"[SOJ] Troupe Gramarye 2016","volume":1},{"id":168708,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Victory!%20-%20Each%20of%20Their%20Wins%20%5BVictory%202016%5D.mp3","fileSize":7452589,"name":"[SOJ] Victory! - Each of Their Wins [Victory 2016]","volume":1},{"id":168709,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/The%20Woman%20Freed.mp3","fileSize":6048550,"name":"[SOJ] The Woman Freed","volume":1},{"id":173971,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/SOJ/Realizing%20the%20Truth.mp3","fileSize":895405,"name":"[SOJ] Realizing the Truth","volume":1});
            if (socketStates.options['ost-tgaa1'] && !musicList.find(music => music.id === 168360)) musicList.push({"id":168360,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/A%20Battle%20of%20Wits%20-%20Opening%20Moves.mp3","fileSize":5543774,"name":"[TGAA1] A Battle of Wits - Opening Moves","volume":1},{"id":168363,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Dance%20of%20Deduction%20(Type%20A).mp3","fileSize":4039449,"name":"[TGAA1] Dance of Deduction (Type A)","volume":1},{"id":168364,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Dance%20of%20Deduction%20-%20Backstage%20(Type%20A).mp3","fileSize":3675821,"name":"[TGAA1] Dance of Deduction - Backstage (Type A)","volume":1},{"id":168368,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Dance%20of%20Deduction%20(Type%20B).mp3","fileSize":3822873,"name":"[TGAA1] Dance of Deduction (Type B)","volume":1},{"id":168369,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Dance%20of%20Deduction%20(Type%20C).mp3","fileSize":4130705,"name":"[TGAA1] Dance of Deduction (Type C)","volume":1},{"id":168384,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Herlock%20Sholmes%20-%20Great%20Detective%20of%20Foggy%20London%20Town.mp3","fileSize":5555412,"name":"[TGAA1] Herlock Sholmes - Great Detective of Foggy London Town","volume":1},{"id":168413,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Theme%20of%20Deduction%20-%20At%20the%20End%20of%20a%20Chain%20of%20Logical%20Sequences.mp3","fileSize":4315483,"name":"[TGAA1] Theme of Deduction - At the End of a Chain of Logical Sequences","volume":1},{"id":168422,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/A%20Farcial%20Comedy%20-%20Boisterous%20Folk.mp3","fileSize":3132830,"name":"[TGAA1] A Farcial Comedy - Boisterous Folk","volume":1},{"id":168441,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Music%20Box%20-%20Great%20Detective%20of%20Foggy%20London%20Town.mp3","fileSize":1581390,"name":"[TGAA1] Music Box - Great Detective of Foggy London Town","volume":1},{"id":168447,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/%22The%20Adventure%20of%20the%20Great%20Beginning%22%20(1).mp3","fileSize":1304525,"name":"[TGAA1] \"The Adventure of the Great Beginning\" (1)","volume":1},{"id":168448,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/221B%20Baker%20Street.mp3","fileSize":4890863,"name":"[TGAA1] 221B Baker Street","volume":1},{"id":168449,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/A%20Battle%20of%20Wits%20-%20Breakthrough.mp3","fileSize":4986397,"name":"[TGAA1] A Battle of Wits - Breakthrough","volume":1},{"id":168450,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/%22The%20Adventure%20of%20the%20Great%20Beginning%22%20(2).mp3","fileSize":701165,"name":"[TGAA1] \"The Adventure of the Great Beginning\" (2)","volume":1},{"id":168451,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Dance%20of%20Deduction%20(Type%20A)%20(No%20Intro).mp3","fileSize":3877276,"name":"[TGAA1] Dance of Deduction (Type A) (No Intro)","volume":1},{"id":168452,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Dance%20of%20Deduction%20-%20Backstage%20(Type%20C).mp3","fileSize":3953357,"name":"[TGAA1] Dance of Deduction - Backstage (Type C)","volume":1},{"id":168453,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/A%20Great%20Blaze.mp3","fileSize":1744075,"name":"[TGAA1] A Great Blaze","volume":1},{"id":168454,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Gina%20Lestrade%20-%20A%20Blast%20from%20the%20East%20End%20(Unused).mp3","fileSize":4100740,"name":"[TGAA1] Gina Lestrade - A Blast from the East End (Unused)","volume":1},{"id":168455,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Daybreak%20Over%20the%20Unspeakable%20Story.mp3","fileSize":2604161,"name":"[TGAA1] Daybreak Over the Unspeakable Story","volume":1},{"id":168456,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/A%20Great%20Twist%20-%20Suspense%20II.mp3","fileSize":4753017,"name":"[TGAA1] A Great Twist - Suspense II","volume":1},{"id":168457,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Gina%20Lestrade%20-%20A%20Blast%20from%20the%20East%20End.mp3","fileSize":3750885,"name":"[TGAA1] Gina Lestrade - A Blast from the East End","volume":1},{"id":168458,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Ambience%20-%20Sea%20of%20Japan.mp3","fileSize":2614333,"name":"[TGAA1] Ambience - Sea of Japan","volume":1},{"id":168459,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Great%20Cross-Examination%20-%20Moderato%202015.mp3","fileSize":4211104,"name":"[TGAA1] Great Cross-Examination - Moderato 2015","volume":1},{"id":168460,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/A%20Great%20Twist%20-%20Suspense%20I.mp3","fileSize":4544024,"name":"[TGAA1] A Great Twist - Suspense I","volume":1},{"id":168461,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Ambience%20-%20Stronghart's%20Cogwheels.mp3","fileSize":2092414,"name":"[TGAA1] Ambience - Stronghart's Cogwheels","volume":1},{"id":168462,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Jezaille%20Brett%20-%20Elegance...%20and%20Excellence.mp3","fileSize":3678601,"name":"[TGAA1] Jezaille Brett - Elegance... and Excellence","volume":1},{"id":168463,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Investigation%20(Unused).mp3","fileSize":5146826,"name":"[TGAA1] Investigation (Unused)","volume":1},{"id":168464,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Complications%20in%20the%20Proceedings.mp3","fileSize":3526526,"name":"[TGAA1] Complications in the Proceedings","volume":1},{"id":168465,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Arrival.mp3","fileSize":677463,"name":"[TGAA1] Arrival","volume":1},{"id":168466,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Citizens%20of%20the%20Fog%20-%20Suspicious%20Folk.mp3","fileSize":4267025,"name":"[TGAA1] Citizens of the Fog - Suspicious Folk","volume":1},{"id":168467,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Investigation%20%5BOpening%202015%5D.mp3","fileSize":6935371,"name":"[TGAA1] Investigation [Opening 2015]","volume":1},{"id":168468,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Machinations%20and%20Deductions%20%5BTrick%202015%5D.mp3","fileSize":4834137,"name":"[TGAA1] Machinations and Deductions [Trick 2015]","volume":1},{"id":168469,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Arrival%20(Unused).mp3","fileSize":656998,"name":"[TGAA1] Arrival (Unused)","volume":1},{"id":168470,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Lord%20Chief%20Justice%20Stronghart%20-%20Time-Keeper%20of%20the%20Law.mp3","fileSize":6063058,"name":"[TGAA1] Lord Chief Justice Stronghart - Time-Keeper of the Law","volume":1},{"id":168471,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Kazuma%20Asogi%20-%20Samurai%20on%20a%20Mission.mp3","fileSize":4858479,"name":"[TGAA1] Kazuma Asogi - Samurai on a Mission","volume":1},{"id":168472,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/London%20Town.mp3","fileSize":6736385,"name":"[TGAA1] London Town","volume":1},{"id":168473,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Music%20Box%20-%20A%20Novel,%20New%20Sound.mp3","fileSize":1793340,"name":"[TGAA1] Music Box - A Novel, New Sound","volume":1},{"id":168474,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Local%20Prison%20-%20Rhapsody%20in%20Gloom.mp3","fileSize":5639148,"name":"[TGAA1] Local Prison - Rhapsody in Gloom","volume":1},{"id":168475,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Barok%20van%20Zieks%20-%20The%20Reaper%20of%20the%20Bailey.mp3","fileSize":8355600,"name":"[TGAA1] Barok van Zieks - The Reaper of the Bailey","volume":1},{"id":168476,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Nikolina%20Pavlova%20-%20A%20Migrating%20Russian%20Breeze.mp3","fileSize":4194123,"name":"[TGAA1] Nikolina Pavlova - A Migrating Russian Breeze","volume":1},{"id":168477,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Iris%20Wilson%20-%20Young%20Biographer.mp3","fileSize":3278076,"name":"[TGAA1] Iris Wilson - Young Biographer","volume":1},{"id":168478,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Iris%20Wilson%20(Unused).mp3","fileSize":3215880,"name":"[TGAA1] Iris Wilson (Unused)","volume":1},{"id":168479,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Kazuma%20Asogi%20-%20Nocturne.mp3","fileSize":5603043,"name":"[TGAA1] Kazuma Asogi - Nocturne","volume":1},{"id":168480,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Curtain%20Call%20Suite%20-%20The%20Great%20Ace%20Attorney%20Continues%20Forth.mp3","fileSize":5153436,"name":"[TGAA1] Curtain Call Suite - The Great Ace Attorney Continues Forth","volume":1},{"id":168481,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Great%20Cross-Examination%20-%20Allegro%202015.mp3","fileSize":5355279,"name":"[TGAA1] Great Cross-Examination - Allegro 2015","volume":1},{"id":168482,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Lord%20Chief%20Justice%20Stronghart%20(Unused).mp3","fileSize":4549170,"name":"[TGAA1] Lord Chief Justice Stronghart (Unused)","volume":1},{"id":168483,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Curtain%20Call%20Suite%20-%20Adventures'%20End.mp3","fileSize":6857038,"name":"[TGAA1] Curtain Call Suite - Adventures' End","volume":1},{"id":168484,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Kazuma%20Asogi%20(Unused).mp3","fileSize":5627783,"name":"[TGAA1] Kazuma Asogi (Unused)","volume":1},{"id":168485,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Omen%20I.mp3","fileSize":2238337,"name":"[TGAA1] Omen I","volume":1},{"id":168486,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Ordinary%20Londoners,%20Ordinary%20Lives.mp3","fileSize":4367462,"name":"[TGAA1] Ordinary Londoners, Ordinary Lives","volume":1},{"id":168487,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Reminiscences%20-%20An%20Ashen%20Waltz.mp3","fileSize":8134428,"name":"[TGAA1] Reminiscences - An Ashen Waltz","volume":1},{"id":168488,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Omen%20II.mp3","fileSize":2173681,"name":"[TGAA1] Omen II","volume":1},{"id":168489,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Prologue%20-%20A%20Most%20Mysterious%20Mood.mp3","fileSize":4803709,"name":"[TGAA1] Prologue - A Most Mysterious Mood","volume":1},{"id":168490,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Defendants'%20Antechamber.mp3","fileSize":4044105,"name":"[TGAA1] The Defendants' Antechamber","volume":1},{"id":168491,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/One%20Last%20Tragedy%20(1).mp3","fileSize":1364071,"name":"[TGAA1] One Last Tragedy (1)","volume":1},{"id":168492,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Pursuit%20-%20A%20Great%20Turnabout%20%5BPursuit%202015%5D.mp3","fileSize":6491241,"name":"[TGAA1] Pursuit - A Great Turnabout [Pursuit 2015]","volume":1},{"id":168493,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Summation%20Examination.mp3","fileSize":6149523,"name":"[TGAA1] Summation Examination","volume":1},{"id":168494,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Reminiscences%20-%20Fallen%20Angel.mp3","fileSize":5197592,"name":"[TGAA1] Reminiscences - Fallen Angel","volume":1},{"id":168495,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Reminiscences%20-%20Ryunosuke's%20Flashback%20(Unused).mp3","fileSize":2906208,"name":"[TGAA1] Reminiscences - Ryunosuke's Flashback (Unused)","volume":1},{"id":168496,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Great%20Detective's%20Morose%20Mood.mp3","fileSize":2045775,"name":"[TGAA1] The Great Detective's Morose Mood","volume":1},{"id":168497,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Reminiscences%20-%20Sympathy%20for%20the%20Sinner,%20but%20Not%20the%20Sin.mp3","fileSize":5923020,"name":"[TGAA1] Reminiscences - Sympathy for the Sinner, but Not the Sin","volume":1},{"id":168498,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Adventure%20of%20the%20Great%20Beginning%20(Unused).mp3","fileSize":1279683,"name":"[TGAA1] The Adventure of the Great Beginning (Unused)","volume":1},{"id":168499,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Adventure%20of%20the%20Unbreakable%20Speckled%20Band%20(1).mp3","fileSize":2159653,"name":"[TGAA1] The Adventure of the Unbreakable Speckled Band (1)","volume":1},{"id":168500,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Susato%20Mikotoba%20-%20A%20New%20Bloom%20in%20the%20New%20World.mp3","fileSize":5045930,"name":"[TGAA1] Susato Mikotoba - A New Bloom in the New World","volume":1},{"id":168501,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Reminiscences%20-%20Ryunosuke's%20Flashback.mp3","fileSize":2376089,"name":"[TGAA1] Reminiscences - Ryunosuke's Flashback","volume":1},{"id":168502,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Adventure%20of%20the%20Runaway%20Room.mp3","fileSize":2211233,"name":"[TGAA1] The Adventure of the Runaway Room","volume":1},{"id":168503,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Truth%20Revealed%20%5BTruth%202015%5D.mp3","fileSize":7118256,"name":"[TGAA1] The Truth Revealed [Truth 2015]","volume":1},{"id":168504,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20SS%20Burya.mp3","fileSize":4439466,"name":"[TGAA1] The SS Burya","volume":1},{"id":168505,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Victory%20-%20In%20Honour%20of%20My%20Friend%20%5BVictory%202015%5D.mp3","fileSize":5040446,"name":"[TGAA1] Victory - In Honour of My Friend [Victory 2015]","volume":1},{"id":168506,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Great%20Ace%20Attorney%20-%20Adjudication.mp3","fileSize":6345979,"name":"[TGAA1] The Great Ace Attorney - Adjudication","volume":1},{"id":168507,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Great%20Ace%20Attorney%20-%20Court%20is%20Now%20in%20Session%20%5BTrial%202015%5D.mp3","fileSize":6395214,"name":"[TGAA1] The Great Ace Attorney - Court is Now in Session [Trial 2015]","volume":1},{"id":168508,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Great%20Ace%20Attorney%20-%20Adjudication%20(Unused).mp3","fileSize":5608706,"name":"[TGAA1] The Great Ace Attorney - Adjudication (Unused)","volume":1},{"id":168509,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/One%20Last%20Tragedy%20(2).mp3","fileSize":461959,"name":"[TGAA1] One Last Tragedy (2)","volume":1},{"id":168510,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Susato%20Mikotoba%20-%20A%20New%20Bloom%20in%20the%20New%20World%20(Unused).mp3","fileSize":4625099,"name":"[TGAA1] Susato Mikotoba - A New Bloom in the New World (Unused)","volume":1},{"id":168511,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Ryunosuke%20Naruhodo%20-%20Overture%20to%20Adventures.mp3","fileSize":4064233,"name":"[TGAA1] Ryunosuke Naruhodo - Overture to Adventures","volume":1},{"id":168512,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Heart%20of%20the%20Matter%20%5BCore%202015%5D.mp3","fileSize":5560373,"name":"[TGAA1] The Heart of the Matter [Core 2015]","volume":1},{"id":168513,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Great%20Ace%20Attorney%20-%20Court%20is%20Now%20in%20Session%20(Unused).mp3","fileSize":3918635,"name":"[TGAA1] The Great Ace Attorney - Court is Now in Session (Unused)","volume":1},{"id":168514,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Ryunosuke%20Naruhodo%20-%20Objection%202015.mp3","fileSize":4077661,"name":"[TGAA1] Ryunosuke Naruhodo - Objection 2015","volume":1},{"id":168515,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Soseki%20Natsume%20-%20I%20Am%20Not%20Guilty.mp3","fileSize":4690812,"name":"[TGAA1] Soseki Natsume - I Am Not Guilty","volume":1},{"id":168516,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Susato%20Mikotoba%20-%20Serenade.mp3","fileSize":4558326,"name":"[TGAA1] Susato Mikotoba - Serenade","volume":1},{"id":168517,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Ryunosuke%20Naruhodo%20-%20Overture%20to%20Adventures%20(Unused).mp3","fileSize":4158248,"name":"[TGAA1] Ryunosuke Naruhodo - Overture to Adventures (Unused)","volume":1},{"id":168518,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Witnesses%20Take%20the%20Stand.mp3","fileSize":4806010,"name":"[TGAA1] The Witnesses Take the Stand","volume":1},{"id":168519,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Tobias%20Gregson%20-%20The%20Great%20Detective's%20Great%20Foe.mp3","fileSize":4549900,"name":"[TGAA1] Tobias Gregson - The Great Detective's Great Foe","volume":1},{"id":168520,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Truth%20Revealed%20(Unused%201).mp3","fileSize":5806737,"name":"[TGAA1] The Truth Revealed (Unused 1)","volume":1},{"id":168521,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Truth%20Revealed%20(Unused%202).mp3","fileSize":5079777,"name":"[TGAA1] The Truth Revealed (Unused 2)","volume":1},{"id":168522,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/Prologue%20-%20A%20Most%20Mysterious%20Mood%20(Unused).mp3","fileSize":4323740,"name":"[TGAA1] Prologue - A Most Mysterious Mood (Unused)","volume":1},{"id":168523,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA1/The%20Adventure%20of%20the%20Unbreakable%20Speckled%20Band%20(2).mp3","fileSize":1485037,"name":"[TGAA1] The Adventure of the Unbreakable Speckled Band (2)","volume":1});
            if (socketStates.options['ost-tgaa2'] && !musicList.find(music => music.id === 168525)) musicList.push({"id":168525,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Partners%20-%20The%20game%20is%20afoot!%20(Variation).mp3","fileSize":6960078,"name":"[TGAA2] Partners - The game is afoot! (Variation)","volume":1},{"id":168528,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Prelude%20to%20Pursuit%20(Unused).mp3","fileSize":4699231,"name":"[TGAA2] Prelude to Pursuit (Unused)","volume":1},{"id":168529,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Partners%20-%20The%20game%20is%20afoot!%20(Unused).mp3","fileSize":7304826,"name":"[TGAA2] Partners - The game is afoot! (Unused)","volume":1},{"id":168531,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Partners%20(With%20Intro).mp3","fileSize":3945534,"name":"[TGAA2] Partners (With Intro)","volume":1},{"id":168535,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Partners%20-%20The%20game%20is%20afoot!.mp3","fileSize":7533656,"name":"[TGAA2] Partners - The game is afoot!","volume":1},{"id":168538,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/A%20Battle%20of%20Wits%20-%20Backstage%20(Partners%20Version).mp3","fileSize":6237637,"name":"[TGAA2] A Battle of Wits - Backstage (Partners Version)","volume":1},{"id":168558,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Prelude%20to%20Pursuit.mp3","fileSize":4799709,"name":"[TGAA2] Prelude to Pursuit","volume":1},{"id":168586,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Curtain%20Call%20Suite%20-%20Treasured%20Melodies.mp3","fileSize":7373165,"name":"[TGAA2] Curtain Call Suite - Treasured Melodies","volume":1},{"id":168587,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Ambience%20-%20The%20Great%20Exhibition.mp3","fileSize":1648386,"name":"[TGAA2] Ambience - The Great Exhibition","volume":1},{"id":168588,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Ambience%20-%20The%20Great%20Exhibition%20Stage.mp3","fileSize":1545890,"name":"[TGAA2] Ambience - The Great Exhibition Stage","volume":1},{"id":168589,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Baker%20Street%20Ball%20-%20Waltz%20for%20Chronicles.mp3","fileSize":3788491,"name":"[TGAA2] Baker Street Ball - Waltz for Chronicles","volume":1},{"id":168590,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Daley%20Vigil%20-%20The%20Prison%20Warders.mp3","fileSize":4406890,"name":"[TGAA2] Daley Vigil - The Prison Warders","volume":1},{"id":168591,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Doctor%20Sithe%20-%20Untouchable%20Coroner.mp3","fileSize":5283613,"name":"[TGAA2] Doctor Sithe - Untouchable Coroner","volume":1},{"id":168592,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Enoch%20Drebber%20-%20Rondo%20of%20Science%20and%20Magic.mp3","fileSize":3970773,"name":"[TGAA2] Enoch Drebber - Rondo of Science and Magic","volume":1},{"id":168593,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/German%20Song%20-%20'Ode%20an%20die%20Wut'%20(Unused%20Instrumental).mp3","fileSize":3100325,"name":"[TGAA2] German Song - 'Ode an die Wut' (Unused Instrumental)","volume":1},{"id":168594,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Professor%20Harebrayne%20-%20Student%20of%20Science%20(Unused).mp3","fileSize":4217765,"name":"[TGAA2] Professor Harebrayne - Student of Science (Unused)","volume":1},{"id":168595,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Kazuma%20Asogi%20-%20A%20Prosecutor,%20Reborn.mp3","fileSize":5868924,"name":"[TGAA2] Kazuma Asogi - A Prosecutor, Reborn","volume":1},{"id":168596,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Reminiscences%20-%20In%20Search%20of%20Family.mp3","fileSize":5328302,"name":"[TGAA2] Reminiscences - In Search of Family","volume":1},{"id":168597,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Kazuma%20Asogi%20-%20His%20Glorious%20Return.mp3","fileSize":6342827,"name":"[TGAA2] Kazuma Asogi - His Glorious Return","volume":1},{"id":168598,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Professor%20Harebrayne%20-%20Student%20of%20Science.mp3","fileSize":4358227,"name":"[TGAA2] Professor Harebrayne - Student of Science","volume":1},{"id":168599,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/German%20Song%20-%20'Ode%20an%20die%20Wut'.mp3","fileSize":1203341,"name":"[TGAA2] German Song - 'Ode an die Wut'","volume":1},{"id":168600,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Great%20Pursuit%20-%20The%20Resolve%20of%20Ryunosuke%20Naruhodo.mp3","fileSize":4521868,"name":"[TGAA2] Great Pursuit - The Resolve of Ryunosuke Naruhodo","volume":1},{"id":168601,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Grand%20Finale%20-%20Epilogue.mp3","fileSize":4536111,"name":"[TGAA2] Grand Finale - Epilogue","volume":1},{"id":168602,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Reminiscences%20-%20Disproved%20Formulas.mp3","fileSize":6519804,"name":"[TGAA2] Reminiscences - Disproved Formulas","volume":1},{"id":168603,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Great%20Pursuit%20-%20The%20Resolve%20of%20Ryunosuke%20Naruhodo%20(Unused).mp3","fileSize":4502894,"name":"[TGAA2] Great Pursuit - The Resolve of Ryunosuke Naruhodo (Unused)","volume":1},{"id":168604,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Reminiscences%20-%20Killers'%20Crossroads.mp3","fileSize":6526837,"name":"[TGAA2] Reminiscences - Killers' Crossroads","volume":1},{"id":168605,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Reminiscences%20-%20The%20Fruits%20of%20Ambition.mp3","fileSize":7087264,"name":"[TGAA2] Reminiscences - The Fruits of Ambition","volume":1},{"id":168606,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Ryutaro%20Naruhodo%20-%20Objection%202017.mp3","fileSize":4371463,"name":"[TGAA2] Ryutaro Naruhodo - Objection 2017","volume":1},{"id":168607,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Ryunosuke%20Naruhodo%20-%20Overture%20to%20Resolve.mp3","fileSize":4506691,"name":"[TGAA2] Ryunosuke Naruhodo - Overture to Resolve","volume":1},{"id":168608,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Madame%20Tusspells%20-%20Mysteries%20Encased%20in%20Wax.mp3","fileSize":4194454,"name":"[TGAA2] Madame Tusspells - Mysteries Encased in Wax","volume":1},{"id":168609,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Ryutaro%20Naruhodo%20-%20Prelude%20to%20the%20Blossoming%20Attorney.mp3","fileSize":4257391,"name":"[TGAA2] Ryutaro Naruhodo - Prelude to the Blossoming Attorney","volume":1},{"id":168610,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Madame%20Tusspells%20-%20Mysteries%20Encased%20in%20Wax%20(Unused).mp3","fileSize":6419765,"name":"[TGAA2] Madame Tusspells - Mysteries Encased in Wax (Unused)","volume":1},{"id":168611,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Murky%20Murderous%20Intentions%20(Unused).mp3","fileSize":2509623,"name":"[TGAA2] Murky Murderous Intentions (Unused)","volume":1},{"id":168612,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Murky%20Murderous%20Intentions.mp3","fileSize":6270869,"name":"[TGAA2] Murky Murderous Intentions","volume":1},{"id":168613,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Ryunosuke%20Naruhodo%20-%20Overture%20to%20Resolve%20(Unused).mp3","fileSize":6115109,"name":"[TGAA2] Ryunosuke Naruhodo - Overture to Resolve (Unused)","volume":1},{"id":168614,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Swirling%20Void%20of%20Nothingness%20(Unused).mp3","fileSize":2340089,"name":"[TGAA2] Swirling Void of Nothingness (Unused)","volume":1},{"id":168615,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Our%20Separate%20Paths.mp3","fileSize":6541653,"name":"[TGAA2] Our Separate Paths","volume":1},{"id":168616,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Raiten%20Menimemo%20-%20One%20Journo's%20Menimemoism.mp3","fileSize":4393844,"name":"[TGAA2] Raiten Menimemo - One Journo's Menimemoism","volume":1},{"id":168617,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Swirling%20Void%20of%20Nothingness.mp3","fileSize":4332343,"name":"[TGAA2] Swirling Void of Nothingness","volume":1},{"id":168618,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Great%20Closed%20Trial%20-%20Court%20is%20Now%20in%20Session%20(Unused%201).mp3","fileSize":5972943,"name":"[TGAA2] The Great Closed Trial - Court is Now in Session (Unused 1)","volume":1},{"id":168619,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Professor%20-%20Great%20Gateway%20to%20the%20Truth.mp3","fileSize":5555203,"name":"[TGAA2] The Professor - Great Gateway to the Truth","volume":1},{"id":168620,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Great%20Ace%20Attorney%20Continues%20Forth%20(Music%20Box).mp3","fileSize":3255437,"name":"[TGAA2] The Great Ace Attorney Continues Forth (Music Box)","volume":1},{"id":168621,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Legend%20of%20the%20Baskervilles.mp3","fileSize":5616969,"name":"[TGAA2] The Legend of the Baskervilles","volume":1},{"id":168622,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/William%20Shamspeare%20-%20Back%20Alley%20Bard.mp3","fileSize":3875775,"name":"[TGAA2] William Shamspeare - Back Alley Bard","volume":1},{"id":168623,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Great%20Closed%20Trial%20-%20The%20Defendants'%20Antechamber.mp3","fileSize":4353173,"name":"[TGAA2] The Great Closed Trial - The Defendants' Antechamber","volume":1},{"id":168624,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Great%20Exhibition%20(Unused).mp3","fileSize":2744817,"name":"[TGAA2] The Great Exhibition (Unused)","volume":1},{"id":168625,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Victory%20-%20One%20Last%20Great%20Win%20(Unused).mp3","fileSize":8133256,"name":"[TGAA2] Victory - One Last Great Win (Unused)","volume":1},{"id":168626,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Yujin%20Mikotoba%20-%20The%20Great%20Detective's%20Great%20Friend.mp3","fileSize":4751309,"name":"[TGAA2] Yujin Mikotoba - The Great Detective's Great Friend","volume":1},{"id":168627,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Victory%20-%20One%20Last%20Great%20Win%20%5BVictory%202017%5D.mp3","fileSize":5248110,"name":"[TGAA2] Victory - One Last Great Win [Victory 2017]","volume":1},{"id":168628,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Great%20Closed%20Trial%20-%20Court%20is%20Now%20in%20Session%20(Unused%202).mp3","fileSize":5555631,"name":"[TGAA2] The Great Closed Trial - Court is Now in Session (Unused 2)","volume":1},{"id":168629,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Great%20Exhibition.mp3","fileSize":4562734,"name":"[TGAA2] The Great Exhibition","volume":1},{"id":168630,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Reminiscences%20of%20Barok%20van%20Zieks.mp3","fileSize":7319871,"name":"[TGAA2] The Reminiscences of Barok van Zieks","volume":1},{"id":168631,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Waxwork%20Museum.mp3","fileSize":4632765,"name":"[TGAA2] The Waxwork Museum","volume":1},{"id":168632,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Professor%20-%20A%20Spectre%20Revived.mp3","fileSize":7317850,"name":"[TGAA2] The Professor - A Spectre Revived","volume":1},{"id":168633,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/The%20Great%20Closed%20Trial%20-%20Court%20is%20Now%20in%20Session%20%5BTrial%202017%5D.mp3","fileSize":7241451,"name":"[TGAA2] The Great Closed Trial - Court is Now in Session [Trial 2017]","volume":1},{"id":168634,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/TGAA2/Words%20of%20Parting%20-%20His%20Last%20Bow.mp3","fileSize":2785474,"name":"[TGAA2] Words of Parting - His Last Bow","volume":1});
            if (socketStates.options['ost-aai1'] && !musicList.find(music => music.id === 168986)) musicList.push({"id":168986,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Further%20Investigation%20%5BMiddle%202009%5D.mp3","fileSize":6008931,"name":"[AAI1] Further Investigation [Middle 2009]","volume":1},{"id":168987,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/%22The%20Kidnapped%20Turnabout%22%20-%20Prelude%20to%20Kidnapping.mp3","fileSize":1774163,"name":"[AAI1] \"The Kidnapped Turnabout\" - Prelude to Kidnapping","volume":1},{"id":168988,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Initial%20Investigation%20%5BOpening%202009%5D.mp3","fileSize":6715849,"name":"[AAI1] Initial Investigation [Opening 2009]","volume":1},{"id":168989,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/%22Turnabout%20Reminiscence%22.mp3","fileSize":1068485,"name":"[AAI1] \"Turnabout Reminiscence\"","volume":1},{"id":168990,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Heart%20of%20the%20Investigation%20%5BCore%202009%5D.mp3","fileSize":5514259,"name":"[AAI1] Heart of the Investigation [Core 2009]","volume":1},{"id":168991,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Logic%20-%20Way%20to%20the%20Truth%20%5BTrick%202009%5D.mp3","fileSize":6662535,"name":"[AAI1] Logic - Way to the Truth [Trick 2009]","volume":1},{"id":168992,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Kay%20Faraday%20-%20The%20Great%20Truth%20Thief.mp3","fileSize":4878666,"name":"[AAI1] Kay Faraday - The Great Truth Thief","volume":1},{"id":168993,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Doubted%20Folk.mp3","fileSize":5616529,"name":"[AAI1] Doubted Folk","volume":1},{"id":168994,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/%22Turnabout%20Ablaze%22.mp3","fileSize":2202887,"name":"[AAI1] \"Turnabout Ablaze\"","volume":1},{"id":168995,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/%22Turnabout%20Airlines%22.mp3","fileSize":3717791,"name":"[AAI1] \"Turnabout Airlines\"","volume":1},{"id":168996,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Ace%20Attorney%20Investigations%20Miles%20Edgeworth%20-%20Opening.mp3","fileSize":1878638,"name":"[AAI1] Ace Attorney Investigations Miles Edgeworth - Opening","volume":1},{"id":168997,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/%22The%20Kidnapped%20Turnabout%22%20-%20Tragedy%20in%20the%20Haunted%20House.mp3","fileSize":2279934,"name":"[AAI1] \"The Kidnapped Turnabout\" - Tragedy in the Haunted House","volume":1},{"id":168998,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Amusing%20Folk.mp3","fileSize":4946359,"name":"[AAI1] Amusing Folk","volume":1},{"id":168999,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Noisy%20Folk.mp3","fileSize":2997825,"name":"[AAI1] Noisy Folk","volume":1},{"id":169000,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Blue%20Badger%20March%20-%20Gatewater%20Land%20Theme.mp3","fileSize":6017105,"name":"[AAI1] Blue Badger March - Gatewater Land Theme","volume":1},{"id":169001,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Dick%20Gumshoe%20-%20I%20Can%20Do%20It%20When%20It%20Counts,%20Pal!.mp3","fileSize":3494356,"name":"[AAI1] Dick Gumshoe - I Can Do It When It Counts, Pal!","volume":1},{"id":169002,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Confrontation%20-%20Moderato%202009.mp3","fileSize":6546706,"name":"[AAI1] Confrontation - Moderato 2009","volume":1},{"id":169003,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Miles%20Edgeworth%20-%20Objection%202009.mp3","fileSize":5611060,"name":"[AAI1] Miles Edgeworth - Objection 2009","volume":1},{"id":169004,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Deduction%20-%20Contradiction%20at%20the%20Crime%20Scene.mp3","fileSize":5009658,"name":"[AAI1] Deduction - Contradiction at the Crime Scene","volume":1},{"id":169005,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Calisto%20Yew%20-%20Let%20Me%20Laugh%20at%20the%20Cool.mp3","fileSize":5501349,"name":"[AAI1] Calisto Yew - Let Me Laugh at the Cool","volume":1},{"id":169006,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/One%20Prosecutor's%20Musings%20-%20Promise%20to%20Meet%20Again.mp3","fileSize":6229452,"name":"[AAI1] One Prosecutor's Musings - Promise to Meet Again","volume":1},{"id":169007,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Shi-Long%20Lang%20-%20Speak%20Up,%20Pup!.mp3","fileSize":5410231,"name":"[AAI1] Shi-Long Lang - Speak Up, Pup!","volume":1},{"id":169008,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Crisis%20of%20Fate.mp3","fileSize":4820530,"name":"[AAI1] Crisis of Fate","volume":1},{"id":169009,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Yatagarasu%20-%20The%20Noble%20Thief%20Dancing%20in%20the%20Dark%20Night.mp3","fileSize":5259023,"name":"[AAI1] Yatagarasu - The Noble Thief Dancing in the Dark Night","volume":1},{"id":169010,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Reminiscences%20-%20False%20Relationships.mp3","fileSize":5381177,"name":"[AAI1] Reminiscences - False Relationships","volume":1},{"id":169011,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Solution!%20-%20Splendid%20Deduction.mp3","fileSize":4957766,"name":"[AAI1] Solution! - Splendid Deduction","volume":1},{"id":169012,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Zinc%20Lablanc%20-%20Time%20is%20Money.mp3","fileSize":2644531,"name":"[AAI1] Zinc Lablanc - Time is Money","volume":1},{"id":169013,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Quercus%20Alba%20-%20The%20Enemy%20Who%20Surpasses%20the%20Law.mp3","fileSize":6186063,"name":"[AAI1] Quercus Alba - The Enemy Who Surpasses the Law","volume":1},{"id":169014,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/The%20Two%20Embassies%20-%20The%20Countries%20of%20the%20Butterfly%20and%20the%20Flower.mp3","fileSize":4938984,"name":"[AAI1] The Two Embassies - The Countries of the Butterfly and the Flower","volume":1},{"id":169015,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Tricks%20and%20Gimmicks%20%5BTrick%202009%5D.mp3","fileSize":5536664,"name":"[AAI1] Tricks and Gimmicks [Trick 2009]","volume":1},{"id":169016,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/The%20Truth%20Revealed%20%5BTruth%202009%5D.mp3","fileSize":4986975,"name":"[AAI1] The Truth Revealed [Truth 2009]","volume":1},{"id":169017,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Confrontation%20-%20Allegro%202009.mp3","fileSize":5972813,"name":"[AAI1] Confrontation - Allegro 2009","volume":1},{"id":169018,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Tyrell%20Badd%20-%20The%20Truth%20Isn't%20Sweet.mp3","fileSize":5318073,"name":"[AAI1] Tyrell Badd - The Truth Isn't Sweet","volume":1},{"id":169019,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Courtroom%20-%20Guardians%20of%20the%20Law%20%5BTrial%202009%5D.mp3","fileSize":4410305,"name":"[AAI1] Courtroom - Guardians of the Law [Trial 2009]","volume":1},{"id":169020,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Reminiscences%20-%20The%20Countries%20Torn%20Apart.mp3","fileSize":6980285,"name":"[AAI1] Reminiscences - The Countries Torn Apart","volume":1},{"id":169021,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Tricks%20and%20Baroque%20%5BTrick%202009%5D.mp3","fileSize":4898845,"name":"[AAI1] Tricks and Baroque [Trick 2009]","volume":1},{"id":169022,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Re-creation%20-%20The%20Noble%20Thief's%20Secret%20Weapon.mp3","fileSize":4590528,"name":"[AAI1] Re-creation - The Noble Thief's Secret Weapon","volume":1},{"id":169023,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Cammy%20Meele%20-%20Good%20Niiight.mp3","fileSize":3577569,"name":"[AAI1] Cammy Meele - Good Niiight","volume":1},{"id":169024,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Pursuit%20-%20Lying%20Coldly%20%5BPursuit%202009%5D.mp3","fileSize":6533092,"name":"[AAI1] Pursuit - Lying Coldly [Pursuit 2009]","volume":1},{"id":169025,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Confrontation%20-%20Presto%202009.mp3","fileSize":6106804,"name":"[AAI1] Confrontation - Presto 2009","volume":1},{"id":169026,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Reminiscences%20-%20The%20KG-8%20Incident.mp3","fileSize":3973482,"name":"[AAI1] Reminiscences - The KG-8 Incident","volume":1},{"id":169027,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI1/Ace%20Attorney%20Investigations%20Miles%20Edgeworth%20-%20Triumphant%20Return%202009.mp3","fileSize":7554194,"name":"[AAI1] Ace Attorney Investigations Miles Edgeworth - Triumphant Return 2009","volume":1});
            if (socketStates.options['ost-aai2'] && !musicList.find(music => music.id === 169034)) musicList.push({"id":169034,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Confrontation%20-%20Moderato%202011.mp3","fileSize":6007193,"name":"[AAI2] Confrontation - Moderato 2011","volume":1},{"id":169035,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/%22The%20Forgotten%20Turnabout%22.mp3","fileSize":1967314,"name":"[AAI2] \"The Forgotten Turnabout\"","volume":1},{"id":169036,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Heart%20of%20the%20Investigation%20%5BCore%202011%5D.mp3","fileSize":6413367,"name":"[AAI2] Heart of the Investigation [Core 2011]","volume":1},{"id":169037,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Prosecutor's%20Path%20-%20Opening.mp3","fileSize":2914877,"name":"[AAI2] Prosecutor's Path - Opening","volume":1},{"id":169038,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Logic%20Chess%20-%20Begin!.mp3","fileSize":6643995,"name":"[AAI2] Logic Chess - Begin!","volume":1},{"id":169039,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Eureka!%20-%20A%20Calm%20Moment.mp3","fileSize":5329162,"name":"[AAI2] Eureka! - A Calm Moment","volume":1},{"id":169040,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Confrontation%20-%20Presto%202011.mp3","fileSize":4241365,"name":"[AAI2] Confrontation - Presto 2011","volume":1},{"id":169041,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Initial%20Investigation%20%5BOpening%202011%5D.mp3","fileSize":5871713,"name":"[AAI2] Initial Investigation [Opening 2011]","volume":1},{"id":169042,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Jeffrey%20Master%20-%20Sweet,%20Sweet%20Happiness.mp3","fileSize":4593790,"name":"[AAI2] Jeffrey Master - Sweet, Sweet Happiness","volume":1},{"id":169043,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Gregory%20Edgeworth%20-%20The%20Wisdom%20of%20a%20Seasoned%20Attorney.mp3","fileSize":4901797,"name":"[AAI2] Gregory Edgeworth - The Wisdom of a Seasoned Attorney","volume":1},{"id":169044,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Prosecutor's%20Path%20-%20Ending.mp3","fileSize":7922605,"name":"[AAI2] Prosecutor's Path - Ending","volume":1},{"id":169045,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Dane%20Gustavia%20-%20Brandished%20Flavor.mp3","fileSize":5842786,"name":"[AAI2] Dane Gustavia - Brandished Flavor","volume":1},{"id":169046,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Further%20Investigation%20%5BMiddle%202011%5D.mp3","fileSize":5991961,"name":"[AAI2] Further Investigation [Middle 2011]","volume":1},{"id":169047,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Miles%20Edgeworth%20-%20Objection%202011.mp3","fileSize":6319930,"name":"[AAI2] Miles Edgeworth - Objection 2011","volume":1},{"id":169055,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Katherine%20Hall%20-%20A%20Sweet%20Dance.mp3","fileSize":4299807,"name":"[AAI2] Katherine Hall - A Sweet Dance","volume":1},{"id":169056,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Lamenting%20Folk.mp3","fileSize":6353260,"name":"[AAI2] Lamenting Folk","volume":1},{"id":169057,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/%22The%20Inherited%20Turnabout%22.mp3","fileSize":2652589,"name":"[AAI2] \"The Inherited Turnabout\"","volume":1},{"id":169058,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/%22The%20Grand%20Turnabout%22.mp3","fileSize":2063256,"name":"[AAI2] \"The Grand Turnabout\"","volume":1},{"id":169059,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/%22The%20Imprisoned%20Turnabout%22.mp3","fileSize":2083787,"name":"[AAI2] \"The Imprisoned Turnabout\"","volume":1},{"id":169060,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Logic%20Chess%20-%20Endgame.mp3","fileSize":6498490,"name":"[AAI2] Logic Chess - Endgame","volume":1},{"id":169061,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Patricia%20Roland%20-%20Hugs%20and%20Kisses.mp3","fileSize":5670046,"name":"[AAI2] Patricia Roland - Hugs and Kisses","volume":1},{"id":169062,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Strange%20Folk.mp3","fileSize":5345793,"name":"[AAI2] Strange Folk","volume":1},{"id":169063,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Sebastian%20Debeste%20-%20A%20First-Class%20Farewell.mp3","fileSize":5016579,"name":"[AAI2] Sebastian Debeste - A First-Class Farewell","volume":1},{"id":169064,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Trial%20of%20Fate.mp3","fileSize":4476187,"name":"[AAI2] Trial of Fate","volume":1},{"id":169065,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Pursuit%20-%20Reaching%20the%20Truth%20%5BPursuit%202011%5D.mp3","fileSize":5326411,"name":"[AAI2] Pursuit - Reaching the Truth [Pursuit 2011]","volume":1},{"id":169066,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Raymond%20Shields%20-%20How%20About%20a%20Hug.mp3","fileSize":4574563,"name":"[AAI2] Raymond Shields - How About a Hug","volume":1},{"id":169067,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Deduction%20-%20Truths%20of%20the%20Crime%20Scene.mp3","fileSize":6565734,"name":"[AAI2] Deduction - Truths of the Crime Scene","volume":1},{"id":169068,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/The%20Bonds%20of%20a%20Trustful%20Heart.mp3","fileSize":6589745,"name":"[AAI2] The Bonds of a Trustful Heart","volume":1},{"id":169069,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/John%20Marsh%20-%20An%20Irritable%20Child.mp3","fileSize":5293093,"name":"[AAI2] John Marsh - An Irritable Child","volume":1},{"id":169070,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Zheng%20Fa%20-%20Land%20of%20the%20Phoenix.mp3","fileSize":6895696,"name":"[AAI2] Zheng Fa - Land of the Phoenix","volume":1},{"id":169071,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Trick%20Analysis%20-%20Allegro%20%5BTrick%202011%5D.mp3","fileSize":5140891,"name":"[AAI2] Trick Analysis - Allegro [Trick 2011]","volume":1},{"id":169072,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Justine%20Courtney%20-%20The%20Goddess%20of%20Law.mp3","fileSize":5564762,"name":"[AAI2] Justine Courtney - The Goddess of Law","volume":1},{"id":169073,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/The%20Mighty%20Moozilla.mp3","fileSize":5852036,"name":"[AAI2] The Mighty Moozilla","volume":1},{"id":169074,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Prosecutorial%20Investigation%20Committee%20-%20Rigorous%20Justice.mp3","fileSize":6448498,"name":"[AAI2] Prosecutorial Investigation Committee - Rigorous Justice","volume":1},{"id":169075,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Prosecutors'%20Murmur%20-%20Each%20One's%20Path.mp3","fileSize":6912252,"name":"[AAI2] Prosecutors' Murmur - Each One's Path","volume":1},{"id":169076,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Re-creation%20-%20The%20Noble%20Thief's%20Secret%20Weapon%202011.mp3","fileSize":6033098,"name":"[AAI2] Re-creation - The Noble Thief's Secret Weapon 2011","volume":1},{"id":169077,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Reminiscences%20-%20The%20IS-7%20Incident.mp3","fileSize":6527491,"name":"[AAI2] Reminiscences - The IS-7 Incident","volume":1},{"id":169078,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/The%20Truth%20Revealed%20%5BTruth%202011%5D.mp3","fileSize":5892182,"name":"[AAI2] The Truth Revealed [Truth 2011]","volume":1},{"id":169079,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Ringtone%20-%20Justine%20Courtney.mp3","fileSize":2430030,"name":"[AAI2] Ringtone - Justine Courtney","volume":1},{"id":169080,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/The%20Man%20Who%20Masterminds%20the%20Game.mp3","fileSize":6257710,"name":"[AAI2] The Man Who Masterminds the Game","volume":1},{"id":169081,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Sebastian%20Debeste%20-%20First-Class%20Reasoning.mp3","fileSize":5067565,"name":"[AAI2] Sebastian Debeste - First-Class Reasoning","volume":1},{"id":169082,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Reminiscences%20-%20An%20Amnesiac%20Girl.mp3","fileSize":5719459,"name":"[AAI2] Reminiscences - An Amnesiac Girl","volume":1},{"id":169083,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Confrontation%20-%20Allegro%202011.mp3","fileSize":5373105,"name":"[AAI2] Confrontation - Allegro 2011","volume":1},{"id":169084,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Sirhan%20Dogen%20-%20The%20Tones%20of%20an%20Assassin.mp3","fileSize":4719002,"name":"[AAI2] Sirhan Dogen - The Tones of an Assassin","volume":1},{"id":169085,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Reminiscences%20-%20The%20SS-5%20Incident.mp3","fileSize":5224149,"name":"[AAI2] Reminiscences - The SS-5 Incident","volume":1},{"id":169086,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Restless%20Folk.mp3","fileSize":5148863,"name":"[AAI2] Restless Folk","volume":1},{"id":169087,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Reminiscences%20-%20The%20House%20of%20Lang's%20Downfall.mp3","fileSize":4944775,"name":"[AAI2] Reminiscences - The House of Lang's Downfall","volume":1},{"id":169088,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/AAI2/Trick%20Analysis%20-%20Moderato%20%5BTrick%202011%5D.mp3","fileSize":4265653,"name":"[AAI2] Trick Analysis - Moderato [Trick 2011]","volume":1});
            if (socketStates.options['ost-pl'] && !musicList.find(music => music.id === 169090)) musicList.push({"id":169090,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Escape.mp3","fileSize":1802468,"name":"[PLvsPW] Escape","volume":1},{"id":169091,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Espella's%20Theme%20No.%201%20-%20Memory.mp3","fileSize":4836292,"name":"[PLvsPW] Espella's Theme No. 1 - Memory","volume":1},{"id":169092,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/A%20Pleasant%20Afternoon.mp3","fileSize":4143677,"name":"[PLvsPW] A Pleasant Afternoon","volume":1},{"id":169093,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/A%20Familiar%20Face.mp3","fileSize":409969,"name":"[PLvsPW] A Familiar Face","volume":1},{"id":169094,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/A%20Faint%20Voice.mp3","fileSize":823677,"name":"[PLvsPW] A Faint Voice","volume":1},{"id":169095,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Espella's%20Theme%20No.%202%20-%20Truth.mp3","fileSize":4342287,"name":"[PLvsPW] Espella's Theme No. 2 - Truth","volume":1},{"id":169096,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/A%20Strange%20Story.mp3","fileSize":5640268,"name":"[PLvsPW] A Strange Story","volume":1},{"id":169097,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/About%20Town.mp3","fileSize":4531599,"name":"[PLvsPW] About Town","volume":1},{"id":169098,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/An%20Uneasy%20Atmosphere.mp3","fileSize":4413821,"name":"[PLvsPW] An Uneasy Atmosphere","volume":1},{"id":169099,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Confrontation%20-%20The%20Titantic%20Knights.mp3","fileSize":793157,"name":"[PLvsPW] Confrontation - The Titantic Knights","volume":1},{"id":169100,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/A%20Mysterious%20Fire.mp3","fileSize":1088207,"name":"[PLvsPW] A Mysterious Fire","volume":1},{"id":169101,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Courtroom%20Jester%20-%20Cheers!.mp3","fileSize":3315100,"name":"[PLvsPW] Courtroom Jester - Cheers!","volume":1},{"id":169102,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Bewitching%20Puzzles.mp3","fileSize":5050179,"name":"[PLvsPW] Bewitching Puzzles","volume":1},{"id":169103,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Cross-Examination%20-%20Allegro%20(English%20Turnabout%20Mix).mp3","fileSize":2198771,"name":"[PLvsPW] Cross-Examination - Allegro (English Turnabout Mix)","volume":1},{"id":169104,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Denouement.mp3","fileSize":4340024,"name":"[PLvsPW] Denouement","volume":1},{"id":169105,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Crisis%20-%20PL%20vs%20PW%20AA%20Version.mp3","fileSize":3861162,"name":"[PLvsPW] Crisis - PL vs PW AA Version","volume":1},{"id":169106,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Cross-Examination%20-%20Moderato%20(English%20Turnabout%20Mix).mp3","fileSize":2186010,"name":"[PLvsPW] Cross-Examination - Moderato (English Turnabout Mix)","volume":1},{"id":169107,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Courtroom%20Magic.mp3","fileSize":7431554,"name":"[PLvsPW] Courtroom Magic","volume":1},{"id":169108,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Deathknell%20Dungeon%20-%20The%20Magical%20Prelude.mp3","fileSize":6195234,"name":"[PLvsPW] Deathknell Dungeon - The Magical Prelude","volume":1},{"id":169109,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Confrontation.mp3","fileSize":6353117,"name":"[PLvsPW] Confrontation","volume":1},{"id":169110,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Courtroom%20Lounge%20-%20Opening%20Prelude%20(English%20Turnabout%20Mix).mp3","fileSize":2752591,"name":"[PLvsPW] Courtroom Lounge - Opening Prelude (English Turnabout Mix)","volume":1},{"id":169111,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Judgment%20-%20Witches'%20Court.mp3","fileSize":1185027,"name":"[PLvsPW] Judgment - Witches' Court","volume":1},{"id":169112,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Granwyrm%20-%20Roar.mp3","fileSize":1498354,"name":"[PLvsPW] Granwyrm - Roar","volume":1},{"id":169113,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Logic%20and%20Witchcraft.mp3","fileSize":4686815,"name":"[PLvsPW] Logic and Witchcraft","volume":1},{"id":169114,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/In-Flight.mp3","fileSize":5450355,"name":"[PLvsPW] In-Flight","volume":1},{"id":169115,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Granwyrm%20-%20Creation.mp3","fileSize":1263954,"name":"[PLvsPW] Granwyrm - Creation","volume":1},{"id":169116,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Into%20the%20Ruins.mp3","fileSize":405358,"name":"[PLvsPW] Into the Ruins","volume":1},{"id":169117,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Festival.mp3","fileSize":6343459,"name":"[PLvsPW] Festival","volume":1},{"id":169118,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Fiery%20Witnesses.mp3","fileSize":4654975,"name":"[PLvsPW] Fiery Witnesses","volume":1},{"id":169119,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Labyrinthia.mp3","fileSize":4957337,"name":"[PLvsPW] Labyrinthia","volume":1},{"id":169120,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Logic%20and%20Trick%20(English%20Turnabout%20Mix).mp3","fileSize":2830021,"name":"[PLvsPW] Logic and Trick (English Turnabout Mix)","volume":1},{"id":169121,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Into%20the%20Forest.mp3","fileSize":3595710,"name":"[PLvsPW] Into the Forest","volume":1},{"id":169122,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Link.mp3","fileSize":5205549,"name":"[PLvsPW] Link","volume":1},{"id":169123,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Hit%20or%20Miss%20-%20Suspense.mp3","fileSize":2870611,"name":"[PLvsPW] Hit or Miss - Suspense","volume":1},{"id":169124,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Newton%20Belduke%20-%20Twilight%20Memories.mp3","fileSize":5603432,"name":"[PLvsPW] Newton Belduke - Twilight Memories","volume":1},{"id":169125,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Phoenix%20Wright%20-%20Objection%202012%20(English%20Turnabout%20Mix).mp3","fileSize":1984367,"name":"[PLvsPW] Phoenix Wright - Objection 2012 (English Turnabout Mix)","volume":1},{"id":169126,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Opening.mp3","fileSize":1230542,"name":"[PLvsPW] Opening","volume":1},{"id":169127,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Phoenix%20Wright%20-%20Objection%202012.mp3","fileSize":5578453,"name":"[PLvsPW] Phoenix Wright - Objection 2012","volume":1},{"id":169128,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Misgivings.mp3","fileSize":3448145,"name":"[PLvsPW] Misgivings","volume":1},{"id":169129,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/More%20Puzzles.mp3","fileSize":4255007,"name":"[PLvsPW] More Puzzles","volume":1},{"id":169130,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Mass%20Inquisition%20-%20Allegro%202012.mp3","fileSize":5330032,"name":"[PLvsPW] Mass Inquisition - Allegro 2012","volume":1},{"id":169131,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Phoenix%20Wright%20Ace%20Attorney%20-%20Court%20Begins%20(English%20Turnabout%20Mix).mp3","fileSize":2781718,"name":"[PLvsPW] Phoenix Wright Ace Attorney - Court Begins (English Turnabout Mix)","volume":1},{"id":169132,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Mass%20Inquisition%20-%20Moderato%202012.mp3","fileSize":5160450,"name":"[PLvsPW] Mass Inquisition - Moderato 2012","volume":1},{"id":169133,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Professor%20Layton's%20Theme%20II.mp3","fileSize":4860679,"name":"[PLvsPW] Professor Layton's Theme II","volume":1},{"id":169134,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/PL%20vs%20PW%20AA%20-%20Opening%20Theme.mp3","fileSize":3757239,"name":"[PLvsPW] PL vs PW AA - Opening Theme","volume":1},{"id":169135,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Professor%20Layton's%20Theme%20I.mp3","fileSize":3166360,"name":"[PLvsPW] Professor Layton's Theme I","volume":1},{"id":169136,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Prelude.mp3","fileSize":1363016,"name":"[PLvsPW] Prelude","volume":1},{"id":169137,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Pursuit%20-%20Cornered%20(English%20Turnabout%20Mix).mp3","fileSize":3189422,"name":"[PLvsPW] Pursuit - Cornered (English Turnabout Mix)","volume":1},{"id":169138,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/PL%20vs%20PW%20AA%20-%20Ending%20Theme.mp3","fileSize":5289691,"name":"[PLvsPW] PL vs PW AA - Ending Theme","volume":1},{"id":169139,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Pursuit%20-%20Spell-breaker%20%5BPursuit%202012%5D.mp3","fileSize":6227242,"name":"[PLvsPW] Pursuit - Spell-breaker [Pursuit 2012]","volume":1},{"id":169140,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Premonition%20-%20The%20Two-Step%20Turnabout.mp3","fileSize":3588220,"name":"[PLvsPW] Premonition - The Two-Step Turnabout","volume":1},{"id":169143,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Puzzle%20Deductions.mp3","fileSize":4442105,"name":"[PLvsPW] Puzzle Deductions","volume":1},{"id":169144,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Quiet%20Moments.mp3","fileSize":3715160,"name":"[PLvsPW] Quiet Moments","volume":1},{"id":169145,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Rainy%20Night.mp3","fileSize":1505177,"name":"[PLvsPW] Rainy Night","volume":1},{"id":169146,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Sealed%20Memories.mp3","fileSize":1507514,"name":"[PLvsPW] Sealed Memories","volume":1},{"id":169147,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Town's%20Past.mp3","fileSize":4094054,"name":"[PLvsPW] The Town's Past","volume":1},{"id":169148,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/That%20Case.mp3","fileSize":927973,"name":"[PLvsPW] That Case","volume":1},{"id":169149,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Light%20of%20Truth.mp3","fileSize":1469895,"name":"[PLvsPW] The Light of Truth","volume":1},{"id":169150,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Hidden%20Garden.mp3","fileSize":3415571,"name":"[PLvsPW] The Hidden Garden","volume":1},{"id":169151,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Bell%20Tower's%20Arrival.mp3","fileSize":1043410,"name":"[PLvsPW] The Bell Tower's Arrival","volume":1},{"id":169152,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Taelende!!.mp3","fileSize":1195697,"name":"[PLvsPW] Taelende!!","volume":1},{"id":169153,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Rescue%20and%20Retribution.mp3","fileSize":2735464,"name":"[PLvsPW] Rescue and Retribution","volume":1},{"id":169154,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Dark%20Forest.mp3","fileSize":4541602,"name":"[PLvsPW] The Dark Forest","volume":1},{"id":169155,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Magic%20Book.mp3","fileSize":1499930,"name":"[PLvsPW] The Magic Book","volume":1},{"id":169156,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Shady%20Workshop.mp3","fileSize":3879343,"name":"[PLvsPW] The Shady Workshop","volume":1},{"id":169157,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Truth%20Revealed%20(English%20Turnabout%20Mix).mp3","fileSize":1533442,"name":"[PLvsPW] The Truth Revealed (English Turnabout Mix)","volume":1},{"id":169158,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Town%20at%20Night.mp3","fileSize":4993266,"name":"[PLvsPW] The Town at Night","volume":1},{"id":169159,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Tavern.mp3","fileSize":2825538,"name":"[PLvsPW] Tavern","volume":1},{"id":169160,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Tension.mp3","fileSize":3673690,"name":"[PLvsPW] Tension","volume":1},{"id":169161,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Sealed%20-%20The%20Darkness%20Within.mp3","fileSize":4688038,"name":"[PLvsPW] Sealed - The Darkness Within","volume":1},{"id":169162,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Reminiscing%20-%20The%20Legendary%20Fire.mp3","fileSize":3142742,"name":"[PLvsPW] Reminiscing - The Legendary Fire","volume":1},{"id":169163,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Storyteller's%20Tower.mp3","fileSize":3945975,"name":"[PLvsPW] The Storyteller's Tower","volume":1},{"id":169164,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Suspense%20(English%20Turnabout%20Mix).mp3","fileSize":2206031,"name":"[PLvsPW] Suspense (English Turnabout Mix)","volume":1},{"id":169165,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Storyteller's%20Theme%20-%20Parade.mp3","fileSize":2892071,"name":"[PLvsPW] The Storyteller's Theme - Parade","volume":1},{"id":169166,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Reminiscing%20-%20A%20Golden%20Message.mp3","fileSize":3872408,"name":"[PLvsPW] Reminiscing - A Golden Message","volume":1},{"id":169167,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Suspense.mp3","fileSize":5073020,"name":"[PLvsPW] Suspense","volume":1},{"id":169168,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Professor's%20Deductions.mp3","fileSize":3615958,"name":"[PLvsPW] The Professor's Deductions","volume":1},{"id":169169,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Creator%20and%20the%20Alchemist.mp3","fileSize":7389564,"name":"[PLvsPW] The Creator and the Alchemist","volume":1},{"id":169170,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Reunion.mp3","fileSize":4044792,"name":"[PLvsPW] Reunion","volume":1},{"id":169171,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Reminiscing%20-%20Fated%20Magic.mp3","fileSize":5173199,"name":"[PLvsPW] Reminiscing - Fated Magic","volume":1},{"id":169172,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Final%20Witness.mp3","fileSize":6842690,"name":"[PLvsPW] The Final Witness","volume":1},{"id":169173,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Underground%20Ruins.mp3","fileSize":5363328,"name":"[PLvsPW] The Underground Ruins","volume":1},{"id":169174,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Sorrowful%20Golden%20Statue.mp3","fileSize":1142285,"name":"[PLvsPW] The Sorrowful Golden Statue","volume":1},{"id":169175,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Winning%20Combination.mp3","fileSize":6187314,"name":"[PLvsPW] The Winning Combination","volume":1},{"id":169176,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Truth%20Revealed%20%5BTruth%202012%5D.mp3","fileSize":7687709,"name":"[PLvsPW] The Truth Revealed [Truth 2012]","volume":1},{"id":169177,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Witches'%20Theme%20-%20Chase.mp3","fileSize":2412712,"name":"[PLvsPW] Witches' Theme - Chase","volume":1},{"id":169178,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Witches'%20Theme%20-%20Assault.mp3","fileSize":1716480,"name":"[PLvsPW] Witches' Theme - Assault","volume":1},{"id":169179,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Turnabout%20Sisters%20Music%20Box%20Melody.mp3","fileSize":7089449,"name":"[PLvsPW] Turnabout Sisters Music Box Melody","volume":1},{"id":169180,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Witches'%20Court%20Convenes.mp3","fileSize":4306879,"name":"[PLvsPW] Witches' Court Convenes","volume":1},{"id":169181,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Audience%20Room.mp3","fileSize":3744027,"name":"[PLvsPW] The Audience Room","volume":1},{"id":169182,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Zacharias%20Barnham%20-%20The%20Sword%20of%20Labyrinthia.mp3","fileSize":5833049,"name":"[PLvsPW] Zacharias Barnham - The Sword of Labyrinthia","volume":1},{"id":169183,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/Won%20the%20Case!%20-%20First%20Victory%20(English%20Turnabout%20Mix).mp3","fileSize":2946653,"name":"[PLvsPW] Won the Case! - First Victory (English Turnabout Mix)","volume":1},{"id":169184,"url":"https://file.garden/ZR29A3a-dUbt6ukN/_/objection.lol/Music/AA/PLvsPW/The%20Trial%20of%20the%20Great%20Witch.mp3","fileSize":5000054,"name":"[PLvsPW] The Trial of the Great Witch","volume":1});
        }
        app.__vue__.$watch('$store.state.assets.music.list', musicListListener);
        musicListListener(appState.assets.music.list);

        
        // Newline on shift+enter
        if (socketStates.options['newlines']) {
            const textArea = document.querySelector('textarea.frameTextarea');
            const textAreaInstance = textArea.parentElement.parentElement.__vue__;
            const origSend = textAreaInstance.send;
            textAreaInstance.send = function() {
                if (modifierKeys.shift) return;
                origSend(...arguments);
            }
            
            textArea.addEventListener('keydown', function (event) {
                if (!event.shiftKey || event.keyCode != 13) return;
                const start = textArea.selectionStart;
                const end = textArea.selectionEnd;
                const text = textArea.value.slice(0, start) + "\n" + textArea.value.slice(end);
                setValue(textArea, text);
                textArea.selectionEnd = end + 1;
            })
        }

        // Modifier keys for any options that need them
        if (socketStates.options['newlines']) {
            function checkModifierKeys(event) {
                modifierKeys.shift = event.shiftKey;
            }
            document.addEventListener('keydown', checkModifierKeys);
            document.addEventListener('keyup', checkModifierKeys);
        }

        
        if (socketStates.options['menu-auto-close']) {
            const MENUS_NOT_AUTO_CLOSE = ['Text Color'];
            const menus = app.querySelectorAll(':scope > div[role="menu"]');
            for (let menu of menus) {
                const titleElem = menu.querySelector('.v-list-item__title') || menu.querySelector('.v-label');
                if (titleElem == null) continue;
                
                const title = titleElem.innerText;
                if (!MENUS_NOT_AUTO_CLOSE.includes(title)) {
                    for (let button of menu.querySelectorAll('.v-btn:not(.success)')) {
                        if (button.querySelector('span.v-btn__content').textContent.slice(0, 6) === 'Manage') continue;
                        button.addEventListener('click', function() {
                            const comp = menu.__vue__.$parent.$parent;
                            comp.isActive = !comp.isActive;
                        });
                    }
                }
            }
        }

        if (socketStates.options['menu-hover']) {
            const buttons = document.querySelector('.mdi-palette').parentElement.parentElement.parentElement.querySelectorAll('button');
            for (let button of buttons) {
                button.addEventListener('mouseenter', function () {
                    for (let button of buttons) {
                        if (!button.__vue__) continue;
                        const comp = button.__vue__.$parent;
                        comp.isActive = false;
                    }

                    let toFocus = false;
                    const textArea = document.querySelector('textarea.frameTextarea')
                    if (document.activeElement == textArea) toFocus = true;
                    button.click();
                    if (toFocus) textArea.focus();
                });
            }
        }

        if (socketStates.options['old-bubbles']) {

            const buttonColumn = htmlToElement(/*html*/`
                <div class="theme--dark mr-2 d-block v-btn-toggle primary--text hil-speech-bubble-column"></div>
            `);

            const speechBubbleDropdown = document.querySelector('.v-input.v-input--hide-details.v-text-field.v-text-field--solo-flat.v-select');
            speechBubbleDropdown.style.display = 'none';
            speechBubbleDropdown.parentElement.style.position = 'relative';
            speechBubbleDropdown.parentElement.appendChild(buttonColumn);

            let activeButton = null;
            function addButton(bubble) {
                const button = htmlToElement(/*html*/`
                    <button class="${getTheme()} hil-themed v-btn v-btn--block v-size--small hil-classic-speech-button">${bubble.name}</button>
                `);
                button.addEventListener("click", function() {
                    if (button.classList.contains('v-btn--active')) {
                        button.classList.remove('v-btn--active');
                        activeButton = null;
                        speechBubbleDropdown.__vue__.selectItem(0);
                    } else {
                        if (activeButton !== null) activeButton.classList.remove('v-btn--active');
                        activeButton = button;
                        button.classList.add('v-btn--active');
    
                        speechBubbleDropdown.__vue__.selectItem(bubble.id);
                    }
                });
                buttonColumn.appendChild(button);
            }

            function updateBubbles() {
                activeButton = null;
                while (buttonColumn.lastElementChild) {
                    buttonColumn.removeChild(buttonColumn.lastElementChild);
                }
                const char = characterInstance.currentCharacter;
                if (char.id > 1000) {
                    // custom character
                    for (let bubble of characterInstance.currentCharacter.bubbles) {
                        addButton(bubble);
                    }
                } else {
                    // preset character
                    if (char.bubbleTypes[0] == '1') addButton({name: "Objection!", id: 1});
                    if (char.bubbleTypes[1] == '1') addButton({name: "Hold It!", id: 2});
                    if (char.bubbleTypes[2] == '1') addButton({name: "Take That!", id: 3});
                    if (char.bubbleTypes[3] == '1') addButton({name: "Gotcha!", id: 4});
                    if (char.bubbleTypes[4] == '1') addButton({name: "Eureka!", id: 5});
                }
                if (buttonColumn.childElementCount === 0) speechBubbleDropdown.style.removeProperty("display");
                if (buttonColumn.childElementCount > 0) speechBubbleDropdown.style.display = "none";
            }

            updateBubbles();
            characterInstance.$watch('currentCharacter.id', updateBubbles);

            speechBubbleDropdown.__vue__.$watch("selectedItems", function(selectedItems) {
                if (selectedItems[0] && selectedItems[0].value !== 0) return;
                if (activeButton !== null) activeButton.classList.remove('v-btn--active');
                activeButton = null;
            });
        }

        if (socketStates.options['extended-log']) {
            
            let settingsButton;
            let logColors;
            let saveColorsButton;

            const toggleButton = document.createElement('button');
            toggleButton.className = 'v-btn v-btn--has-bg hil-icon-button hil-expanded-log-button hil-themed ' + getTheme();
            const icon = createIcon("console");
            toggleButton.appendChild(icon);

            toggleButton.addEventListener('mouseenter', function () {
                if (toggleButton.tooltip === undefined) toggleButton.tooltip = createTooltip("Extended Log", toggleButton);
                toggleButton.tooltip.realign();
                toggleButton.tooltip.classList.remove('hil-hide');
            });
            toggleButton.addEventListener('mouseleave', () => toggleButton.tooltip.classList.add('hil-hide'));

            const chat = document.querySelector('.chat');
            const list = chat.querySelector('[role="list"]');

            const logDiv = document.createElement('div');
            logDiv.className = getTheme() + ` hil-themed hil-expanded-log hil-hide-muted`;
            logDiv.style.display = "none";

            const HIDABLE_CLASSES = {
                ".hil-hide-timestamps": ".hil-log-timestamp",
                ".hil-hide-plain": ".hil-log-plain",
                ".hil-hide-muted": ".hil-log-muted",
                ".hil-hide-tags": ".hil-log-tag",
                ".hil-hide-names": ".hil-log-name",
            }
            logDiv.addEventListener("copy", function(e) {
                const clipboardData = e.clipboardData || window.clipboardData;
                const selectionContents = getHTMLOfSelection();
                console.log(selectionContents.innerHTML);

                for (let hideClass in HIDABLE_CLASSES) {
                    if (logDiv.matches(hideClass)) {
                        for (let elem of selectionContents.querySelectorAll(HIDABLE_CLASSES[hideClass])) {
                            elem.remove();
                        }
                    }
                }
                if (logDiv.matches('.hil-no-breaks')) {
                    for (let elem of selectionContents.querySelectorAll('br')) {
                        elem.remove();
                    }
                } else {
                    for (let div of selectionContents.querySelectorAll(':scope > div')) {
                        const br = document.createElement('br');
                        div.appendChild(br);
                    }
                }

                for (let elem of selectionContents.querySelectorAll('*')) {
                    if (elem.style.color === "rgb(255, 255, 255)" || elem.style.color === "rgb(0, 0, 0)") elem.style.removeProperty('color');
                }

                console.log(selectionContents.innerHTML);
                clipboardData.setData('text/html', selectionContents.innerHTML);
                clipboardData.setData('text/plain', selectionContents.innerText);
                e.preventDefault();
            });
            chat.appendChild(logDiv);

            let extendedLog = false;
            toggleButton.addEventListener('click', function() {
                extendedLog = !extendedLog;
                if (extendedLog) {

                    list.style.display = "none";
                    logDiv.style.display = "";
                    toggleButton.tooltip.textContent = "Normal Chat Log";
                    toggleButton.tooltip.realign();
                    icon.classList.remove('mdi-console');
                    icon.classList.add('mdi-list-box-outline');
                    settingsButton.classList.add('hil-shown');
                    
                } else {

                    logDiv.style.display = "none";
                    list.style.display = "";
                    toggleButton.tooltip.textContent = "Extended Log";
                    toggleButton.tooltip.realign();
                    icon.classList.remove('mdi-list-box-outline');
                    icon.classList.add('mdi-console');
                    settingsButton.classList.remove('hil-shown');

                }
            });

            chat.parentElement.appendChild(toggleButton);


            const LOG_TYPES = {
                message: 0,
                chatlog: 1,
                info: 2,
                popup: 4,
            }
            let lastSpeaker = null;
            let forceNewDiv = false;
            let nameColors = {};
            function addSpaceBeforeBR(br) {
                const space = document.createElement('span');
                space.textContent = " ";
                space.classList.add("hil-space");
                if (br.classList.contains('hil-log-muted')) space.classList.add("hil-log-muted");
                br.parentElement.insertBefore(space, br);
            }
            function registerMessage(name, text, type, muted=false, logArgs=null) {
                let div;
                let newDiv = false;
                let mutedSpan = false;
                if (forceNewDiv || name != lastSpeaker || type == LOG_TYPES.popup) {
                    forceNewDiv = false;
                    newDiv = true;
                    div = document.createElement('div');

                    if (muted) {
                        div.classList.add('hil-log-muted');
                    }

                    if (type === LOG_TYPES.message) {
                        div.dataset.name = name;
                        if (nameColors[name]) div.style.color = nameColors[name];
                    } else if (type == LOG_TYPES.chatlog || type == LOG_TYPES.info) {
                        div.classList.add("hil-log-plain");
                    } else if (type == LOG_TYPES.popup) {
                        if (logArgs !== null) div.style.color = logArgs;
                        div.classList.add('hil-log-shout');
                        forceNewDiv = true;
                    }
                    
                    logDiv.appendChild(div);
                } else {
                    div = logDiv.lastElementChild;
                    if (muted) mutedSpan = true;
                }

                const spanName = document.createElement('span');
                if (newDiv && type != LOG_TYPES.popup) {

                    const spanTimestamp = document.createElement('span');
                    spanTimestamp.classList.add( "hil-log-timestamp");
                    if (mutedSpan) spanTimestamp.classList.add( "hil-log-muted");
                    const hours = String(new Date().getHours()).padStart(2, 0);
                    const minutes = String(new Date().getMinutes()).padStart(2, 0);
                    spanTimestamp.textContent = `(${hours}:${minutes}) `;
                    div.appendChild(spanTimestamp);

                    spanName.classList.add("hil-log-name");
                    spanName.textContent += `${name}`;
                    if (type !== LOG_TYPES.info) spanName.textContent += ":";
                    spanName.textContent += " ";
                    div.appendChild(spanName);

                }

                const spanMain = document.createElement('span');
                if (type !== LOG_TYPES.message) {
                    spanMain.textContent += text;
                    spanMain.textContent = spanMain.textContent.trim();
                }

                if (spanMain.textContent.length > 0) {
                    if (mutedSpan) spanMain.classList.add("hil-log-muted");
                    div.appendChild(spanMain);
                }

                if (type === LOG_TYPES.message) {
                    const REGEX_TAG = /(\[\/#\])|(\[#.*?\])/g;
                    const REGEX_COLOR_TAG = /\[#\/([0-9a-zA-Z]*?)\]$/g;
                    const REGEX_UNCOLOR_TAG = /\[\/#\]$/g;
                    let currentColor = null;
                    for (let str of text.split(REGEX_TAG)) {
                        if (!str) continue;
                        const span = document.createElement('span');
                        if (mutedSpan) span.classList.add("hil-log-muted");
                        if (str.match(REGEX_TAG)) span.classList.add("hil-log-tag");

                        if (str.match(REGEX_COLOR_TAG) && currentColor === null) {
                            let color = str.replace(REGEX_COLOR_TAG, "$1");
                            if (color == "r") currentColor = "#f77337";
                            if (color == "g") currentColor = "#00f61c";
                            if (color == "b") currentColor = "#6bc7f6";
                            if (color[0] == "c") {
                                color = color.slice(1);
                                currentColor = "#" + color;
                            }
                        }

                        if (currentColor !== null) span.style.color = currentColor;
                        if (str.match(REGEX_UNCOLOR_TAG)) currentColor = null;
                        span.textContent = str;
                        div.appendChild(span);
                    }
                }

                if (spanMain.textContent.length > 0 || (type === LOG_TYPES.message && text.length > 0)) {
                    const br = document.createElement('br');
                    div.appendChild(br);
                    if (logDiv.classList.contains('hil-no-breaks')) addSpaceBeforeBR(br);
                    if (mutedSpan) br.classList.add("hil-log-muted");
                }

                lastSpeaker = name;
            }
            addMessageListener(window, 'log-message', function(data) {
                registerMessage('(Info)', data.text, LOG_TYPES.info);
            });
            addMessageListener(window, 'plain_message', function(data) {
                const muted = muteInputInstance.selectedItems.find(item => item.id === data.userId);
                registerMessage('(Chat) ' + data.username, data.text, LOG_TYPES.chatlog, muted);
            });
            addMessageListener(window, 'receive_message', function(data) {
                const muted = muteInputInstance.selectedItems.find(item => item.id === data.userId);

                const name = data.frame.username;
                if (!(name in nameColors)) {
                    nameColors[name] = "#ffffff";

                    const colorRow = htmlToElement(/*html*/`
                        <div class="hil-log-settings-row">
                            <div class="hil-log-settings-color-name" data-name="${name}">Color: ${name}</div>
                            <div class="hil-log-settings-color">
                                <input type="color">
                                <button class="v-btn v-btn--has-bg hil-icon-button hil-themed theme--dark"><i class="v-icon notranslate mdi hil-themed mdi-delete theme--dark"></i></button>
                            </div>
                        </div>
                    `);
                    colorRow.querySelector('input').value = nameColors[name];
                    colorRow.querySelector('button').addEventListener('click', function() {
                        delete nameColors[name];
                        colorRow.remove();
                        for (let div of logDiv.querySelectorAll(`div[data-name="${name}"]`)) {
                            div.style.removeProperty("color");
                        }
                    });
                    logColors.appendChild(colorRow);
                    saveColorsButton.classList.remove('v-btn--disabled');
                }

                if (data.frame.bubbleType) {
                    let bubbleName = null;
                    if (data.frame.bubbleType <= 5) {
                        if (data.frame.bubbleType === 1) bubbleName = "OBJECTION!";
                        if (data.frame.bubbleType === 2) bubbleName = "HOLD IT!";
                        if (data.frame.bubbleType === 3) bubbleName = "TAKE THAT!";
                        if (data.frame.bubbleType === 4) bubbleName = "GOTCHA!";
                        if (data.frame.bubbleType === 5) bubbleName = "EUREKA!";
                    } else if (frameInstance.customCharacters[data.frame.characterId]) {
                        // registerMessage(data.frame.username, "", LOG_TYPES.default, muted);
                        const bubble = frameInstance.customCharacters[data.frame.characterId].bubbles.find(bubble => bubble.id === data.frame.bubbleType);
                        if (bubble) {
                            bubbleName = bubble.name.toUpperCase();
                        }
                    }
                    if (bubbleName !== null) registerMessage(data.frame.username, bubbleName, LOG_TYPES.popup, muted, "#f44");
                }

                if (data.frame.frameActions) for (let action of data.frame.frameActions) {
                    if (action.actionId !== 7) continue;
                    if (action.actionParam == "1") registerMessage(data.frame.username, "-- WITNESS TESTIMONY --", LOG_TYPES.popup, muted, "#2084ff");
                    if (action.actionParam == "2") registerMessage(data.frame.username, "-- CROSS EXAMINATION --", LOG_TYPES.popup, muted, "#ff2133");
                    if (action.actionParam == "4") registerMessage(data.frame.username, "-- GUILTY --", LOG_TYPES.popup, muted);
                    if (action.actionParam == "5") registerMessage(data.frame.username, "-- NOT GUILTY --", LOG_TYPES.popup, muted);
                }

                registerMessage(data.frame.username, data.frame.text, LOG_TYPES.message, muted);
            });


            settingsButton = document.createElement('button');
            settingsButton.className = 'v-btn v-btn--has-bg hil-icon-button hil-expanded-log-button hil-expanded-log-settings-button hil-themed ' + getTheme();
            settingsButton.appendChild(createIcon("cog"));

            settingsButton.addEventListener('mouseenter', function () {
                if (settingsButton.tooltip === undefined) settingsButton.tooltip = createTooltip("Log Settings", settingsButton);
                settingsButton.tooltip.realign();
                settingsButton.tooltip.classList.remove('hil-hide');
            });
            settingsButton.addEventListener('mouseleave', () => settingsButton.tooltip.classList.add('hil-hide'));
            chat.parentElement.appendChild(settingsButton);

            const settingsCard = htmlToElement(/*html*/`
                <div class="hil-hide hil-card hil-log-settings hil-themed ${getTheme()}">
                    <div class="hil-log-settings-row"><div>Show timestamps</div></div>
                    <div class="hil-log-settings-row"><div>Show names</div></div>
                    <div class="hil-log-settings-row"><div>Show chat log messages</div></div>
                    <div class="hil-log-settings-row"><div>Show tags</div></div>
                    <div class="hil-log-settings-row"><div>Separate message lines</div></div>
                    <div class="hil-log-settings-row"><div>Show muted messages</div></div>
                    <hr class="v-divider hil-themed ${getTheme()}" style="margin-bottom: 0">
                    <div class="hil-log-colors"></div>
                </div>
            `);

            const TOGGLE_CLASSES = ["hil-hide-timestamps", "hil-hide-names", "hil-hide-plain", "hil-hide-tags", "hil-no-breaks", "hil-hide-muted"];
            for (let i = 0; i < TOGGLE_CLASSES.length; i++) {
                const cls = TOGGLE_CLASSES[i];
                const enabledDefault = (cls === "hil-hide-muted") ? false : true;
                const swtch = createSwitch(function(value) {
                    logDiv.classList[value ? "remove" : "add"](cls);
                    if (cls === "hil-no-breaks") {
                        for (let br of logDiv.querySelectorAll('br')) {
                            if (!br.previousElementSibling) continue;
                            if (value) {
                                if (br.previousElementSibling.classList.contains("hil-space")) br.previousElementSibling.remove();
                            } else {
                                addSpaceBeforeBR(br);
                            }
                            if (value) br.previousElementSibling.textContent = br.previousElementSibling.textContent.trim();
                            else br.previousElementSibling.textContent += " ";
                        }
                    }
                }, enabledDefault);
                settingsCard.children[i].appendChild(swtch);
            }

            logColors = settingsCard.querySelector('.hil-log-colors');
            saveColorsButton = createButton(
                function() {
                    const updated = {};
                    for (let row of logColors.children) {
                        const name = row.querySelector('.hil-log-settings-color-name').dataset.name;
                        const color = row.querySelector('input').value;
                        if (nameColors[name] != color) {
                            updated[name] = true;
                        }
                        nameColors[name] = color;
                    }
                    for (let div of logDiv.querySelectorAll('div[data-name]')) {
                        if (updated[div.dataset.name]) div.style.color = nameColors[div.dataset.name];
                    }
                },
                'Save Colors',
                'hil-log-colors-button v-btn--disabled',
            );
            settingsCard.appendChild(saveColorsButton);
            app.appendChild(settingsCard);

            document.addEventListener('click', function () {
                if (document.querySelector('.hil-log-settings:hover')) return;
                if (document.querySelector('.hil-expanded-log-settings-button:hover')) return;
                settingsCard.classList.add('hil-hide');
            });

            settingsButton.addEventListener('click', function() {
                settingsCard.classList.toggle("hil-hide");
                if (!settingsCard.classList.contains("hil-hide")) {
                    settingsCard.style.right = 0;
                    const rect = settingsButton.getClientRects()[0];
                    settingsCard.style.top = (rect.y + rect.height + 17) + "px";
                }
            });

        }
    });


    const origOnevent = socket.onevent;
    socket.onevent = function (e) {
        const [action, data] = e.data;

        if (action === 'spectate_success') {
            socketStates.spectating = true;
        } else if ((action === 'join_success' || action === 'join_discord_success') && socketStates.spectating) {
            location.reload();
        } else if (action === 'receive_message') {

            if (socketStates.options['tts'] && socketStates['tts-enabled']) data.frame.frameActions.push({ "actionId": 5 });
            if (socketStates.options['testimony-mode'] && socketStates['testimony-music']) {
                const matches = data.frame.text.match(/\[#bgm([0-9s]|fo|fi)*?\]/g);
                if (matches && matches.find(match => match !== socketStates['testimony-music'])) socketStates['testimony-music-state'] = false;
            }
            if (socketStates.options['list-moderation'] && socketStates.options['mute-character']) {
                const unwatch = frameInstance.$watch('frame', function (frame) {
                    if (!compareShallow(frame, data.frame, ['text', 'poseId', 'bubbleType', 'username', 'mergeNext', 'doNotTalk', 'goNext', 'poseAnimation', 'flipped', 'backgroundId', 'characterId', 'popupId'])) return;
                    unwatch();

                    if (data.userId in socketStates['mutedCharUsers']) {
                        const muteCharacter = getMuteCharacter(frameInstance.character.id, frame.poseId);
                        if (frameInstance.pairConfig?.characterId === frameInstance.character.id) frameInstance.pairConfig.characterId = muteCharacter.characterId;
                        else if (frameInstance.pairConfig?.characterId2 === frameInstance.character.id) frameInstance.pairConfig.characterId2 = muteCharacter.characterId;
                        frame.characterId = muteCharacter.characterId;
                        frame.poseId = muteCharacter.poseId;
                    }

                    if (Object.values(muteCharacters).map(character => character.poseId).includes(frame.pairPoseId)) return;
                    const pairedUser = roomInstance.pairs.find(pair => pair.userId1 === data.userId)?.userId2 || roomInstance.pairs.find(pair => pair.userId2 === data.userId)?.userId1;
                    if (!(pairedUser in socketStates['mutedCharUsers'])) return;

                    const pairIs2 = frameInstance.character.id === frameInstance.pairConfig.characterId;
                    const muteCharacter = getMuteCharacter(pairIs2 ? frameInstance.pairConfig.characterId2 : frameInstance.pairConfig.characterId, frame.pairPoseId);
                    frameInstance.frame.pairPoseId = muteCharacter.poseId;
                    if (pairIs2) frameInstance.pairConfig.characterId2 = muteCharacter.characterId;
                    else frameInstance.pairConfig.characterId = muteCharacter.characterId;
                });
            }
            socketStates['prev-message'] = data;
            
            if (socketStates.options['extended-log']) {
                window.postMessage(['receive_message', data]);
            }

        } else if (action === 'receive_plain_message') {
            window.postMessage(['plain_message', {
                text: data.text,
                userId: data.userId,
                username: roomInstance.users.find(user => user.id === data.userId).username,
            }]);
        } else if (action === 'user_left') {
            if (socketStates.options['remute'] && data.authUsername) {
                if (muteInputInstance.selectedItems.find(user => user.id === data.id)) {
                    socketStates['mutedLeftCache'][data.authUsername] = true;
                }
                if (socketStates.options['mute-character'] && data.id in socketStates['mutedCharUsers']) {
                    socketStates['hiddenLeftCache'][data.authUsername] = true;
                }
            }
            if (socketStates.options['chat-moderation']) {
                for (let buttonContainer of document.querySelectorAll('div.hil-user-action-buttons[data-user-id="' + data.id + '"]')) {
                    buttonContainer.removeWithTooltips();
                }
            }
        } else if (action === 'set_mods') {
            for (let icon of document.querySelectorAll('.hil-userlist-mod > i.mdi-crown')) {
                const button = icon.parentElement;
                if (!data.includes(parseInt(button.parentElement.dataset.userId))) continue;
                icon.classList.add('mdi-account-arrow-down');
                icon.classList.remove('mdi-crown');
                button.tooltip?.realign('Remove moderator');
            }
            for (let icon of document.querySelectorAll('.hil-userlist-mod > i.mdi-account-arrow-down')) {
                const button = icon.parentElement;
                if (data.includes(parseInt(button.parentElement.dataset.userId))) continue;
                icon.classList.remove('mdi-account-arrow-down');
                icon.classList.add('mdi-crown');
                button.tooltip?.realign('Make moderator');
            }
        } else if (action === 'user_joined') {
            if (socketStates.options['remute'] && data.authUsername) {
                function addJoinText(text) {
                    const checkLastMessage = () => {
                        if (chatInstance.messages[chatInstance.messages.length - 1].text.slice(0, -' joined.'.length) !== data.username) return false;
                        chatInstance.messages[chatInstance.messages.length - 1].text += ' ' + text;
                        return true;
                    }
                    if (checkLastMessage() === false) {
                        const unwatch = chatInstance.$watch('messages', function () {
                            if (checkLastMessage()) unwatch();
                        });
                    }
                }

                if (data.authUsername in socketStates['mutedLeftCache']) {
                    muteInputInstance.selectItem(data.id);
                    delete socketStates['mutedLeftCache'][data.authUsername];
                    addJoinText('(Automatically re-muted)');
                } else if (socketStates.options['mute-character'] && data.authUsername in socketStates['hiddenLeftCache']) {
                    addJoinText('(Automatically re-hidden)');
                }
                if (socketStates.options['mute-character'] && data.authUsername in socketStates['hiddenLeftCache']) {
                    socketStates['mutedCharUsers'][data.id] = true;
                    delete socketStates['hiddenLeftCache'][data.authUsername];
                }
            }
        }

        origOnevent(e);
    }

    const origEmit = socket.emit;
    socket.emit = function (action, data) {
        let delay = 0;

        if (action === 'message') {
            if (socketStates['no-talk'] || data.frame.text.includes('[##nt]')) data.frame.doNotTalk = true;
            if (socketStates['dont-delay'] || data.frame.text.includes('[##dd]')) data.frame.keepDialogue = true;
            if (data.frame.text.includes('[##mn]')) data.frame.mergeNext = true;
            if (data.frame.text.includes('[##ct]')) data.frame.frameActions.push({ "actionId": 9 });
            if (data.frame.text.includes('[##tm]')) data.testimony = true;

            if (socketStates.options['smart-tn'] && data.frame.poseAnimation && socketStates['prev-char'] === characterInstance.currentCharacter.id && data.frame.poseId !== socketStates['prev-pose']) {
                (function () {
                    let useTN = socketStates.options['tn-toggle-value'];
                    useTN = useTN === undefined ? true : useTN;
                    useTN = data.frame.text.includes('[##tn]') ? !useTN : useTN;
                    if (!useTN) return;

                    if (socketStates['prev-message'] !== undefined) {
                        const prevFrame = socketStates['prev-message'].frame;
                        if (prevFrame.text.match(/\[#evd[0-9]+?\]/g) || prevFrame.characterId !== data.frame.characterId || (prevFrame.pairId === data.frame.pairId && data.frame.pairId !== null)) return;
                    }

                    const patterns = socketStates.options['smart-tn-patterns'] || ['TN'];
                    const charPoses = characterInstance.currentCharacter.poses;
                    const prevPoseName = charPoses.find(pose => pose.id === socketStates['prev-pose']).name;
                    const currentPoseName = charPoses.find(pose => pose.id === data.frame.poseId).name;
                    let poseIsTN = false;
                    for (let substr of patterns) {
                        if (prevPoseName.includes(substr)) poseIsTN = true;
                        if (currentPoseName.includes(substr)) poseIsTN = true;
                    }
                    if (poseIsTN) return;

                    let tnPoses = [];
                    for (let substr of patterns) {
                        tnPoses = tnPoses.concat(charPoses.filter(pose => pose.name.includes(substr)));
                    }
                    if (tnPoses.length === 0) return;
                    const [tnPoseName, distance] = closestMatch(prevPoseName, tnPoses.map(pose => pose.name));
                    if (!tnPoseName) return;
                    const ratio = (prevPoseName.length + tnPoseName.length - distance) / (prevPoseName.length + tnPoseName.length);
                    if (ratio < 0.63) return;
                    const tnPoseId = charPoses.find(pose => pose.name === tnPoseName).id;
                    const tnData = JSON.parse(JSON.stringify(data));
                    tnData.frame.poseId = tnPoseId;
                    tnData.frame.text = '';
                    origEmit.call(socket, action, tnData);
                    delay = 1000;
                })();
            }
            if (socketStates.options['testimony-mode']) (function () {
                if (data.frame.text.includes('[##ce]')) data.testimony = false;

                const match = /\[##tmid([0-9]+?)\]/g.exec(data.frame.text);
                if (match === null) return;
                const statementId = parseInt(match[1]);
                
                if (!socketStates['testimony-music-state'] && socketStates['testimony-music'] && !data.frame.text.includes('[##nt]')) {
                    data.frame.text = socketStates['testimony-music'] + data.frame.text;
                    socketStates['testimony-music-state'] = true;
                }

                if (socketStates.testimonyPoses[statementId]) {
                    data.frame.poseId = socketStates.testimonyPoses[statementId];
                } else {
                    socketStates.testimonyPoses[statementId] = poseInstance.currentPoseId;
                    window.postMessage([
                        'set_statement_pose_name',
                        {
                            id: statementId,
                            name: poseInstance.characterPoses.find(pose => pose.id === poseInstance.currentPoseId).name,
                        }
                    ]);
                }
            })();

            socketStates['prev-pose'] = data.frame.poseId;
            socketStates['prev-char'] = characterInstance.currentCharacter.id;

            if (socketStates.options['more-color-tags']) {
                data.frame.text = data.frame.text.replaceAll('[#/y]', '[#/cf3ff00]');
                data.frame.text = data.frame.text.replaceAll('[#/w]', '[#/cbbb]');
                data.frame.text = data.frame.text.replaceAll('[#/dr]', '[#/cf00]');
            }

            if (socketStates.options['fix-tag-nesting']) {
                data.frame.text = fixTagNesting(data.frame.text);
            }

            data.frame.text = data.frame.text.replaceAll(/\[##.*?\]/g, '');
            if (data.frame.text.length > 500) {
                data.frame.text = data.frame.text.slice(0, 500);
                toolbarInstance.$snotify.info('Your message ended up being above 500 character limit, and was cropped.');
            }
        }

        if (delay === 0) origEmit.call(socket, action, data);
        else setTimeout(() => origEmit.call(socket, action, data), delay);
    }
}

main();
