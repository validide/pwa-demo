'use strict';
(function (window, undefined) {

  function isStandalone() { return window.matchMedia('(display-mode: standalone)').matches; }
  function handleNavigatorOnlineStatus() {
    if (navigator.onLine) {
      document.getElementById('offline-warning').classList.add('d-none');
    } else {
      document.getElementById('offline-warning').classList.remove('d-none');
    }
  }

  function initialize() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('shell-service-worker.js')
          .then((reg) => {
            console.log('Service worker registered.', reg);
          })
          .catch((error) => {
            console.log('Service worker failed to register.', error);
          });
      });
    }

    window.addEventListener('offline', handleNavigatorOnlineStatus);
    window.addEventListener('online', handleNavigatorOnlineStatus);
    handleNavigatorOnlineStatus();
  }

  function initialized() {
    window.document.body.classList.add('shell-loaded');
    if (isStandalone()) {
      window.document.title += ' App (' + window.location + ')';
    } else {
      window.document.title += ' Web Site'
    }
  }

  function onReady(callback) {
    document.readyState != 'loading'
      ? callback()
      : document.addEventListener('DOMContentLoaded', callback);
  }

  window.shell = {
    initialize: initialize,
    initialized: initialized,
    onReady: onReady
  };

}(window, void (0)));
