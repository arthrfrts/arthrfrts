#!/usr/bin/env ruby
require_relative "../lib/pds_fetch/client"
require_relative "../lib/pds_fetch/links"
require_relative "../lib/pds_fetch/writer"
require_relative "../lib/pds_fetch/bsky"
require_relative "../lib/pds_fetch/tangled"
require_relative "../lib/pds_fetch/blog"
require_relative "../lib/pds_fetch/grain"

MAIN_DID = "did:plc:aeaouj6eedwqmk4z3pies55n"
BLOG_DID = "did:plc:5anqf5uonyp67nsex6h55l6p"
DATA_DIR = File.expand_path("../_data", __dir__)

client = PdsFetch::Client.new

sources = {
  "bsky.yml" => -> { PdsFetch::Bsky.fetch_posts(client, client.resolve_pds(MAIN_DID), MAIN_DID) },
  "tangled_repos.yml" => -> { PdsFetch::Tangled.fetch_repos(client, client.resolve_pds(MAIN_DID), MAIN_DID) },
  "tangled_stars.yml" => -> { PdsFetch::Tangled.fetch_stars(client, client.resolve_pds(MAIN_DID), MAIN_DID) },
  "blog.yml" => -> { PdsFetch::Blog.fetch_posts(client, client.resolve_pds(BLOG_DID), BLOG_DID) },
  "grain.yml" => -> { PdsFetch::Grain.fetch_galleries(client, client.resolve_pds(MAIN_DID), MAIN_DID) }
}

sources.each do |filename, fetcher|
  path = File.join(DATA_DIR, filename)
  result = PdsFetch::Writer.write_source(path, &fetcher)

  if result[:status] == :ok
    puts "wrote #{filename} (#{result[:count]} records)"
  else
    warn "fetch failed for #{filename}, keeping existing file: #{result[:message]}"
  end
end
