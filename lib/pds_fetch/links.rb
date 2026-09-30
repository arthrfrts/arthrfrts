module PdsFetch
  module Links
    def self.tangled_link(did, rkey)
      "https://tangled.org/#{did}/#{rkey}"
    end

    def self.bsky_post_link(handle, rkey)
      "https://bsky.app/profile/#{handle}/post/#{rkey}"
    end

    def self.blob_url(pds, did, cid)
      "#{pds}/xrpc/com.atproto.sync.getBlob?did=#{did}&cid=#{cid}"
    end

    def self.rkey_from_uri(uri)
      uri.split("/").last
    end
  end
end
