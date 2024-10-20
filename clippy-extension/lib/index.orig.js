"use strict";

/* eslint-disable no-var */
var browser = function createBrowser() {
  return window.msBrowser || browser || window.browser || window.chrome;
}();
/* eslint-enable no-var */


var clippyController = {
  agent: null,
  lastComment: null,
  animations: ['Congratulate', 'LookRight', 'SendMail', 'Thinking', 'Explain', 'IdleRopePile', 'IdleAtom', 'Print', 'GetAttention', 'Save', 'GetTechy', 'GestureUp', 'Idle1_1', 'Processing', 'Alert', 'LookUpRight', 'IdleSideToSide', 'LookLeft', 'IdleHeadScratch', 'LookUpLeft', 'CheckingSomething', 'Hearing_1', 'GetWizardy', 'IdleFingerTap', 'GestureLeft', 'Wave', 'GestureRight', 'Writing', 'IdleSnooze', 'LookDownRight', 'GetArtsy', 'LookDown', 'Searching', 'EmptyTrash', 'LookUp', 'GestureDown', 'RestPose', 'IdleEyeBrowRaise', 'LookDownLeft'],
  comments: {},
  init: function init(agent) {
    this.agent = agent;
    this.fetchCommentUpdates();
    browser.runtime.sendMessage({
      name: 'isActive'
    }, function (response) {
      if (response.value) {
        clippyController.toggle(response.value);
        clippyController.idle();
      }
    });
  },
  talk: function talk() {
    var _this = this;

    var hostname = window.location.hostname;
    var clippyComments = [];
    Object.keys(this.comments).forEach(function (property) {
      if (hostname.indexOf(property) !== -1) {
        if (_this.comments[property].constructor === Array) {
          clippyComments = clippyComments.concat(_this.comments[property]);
        } else {
          clippyComments.push(_this.comments[property]);
        }
      }
    });

    if (clippyComments.length > 0) {
      var nextComment = clippyComments.constructor === Array ? clippyComments[Math.floor(Math.random() * clippyComments.length)] : clippyComments;

      if (nextComment !== this.lastComment) {
        this.agent.speak(nextComment);
        this.lastComment = nextComment;
      } else {
        this.lastComment = null;
      }
    } else {
      this.agent.stop();
    }
  },
  toggle: function toggle(state) {
    var clippyBalloon = document.getElementsByClassName('clippy-balloon');

    if (clippyBalloon.length > 0) {
      clippyBalloon[0].style.display = state && clippyBalloon[0].innerText.length > 0 ? 'block' : 'none';
    }

    this.agent.stop();

    if (!state) {
      this.agent.play('GoodBye', 5000, function () {
        clippyController.agent.hide(true);
      });
    } else {
      clippyController.agent.show(true);
    }
  },
  fetchCommentUpdates: function fetchCommentUpdates() {
    browser.runtime.sendMessage({
      name: 'comments'
    });
  },
  idle: function idle() {
    browser.runtime.sendMessage({
      name: 'idle'
    });
  },
  animate: function animate(callback) {
    this.agent.play(this.animations[Math.floor(Math.random() * this.animations.length)], 5000, callback);
  }
};
window.addEventListener('load', function () {
  clippy.load('Clippy', function (agent) {
    clippyController.init(agent);
  });
}, false);
browser.runtime.onMessage.addListener(function (request) {
  switch (request.name) {
    case 'isActive':
      clippyController.toggle(request.value);

      if (request.value) {
        clippyController.idle();
      }

      break;

    case 'comments':
      clippyController.comments = request.value;
      break;

    case 'animate':
      if (!clippyController.agent) {
        return;
      }

      clippyController.fetchCommentUpdates();
      browser.runtime.sendMessage({
        name: 'isActive'
      }, function (response) {
        if (response.value) {
          clippyController.agent.stop();
          clippyController.talk();
          clippyController.animate(function () {
            clippyController.idle();
          });
        }
      });
      break;

    default:
      break;
  }
});
var isFirefox = typeof InstallTrigger !== 'undefined';

if (isFirefox) {
  window.addEventListener('message', function (event) {
    var request = event.data || {};
    var manifest = browser.runtime.getManifest();
    browser.runtime.sendMessage({
      name: 'isActive'
    }, function (response) {
      switch (request.name) {
        case 'WHAT_IS_THE_MEANING_OF_LIFE':
          window.postMessage({
            name: 'SILENCE_MY_BROTHER',
            value: {
              installed: true,
              isActive: response.value,
              version: manifest.version
            }
          });
          break;

        case 'RISE':
          browser.runtime.sendMessage({
            name: 'toggle'
          }, function (toggleResponse) {
            window.postMessage(toggleResponse);
          });
          break;

        default:
          break;
      }
    });
    return true;
  }, false);
}

window.clippyController = clippyController;