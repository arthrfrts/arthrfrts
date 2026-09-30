require "time"
require_relative "pds_fetch/links"

module FeedBuilder
  MAIN_DID = "did:plc:aeaouj6eedwqmk4z3pies55n"
  MAIN_HANDLE = "arthr.me"

  def self.normalize_bsky(records)
    records.map do |r|
      rkey = PdsFetch::Links.rkey_from_uri(r["uri"])
      {
        "type" => "bsky",
        "url" => PdsFetch::Links.bsky_post_link(MAIN_HANDLE, rkey),
        "title" => nil,
        "summary" => r.dig("value", "text"),
        "published" => r.dig("value", "createdAt"),
        "photos" => [],
        "tags" => []
      }
    end
  end

  def self.normalize_tangled_repos(records)
    records.map do |r|
      rkey = PdsFetch::Links.rkey_from_uri(r["uri"])
      {
        "type" => "tangled_repo",
        "url" => PdsFetch::Links.tangled_link(MAIN_DID, rkey),
        "title" => r.dig("value", "name") || rkey,
        "summary" => r.dig("value", "description"),
        "published" => r.dig("value", "createdAt"),
        "photos" => [],
        "tags" => []
      }
    end
  end

  def self.normalize_tangled_stars(records)
    records.map do |r|
      resolved = r["resolved"] || {}
      owner = resolved["owner_handle"]
      name = resolved["repo_name"]
      title = (owner && name) ? "#{owner}/#{name}" : "Starred a repo on Tangled"
      {
        "type" => "tangled_star",
        "url" => resolved["link"],
        "title" => title,
        "summary" => resolved["repo_description"],
        "published" => r.dig("value", "createdAt"),
        "photos" => [],
        "tags" => []
      }
    end
  end

  def self.normalize_blog(records)
    records.map do |r|
      {
        "type" => "blog",
        "url" => r["full_url"],
        "title" => r.dig("value", "title"),
        "summary" => nil,
        "published" => r.dig("value", "publishedAt"),
        "photos" => [],
        "tags" => r.dig("value", "tags") || []
      }
    end
  end

  def self.normalize_grain(records)
    records.map do |r|
      rkey = PdsFetch::Links.rkey_from_uri(r["uri"])
      {
        "type" => "grain",
        "url" => "https://grain.social/profile/#{MAIN_HANDLE}/gallery/#{rkey}",
        "title" => r.dig("value", "title"),
        "summary" => r.dig("value", "description"),
        "published" => r.dig("value", "createdAt"),
        "photos" => r["photos"] || [],
        "tags" => []
      }
    end
  end

  def self.build(sources)
    entries =
      normalize_bsky(sources["bsky"] || []) +
      normalize_tangled_repos(sources["tangled_repos"] || []) +
      normalize_tangled_stars(sources["tangled_stars"] || []) +
      normalize_blog(sources["blog"] || []) +
      normalize_grain(sources["grain"] || [])

    entries.sort_by { |e| sort_key(e["published"]) }
  end

  def self.sort_key(published)
    return Float::INFINITY unless published

    begin
      -Time.iso8601(published).to_f
    rescue ArgumentError
      Float::INFINITY
    end
  end
end
