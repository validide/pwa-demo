(function (window, undefined) {
  'use strict';
  var beforeInstallPromptDeferred;


  function isStandalone() { return window.matchMedia('(display-mode: standalone)').matches; }

  function handleNavigatorOnlineStatus() {
    var installButton = window.document.getElementById('install-web-app');
    if (installButton) {
      if (navigator.onLine) {
        installButton.removeAttribute('disabled');
        installButton.classList.remove('disabled');
      } else {
        installButton.classList.add('disabled');
        installButton.setAttribute('disabled', 'disabled');
      }
    }
  }

  function promptInstall(e) {
    if (!beforeInstallPromptDeferred || e.target.getAttribute('disabled') !== null)
      return;

    beforeInstallPromptDeferred.prompt();
  }
  function refrehsInstallUi() {
    var button = window.document.getElementById('install-web-app');
    if (!button)
      return;

    var show = !isStandalone() && beforeInstallPromptDeferred !== null;
    if (show) {
      button.addEventListener('click', promptInstall);
      button.classList.remove('d-none');
    } else {
      button.classList.add('d-none');
      button.removeEventListener('click', promptInstall);
    }
  }

  function handleBeforeInstallPrompt(e) {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    beforeInstallPromptDeferred = e;
    // Update UI so the user they can install the PWA
    refrehsInstallUi();
  };

  function appInstalledPrompt(e) {
    beforeInstallPromptDeferred = null;
    refrehsInstallUi();
  }

  function initialize() {
    const swPath = window.document.querySelector('[data-sw-path]').getAttribute('data-sw-path');
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register(swPath)
          .then(function (reg) {
            console.log('Service worker registered.', reg);
          }, function (error) {
            console.log('Service worker failed to register.', error);
          });
      });
    }

    window.addEventListener('offline', handleNavigatorOnlineStatus);
    window.addEventListener('online', handleNavigatorOnlineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', appInstalledPrompt);
    onReady(initialized);
  }

  function initialized() {
    window.document.body.classList.add('shell-loaded');
    if (isStandalone()) {
      window.document.title += ' App (' + window.location + ')';
    } else {
      window.document.title += ' Web Site'
    }

    handleNavigatorOnlineStatus();
  }

  function onReady(callback) {
    document.readyState != 'loading'
      ? callback()
      : document.addEventListener('DOMContentLoaded', callback);
  }

  window.shell = {
    initialize: initialize,
    isStandalone: isStandalone,
    onReady: onReady
  };

}(window, void (0)));
