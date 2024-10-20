"use strict";

/* eslint-disable no-var */
var browser = function createBrowser() {
  return window.msBrowser || browser || window.browser || window.chrome;
}();
/* eslint-enable no-var */

var settings = new webStorageObject.LocalStorageObject({
  isActive: true,
  comments: {}
}, 'settings', false);
var idleTime = 3000;

var getCommentsRepoURL = function getCommentsRepoURL() {
  return "https://raw.githubusercontent.com/chews/clippai/master/clippy.json?v=".concat(new Date().getTime());
};

var loadComments = function loadComments() {
  var xhttp = new XMLHttpRequest();
  xhttp.open('GET', getCommentsRepoURL(), true);

  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      var comments = JSON.parse(xhttp.response);
      settings.comments = comments;
      browser.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab, index) {
          browser.tabs.sendMessage(tabs[index].id, {
            name: 'comments',
            value: comments
          });
        });
      });
    }
  };

  xhttp.send();
};

var askClaude = function askClaude(query, sendResponse) {
  var xhttp = new XMLHttpRequest();
  xhttp.open('POST', 'https://api.anthropic.com/v1/messages', true);

  xhttp.setRequestHeader('x-api-key', '[production key here]');
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.setRequestHeader('anthropic-version', '2023-06-01');
  xhttp.setRequestHeader('anthropic-dangerous-direct-browser-access', 'true');

  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4) {
      if (xhttp.status === 200) {
        var response = JSON.parse(xhttp.response);
        sendResponse({ success: true, response: response.content[0].text });
      } else {
        console.error('Failed to get response from Claude API:', xhttp.status, xhttp.statusText);
        sendResponse({ success: false, error: 'Failed to get response from Claude API' });
      }
    }
  };

  var data = JSON.stringify({
    model: "claude-3-opus-20240229",
    max_tokens: 1000,
    messages: [{ role: "user", content: query }]
  });

  xhttp.send(data);
};

var toggleIcon = function toggleIcon(tab) {
  var iconName = "assets/img/clippy-icon".concat(settings.isActive ? '' : '-gray');
  browser.browserAction.setIcon({
    path: {
      16: "".concat(iconName, "-48x48.png"),
      24: "".concat(iconName, "-48x48.png"),
      32: "".concat(iconName, "-48x48.png")
    },
    tabId: tab.id
  });
};

var sendActive = function sendActive(tab) {
  browser.tabs.sendMessage(tab.id, {
    name: 'isActive',
    value: settings.isActive
  });
};

var toggleClippy = function toggleClippy() {
  settings.isActive = !settings.isActive;
  browser.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab, index) {
      sendActive(tabs[index]);
      toggleIcon(tabs[index]);
    });
  });
};


browser.browserAction.onClicked.addListener(toggleClippy);
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.name) {
    case 'isActive':
      browser.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        if (tabs.length > 0) {
          toggleIcon(tabs[0]);
        }
      });
      sendResponse({
        name: 'isActive',
        value: settings.isActive
      });
      break;

    case 'comments':
      loadComments();
      break;

    case 'idle':
      if (settings.isActive) {
        setTimeout(function () {
          if (!settings.isActive) {
            return;
          }

          browser.tabs.query({
            active: true,
            currentWindow: true
          }, function (tabs) {
            if (tabs.length > 0) {
              browser.tabs.sendMessage(tabs[0].id, {
                name: 'animate',
                value: true
              });
            }
          });
        }, idleTime);
      }
      break;

    case 'toggle':
      toggleClippy();
      sendResponse({
        name: 'SILENCE_MY_BROTHER',
        value: settings.isActive
      });
      break;
    
    case 'askClaude':
      askClaude(request.query, sendResponse);
      break;
      //return true; // Indicates that the response is sent asynchronously
    default:
      break;
  }

  return true;
});

browser.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  var manifest = browser.runtime.getManifest();

  switch (request.name) {
    case 'WHAT_IS_THE_MEANING_OF_LIFE':
      sendResponse({
        name: 'SILENCE_MY_BROTHER',
        value: {
          installed: true,
          isActive: settings.isActive,
          version: manifest.version
        }
      });
      break;

    case 'RISE':
      toggleClippy();
      sendResponse({
        name: 'SILENCE_MY_BROTHER',
        value: settings.isActive
      });
      break;

    default:
      break;
  }

  return true;
});

window.settings = settings;