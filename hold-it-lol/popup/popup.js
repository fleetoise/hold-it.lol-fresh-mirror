'use strict';
import browser from 'webextension-polyfill';

const animationDuration = 150;


function makeCourtURL() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
    return result;
}

function handleBellText() {
  const bellTextContainer = document.getElementById('bell-text-container');
  const bellTextInput = document.getElementById('bell-text-input');
  const saveButton = document.getElementById('save-bell-text');

  initBellText(bellTextInput, bellTextContainer)
  setupBellTextUIEventListeners(bellTextInput, saveButton);
  saveBellText(bellTextInput, saveButton);
}

function initBellText(bellTextInput, bellTextContainer) {
  browser.storage.local.get(['options', 'bellText'])
    .then((result) => {
      const options = result.options || {};
      const bellText = result.bellText || '';

      bellTextInput.value = bellText;

      if (!options['message-bell']) {
        bellTextContainer.classList.add('disabled');
        bellTextInput.disabled = true;
        bellTextInput.placeholder = 'Message bell option is disabled.';
      }
    })
    .catch((err) => {
      console.error("Error loading extension data:", err);
      bellTextInput.placeholder = 'Error loading options.';
      bellTextInput.disabled = true;
    });
}

function setupBellTextUIEventListeners(bellTextInput, saveButton) {
  
  bellTextInput.addEventListener('focus', () => {
    if (!bellTextInput.disabled) {
      saveButton.classList.remove('hidden');
    }
  });

  bellTextInput.addEventListener('blur', (event) => {
    if (event.relatedTarget !== saveButton) {
      saveButton.classList.add('hidden');
    }
  });
}  

function saveBellText(bellTextInput, saveButton) {
  saveButton.addEventListener('click', () => {
    const text = bellTextInput.value;

    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    browser.storage.local.set({ bellText: text })
      .then(() => {
        saveButton.textContent = 'Saved!';
        setTimeout(() => {
          saveButton.classList.add('hidden');
          saveButton.textContent = 'Apply';
          saveButton.disabled = false;
        }, 750);
      })
      .catch((err) => {
        console.error("Error saving bell text:", err);
        saveButton.textContent = 'Error!';
        setTimeout(() => {
          saveButton.textContent = 'Apply';
          saveButton.disabled = false;
        }, 1500);
      });
  });
}



function initBtnOptions(btnOptions) {
  btnOptions.addEventListener('click', function () {
    setTimeout(function () {
      browser.runtime.openOptionsPage();
      window.close();
    }, animationDuration);
  });
}

function handleMainButtons() {
  const btnOptions = document.getElementById('options');
  const btnCourt = document.getElementById('new-court');
  const btnTestimony = document.getElementById('testimony-mode');

  initBtnOptions(btnOptions);

  btnCourt.addEventListener('click', function () {
    setTimeout(function () {
      browser.tabs.create({ url: 'https://objection.lol/courtroom' });
      window.close();
    }, animationDuration);
  });
  
  btnTestimony.addEventListener('click', function () {
    // TODO
  });
}

function main() {
  handleMainButtons();
  handleBellText();
}



main();
