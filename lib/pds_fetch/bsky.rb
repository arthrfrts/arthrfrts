module PdsFetch
  module Bsky
    def self.reply?(record)
      !record.dig("value", "reply").nil?
    end

    def self.fetch_posts(client, pds, did)
      records = client.list_all_records(pds, did, "app.bsky.feed.post")
      records.reject { |r| reply?(r) }
    end
  end
end
