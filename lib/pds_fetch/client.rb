require "net/http"
require "json"
require "uri"

module PdsFetch
  class Client
    MAX_RECORDS = 5000

    def self.raise_unless_success!(response, url)
      code = response.code.to_i
      return response.body if code >= 200 && code < 300

      raise "HTTP #{response.code} for #{url}: #{response.body.to_s[0, 200]}"
    end

    def initialize(http_get: method(:default_http_get))
      @http_get = http_get
      @did_docs = {}
    end

    def resolve_pds(did)
      doc = did_doc(did)
      service = doc.fetch("service").find { |s| s["type"] == "AtprotoPersonalDataServer" }
      service.fetch("serviceEndpoint")
    end

    def resolve_handle(did)
      doc = did_doc(did)
      aka = doc.fetch("alsoKnownAs", [])
      handle = aka.find { |a| a.start_with?("at://") }
      handle ? handle.sub("at://", "") : nil
    end

    def get_record(pds, did, collection, rkey)
      url = "#{pds}/xrpc/com.atproto.repo.getRecord?repo=#{did}&collection=#{collection}&rkey=#{rkey}"
      JSON.parse(@http_get.call(url))
    end

    def list_all_records(pds, did, collection)
      records = []
      cursor = nil

      loop do
        query = "repo=#{did}&collection=#{collection}&limit=100"
        query += "&cursor=#{cursor}" if cursor && !cursor.empty?
        page = JSON.parse(@http_get.call("#{pds}/xrpc/com.atproto.repo.listRecords?#{query}"))
        records.concat(page.fetch("records", []))
        cursor = page["cursor"]
        break if cursor.nil? || cursor.empty?
        break if records.length >= MAX_RECORDS
      end

      records
    end

    private

    def did_doc(did)
      @did_docs[did] ||= JSON.parse(@http_get.call("https://plc.directory/#{did}"))
    end

    def default_http_get(url)
      response = Net::HTTP.get_response(URI(url))
      self.class.raise_unless_success!(response, url)
    end
  end
end
