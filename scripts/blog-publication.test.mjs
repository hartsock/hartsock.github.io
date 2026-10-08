import test from 'node:test';
import assert from 'node:assert/strict';
import { blogPage } from './build-preview-corpus.mjs';

test('republication preserves prose, original dates and source without preview flags', () => {
  const original = {file:'2015-08-26-a-post.md',title:'A post',published:'2015-08-26T12:30:00-04:00',original_url:'https://hartsock.blogspot.com/2015/08/a-post.html',labels:['Python']};
  const body = '\nAn original **paragraph** about Python.\n';
  const page = blogPage(original, body, true);
  assert.equal(page.body, body);
  assert.equal(page.front.date, original.published);
  assert.equal(page.front.original_url, original.original_url);
  assert.equal(page.front.authors[0].name, 'Shawn Hartsock');
  assert.equal(page.front.layout, 'archive-post');
  assert.equal(page.front.noindex, undefined);
  assert.equal(page.front.sitemap, undefined);
  assert.equal(page.front.permalink, undefined, 'existing page-id generator owns the public identity');
  assert.equal(page.front.redirect_from, '/posts/archive/2015-08-26-a-post/');
  assert.deepEqual(page.front.original_labels, ['Python']);
});

test('late-night posts retain their original calendar date and timezone', () => {
  const original = {file:'2007-11-11-late.md',title:'Late',published:'2007-11-11T23:30:00-05:00'};
  assert.equal(blogPage(original,'Words',true).front.date, original.published);
});
