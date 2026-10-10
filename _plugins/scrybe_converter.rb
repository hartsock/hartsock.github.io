# frozen_string_literal: true

require "open3"

# Use Jekyll's Markdown processor extension point so Markdown is converted once,
# including markdownify filters. Only the preview overlay selects this processor.
module Jekyll
  module Converters
    class Markdown
      class Scrybe
        def initialize(config)
          unless config["scrybe_preview"] == true
            raise Jekyll::Errors::FatalException, "Scrybe requires the preview overlay"
          end
        end

        def convert(content)
          file = Thread.current[:scrybe_preview_file] || "(Markdown filter)"
          output, _error, status = Open3.capture3(
            "scrybe", "render", "--profile", "site", "--body-only",
            :stdin_data => content
          )
          unless status.success?
            raise Jekyll::Errors::FatalException,
                  "Scrybe failed for #{file} (exit #{status.exitstatus})"
          end
          output
        rescue Errno::ENOENT
          raise Jekyll::Errors::FatalException, "Scrybe binary missing while rendering #{file}"
        end
      end
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :pre_render do |item, _payload|
  next unless item.site.config["scrybe_preview"] == true

  # Keep diagnostics relative; never expose a runner's checkout directory.
  path = item.respond_to?(:relative_path) ? item.relative_path : item.path
  Thread.current[:scrybe_preview_file] = path.delete_prefix("#{item.site.source}/")
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |_item|
  Thread.current[:scrybe_preview_file] = nil
end
