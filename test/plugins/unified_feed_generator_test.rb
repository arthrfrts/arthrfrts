require "minitest/autorun"
require "jekyll"
require_relative "../../_plugins/unified_feed_generator"

class FakeSite
  attr_accessor :data

  def initialize(data)
    @data = data
  end
end

class UnifiedFeedGeneratorTest < Minitest::Test
  def test_generate_sets_site_data_feed_from_sources
    site = FakeSite.new({
      "bsky" => [{"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/app.bsky.feed.post/abc", "value" => {"text" => "hi", "createdAt" => "2026-09-29T00:00:00Z"}}]
    })

    ArthrFeed::UnifiedFeedGenerator.new.generate(site)

    assert_equal 1, site.data["feed"].length
    assert_equal "bsky", site.data["feed"].first["type"]
  end

  def test_generate_defaults_to_empty_feed_when_no_source_data_exists
    site = FakeSite.new({})

    ArthrFeed::UnifiedFeedGenerator.new.generate(site)

    assert_equal [], site.data["feed"]
  end
end
