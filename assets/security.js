// Public widget only. The secret remains in the Worker binding.
'use strict';
(() => {
  let widget = null;
  globalThis.LCI_SECURITY = Object.freeze({
    getToken() {
      const token = widget === null ? '' : globalThis.turnstile?.getResponse(widget);
      if (!token) throw new Error('SECURITY_VERIFICATION');
      return token;
    },
    reset() { if (widget !== null) globalThis.turnstile?.reset(widget); }
  });
  globalThis.lciTurnstileReady = () => {
    widget = globalThis.turnstile.render('#securityChallenge', {
      sitekey: globalThis.LCI_CONFIG.turnstileSiteKey,
      action: 'lifecycle-analyze', size: 'flexible', appearance: 'interaction-only',
      language: document.documentElement.lang === 'tr' ? 'tr' : 'en'
    });
  };
})();
