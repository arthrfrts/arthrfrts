require_relative "../lib/feed_builder"

module ArthrFeed
  class UnifiedFeedGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      sources = {
        "bsky" => site.data["bsky"] || [],
        "tangled_repos" => site.data["tangled_repos"] || [],
        "tangled_stars" => site.data["tangled_stars"] || [],
        "blog" => site.data["blog"] || [],
        "grain" => site.data["grain"] || []
      }

      site.data["feed"] = FeedBuilder.build(sources)
    end
  end
end
