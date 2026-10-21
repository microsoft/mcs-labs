# frozen_string_literal: true

require "fileutils"
require "minitest/autorun"
require "tmpdir"

require_relative "../_plugins/content_last_updated"

ContentUpdateDocument = Struct.new(:data, :path, :basename_without_ext, keyword_init: true)
ContentUpdateCollection = Struct.new(:docs, keyword_init: true)
ContentUpdateSite = Struct.new(:source, :collections, keyword_init: true)

class ContentUpdateLogger
  attr_reader :warnings

  def initialize
    @warnings = []
  end

  def warn(*parts)
    @warnings << parts.join(" ")
  end
end

class ContentLastUpdatedTest < Minitest::Test
  def setup
    @root = Dir.mktmpdir("mcs-content-update-date")
    FileUtils.mkdir_p(File.join(@root, "_labs"))
    FileUtils.mkdir_p(File.join(@root, "_modules"))
    FileUtils.mkdir_p(File.join(@root, "presentations"))
    @logger = ContentUpdateLogger.new
    @requested_paths = []
  end

  def teardown
    FileUtils.remove_entry(@root)
  end

  def test_prefers_url_decoded_powerpoint_date_for_module_and_lab
    write("_labs/demo.md")
    write("_modules/modern-agents.md")
    write("presentations/Modern Agents.pptx")
    lab = document("demo", { "module" => "modern-agents" }, "labs")
    mod = document(
      "modern-agents",
      { "slides" => "/presentations/Modern%20Agents.pptx" },
      "modules"
    )

    apply(
      [lab],
      [mod],
      "_labs/demo.md" => "2026-09-01T10:00:00Z",
      "_modules/modern-agents.md" => "2026-09-02T10:00:00Z",
      "presentations/Modern Agents.pptx" => "2026-10-05T12:00:00Z"
    )

    assert_equal "2026-10-05T12:00:00Z", mod.data["content_last_updated"]
    assert_equal "2026-10-05T12:00:00Z", lab.data["content_last_updated"]
    assert_equal ["presentations/Modern Agents.pptx"], @requested_paths
  end

  def test_uses_module_date_when_module_has_no_powerpoint
    write("_modules/modern-agents.md")
    mod = document("modern-agents", {}, "modules")

    apply([], [mod], "_modules/modern-agents.md" => "2026-10-04T09:00:00Z")

    assert_equal "2026-10-04T09:00:00Z", mod.data["content_last_updated"]
    assert_equal ["_modules/modern-agents.md"], @requested_paths
  end

  def test_uses_lab_date_when_parent_module_has_no_powerpoint
    write("_labs/demo.md")
    lab = document("demo", { "module" => "modern-agents" }, "labs")
    mod = document("modern-agents", {}, "modules")

    apply([lab], [mod], "_labs/demo.md" => "2026-10-04T09:00:00Z")

    assert_equal "2026-10-04T09:00:00Z", lab.data["content_last_updated"]
    assert_equal ["_labs/demo.md"], @requested_paths
  end

  def test_missing_powerpoint_warns_and_falls_back_to_document_dates
    write("_labs/demo.md")
    write("_modules/modern-agents.md")
    lab = document("demo", { "module" => "modern-agents" }, "labs")
    mod = document(
      "modern-agents",
      { "slides" => "/presentations/Missing%20Deck.pptx" },
      "modules"
    )

    apply(
      [lab],
      [mod],
      "_labs/demo.md" => "2026-10-03T08:00:00Z",
      "_modules/modern-agents.md" => "2026-10-02T08:00:00Z"
    )

    assert_equal "2026-10-02T08:00:00Z", mod.data["content_last_updated"]
    assert_equal "2026-10-03T08:00:00Z", lab.data["content_last_updated"]
    assert_includes @logger.warnings.join("\n"), "Missing Deck.pptx"
  end

  def test_unsafe_powerpoint_path_warns_and_falls_back_to_lab
    write("_labs/demo.md")
    lab = document("demo", { "module" => "modern-agents" }, "labs")
    mod = document("modern-agents", { "slides" => "/../Outside.pptx" }, "modules")

    apply([lab], [mod], "_labs/demo.md" => "2026-10-02T07:00:00Z")

    assert_equal "2026-10-02T07:00:00Z", lab.data["content_last_updated"]
    assert_includes @logger.warnings.join("\n"), "escapes the repository"
  end

  def test_feed_date_is_used_when_syndicated_source_is_not_local
    lab = document(
      "partner-demo",
      { "content_last_updated" => "2026-10-01T06:00:00Z" },
      "labs"
    )
    mod = document(
      "partner-module",
      { "content_last_updated" => "2026-09-30T06:00:00Z" },
      "modules"
    )

    apply([lab], [mod], {})

    assert_equal "2026-10-01T06:00:00Z", lab.data["content_last_updated"]
    assert_equal "2026-09-30T06:00:00Z", mod.data["content_last_updated"]
    assert_empty @requested_paths
  end

  def test_shared_powerpoint_date_is_looked_up_once
    write("_labs/first.md")
    write("_labs/second.md")
    write("_modules/shared.md")
    write("presentations/Shared.pptx")
    first = document("first", { "module" => "shared" }, "labs")
    second = document("second", { "module" => "shared" }, "labs")
    mod = document("shared", { "slides" => "/presentations/Shared.pptx" }, "modules")

    apply(
      [first, second],
      [mod],
      "presentations/Shared.pptx" => "2026-09-30T05:00:00Z"
    )

    assert_equal "2026-09-30T05:00:00Z", mod.data["content_last_updated"]
    assert_equal "2026-09-30T05:00:00Z", first.data["content_last_updated"]
    assert_equal "2026-09-30T05:00:00Z", second.data["content_last_updated"]
    assert_equal ["presentations/Shared.pptx"], @requested_paths
  end

  def test_syndicated_dates_survive_a_missing_local_deck
    published_date = "2026-10-05T12:00:00Z"
    lab = document(
      "partner-demo",
      { "module" => "partner-module", "content_last_updated" => published_date },
      "labs"
    )
    mod = document(
      "partner-module",
      {
        "slides" => "/presentations/Partner%20Deck.pptx",
        "content_last_updated" => published_date
      },
      "modules"
    )

    apply([lab], [mod], {})

    assert_equal published_date, lab.data["content_last_updated"]
    assert_equal published_date, mod.data["content_last_updated"]
    assert_empty @requested_paths
    assert_includes @logger.warnings.join("\n"), "Partner Deck.pptx"
  end

  private

  def document(slug, data, collection_name)
    ContentUpdateDocument.new(
      data: data,
      path: File.join(@root, "_#{collection_name}", "#{slug}.md"),
      basename_without_ext: slug
    )
  end

  def write(relative_path)
    absolute_path = File.join(@root, relative_path)
    FileUtils.mkdir_p(File.dirname(absolute_path))
    File.write(absolute_path, "")
  end

  def apply(labs, modules, dates)
    resolver = lambda do |_repository_root, relative_path|
      @requested_paths << relative_path
      dates[relative_path]
    end
    site = ContentUpdateSite.new(
      source: @root,
      collections: {
        "labs" => ContentUpdateCollection.new(docs: labs),
        "modules" => ContentUpdateCollection.new(docs: modules)
      }
    )

    McsLabs::ContentLastUpdated.apply(
      site,
      git_date_resolver: resolver,
      logger: @logger
    )
  end
end
