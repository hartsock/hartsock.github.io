"""Adversarial tests for source ownership, addressing, and the debt ratchet."""
from pathlib import Path
import tempfile
import unittest

import yaml
import prose_rule as rule

RULES = yaml.safe_load((Path(__file__).parent / 'prose-rules.yml').read_text())


class ProseRuleTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def put(self, path, text):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text)
        return target

    def source(self):
        return rule.scan_source(self.root, RULES)

    def built(self, html):
        self.put('_site/index.html', html)
        return rule.scan_built(self.root, self.root / '_site', RULES)

    def test_thresholds(self):
        for text in ['These are words.', 'one two three four five six', 'These are words?', 'These are words!']:
            self.assertTrue(rule.is_prose(text, RULES), text)
        for text in ['Two words.', 'One. two three', 'one two three four five', 'https://example.invalid/a/b', '{{ page.title }}']:
            self.assertFalse(rule.is_prose(text, RULES), text)

    def test_short_headings_need_a_role(self):
        self.put('_includes/test.html', '<h2>Revisions</h2><h3>Chat</h3><p role="heading">Status</p>')
        self.assertEqual(len(self.source()), 3)
        self.put('_includes/test.html', '<h2 data-prose-role="microcopy">Chat</h2>')
        self.assertEqual(self.source(), [])
        self.put('_includes/test.html', '<h2 data-prose-role="microcopy">These are sentences.</h2>')
        self.assertEqual(len(self.source()), 1)

    def test_inline_prose_cannot_evade_threshold(self):
        self.put('_includes/test.html', '<p>one <em>two</em> three <b>four</b> five six</p>')
        self.assertEqual(len(self.source()), 1)
        self.assertEqual(len(self.built('<body><footer>one <em>two</em> three four five six</footer></body>')), 1)

    def test_navigation_key_exception(self):
        for name in ['nav', 'topics']:
            self.put(f'_data/{name}.yml', '- title: Short heading\n')
        self.assertEqual(self.source(), [])
        self.put('_data/nav.yml', '- title: These are sentences.\n')
        self.assertEqual(len(self.source()), 1)
        self.put('_data/other.yml', 'title: Chat\n')
        self.assertEqual(len(self.source()), 2)

    def test_javascript_nested_templates_and_comments(self):
        self.put('assets/js/example.js', '''// "Ignore this entire comment sentence."
const regex = /"ignored literal inside regex"/;
const text = `Header ${true ? "These are sentences." : "OK"}<h2>Chat</h2>`;
''')
        self.assertEqual(len(self.source()), 2)

    def test_dialect_and_code_examples(self):
        self.put('page.md', '''---
title: Page
---
{{ page.title }}
inline <b>HTML</b>
<!-- comment -->
# Heading {#custom}
[ref]: /url
[^footnote]
~~~ruby {linenos}
puts 'code'
~~~
    indented code
''')
        kinds = {row[1] for row in self.source()}
        for name in ['liquid', 'html', 'kramdown', 'reference', 'footnote', 'fence-attributes', 'indented-code']:
            self.assertIn('dialect:' + name, kinds)
        self.put('page.md', '# Page\n\n```html\n<b>{{ example }}</b>\n```\n\n`{{ example }}`\n')
        self.assertEqual(self.source(), [])

    def test_archive_envelope(self):
        self.put('_posts/test.md', '---\nrepublished: true\n---\n{% raw %}\nText.\n{% endraw %}\n')
        self.assertEqual(self.source(), [])
        self.put('other.md', '---\nrepublished: true\n---\n{% raw %}\nText.\n{% endraw %}\n')
        self.assertEqual(len(self.source()), 2)

    def test_schema_and_tokens(self):
        self.put('page.md', '---\ncopy:\n  dialog:\n    status: Ready\nvalues:\n  camelName: Example\n---\n{camelName}\n')
        self.assertEqual(self.source(), [])
        self.put('page.md', '---\ncopy:\n  dialog: Wrong level\nauthors: bad\nvalues: bad\ntitle: []\n---\n{missingToken}\n')
        self.assertEqual(len(self.source()), 5)
        self.put('page.md', '---\n- not a mapping\n---\n')
        self.assertEqual(self.source()[0][1], 'frontmatter')

    def test_entire_body_is_covered(self):
        findings = self.built('<head><title>Ignore head title sentence.</title></head><body><header>These are sentences.</header><main></main><dialog><h2>Chat</h2></dialog><footer>one two three four five six</footer></body>')
        self.assertEqual(len(findings), 3)

    def test_addresses_and_evidence(self):
        self.put('page.md', '---\ntitle: My title\ncopy:\n  group:\n    key: Some display text\n---\nBody.\n')
        self.assertEqual(self.built('<body><h1 data-md="page.md" data-md-key="title">My title</h1><div data-md="page.md">These are sentences.</div><p data-evidence="recorded">These are sentences.</p></body>'), [])
        for attrs in ['data-md="../page.md"', 'data-md="/page.md"', 'data-md="missing.md"',
                      'data-md-key="title"', 'data-md="page.md" data-md-key="missing"',
                      'data-md="page.md" data-md-key="copy"']:
            self.assertTrue(any(row[1] == 'address' for row in self.built(f'<body><p {attrs}>Words.</p></body>')), attrs)
        self.assertEqual(self.built('<body><p data-md="page.md" data-md-key="copy.group.key">Some display text</p></body>'), [])
        self.assertTrue(self.built('<body><p data-md="page.md" data-md-key="title">Wrong value</p></body>'))
        self.assertTrue(self.built('<body><main data-md="page.md">Words.</main></body>'))

    def test_reader_attributes_and_void_elements(self):
        findings = self.built('<body><img alt="These are sentences."><p>These are other sentences.</p></body>')
        self.assertEqual(len(findings), 2)

    def test_empty_build_is_an_error(self):
        with self.assertRaises(ValueError):
            rule.scan_built(self.root, self.root / '_site', RULES)

    def test_ratchet_new_stale_duplicate_and_growth(self):
        rows = [('a.html', 'prose', 'These are sentences.')]
        current = rule.identities('source', rows)
        self.assertEqual(rule.ratchet(current, current, 'source'), (set(), set(), set()))
        self.assertEqual(rule.ratchet(current, set(), 'source')[0], current)
        self.assertEqual(rule.ratchet(set(), current, 'source')[1], current)
        doubled = rule.identities('source', rows * 2)
        self.assertEqual(len(rule.ratchet(doubled, current, 'source')[0]), 1)
        self.assertEqual(rule.ratchet(current, current, 'source', set())[2], current)
        built = rule.identities('built', rows)
        self.assertFalse(rule.ratchet(current, current | built, 'source')[1])
        with self.assertRaises(ValueError):
            rule.read_debt('\n'.join(list(current) * 2))

    def test_exception_contract(self):
        root = Path(__file__).resolve().parent.parent
        for exception in RULES['exceptions'] + RULES['key_rule_exceptions'] + [RULES['archive_envelope']]:
            self.assertTrue(exception['reason'])
            self.assertTrue(exception.get('capture_id') or exception.get('test'))
            if exception.get('test'):
                self.assertTrue((root / exception['test'].split(':')[0]).is_file())
        # A changed capture cannot disappear behind the exception.
        path = RULES['exceptions'][0]['path']
        self.put(path, '{"capture_id": "changed"}')
        self.assertEqual(self.source()[0][1], 'capture')
        import json
        self.put(path, json.dumps({'capture_id': RULES['exceptions'][0]['capture_id'], 'text': 'Changed prose.'}))
        self.assertEqual(self.source()[0][1], 'capture')


if __name__ == '__main__':
    unittest.main()
