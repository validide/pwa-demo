'use strict';
(function (window, undefined) {

  function initialize() {
  }

  function initialized() {
    window.document.body.classList.add('shell-loaded');
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('display-mode is standalone');
      alert('Welcome to the App');
    }
  }

  window.shell = {
    initialize: initialize,
    initialized: initialized
  };

}(window, void (0)));
