import * as hdom from "../lib/utils/hdom.js";
import browser from "webextension-polyfill";
import { Testimony } from "../lib/utils/htestimony.js";

let queue = [];
let currentIndex = 0;
let isPlaying = false;
let loopTimeout = null;
let crossExamObserver = null;
let mode = "TESTIMONY"; // "CROSS_EXAM" is the other mode

export function initFeatureTestimony() {
    browser.runtime.onMessage.addListener((message) => {
        switch (message.action) {
            case "TESTIMONY_UPDATE_DATA":
                handleDataUpdate(message.data);
                break;
            case "TESTIMONY_PLAY":
                if (mode === "TESTIMONY") play();
                break;
            case "TESTIMONY_PAUSE":
                pause();
                break;
            case "TESTIMONY_STOP":
                stop();
                break;
            case "TESTIMONY_GET_STATE":
                return Promise.resolve({ isPlaying, currentIndex, mode });
            case "TESTIMONY_SET_MODE":
                setMode(message.mode);
                break;
        }
    });
}

function setMode(newMode) {
    if (mode === newMode) return;
    mode = newMode;
    stop();

    if (mode === "CROSS_EXAM") {
        startCrossExamObserver();
    } else {
        stopCrossExamObserver();
    }
}

function handleDataUpdate(data) {
    const newQueue = Testimony.getSequence(data);
    if (queue.length === 0) {
        queue = newQueue;
        currentIndex = 0;
        return;
    }

    const currentContent = queue[currentIndex];
    let newIndex = newQueue.indexOf(currentContent);

    if (newIndex === -1) {
        newIndex = Math.min(currentIndex, newQueue.length - 1);
        if (newIndex < 0) newIndex = 0;
    }

    queue = newQueue;
    currentIndex = newIndex;
}

function parseTags(text) {
    let pose = null;
    let cleanText = text;
    const poseMatch = text.match(/\[#ps(.*?)\]/);
    if (poseMatch) {
        pose = poseMatch[1];
        cleanText = cleanText.replace(poseMatch[0], '');
    }

    let pause = 1000;
    const pauseMatch = cleanText.match(/\[#p(\d+)\]/);
    if (pauseMatch) {
        pause = parseInt(pauseMatch[1], 10);
        cleanText = cleanText.replace(pauseMatch[0], '');
    }

    const readingTime = Math.max(2500, cleanText.length * 60);
    
    return { 
        cleanText, 
        totalDelay: readingTime + pause,
        pose
    };
}

function play() {
    if (queue.length === 0) return;
    
    if (currentIndex >= queue.length) currentIndex = 0;
    
    isPlaying = true;
    runLoop();
}

function pause() {
    isPlaying = false;
    if (loopTimeout) clearTimeout(loopTimeout);
    loopTimeout = null;
}

function stop() {
    isPlaying = false;
    if (loopTimeout) clearTimeout(loopTimeout);
    loopTimeout = null;
    currentIndex = 0; 
}

async function runLoop() {
    if (!isPlaying) return;
    
    if (currentIndex >= queue.length) {
        stop();
        return;
    }

    const rawText = queue[currentIndex];
    const { cleanText, totalDelay, pose } = parseTags(rawText);
    
    if (pose) {
        await changePose(pose);
    }
    
    sendMessage(cleanText);

    currentIndex++;

    if (currentIndex >= queue.length) {
        loopTimeout = setTimeout(() => {
            stop();
        }, totalDelay);
    } else {
        loopTimeout = setTimeout(() => {
            runLoop();
        }, totalDelay);
    }
}

function changePose(poseName) {
    if (!poseName) return Promise.resolve();
    poseName = poseName.trim();

    const swiper = document.querySelector('.swiper-wrapper');
    if (swiper) {
        const images = swiper.querySelectorAll('img');
        for (let img of images) {
            if (img.alt === `${poseName} pose`) {
                img.click();
                return Promise.resolve();
            }
        }
        alert(`Pose "${poseName}" not found in presets.`);
        return Promise.resolve();
    }

    const labels = Array.from(document.querySelectorAll('label'));
    const poseLabel = labels.find(l => l.textContent === "Pose");
    if (!poseLabel) return Promise.resolve();

    const input = poseLabel.parentElement.querySelector('input');
    if (!input) return Promise.resolve();

    if (input.value === poseName) return Promise.resolve();

    return new Promise((resolve) => {
        const observer = new MutationObserver((mutations, obs) => {
            const popper = document.querySelector('.MuiAutocomplete-popper');
            if (popper) {
                const options = Array.from(popper.querySelectorAll('li[role="option"]'));
                const target = options.find(o => o.textContent === poseName);
                if (target) {
                    target.click();
                    obs.disconnect();
                    resolve();
                } else {
                    alert(`Pose "${poseName}" not available.`);
                    obs.disconnect();
                    resolve();
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        input.dispatchEvent(event);

        setTimeout(() => {
            observer.disconnect();
            resolve();
        }, 2000);
    });
}

function startCrossExamObserver() {
    if (crossExamObserver) return;
    
    crossExamObserver = chatMessageObserver((node) => {
        const paragraphs = node.querySelectorAll("p");
        if (paragraphs.length >= 2) {
            const content = paragraphs[1].textContent.trim();
            if (content === "<") {
                prevStatement();
            } else if (content === ">") {
                nextStatement();
            }
        }
    });
}

function stopCrossExamObserver() {
    if (crossExamObserver) {
        crossExamObserver.disconnect();
        crossExamObserver = null;
    }
}

async function nextStatement() {
    if (queue.length === 0) return;
    currentIndex++;
    if (currentIndex >= queue.length) currentIndex = 0; 
    
    const rawText = queue[currentIndex];
    const { cleanText, pose } = parseTags(rawText);
    
    if (pose) await changePose(pose);
    sendMessage(cleanText);
}

async function prevStatement() {
    if (queue.length === 0) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = queue.length - 1; 
    
    const rawText = queue[currentIndex];
    const { cleanText, pose } = parseTags(rawText);

    if (pose) await changePose(pose);
    sendMessage(cleanText);
}

function chatMessageObserver(callback) {
  let _observer = new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
            callback(node);
        }
      }
    }
  });

  const listRoot = document.querySelector(".MuiList-root");
  if (listRoot) {
      _observer.observe(listRoot, {
        childList: true,
        subtree: true,
      });
  }
  return _observer;
}

function sendMessage(text) {
    const chatInputBox = hdom.getInputBox();
    if (!chatInputBox) return;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(chatInputBox, text);
    } else {
        chatInputBox.value = text;
    }

    const inputEvent = new Event('input', { bubbles: true });
    chatInputBox.dispatchEvent(inputEvent);

    setTimeout(() => {
        const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13
        });
        chatInputBox.dispatchEvent(enterEvent);
    }, 50);
}
