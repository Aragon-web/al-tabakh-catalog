const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const scriptApp = fs.readFileSync('app.js', 'utf8');
const scriptData = fs.readFileSync('data.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Load data.js
const scriptEl1 = window.document.createElement('script');
scriptEl1.textContent = scriptData;
window.document.body.appendChild(scriptEl1);

// Load app.js
const scriptEl2 = window.document.createElement('script');
scriptEl2.textContent = scriptApp;
window.document.body.appendChild(scriptEl2);

// Simulate DOMContentLoaded
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

setTimeout(() => {
    console.log("Background color var:", window.document.documentElement.style.getPropertyValue('--clr-dark-base'));
    console.log("Body classes:", window.document.body.className);
}, 500);
