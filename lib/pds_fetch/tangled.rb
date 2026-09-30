require_relative "links"

module PdsFetch
  module Tangled
    def self.parse_at_uri(uri)
      _prefix, _blank, did, collection, rkey = uri.split("/")
      { did: did, collection: collection, rkey: rkey }
    end

    def self.fetch_repos(client, pds, did)
      client.list_all_records(pds, did, "sh.tangled.repo")
    end

    def self.resolve_star_label(client, target)
      target_pds = client.resolve_pds(target[:did])
      repo = client.get_record(target_pds, target[:did], target[:collection], target[:rkey])
      handle = client.resolve_handle(target[:did])
      {
        "owner_handle" => handle,
        "repo_name" => repo.dig("value", "name"),
        "repo_description" => repo.dig("value", "description")
      }
    rescue StandardError
      { "owner_handle" => nil, "repo_name" => nil, "repo_description" => nil }
    end

    def self.fetch_stars(client, pds, did)
      stars = client.list_all_records(pds, did, "sh.tangled.feed.star")

      stars.map do |star|
        subject = star.dig("value", "subject")
        target = parse_at_uri(subject)
        link = Links.tangled_link(target[:did], target[:rkey])
        label = resolve_star_label(client, target)

        star.merge("resolved" => { "link" => link }.merge(label))
      end
    end
  end
end
