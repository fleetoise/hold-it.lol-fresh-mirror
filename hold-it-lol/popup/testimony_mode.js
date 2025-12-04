import browser from "webextension-polyfill";
import { saveMenuState } from "./popup";

function addStatement() { 
  const row = document.getElementById("testimonies");
  const appendBtn = document.getElementById("add-testimony");
  const template = document.getElementById("testimony-template");

  const clone = template.content.cloneNode(true);
  row.insertBefore(clone, appendBtn);
  
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

function initListeners() {
  const backBtn = document.getElementById("back-to-main-menu");
  const appendBtn = document.getElementById("add-testimony");
  
  backBtn.addEventListener("click", switchToMain);
  appendBtn.addEventListener("click", addStatement);
}

export function initTestimonyMenu() {
  initListeners();
  
}
