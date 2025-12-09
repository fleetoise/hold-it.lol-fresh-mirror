import * as hdom from "../lib/utils/hdom.js";
import browser from "webextension-polyfill";
import { Testimony } from "../lib/utils/htestimony.js";

let queue = [];
let currentIndex = 0;
let isPlaying = false;
let loopTimeout = null;
let crossExamObserver = null;
let mode = "TESTIMONY"; // TESTIMONY || CROSS_EXAM

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
    stop(); // resets playback state on mode switch

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

function parseDelay(text) {
    let pause = 1000; 
    let cleanText = text;

    const match = text.match(/\[#p(\d+)\]/);
    if (match) {
        pause = parseInt(match[1], 10);
        cleanText = text.replace(match[0], '');
    }

    const readingTime = Math.max(2500, cleanText.length * 60);
    
    return { 
        cleanText, 
        totalDelay: readingTime + pause 
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

function runLoop() {
    if (!isPlaying) return;
    
    // Safety boundary check
    if (currentIndex >= queue.length) {
        stop();
        return;
    }

    const rawText = queue[currentIndex];
    const { cleanText, totalDelay } = parseDelay(rawText);
    
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

function nextStatement() {
    if (queue.length === 0) return;
    currentIndex++;
    if (currentIndex >= queue.length) currentIndex = 0; 
    
    const rawText = queue[currentIndex];
    const { cleanText } = parseDelay(rawText);
    sendMessage(cleanText);
}

function prevStatement() {
    if (queue.length === 0) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = queue.length - 1; 
    
    const rawText = queue[currentIndex];
    const { cleanText } = parseDelay(rawText);
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
