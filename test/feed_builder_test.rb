require "minitest/autorun"
require_relative "../lib/feed_builder"

class FeedBuilderTest < Minitest::Test
  def test_normalize_bsky_builds_post_link_and_summary
    records = [{"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/app.bsky.feed.post/abc123", "value" => {"text" => "hello", "createdAt" => "2026-09-29T00:00:00Z"}}]
    result = FeedBuilder.normalize_bsky(records)
    assert_equal "https://bsky.app/profile/arthr.me/post/abc123", result.first["url"]
    assert_equal "hello", result.first["summary"]
    assert_nil result.first["title"]
  end

  def test_normalize_tangled_repos_uses_name_or_falls_back_to_rkey
    records = [{"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/sh.tangled.repo/linus", "value" => {"name" => "linus", "description" => "a theme", "createdAt" => "2026-02-14T00:00:00Z"}}]
    result = FeedBuilder.normalize_tangled_repos(records)
    assert_equal "https://tangled.org/did:plc:aeaouj6eedwqmk4z3pies55n/linus", result.first["url"]
    assert_equal "linus", result.first["title"]
  end

  def test_normalize_tangled_star_uses_resolved_label_when_present
    records = [{"value" => {"createdAt" => "2026-01-01T00:00:00Z"}, "resolved" => {"link" => "https://tangled.org/x/y", "owner_handle" => "esporo.net", "repo_name" => "infra", "repo_description" => "infra repo"}}]
    result = FeedBuilder.normalize_tangled_stars(records)
    assert_equal "esporo.net/infra", result.first["title"]
  end

  def test_normalize_tangled_star_falls_back_when_unresolved
    records = [{"value" => {"createdAt" => "2026-01-01T00:00:00Z"}, "resolved" => {"link" => "https://tangled.org/x/y", "owner_handle" => nil, "repo_name" => nil, "repo_description" => nil}}]
    result = FeedBuilder.normalize_tangled_stars(records)
    assert_equal "Starred a repo on Tangled", result.first["title"]
  end

  def test_normalize_blog_uses_full_url_and_tags
    records = [{"value" => {"title" => "Quieto", "tags" => ["agora"], "publishedAt" => "2026-09-28T23:13:00.000Z"}, "full_url" => "https://irrelefante.com.br/notas/2026/09/28/quieto/"}]
    result = FeedBuilder.normalize_blog(records)
    assert_equal "https://irrelefante.com.br/notas/2026/09/28/quieto/", result.first["url"]
    assert_equal ["agora"], result.first["tags"]
  end

  def test_normalize_grain_builds_gallery_url_and_keeps_photos
    records = [{"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/social.grain.gallery/3mwkakx5fcoje", "value" => {"title" => "Catedral", "createdAt" => "2026-09-28T02:14:55.673Z"}, "photos" => [{"blob_url" => "https://teal.town/xrpc/com.atproto.sync.getBlob?did=x&cid=y", "alt" => "sino", "width" => 1333, "height" => 2000}]}]
    result = FeedBuilder.normalize_grain(records)
    assert_equal "https://grain.social/profile/arthr.me/gallery/3mwkakx5fcoje", result.first["url"]
    assert_equal 1, result.first["photos"].length
  end

  def test_build_merges_and_sorts_all_sources_descending_by_published
    sources = {
      "bsky" => [{"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/app.bsky.feed.post/old", "value" => {"text" => "old", "createdAt" => "2026-01-01T00:00:00Z"}}],
      "grain" => [{"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/social.grain.gallery/new", "value" => {"title" => "new", "createdAt" => "2026-09-01T00:00:00Z"}, "photos" => []}]
    }
    result = FeedBuilder.build(sources)
    assert_equal ["grain", "bsky"], result.map { |e| e["type"] }
  end

  def test_build_sorts_missing_published_to_the_end_without_raising
    sources = {
      "bsky" => [
        {"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/app.bsky.feed.post/nopublish", "value" => {"text" => "no date"}},
        {"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/app.bsky.feed.post/dated", "value" => {"text" => "has date", "createdAt" => "2026-01-01T00:00:00Z"}}
      ]
    }
    result = FeedBuilder.build(sources)
    assert_equal "has date", result.first["summary"]
    assert_equal "no date", result.last["summary"]
  end

  def test_build_defaults_missing_source_keys_to_empty
    result = FeedBuilder.build({})
    assert_equal [], result
  end

  def test_build_sorts_by_parsed_instant_across_mixed_timezone_offsets
    sources = {
      "tangled_repos" => [{"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/sh.tangled.repo/older", "value" => {"name" => "older", "createdAt" => "2026-08-02T07:44:26+03:00"}}],
      "bsky" => [{"uri" => "at://did:plc:aeaouj6eedwqmk4z3pies55n/app.bsky.feed.post/newer", "value" => {"text" => "newer", "createdAt" => "2026-08-02T06:00:00.000Z"}}]
    }
    result = FeedBuilder.build(sources)
    assert_equal ["bsky", "tangled_repo"], result.map { |e| e["type"] }
  end
end
