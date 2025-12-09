import browser from "webextension-polyfill";
import { saveMenuState } from "./popup";
import { Testimony, DEFAULTS } from "../lib/utils/htestimony.js";

let testimonyManager;

function initDragAndDrop() {
    const container = document.getElementById('testimonies');

    container.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        const afterElement = getDragAfterElement(container, e.clientX);
        const draggable = document.querySelector('.dragging');
        if (!draggable || !testimonyManager) return;
        testimonyManager.reorder(draggable, afterElement);
    });
}

function getDragAfterElement(container, x) {
    const draggables = [...container.querySelectorAll('.testimony-wrapper:not(.dragging)')];
    return draggables.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const boxCenter = box.left + box.width / 2;
        const offset = x - boxCenter;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function switchToMain() {
  const mainMenu = document.getElementById("main-menu");
  const testimonyMenu = document.getElementById("testimony-menu");
 
  testimonyMenu.classList.add("transparent");

  setTimeout(function () {
    saveMenuState("main");
    testimonyMenu.classList.add("hidden");
    mainMenu.classList.remove("hidden");
    document.body.classList.remove("testimony-body");
    document.body.classList.add("main-body");
    document.body.offsetWidth;
    mainMenu.offsetWidth;
    mainMenu.classList.remove("transparent");
  }, 200);
}

async function syncToContentScript() {
    try {
        const data = testimonyManager.serialize();
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            await browser.tabs.sendMessage(tabs[0].id, {
                action: "TESTIMONY_UPDATE_DATA",
                data: data
            });
        }
    } catch (e) {
        console.warn("could not sync to content script (popup might be detached or script not ready)", e);
    }
}

async function sendCommand(action, payload = {}) {
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            await browser.tabs.sendMessage(tabs[0].id, { action, ...payload });
        }
    } catch (e) {
        console.warn("could not send command", e);
    }
}

function initListeners() {
  const backBtn = document.getElementById("back-to-main-menu");
  const appendBtn = document.getElementById("add-testimony");
  const saveBtn = document.getElementById("save-testimony");
  const copyBtn = document.getElementById("copy-json");
  
  if (backBtn) backBtn.addEventListener("click", switchToMain);
  if (appendBtn) appendBtn.addEventListener("click", () => testimonyManager.add());

  if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
          try {
              const data = await testimonyManager.save();
              
              await syncToContentScript();

              const originalText = saveBtn.innerHTML;
              saveBtn.textContent = "Saved!";
              await refreshDropdownList(); 
              setTimeout(() => { saveBtn.innerHTML = originalText; }, 1000);
          } catch (e) {
              if (e.message === "Invalid Title") {
                  alert("Please provide a valid title for the testimony");
              } else {
                  console.error(e);
              }
          }
      });
  }
  
  if (copyBtn) {
      copyBtn.addEventListener("click", () => {
          try {
              const data = testimonyManager.serialize();
              const jsonString = JSON.stringify(data, null, 2);
              navigator.clipboard.writeText(jsonString).then(() => {
                   const icon = copyBtn.querySelector('use');
                   copyBtn.style.backgroundColor = "#C8E6C9"; 
                   setTimeout(() => { copyBtn.style.backgroundColor = ""; }, 1000);
              });
          } catch (e) {
              console.error(e);
              if (e.message === "Invalid Title") alert("Please ensure testimony has a title before copying");
          }
      });
  }
  
  initDragAndDrop();
}

function initDropdown() {
    const dropdownBtn = document.getElementById("testimony-selector-btn");
    const dropdownContent = document.getElementById("testimony-dropdown-content");
    const searchInput = document.getElementById("testimony-search");
    const testimonyList = document.getElementById("testimony-list");
    const selectedText = document.getElementById("selected-testimony-text");
    const chevronDown = dropdownBtn.querySelector(".chevron-down");
    const chevronUp = dropdownBtn.querySelector(".chevron-up");
    const createNewBtn = document.getElementById("create-new-testimony-btn");
    const deleteBtn = document.getElementById("delete-testimony-btn");

    if (!dropdownBtn || !dropdownContent) return;

    refreshDropdownList();

    function toggleDropdown() {
        const isHidden = dropdownContent.classList.contains("hidden");
        if (isHidden) {
            dropdownContent.classList.remove("hidden");
            chevronDown.classList.add("hidden");
            chevronUp.classList.remove("hidden");
            searchInput.focus();
        } else {
            dropdownContent.classList.add("hidden");
            chevronDown.classList.remove("hidden");
            chevronUp.classList.add("hidden");
        }
    }

    dropdownBtn.addEventListener("click", (e) => {
        if (e.target === selectedText) return;
        e.stopPropagation(); 
        toggleDropdown();
    });

    window.addEventListener("click", (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
            if (!dropdownContent.classList.contains("hidden")) toggleDropdown();
        }
    });

    testimonyList.addEventListener("click", async (e) => {
        const option = e.target.closest(".testimony-option");
        if (option) {
            const id = option.dataset.id;
            const type = option.dataset.type;
            let data = null;
            
            if (type === "default") {
                data = DEFAULTS[id];
            } else if (type === "custom") {
                const key = option.dataset.key;
                const result = await browser.storage.local.get(key);
                data = result[key];
            }
            
            if (data) {
                testimonyManager.load(data);
                await syncToContentScript();
            }
            toggleDropdown();
        }
    });

    if (createNewBtn) {
        createNewBtn.addEventListener("click", () => {
             selectedText.textContent = "New Testimony";
             if(testimonyManager.start) testimonyManager.start.textContent = "";
             if(testimonyManager.end) testimonyManager.end.textContent = "";
             testimonyManager.clear();
             
             if(testimonyManager.startColorBtn) {
                 testimonyManager.startColorBtn.classList.remove('color-g', 'color-r', 'color-b');
                 testimonyManager.startColorBtn.classList.add('color-none');
                 testimonyManager.startColorBtn.dataset.color = 'none';
             }
             if(testimonyManager.endColorBtn) {
                 testimonyManager.endColorBtn.classList.remove('color-g', 'color-r', 'color-b');
                 testimonyManager.endColorBtn.classList.add('color-none');
                 testimonyManager.endColorBtn.dataset.color = 'none';
             }
             if(testimonyManager.startPauseInput) testimonyManager.startPauseInput.value = "";
             if(testimonyManager.endPauseInput) testimonyManager.endPauseInput.value = "";

             testimonyManager.add();
             toggleDropdown();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            await testimonyManager.delete();
            await refreshDropdownList();
            toggleDropdown();
        });
    }

    searchInput.addEventListener("keyup", () => {
        const filter = searchInput.value.toLowerCase();
        const options = testimonyList.getElementsByClassName("testimony-option");
        for (let i = 0; i < options.length; i++) {
            const txtValue = options[i].textContent || options[i].innerText;
            if (txtValue.toLowerCase().indexOf(filter) > -1) {
                options[i].style.display = "";
            } else {
                options[i].style.display = "none";
            }
        }
    });
}

async function refreshDropdownList() {
    const testimonyList = document.getElementById("testimony-list");
    if (!testimonyList) return;
    testimonyList.innerHTML = '';

    Object.values(DEFAULTS).forEach(item => {
        const li = document.createElement("li");
        li.className = "testimony-option";
        li.dataset.id = item.id;
        li.dataset.type = "default";
        li.textContent = item.title;
        testimonyList.appendChild(li);
    });

    const storage = await browser.storage.local.get(null);
    Object.keys(storage).forEach(key => {
        if (key.startsWith("testimony_")) {
            const data = storage[key];
            const li = document.createElement("li");
            li.className = "testimony-option";
            li.dataset.id = data.id; 
            li.dataset.type = "custom";
            li.dataset.key = key; 
            li.textContent = data.title;
            testimonyList.appendChild(li);
        }
    });
}

function initModeSwitcher() {
    const modeSwitchBtn = document.getElementById("mode-switch-btn");
    if (!modeSwitchBtn) return;
    
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if(tabs[0]) {
            browser.tabs.sendMessage(tabs[0].id, { action: "TESTIMONY_GET_STATE" })
                .then(state => {
                    if (state && state.mode === "CROSS_EXAM") {
                        modeSwitchBtn.textContent = "Cross Examination Mode";
                        modeSwitchBtn.style.backgroundColor = "#ffab91";
                    }
                })
                .catch(() => {});
        }
    });

    modeSwitchBtn.addEventListener("click", () => {
        const isCrossExam = modeSwitchBtn.textContent.includes("Testimony");
        
        modeSwitchBtn.textContent = isCrossExam ? "Cross Examination Mode" : "Testimony Mode";
        modeSwitchBtn.style.backgroundColor = isCrossExam ? "#ffab91" : "";
        
        sendCommand("TESTIMONY_SET_MODE", { 
            mode: isCrossExam ? "CROSS_EXAM" : "TESTIMONY" 
        });
    });
}

function initControls() {
    const activateBtn = document.getElementById("activate-testimony");
    const pauseBtn = document.getElementById("pause-testimony");
    const stopBtn = document.getElementById("deactivate-testimony");

    function updateActiveState(activeId) {
        [activateBtn, pauseBtn, stopBtn].forEach(btn => {
            if(btn) btn.classList.remove('active');
        });
        if (activeId) {
            const btn = document.getElementById(activeId);
            if (btn) btn.classList.add('active');
        }
    }

    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if(tabs[0]) {
            browser.tabs.sendMessage(tabs[0].id, { action: "TESTIMONY_GET_STATE" })
                .then(state => {
                    if (state && state.isPlaying) {
                        updateActiveState("activate-testimony");
                    }
                })
                .catch(() => {});
        }
    });

    if (activateBtn) {
        activateBtn.addEventListener("click", () => {
            updateActiveState("activate-testimony");
            sendCommand("TESTIMONY_PLAY");
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener("click", () => {
            updateActiveState("pause-testimony");
            sendCommand("TESTIMONY_PAUSE");
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener("click", () => {
            updateActiveState("deactivate-testimony");
            sendCommand("TESTIMONY_STOP");
        });
    }
}

function initHorizontalScroll() {
    const testimonyBox = document.getElementById('testimony-box');
    if (testimonyBox) {
        testimonyBox.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                const target = e.target;
                const isTestimonyTextarea = target.classList.contains('testimony');
                if (isTestimonyTextarea) {
                    const isScrollingDown = e.deltaY > 0;
                    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight;
                    const isAtTop = target.scrollTop === 0;
                    if ((isScrollingDown && !isAtBottom) || (!isScrollingDown && !isAtTop)) return;
                }
                e.preventDefault(); 
                testimonyBox.scrollLeft += e.deltaY;
            }
        }, { passive: false }); 
    }
}

function initSwitches() {
    const startToggle = document.getElementById('toggle-start');
    const endToggle = document.getElementById('toggle-end');
    const startBox = document.getElementById('start-testimony');
    const endBox = document.getElementById('end-testimony');

    function updateState() {
        syncToContentScript();
    }

    function toggleState(checkbox, element) {
        if (checkbox.checked) {
            element.setAttribute('contenteditable', 'true');
            element.classList.remove('disabled');
        } else {
            element.setAttribute('contenteditable', 'false');
            element.classList.add('disabled');
        }
        updateState();
    }

    if(startToggle && startBox) {
        startToggle.addEventListener('change', () => toggleState(startToggle, startBox));
    }
    if(endToggle && endBox) {
        endToggle.addEventListener('change', () => toggleState(endToggle, endBox));
    }
}

export async function initTestimonyMenu() {
  testimonyManager = new Testimony();
  
  initListeners(); 
  initDropdown(); 
  initModeSwitcher();
  initControls();
  initHorizontalScroll();
  initSwitches();
  
  try {
      const result = await browser.storage.local.get('lastLoadedId');
      const lastId = result.lastLoadedId;
      
      if (lastId) {
          if (DEFAULTS[lastId]) {
              testimonyManager.load(DEFAULTS[lastId]);
              await syncToContentScript();
          } else {
              const key = `testimony_${lastId}`;
              const storage = await browser.storage.local.get(key);
              if (storage[key]) {
                  testimonyManager.load(storage[key]);
                  await syncToContentScript();
              }
          }
      }
  } catch (e) {
      console.warn("Failed to auto-load last testimony:", e);
  }
}
