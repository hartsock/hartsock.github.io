"""Exercise bundle derivation without requiring Jekyll or network access."""
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def ruby(expression):
    result = subprocess.run(['ruby', '-rjson', '-r./scripts/scrybe_preview_bundle',
                             '-e', expression], cwd=ROOT, text=True, capture_output=True)
    if result.returncode:
        raise AssertionError(result.stderr)
    return json.loads(result.stdout)


class PreviewBundleTests(unittest.TestCase):
    def test_versions_pin_all_transitives_except_pages_hook(self):
        result = ruby('puts JSON.generate(ScrybePreviewBundle.versions({"github-pages"=>"232", "jekyll"=>"3.10.0", "jekyll-seo-tag"=>"2.8.0", "liquid"=>"4.0.4"}))')
        self.assertEqual(result, {'jekyll': '3.10.0', 'jekyll-seo-tag': '2.8.0', 'liquid': '4.0.4'})

    def test_plugins_come_from_effective_config(self):
        result = ruby('puts JSON.generate(ScrybePreviewBundle.plugins(["jekyll-seo-tag", "jekyll-optional-front-matter", "jekyll-commonmark-ghpages", "jekyll-default-layout", "jekyll-seo-tag"]))')
        self.assertEqual(result, ['jekyll-seo-tag', 'jekyll-optional-front-matter', 'jekyll-default-layout'])

    def test_config_preserves_defaults_and_removes_machine_paths(self):
        result = ruby('puts JSON.generate(ScrybePreviewBundle.preview_config({"source"=>"/runner/site", "destination"=>"/runner/output", "plugins_dir"=>"random", "config"=>["/runner/config"], "theme"=>"jekyll-theme-primer", "future"=>true, "markdown"=>"kramdown", "safe"=>true, "plugins"=>["jekyll-optional-front-matter"]}))')
        self.assertNotIn('source', result)
        self.assertNotIn('destination', result)
        self.assertNotIn('config', result)
        self.assertEqual(result['theme'], 'jekyll-theme-primer')
        self.assertTrue(result['future'])
        self.assertEqual(result['plugins'], ['jekyll-optional-front-matter'])
        self.assertEqual(result['plugins_dir'], '_plugins')
        self.assertFalse(result['safe'])

    def test_verify_rejects_missing_drift_and_extra_versions(self):
        for actual in ['{}', '{"jekyll"=>"3.10.1"}', '{"jekyll"=>"3.10.0", "extra"=>"1"}']:
            with self.subTest(actual=actual):
                result = ruby(f'begin; ScrybePreviewBundle.verify_versions!({{"jekyll"=>"3.10.0"}}, {actual}); puts "false"; rescue => e; puts JSON.generate(e.message); end')
                self.assertIn('version mismatch', result)
        self.assertTrue(ruby('ScrybePreviewBundle.verify_versions!({"jekyll"=>"3.10.0"}, {"jekyll"=>"3.10.0"}); puts "true"'))


if __name__ == '__main__':
    unittest.main()
