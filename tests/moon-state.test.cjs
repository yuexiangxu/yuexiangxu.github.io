const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ Intl, Date, Math });
for (const file of ['assets/vendor/astronomy-engine-2.1.19.min.js', 'assets/moon-state.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}
const evaluate = code => vm.runInContext(code, context);
const at = date => evaluate(`Lunar.at(${JSON.stringify(date)})`);
// USNO: https://aa.usno.navy.mil/calculated/moon/phases?date=2026-10-01&format=p&nump=6
for (const [angle, expected] of [
  [0, '2026-10-10T15:50:00Z'], [90, '2026-10-18T16:12:00Z'],
  [180, '2026-10-26T04:12:00Z'], [270, '2026-11-01T20:28:00Z']
]) {
  const actual = evaluate(`Astronomy.SearchMoonPhase(${angle}, new Date('2026-10-04T00:00:00Z'), 32).date.getTime()`);
  assert.ok(Math.abs(actual - Date.parse(expected)) < 120000, `${angle}° agrees with USNO within 2 minutes`);
}
const today = at('2026-10-12T10:00:00Z');
assert.ok(today.phase > 0 && today.phase < 0.25);
assert.ok(today.ageDays > 1.7 && today.ageDays < 1.9);
assert.ok(today.fraction > 0.03 && today.fraction < 0.04);
assert.ok(at('2026-10-10T15:52:00Z').ageDays < 0.01, 'age resets at actual new moon');
assert.ok(at('2026-10-26T04:12:00Z').fraction > 0.995, 'full moon is illuminated');
assert.equal(at('2026-10-11T15:59:00Z').dateText, '10月11日');
assert.equal(at('2026-10-11T16:00:00Z').dateText, '10月12日');
assert.equal(evaluate("Lunar.current(Date.parse('2026-10-11T15:59:00Z')) === Lunar.current(Date.parse('2026-10-11T15:59:50Z'))"), true);
assert.equal(evaluate("Lunar.current(Date.parse('2026-10-11T16:00:00Z')).dateText"), '10月12日');
console.log('Passed: USNO phase dates, illumination, lunar age, Beijing midnight, minute cache.');
console.log('2026-10-12 18:00 Beijing:', today);
