"""Exercise the Ruby processor with real subprocess success/failure paths."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
RUBY = r'''
module Jekyll
  module Errors
    class FatalException < StandardError; end
  end
  module Hooks
    def self.register(*args); end
  end
  module Converters
    class Markdown; end
  end
end
require_relative "_plugins/scrybe_converter"
Thread.current[:scrybe_preview_file] = "example.md"
begin
  processor = Jekyll::Converters::Markdown::Scrybe.new("scrybe_preview" => ARGV[0] == "true")
  print processor.convert("input body")
rescue Jekyll::Errors::FatalException => error
  warn error.message
  exit 1
end
'''


class ConverterTests(unittest.TestCase):
    def run_converter(self, executable=None, enabled=True):
        with tempfile.TemporaryDirectory() as directory:
            if executable:
                script = Path(directory)/'scrybe'
                script.write_text('#!/bin/sh\n' + executable)
                script.chmod(0o755)
            # Resolve Ruby before restricting PATH, so missing scrybe is real.
            import shutil
            ruby = shutil.which('ruby')
            return subprocess.run([ruby, '-e', RUBY, str(enabled).lower()], cwd=ROOT,
                                  env={**os.environ, 'PATH': directory}, text=True,
                                  capture_output=True)

    def test_success_stdin_and_arguments(self):
        result = self.run_converter('test "$*" = "render --profile site --body-only" || exit 9\nread body\nprintf "<p>%s</p>" "$body"\n')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, '<p>input body</p>')

    def test_failure_names_source(self):
        result = self.run_converter('exit 7\n')
        self.assertEqual(result.returncode, 1)
        self.assertIn('example.md (exit 7)', result.stderr)

    def test_missing_binary_names_source(self):
        result = self.run_converter()
        self.assertEqual(result.returncode, 1)
        self.assertIn('binary missing while rendering example.md', result.stderr)

    def test_overlay_required(self):
        result = self.run_converter(enabled=False)
        self.assertEqual(result.returncode, 1)
        self.assertIn('requires the preview overlay', result.stderr)


if __name__ == '__main__':
    unittest.main()
