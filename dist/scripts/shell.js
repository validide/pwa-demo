'use strict';
(function (window, undefined) {

  function initialize() {
  }

  function initialized() {
    window.document.body.classList.add('shell-loaded');
  }

  window.shell = {
    initialize: initialize,
    initialized: initialized
  };

}(window, void (0)));
