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

    def test_empty_build_is_an_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                compare(Path(tmp), Path(tmp))


if __name__ == '__main__':
    unittest.main()
