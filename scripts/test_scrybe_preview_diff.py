import tempfile
import unittest
from pathlib import Path
from scrybe_preview_diff import causes, compare, normalize, report


class PreviewDiffTests(unittest.TestCase):
    def test_only_intertag_whitespace_is_ignored(self):
        self.assertEqual(normalize('<p>x</p> \n <p>y</p>'), '<p>x</p><p>y</p>')
        for tag in ('pre', 'code', 'script', 'style', 'textarea'):
            source = f'<{tag}><b>x</b> \n <b>y</b></{tag}>'
            self.assertEqual(normalize(source), source)
        self.assertEqual(normalize('<p>x</p> \n <pre>x</pre> \n <p>y</p>'), '<p>x</p><pre>x</pre><p>y</p>')
        self.assertNotEqual(normalize('<p>a b</p>'), normalize('<p>a  b</p>'))

    def test_causes(self):
        self.assertEqual(causes('<p>"hi"</p>', '<p>“hi”</p>'), ['smart punctuation'])
        self.assertEqual(causes('<h2 id="a">a</h2>', '<h2>a</h2>'), ['heading ids'])
        self.assertEqual(causes('<pre><code>x</code></pre>', '<pre class="code-block"><code><span>x</span></code></pre>'), ['code-block markup'])
        self.assertEqual(causes('<p>a</p>', '<p>b</p>'), ['other'])
        self.assertIn('other', causes('<h2 id="a">a</h2>', '<h2>b</h2>'))

    def test_unchanged_features_do_not_label_unrelated_changes(self):
        shared = '<h2 id="title">Title</h2><pre class="code"><code>x</code></pre>'
        self.assertEqual(causes(shared + '<p>a</p>', shared + '<p>b</p>'), ['other'])

    def test_literal_code_and_html_entities_remain_significant(self):
        self.assertIn('other', causes('<pre><code>&lt;b&gt;x&lt;/b&gt;</code></pre>', '<pre><code>x</code></pre>'))
        self.assertEqual(causes('<p>&lt;b&gt;</p>', '<p><b></p>'), ['other'])

    def test_tree_counts_and_one_sided_pages(self):
        with tempfile.TemporaryDirectory() as tmp:
            a, b = Path(tmp)/'a', Path(tmp)/'b'
            a.mkdir()
            b.mkdir()
            (a/'same.html').write_text('<p>x</p>\n<p>y</p>')
            (b/'same.html').write_text('<p>x</p><p>y</p>')
            (a/'changed.html').write_text('<p>"x"</p>')
            (b/'changed.html').write_text('<p>“x”</p>')
            (a/'old.html').write_text('old')
            (b/'new.html').write_text('new')
            (a/'ignored.txt').write_text('ignored')
            result = compare(a, b)
            self.assertEqual(result['same'], 1)
            self.assertEqual(result['only production'], ['old.html'])
            self.assertEqual(result['only scrybe'], ['new.html'])
            self.assertEqual(result['changed'], {'changed.html': ['smart punctuation']})
            self.assertIn('differing HTML pages: 1', report(result))
            self.assertIn('&lt;p&gt;', report(result))
            with self.assertRaises(ValueError):
                compare(a, b/'missing')

    def test_reviewer_probes_preserve_attribute_and_visible_text(self):
        probes = [('<p title="one> <two">same</p>', '<p title="one><two">same</p>'),
                  ('<p>one > < two</p>', '<p>one >< two</p>'),
                  ('<!-- one> <two --><p>x</p>', '<!-- one><two --><p>x</p>')]
        for left, right in probes:
            with self.subTest(left=left), tempfile.TemporaryDirectory() as tmp:
                self.assertNotEqual(normalize(left), normalize(right))
                a, b = Path(tmp)/'a', Path(tmp)/'b'
                a.mkdir(); b.mkdir()
                (a/'index.html').write_bytes(left.encode())
                (b/'index.html').write_bytes(right.encode())
                self.assertIn('index.html', compare(a, b)['changed'])

    def test_reviewer_probes_at_tree_level(self):
        probes = [('<p title="one> <two">same</p>', '<p title="one><two">same</p>'),
                  ('<p>one > < two</p>', '<p>one >< two</p>')]
        for left, right in probes:
            with self.subTest(left=left), tempfile.TemporaryDirectory() as tmp:
                a, b = Path(tmp)/'a', Path(tmp)/'b'
                a.mkdir(); b.mkdir()
                (a/'index.html').write_bytes(left.encode())
                (b/'index.html').write_bytes(right.encode())
                self.assertIn('index.html', compare(a, b)['changed'])

    def test_nonbreaking_space_is_visible_text(self):
        self.assertNotEqual(normalize('<p>a</p>\u00a0<p>b</p>'), normalize('<p>a</p><p>b</p>'))

    def test_byte_level_protected_newlines(self):
        for tag in ('pre', 'code', 'script', 'style', 'textarea'):
            for newline in (b'\r\n', b'\r'):
                with self.subTest(tag=tag, newline=newline), tempfile.TemporaryDirectory() as tmp:
                    a, b = Path(tmp)/'a', Path(tmp)/'b'
                    a.mkdir(); b.mkdir()
                    (a/'index.html').write_bytes(b'<' + tag.encode() + b'>a' + newline + b'b</' + tag.encode() + b'>')
                    (b/'index.html').write_bytes(f'<{tag}>a\nb</{tag}>'.encode())
                    self.assertIn('index.html', compare(a, b)['changed'])

    def test_metadata_and_cause_specific_examples(self):
        with tempfile.TemporaryDirectory() as tmp:
            a, b = Path(tmp)/'a', Path(tmp)/'b'
            a.mkdir(); b.mkdir()
            (a/'index.html').write_text('<meta name="generator" content="old"><p>"Hello"</p><pre><code>sample</code></pre><h2 id="title">Title</h2>')
            (b/'index.html').write_text('<meta name="generator" content="new"><p>“Hello”</p><pre class="code-block"><code>sample</code></pre><h2>Title</h2>')
            for filename, tag in [('feed.xml', 'updated'), ('sitemap.xml', 'lastmod')]:
                (a/filename).write_text(f'<root><{tag}>old</{tag}></root>')
                (b/filename).write_text(f'<root><{tag}>new</{tag}></root>')
            result = compare(a, b)
            self.assertEqual(set(result['changed']['index.html']), {'metadata', 'smart punctuation', 'code-block markup', 'heading ids'})
            for group, text in [('metadata', 'generator'), ('smart punctuation', 'Hello'), ('code-block markup', 'sample'), ('heading ids', 'Title')]:
                example = ''.join(result['examples']['index.html'][group])
                self.assertIn(text, example)
                if group != 'metadata': self.assertNotIn('generator', example)
            self.assertEqual(result['changed']['feed.xml'], ['metadata'])
            self.assertEqual(result['changed']['sitemap.xml'], ['metadata'])
            self.assertIn('metadata:', report(result))

    def test_inserted_region_does_not_mislabel_unchanged_punctuation(self):
        self.assertEqual(causes('<p>Before</p><p>“same”</p>', '<p>Inserted</p><p>Before</p><p>“same”</p>'), ['other'])

    def test_feed_generator_is_metadata(self):
        self.assertEqual(causes('<generator version="3.9">Jekyll</generator>', '<generator version="3.10">Jekyll</generator>'), ['metadata'])

    def test_json_ld_is_reported_as_metadata(self):
        self.assertEqual(causes('<script type="application/ld+json">{"a":1}</script>', '<script type="application/ld+json">{"a":2}</script>'), ['metadata'])

    def test_empty_build_is_an_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                compare(Path(tmp), Path(tmp))


if __name__ == '__main__':
    unittest.main()
