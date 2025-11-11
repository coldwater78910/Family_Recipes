// Small Node test script for parseMinutes and fuzzy matching using shared utils
const assert = require('assert');
const path = require('path');
// require the shared utils (js/filter-utils.js supports CommonJS via module.exports)
const utils = require(path.join(__dirname, '..', 'js', 'filter-utils.js'));

// Tests for parseMinutes
assert.strictEqual(utils.parseMinutes('30'), 30);
assert.strictEqual(utils.parseMinutes('45 min'), 45);
assert.strictEqual(utils.parseMinutes(' 120 minutes '), 120);
assert.strictEqual(utils.parseMinutes('N/A'), null);
assert.strictEqual(utils.parseMinutes(null), null);

// Tests for levenshtein (a few sanity checks)
assert.strictEqual(utils.levenshtein('kitten', 'sitting') >= 0, true);
assert.strictEqual(utils.levenshtein('flaw', 'lawn'), 2);
assert.strictEqual(utils.levenshtein('', ''), 0);

// Tests for fuzzyMatch
assert.strictEqual(utils.fuzzyMatch('Chicken Curry', 'chiken'), true, 'typo should match');
// (removed tests for recipes that were deleted from the project)

console.log('All filter tests passed ✅');
