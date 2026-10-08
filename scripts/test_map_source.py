import json
from pathlib import Path
import tempfile
import unittest
from map_source import load_source, source_id


class MapSourceTests(unittest.TestCase):
    def test_only_main_content_enters_model_and_identity_changes_with_prose(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'assets/data').mkdir(parents=True)
            (root / 'posts/test').mkdir(parents=True)
            page = {'title':'Test','url':'/posts/test/','date':'2008-01-02','description':'','topics':None,'kind':'Post'}
            (root / 'assets/data/page-catalog.json').write_text(json.dumps([page, None]))
            path = root / 'posts/test/index.html'
            path.write_text('<header>Private settings</header><main><p>Original words.</p><script>skip_me()</script></main><footer>Build timestamp</footer>')
            pages, texts = load_source(root)
            self.assertIn('Original words.', texts[0])
            self.assertNotIn('Private settings', texts[0])
            self.assertNotIn('Build timestamp', texts[0])
            self.assertNotIn('skip_me', texts[0])
            self.assertEqual(pages[0]['topics'], [])
            before = source_id(pages, texts)
            path.write_text('<main>Changed words.</main>')
            self.assertNotEqual(before, source_id(*load_source(root)))

    def test_catalog_cannot_escape_build(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'assets/data').mkdir(parents=True)
            (root / 'assets/data/page-catalog.json').write_text(json.dumps([{'url':'/../../secret/','date':''}]))
            with self.assertRaisesRegex(ValueError, 'escapes'):
                load_source(root)


if __name__ == '__main__':
    unittest.main()
