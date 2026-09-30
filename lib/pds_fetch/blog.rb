module PdsFetch
  module Blog
    def self.join_url(publication_url, path)
      "#{publication_url}#{path}"
    end

    def self.fetch_posts(client, pds, did)
      publications = client.list_all_records(pds, did, "site.standard.publication")
      publication_url = publications.first&.dig("value", "url")

      documents = client.list_all_records(pds, did, "site.standard.document")
      documents.map do |doc|
        path = doc.dig("value", "path")
        doc.merge("full_url" => join_url(publication_url, path))
      end
    end
  end
end
