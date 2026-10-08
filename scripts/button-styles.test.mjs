import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const theme = readFileSync(new URL('../assets/css/theme.css', import.meta.url), 'utf8');
const chrome = readFileSync(new URL('../assets/css/chrome.css', import.meta.url), 'utf8');
const course = readFileSync(new URL('../courses/app/app.css', import.meta.url), 'utf8');

test('primary buttons pair the warm action fill with black text in either theme', () => {
  assert.match(theme, /--action-bg:\s*#ffaa41\s*;/);
  assert.match(theme, /--action-ink:\s*#000000\s*;/);
  assert.equal((theme.match(/--action-bg:/g) || []).length, 1);
  assert.equal((theme.match(/--action-ink:/g) || []).length, 1);
  const primary = chrome.match(/\.btn\.primary\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(primary, /background:\s*var\(--action-bg\)/);
  assert.match(primary, /color:\s*var\(--action-ink\)/);
  assert.match(primary, /border-color:\s*var\(--accent\)/);
  // Grounded additionally in Chrome: course buttons must have this computed pair.
  const luminance = hex => hex.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((n, v, i) => n + v * [.2126, .7152, .0722][i], 0);
  assert.ok((luminance('ffaa41') + .05) / .05 > 7);
});

test('course control defaults cannot outrank shared button classes', () => {
  assert.match(course, /:where\(#view\) :is\(button, select, input, textarea\)\s*\{[^}]*color:\s*var\(--ink\)/);
  assert.doesNotMatch(course, /#view button[^{}]*\{[^}]*color:/);
});

test('Next word is the primary path; Previous and Roll the dice stay secondary', () => {
  const view = readFileSync(new URL('../courses/app/views/session3.js', import.meta.url), 'utf8');
  assert.match(view, /class="btn primary" id="fwd"/);
  assert.match(view, /class="btn" id="back"/);
  assert.match(view, /class="btn" id="draw"/);
});
