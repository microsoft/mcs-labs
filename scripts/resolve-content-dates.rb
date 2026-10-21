# frozen_string_literal: true

require "json"

require_relative "../_plugins/content_last_updated"

FeedDateDocument = Struct.new(:data, :path, :basename_without_ext, keyword_init: true)
FeedDateCollection = Struct.new(:docs)
FeedDateSite = Struct.new(:source, :collections)

module FeedDateLogger
  def self.warn(*parts)
    $stderr.puts(parts.join(" "))
  end
end

items = JSON.parse($stdin.read)
collections = %w[labs modules].to_h do |collection|
  documents = items.select { |item| item.fetch("collection") == collection }.map do |item|
    slug = item.fetch("slug")
    FeedDateDocument.new(
      data: item.fetch("metadata"),
      path: File.join(Dir.pwd, "_#{collection}", "#{slug}.md"),
      basename_without_ext: slug
    )
  end
  [collection, FeedDateCollection.new(documents)]
end

McsLabs::ContentLastUpdated.apply(
  FeedDateSite.new(Dir.pwd, collections),
  logger: FeedDateLogger
)

dates = items.to_h do |item|
  key = "#{item.fetch('collection')}/#{item.fetch('slug')}"
  [key, item.fetch("metadata")["content_last_updated"]]
end
$stdout.write(JSON.generate(dates))
