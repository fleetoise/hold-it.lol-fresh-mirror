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

function main() {

  const btnOptions = document.getElementById('options');
  btnOptions.addEventListener('click', function() {
    setTimeout(function() {
      browser.runtime.openOptionsPage();
      window.close();
    }, animationDuration);
  });

  const btnCourt = document.getElementById('new-court');

  btnCourt.addEventListener('click', function() {
    setTimeout(function() {
      browser.tabs.create({url: 'https://objection.lol/courtroom'});
      window.close();
    }, animationDuration);
  });
}

main();
