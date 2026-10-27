globalThis.PD = globalThis.PD || {};
PD.T_HIGH = 0.74;

PD.decide = function (ml, h) {
  const initial = 0.8 * ml + 0.2 * h;
  return { initial, route: initial >= PD.T_HIGH ? 'immediate' : 'deep' };
};