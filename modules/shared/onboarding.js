// /modules/shared/onboarding.js
// PRODAPP — Onboarding Tutorial Modülü (Adım 4 — kopyalama, index.html orijinaller yerinde)
//
// SVG ve içerik verisi constants.js'ten import edilir.
// Bağımlılıklar (window globals — henüz index.html'den):
//   openM, closeM

import { APP }              from '../core/state.js';
import { ONB_SVG, ONB_DATA } from '../core/constants.js';

/* ═══ ONBOARDING ═══ */

var _onbStep  = 0;
var _onbSteps = [];

function _onbRender() {
  var s  = _onbSteps[_onbStep];
  var ic = document.getElementById('onb-icon');
  var ti = document.getElementById('onb-title');
  var de = document.getElementById('onb-desc');
  var dt = document.getElementById('onb-dots');
  var nx = document.getElementById('onb-next');
  if (ic) ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#E8962E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px">' + ONB_SVG[s.icon] + '</svg>';
  if (ti) ti.textContent = s.title;
  if (de) de.textContent = s.desc;
  if (dt) {
    var dots = '';
    for (var i = 0; i < _onbSteps.length; i++) {
      dots += '<span class="onb-dot' + (i === _onbStep ? ' on' : '') + '"></span>';
    }
    dt.innerHTML = dots;
  }
  if (nx) nx.textContent = (_onbStep === _onbSteps.length - 1) ? 'Başla' : 'Sonraki';
}

export function startOnboard() {
  var role  = APP.ui.curUser ? APP.ui.curUser.role : 'user';
  _onbSteps = ONB_DATA[role] || ONB_DATA.user;
  _onbStep  = 0;
  _onbRender();
  openM('md-onboard');
}

export function onboardStep(dir) {
  _onbStep += dir;
  if (_onbStep < 0) { _onbStep = 0; return; }
  if (_onbStep >= _onbSteps.length) { onboardDone(); return; }
  _onbRender();
}

export function onboardDone() {
  if (APP.ui.curUser) localStorage.setItem('onboardDone_' + APP.ui.curUser.role, '1');
  closeM('md-onboard');
}

/* ─── window global uyumluluk (inline onclick) ──────────────────────────── */

window.startOnboard = startOnboard;
window.onboardStep  = onboardStep;
window.onboardDone  = onboardDone;
