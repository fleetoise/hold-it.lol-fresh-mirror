import browser from "webextension-polyfill";

function wrap(text, tag) {
    if (!tag || tag === 'none') return text;
    return `[#/${tag}]${text}[/#]`;
}

function wrapPause(text, pauseVal) {
    if (!pauseVal || pauseVal === 0 || pauseVal === "") return text;
    return `${text}[#p${pauseVal}]`;
}

function wrapPose(text, poseVal) {
    if (!poseVal || poseVal === "") return text;
    return `[#ps${poseVal}]${text}`;
}

export const DEFAULTS = {
    "ema": {
        id: "ema",
        title: "(Ema) Two Years Ago | PRESET(unchangeable)",
        startStatement: { text: "[#/g]Witness Testimony[/#]" }, 
        endStatement: { text: "" },
        statements: [
            "I was waiting in my sister’s office that day.",
            "A man came running in, and took me hostage.",
            "Neil Marshall rescued me,",
            "but I'll never forget what I saw that instant!",
            "The man raised up his knife, and… and stabbed Mr. Marshall in the chest…!"
        ]
    },
    "sahwit": {
        id: "sahwit",
        title: "(Sahwit) Witness’s Account | PRESET(unchangeable)",
        startStatement: { text: "[#/g]Witness Testimony[/#]" },
        endStatement: { text: "" },
        statements: [
            "I was going door-to-door, selling subscriptions when I saw a man fleeing an apartment.",
            "I thought he must be in a hurry because he left the door half-open behind him.",
            "Thinking it strange, I looked inside the apartment.",
            "Then I saw her lying there… A woman… not moving… dead!",
            "I quailed in fright and found myself unable to go inside.",
            "I thought to call the police immediately!",
            "However, the phone in her apartment wasn’t working.",
            "I went to a nearby park and found a public phone.",
            "I remember the time exactly: it was 1:00 PM.",
            "The man who ran was, without a doubt, the defendant sitting right over there."
        ]
    },
    "white": {
        id: "white",
        title: "(White) The Wiretapping | PRESET(unchangeable)",
        startStatement: { text: "[#/g]Witness Testimony[/#]" },
        endStatement: { text: "" },
        statements: [
            "It was the beginning of September… the week before the murder.",
            "I had entered the Fey & Co. Law Offices.",
            "Of course, I had done so to place the wiretap.",
            "That is when I saw this glass light stand."
        ]
    }
};

const COLORS = ['none', 'g', 'r', 'b'];

function addDragListeners(element) {
    element.addEventListener('dragstart', (e) => {
        element.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
    });
}

function cycleColor(btn) {
    let current = 'none';
    if (btn.classList.contains('color-g')) current = 'g';
    if (btn.classList.contains('color-r')) current = 'r';
    if (btn.classList.contains('color-b')) current = 'b';

    const idx = COLORS.indexOf(current);
    const next = COLORS[(idx + 1) % COLORS.length];

    btn.classList.remove('color-none', 'color-g', 'color-r', 'color-b');
    btn.classList.add(`color-${next}`);
    btn.dataset.color = next;
    
    return next;
}

function updateColorBtn(btn, colorCode) {
    btn.classList.remove('color-none', 'color-g', 'color-r', 'color-b');
    let validColor = COLORS.includes(colorCode) ? colorCode : 'none';
    btn.classList.add(`color-${validColor}`);
    btn.dataset.color = validColor;
}

function parseText(rawText) {
    let cleanText = rawText;
    
    let pose = "";
    const poseMatch = cleanText.match(/\[#ps(.*?)\]/);
    if (poseMatch) {
        pose = poseMatch[1];
        cleanText = cleanText.replace(poseMatch[0], '');
    }

    let pause = null;
    const pauseMatch = cleanText.match(/\[#p(\d+)\]/);
    if (pauseMatch) {
        pause = pauseMatch[1];
        cleanText = cleanText.replace(pauseMatch[0], '');
    }

    let color = 'none';
    const colorMatch = cleanText.match(/^\[#\/([grb])\](.*)\[\/#\]$/s);
    if (colorMatch) {
        color = colorMatch[1];
        cleanText = colorMatch[2];
    }

    return {
        color,
        text: cleanText,
        pause,
        pose
    };
}

export class Testimony {
    constructor() {
        this.container = document.getElementById("testimonies");
        this.addBtn = document.getElementById("add-testimony");
        this.title = document.getElementById("selected-testimony-text");
        
        this.start = document.getElementById("start-testimony");
        this.startColorBtn = document.getElementById("start-color-btn");
        this.startPauseInput = document.getElementById("start-pause");
        this.startPoseInput = document.getElementById("start-pose");
        this.startToggle = document.getElementById("toggle-start");
        
        this.end = document.getElementById("end-testimony");
        this.endColorBtn = document.getElementById("end-color-btn");
        this.endPauseInput = document.getElementById("end-pause");
        this.endPoseInput = document.getElementById("end-pose");
        this.endToggle = document.getElementById("toggle-end");

        this.statements = Array.from(this.container.querySelectorAll('.testimony-wrapper'));
        this.currentId = null; 
        this.isDefault = false;

        this.statements.forEach(wrapper => this.bindWrapperEvents(wrapper));
        
        if (this.startColorBtn) this.startColorBtn.onclick = () => cycleColor(this.startColorBtn);
        if (this.endColorBtn) this.endColorBtn.onclick = () => cycleColor(this.endColorBtn);

        if (this.title) {
            this.title.addEventListener('click', (e) => e.stopPropagation());
            this.title.addEventListener('keydown', (e) => {
                 if (e.key === 'Enter') {
                     e.preventDefault();
                     this.title.blur();
                 }
            });
        }
    }

    generateId(title) {
        return title.trim().replace(/\s+/g, '_').toLowerCase();
    }

    bindWrapperEvents(wrapper) {
        addDragListeners(wrapper);
        const removeBtn = wrapper.querySelector(".remove-btn");
        const colorBtn = wrapper.querySelector(".color-cycle-btn");

        removeBtn.onclick = () => this.remove(wrapper);
        if (colorBtn) {
            colorBtn.onclick = () => cycleColor(colorBtn);
            if (!colorBtn.dataset.color) colorBtn.dataset.color = 'none';
        }
    }

    add(textData = "") {
        const template = document.getElementById("testimony-template");
        const clone = template.content.cloneNode(true);
        const wrapper = clone.querySelector(".testimony-wrapper");
        const textarea = wrapper.querySelector(".testimony");
        const pauseInput = wrapper.querySelector(".bubble-pause .pause-input");
        const poseInput = wrapper.querySelector(".bubble-pose .pose-input");
        
        const { color, text, pause, pose } = parseText(textData);
        textarea.value = text;
        if (pause && pauseInput) pauseInput.value = pause;
        if (pose && poseInput) poseInput.value = pose;

        const colorBtn = wrapper.querySelector(".color-cycle-btn");
        updateColorBtn(colorBtn, color);

        this.bindWrapperEvents(wrapper);
        this.statements.push(wrapper);
        this.container.insertBefore(wrapper, this.addBtn);
    }

    remove(wrapper) {
        wrapper.remove();
        this.statements = this.statements.filter(item => item !== wrapper);
    }

    clear() {
        this.statements.forEach(wrapper => wrapper.remove());
        this.statements = [];
        this.currentId = null;
        this.isDefault = false;
        
        if (this.startPauseInput) this.startPauseInput.value = "";
        if (this.endPauseInput) this.endPauseInput.value = "";
        if (this.startPoseInput) this.startPoseInput.value = "";
        if (this.endPoseInput) this.endPoseInput.value = "";
    }

    load(data) {
        this.clear();
        this.currentId = data.id || this.generateId(data.title);
        this.isDefault = !!DEFAULTS[this.currentId]; 
        this.title.textContent = data.title;

        const startRaw = data.startStatement ? data.startStatement.text : "";
        const parsedStart = parseText(startRaw);
        if (this.start) this.start.innerText = parsedStart.text;
        if (this.startColorBtn) updateColorBtn(this.startColorBtn, parsedStart.color);
        if (this.startPauseInput && parsedStart.pause) this.startPauseInput.value = parsedStart.pause;
        if (this.startPoseInput && parsedStart.pose) this.startPoseInput.value = parsedStart.pose;

        const endRaw = data.endStatement ? data.endStatement.text : "";
        const parsedEnd = parseText(endRaw);
        if (this.end) this.end.innerText = parsedEnd.text;
        if (this.endColorBtn) updateColorBtn(this.endColorBtn, parsedEnd.color);
        if (this.endPauseInput && parsedEnd.pause) this.endPauseInput.value = parsedEnd.pause;
        if (this.endPoseInput && parsedEnd.pose) this.endPoseInput.value = parsedEnd.pose;

        if (data.statements && Array.isArray(data.statements)) {
            data.statements.forEach(text => this.add(text));
        }
        
        browser.storage.local.set({ lastLoadedId: this.currentId });
    }

    reorder(draggedElement, afterElement) {
        if (afterElement == null || afterElement === this.addBtn) {
            this.container.insertBefore(draggedElement, this.addBtn);
        } else {
            this.container.insertBefore(draggedElement, afterElement);
        }

        const oldIndex = this.statements.indexOf(draggedElement);
        if (oldIndex === -1) return; 

        this.statements.splice(oldIndex, 1);

        if (afterElement == null || afterElement === this.addBtn) {
             this.statements.push(draggedElement);
        } else {
             const newIndex = this.statements.indexOf(afterElement);
             this.statements.splice(newIndex, 0, draggedElement);
        }
    }

    serialize() {
        const currentTitle = this.title.textContent.trim();
        if (!currentTitle || currentTitle === "No Testimony Loaded") throw new Error("Invalid Title");

        const statementValues = this.statements.map(wrapper => {
            const raw = wrapper.querySelector('.testimony').value;
            const color = wrapper.querySelector('.color-cycle-btn').dataset.color;
            const pause = wrapper.querySelector('.bubble-pause .pause-input').value;
            const pose = wrapper.querySelector('.bubble-pose .pose-input').value;
            
            let result = wrap(raw, color);
            result = wrapPause(result, pause);
            result = wrapPose(result, pose);
            return result;
        });

        const newId = this.generateId(currentTitle);
        const startColor = this.startColorBtn ? this.startColorBtn.dataset.color : 'none';
        const startPause = this.startPauseInput ? this.startPauseInput.value : '';
        const startPose = this.startPoseInput ? this.startPoseInput.value : '';
        
        const endColor = this.endColorBtn ? this.endColorBtn.dataset.color : 'none';
        const endPause = this.endPauseInput ? this.endPauseInput.value : '';
        const endPose = this.endPoseInput ? this.endPoseInput.value : '';

        const startEnabled = this.startToggle ? this.startToggle.checked : true;
        const endEnabled = this.endToggle ? this.endToggle.checked : true;

        let startText = wrap(this.start.innerText, startColor);
        startText = wrapPause(startText, startPause);
        startText = wrapPose(startText, startPose);

        let endText = wrap(this.end.innerText, endColor);
        endText = wrapPause(endText, endPause);
        endText = wrapPose(endText, endPose);

        return {
            id: newId,
            title: currentTitle,
            startStatement: {
                text: startText,
                enabled: startEnabled
            },
            endStatement: {
                text: endText,
                enabled: endEnabled
            },
            statements: statementValues,
            lastUpdated: Date.now()
        };
    }

    async save() {
        const data = this.serialize();

        if (this.currentId && !this.isDefault && this.currentId !== data.id) {
             await browser.storage.local.remove(`testimony_${this.currentId}`);
        }

        const storageItem = {};
        storageItem[`testimony_${data.id}`] = data;
        await browser.storage.local.set(storageItem);
        
        this.currentId = data.id;
        this.isDefault = false;
        
        await browser.storage.local.set({ lastLoadedId: this.currentId });
        
        return data;
    }

    async delete() {
        if (!this.currentId) return;
        if (this.isDefault) {
            this.clear();
            this.title.textContent = "No Testimony Loaded";
            return;
        }
        await browser.storage.local.remove(`testimony_${this.currentId}`);
        this.clear();
        this.title.textContent = "No Testimony Loaded";
    }

    static getSequence(data) {
        const sequence = [];
        
        if (data.startStatement && data.startStatement.enabled && data.startStatement.text) {
            sequence.push(data.startStatement.text);
        }

        if (data.statements && Array.isArray(data.statements)) {
            data.statements.forEach(s => sequence.push(s));
        }

        if (data.endStatement && data.endStatement.enabled && data.endStatement.text) {
            sequence.push(data.endStatement.text);
        }
        
        return sequence;
    }
}
