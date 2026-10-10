# frozen_string_literal: true

require "json"
require "yaml"
require "fileutils"

module ScrybePreviewBundle
  # The Pages after_reset hook forces its Markdown allowlist. Keep its other
  # dependencies pinned, but do not make that hook available in the preview.
  EXCLUDED_GEMS = ["github-pages"].freeze
  # This default registers a competing Markdown processor. Scrybe replaces it.
  EXCLUDED_PLUGINS = ["jekyll-commonmark-ghpages"].freeze
  GENERATED = File.expand_path("../.scrybe-preview/build", __dir__)

  def self.versions(specs)
    specs.reject { |name, _version| EXCLUDED_GEMS.include?(name) }.sort.to_h
  end

  def self.plugins(names)
    names.uniq.reject { |name| EXCLUDED_PLUGINS.include?(name) }
  end

  def self.preview_config(config)
    result = config.reject do |key, _value|
      %w(source destination cache_dir config plugins_dir).include?(key)
    end
    result.merge("plugins" => plugins(config.fetch("plugins")),
                 "plugins_dir" => "_plugins", "safe" => false)
  end

  def self.verify_versions!(expected, actual)
    return if expected == actual

    differences = (expected.keys | actual.keys).sort.select { |name| expected[name] != actual[name] }
    raise "Preview version mismatch: #{differences.join(', ')}"
  end

  def self.bundle_versions
    require "bundler"
    Bundler.load.specs.to_h { |spec| [spec.name, spec.version.to_s] }
  end

  def self.export
    require "jekyll"
    require "github-pages"
    # Use the same installed method called by Pages' after_reset hook, before
    # plugin runtime objects (for example the GitHub metadata drop) enter config.
    effective = GitHubPages::Configuration.effective_config(
      Jekyll.configuration("config" => "_config.yml")
    )
    resolved = versions(bundle_versions)
    config = preview_config(effective)
    FileUtils.mkdir_p(GENERATED)
    File.write(File.join(GENERATED, "production-versions.json"), JSON.pretty_generate(resolved) + "\n")
    File.write(File.join(GENERATED, "production-config.yml"), YAML.dump(config))
    # Ruby string literals are escaped via inspect; all gems are require:false
    # so only the derived plugin list and Jekyll itself control runtime loading.
    pins = ["source \"https://rubygems.org\""] + resolved.map do |name, version|
      "gem #{name.inspect}, #{("= " + version).inspect}, require: false"
    end
    File.write(File.join(GENERATED, "production-pins.rb"), pins.join("\n") + "\n")
    puts "Derived #{resolved.size} exact gem pins from github-pages #{Gem.loaded_specs.fetch('github-pages').version}"
    puts "Installed Pages defaults: #{GitHubPages::Plugins::DEFAULT_PLUGINS.join(', ')}"
    puts "Preview plugins: #{config.fetch('plugins').join(', ')}"
    puts "Excluded runtime plugins: #{EXCLUDED_PLUGINS.join(', ')}; excluded hook gem: #{EXCLUDED_GEMS.join(', ')}"
  end

  def self.verify
    expected = JSON.parse(File.read(File.join(GENERATED, "production-versions.json")))
    verify_versions!(expected, bundle_versions)
    raise "Pages hook must not load in preview" if defined?(GitHubPages)

    puts "Verified #{expected.size} exact preview gem versions against production"
  end
end

if $PROGRAM_NAME == __FILE__
  case ARGV.fetch(0, "")
  when "export" then ScrybePreviewBundle.export
  when "verify" then ScrybePreviewBundle.verify
  else abort "Usage: ruby scripts/scrybe_preview_bundle.rb export|verify"
  end
end
