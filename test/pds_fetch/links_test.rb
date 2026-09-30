require "minitest/autorun"
require_relative "../../lib/pds_fetch/links"

class LinksTest < Minitest::Test
  def test_tangled_link_builds_did_rkey_redirect_url
    url = PdsFetch::Links.tangled_link("did:plc:aeaouj6eedwqmk4z3pies55n", "3met26k7c6k22")
    assert_equal "https://tangled.org/did:plc:aeaouj6eedwqmk4z3pies55n/3met26k7c6k22", url
  end

  def test_bsky_post_link_builds_profile_post_url
    url = PdsFetch::Links.bsky_post_link("arthr.me", "3mwoc62rqt22j")
    assert_equal "https://bsky.app/profile/arthr.me/post/3mwoc62rqt22j", url
  end

  def test_blob_url_builds_get_blob_endpoint
    url = PdsFetch::Links.blob_url("https://teal.town", "did:plc:aeaouj6eedwqmk4z3pies55n", "bafkreia4rofrp7bp3hiz72qybqmworzvgd4zhrfansfby3oiu3bcgvnaqe")
    assert_equal "https://teal.town/xrpc/com.atproto.sync.getBlob?did=did:plc:aeaouj6eedwqmk4z3pies55n&cid=bafkreia4rofrp7bp3hiz72qybqmworzvgd4zhrfansfby3oiu3bcgvnaqe", url
  end

  def test_rkey_from_uri_returns_last_path_segment
    rkey = PdsFetch::Links.rkey_from_uri("at://did:plc:aeaouj6eedwqmk4z3pies55n/app.bsky.feed.post/3mwoc62rqt22j")
    assert_equal "3mwoc62rqt22j", rkey
  end
end
