# frozen_string_literal: true

require "open3"
require "pathname"
require "uri"

module McsLabs
  module ContentLastUpdated
    module_function

    def apply(site, git_date_resolver: method(:git_date), logger: Jekyll.logger)
      repository_root = Pathname(site.source).expand_path
      modules = Array(site.collections["modules"]&.docs)
      labs = Array(site.collections["labs"]&.docs)
      modules_by_slug = modules.to_h { |document| [document_slug(document), document] }
      date_cache = {}

      modules.each do |module_document|
        assign_date(
          module_document,
          "modules",
          module_document,
          "module",
          repository_root,
          git_date_resolver,
          date_cache,
          logger
        )
      end

      labs.each do |lab|
        deck_document = lab.data["slides"] ? lab : modules_by_slug[lab.data["module"]]
        assign_date(
          lab,
          "labs",
          deck_document,
          "lab",
          repository_root,
          git_date_resolver,
          date_cache,
          logger
        )
      end
    end

    def assign_date(
      document,
      collection_name,
      deck_document,
      subject_kind,
      repository_root,
      git_date_resolver,
      date_cache,
      logger
    )
      slug = document_slug(document)
      selected_date = deck_date(
        deck_document,
        subject_kind,
        slug,
        repository_root,
        git_date_resolver,
        date_cache,
        logger
      )
      selected_date ||= document_date(
        document,
        collection_name,
        slug,
        repository_root,
        git_date_resolver,
        date_cache,
        logger
      )

      if selected_date
        document.data["content_last_updated"] = selected_date
      else
        logger.warn(
          "Content update date:",
          "No Git date is available for #{subject_kind} #{slug}; the date will not be rendered."
        )
      end
    end

    def document_slug(document)
      document.data["slug"] ||
        (document.respond_to?(:basename_without_ext) && document.basename_without_ext) ||
        File.basename(document.path, File.extname(document.path))
    end

    def document_date(
      document,
      collection_name,
      slug,
      repository_root,
      git_date_resolver,
      date_cache,
      logger
    )
      source_path = repository_root.join("_#{collection_name}", "#{slug}.md")
      feed_date = document.data["content_last_updated"] || document.data["last_modified"]
      return feed_date unless source_path.file?

      relative_path = relative_git_path(source_path, repository_root)
      resolved_date = cached_git_date(
        repository_root,
        relative_path,
        git_date_resolver,
        date_cache
      )
      return resolved_date if resolved_date

      logger.warn(
        "Content update date:",
        "Git has no date for #{relative_path}; using feed metadata when available."
      )
      feed_date
    end

    def deck_date(
      deck_document,
      subject_kind,
      subject_slug,
      repository_root,
      git_date_resolver,
      date_cache,
      logger
    )
      slides = deck_document&.data&.[]("slides")
      return nil unless slides.is_a?(String) && !slides.empty?
      return nil if slides.match?(%r{\Ahttps?://}i)
      return nil unless slides.split(/[?#]/, 2).first.match?(/\.pptx\z/i)

      deck_path = local_powerpoint_path(slides, repository_root)
      unless deck_path.file?
        logger.warn(
          "Content update date:",
          "Deck #{relative_git_path(deck_path, repository_root)} for #{subject_kind} #{subject_slug} is missing; " \
          "using the #{subject_kind} date."
        )
        return nil
      end

      relative_path = relative_git_path(deck_path, repository_root)
      resolved_date = cached_git_date(
        repository_root,
        relative_path,
        git_date_resolver,
        date_cache
      )
      return resolved_date if resolved_date

      logger.warn(
        "Content update date:",
        "Git has no date for deck #{relative_path}; using the #{subject_kind} date for #{subject_slug}."
      )
      nil
    rescue ArgumentError => error
      logger.warn(
        "Content update date:",
        "#{error.message}; using the #{subject_kind} date for #{subject_slug}."
      )
      nil
    end

    def local_powerpoint_path(slides, repository_root)
      path_without_query = slides.split(/[?#]/, 2).first
      decoded_path = URI::DEFAULT_PARSER.unescape(path_without_query).sub(%r{\A/+}, "")
      candidate = repository_root.join(decoded_path).cleanpath
      relative_git_path(candidate, repository_root)
      candidate
    end

    def relative_git_path(path, repository_root)
      relative_path = Pathname(path).expand_path.relative_path_from(repository_root)
      if relative_path.each_filename.first == ".."
        raise ArgumentError, "Deck path escapes the repository: #{path}"
      end

      relative_path.to_s.tr("\\", "/")
    rescue ArgumentError
      raise ArgumentError, "Deck path escapes the repository: #{path}"
    end

    def cached_git_date(repository_root, relative_path, git_date_resolver, date_cache)
      return date_cache[relative_path] if date_cache.key?(relative_path)

      date_cache[relative_path] = git_date_resolver.call(repository_root, relative_path)
    end

    def git_date(repository_root, relative_path)
      output, _error, status = Open3.capture3(
        "git",
        "log",
        "-1",
        "--format=%cI",
        "--",
        relative_path,
        chdir: repository_root.to_s
      )
      return nil unless status.success?

      output.strip.empty? ? nil : output.strip
    rescue Errno::ENOENT
      nil
    end
  end
end

if defined?(Jekyll::Hooks)
  Jekyll::Hooks.register :site, :post_read do |site|
    McsLabs::ContentLastUpdated.apply(site)
  end
end
