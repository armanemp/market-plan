import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../frontend/index.html', import.meta.url), 'utf8');
const sample = JSON.parse(readFileSync(new URL('../data/plan-2026-10-12.example.json', import.meta.url), 'utf8'));
const start = html.indexOf('function isValidPlan(candidate) {');
const end = html.indexOf('\nfunction exportJson() {', start);
assert.ok(start >= 0 && end > start, 'the production plan validator must exist');
const validatorSource = html.slice(start, end);
const parseIsoDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(value + 'T12:00:00Z');
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
};
const safeWebUrl = value => {
  try {
    const url = new URL(String(value || ''));
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};
const validate = new Function('parseIsoDate', 'safeWebUrl', validatorSource + '\nreturn isValidPlan;')(parseIsoDate, safeWebUrl);
assert.equal(validate(sample), true, 'the canonical example plan must pass');
function rejects(label, mutate) {
  const candidate = structuredClone(sample);
  mutate(candidate);
  assert.equal(validate(candidate), false, label);
}
rejects('missing id is rejected', p => { delete p.id; });
rejects('invalid calendar date is rejected', p => { p.date = '2026-02-30'; });
rejects('unknown data mode is rejected', p => { p.dataMode = 'live-feed'; });
rejects('invalid as-of date type is rejected', p => { p.dataAsOf = 123; });
rejects('duplicate symbol is rejected', p => { p.instruments.push(structuredClone(p.instruments[0])); });
rejects('duplicate level id is rejected', p => { p.instruments[0].levels[1].id = p.instruments[0].levels[0].id; });
rejects('duplicate scenario id is rejected', p => { p.instruments[0].scenarios[1].id = p.instruments[0].scenarios[0].id; });
rejects('missing scenario target is rejected', p => { p.instruments[0].scenarios[0].targetLevelIds = ['missing-level']; });
rejects('invalid scenario array shape is rejected', p => { p.instruments[0].scenarios[0].confirmation = 'not-an-array'; });
rejects('invalid level category is rejected', p => { p.instruments[0].levels[0].type = 'script'; });
rejects('risk policy min/max inconsistency is rejected', p => { p.riskPolicy.riskPerTradeMinPct = 2; p.riskPolicy.riskPerTradeMaxPct = 1; });
rejects('unsafe source URL is rejected', p => { p.sources[0].url = 'javascript:alert(1)'; });
rejects('invalid context shape is rejected', p => { p.context = { unexpected: true }; });
rejects('non-boolean checklist state is rejected', p => { p.review.checks = { news: 'yes' }; });
console.log('Runtime plan validation: canonical plan accepted; 14 malformed-plan cases rejected.');
