import browser from 'webextension-polyfill';
import { initMainMenu } from './main_menu.js';
import { initTestimonyMenu } from './testimony_mode.js';


export function saveMenuState(menu) {
  browser.storage.local.set({ lastMenu: menu });
}

function main() {
  browser.storage.local.get("lastMenu").then((data) => {
          const lastMenu = data.lastMenu || "main"; 
          const mainMenu = document.getElementById("main-menu");
          const testimonyMenu = document.getElementById("testimony-menu");
  
          if (lastMenu === "testimony") {
            document.body.classList.add("testimony-body");
            document.body.offsetWidth;
            
            mainMenu.classList.add("hidden");
            mainMenu.classList.add("transparent");
          
          } else if (lastMenu === "main") {
            document.body.classList.add("main-body");
            document.body.offsetWidth;
            
            testimonyMenu.classList.add("hidden");
            testimonyMenu.classList.add("transparent");
          }
      });
  initMainMenu();
  initTestimonyMenu();
}

main();
