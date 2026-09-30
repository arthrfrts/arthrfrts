require "minitest/autorun"
require_relative "../../lib/pds_fetch/client"

class ClientTest < Minitest::Test
  def test_resolve_pds_reads_service_endpoint
    fake = ->(url) {
      assert_equal "https://plc.directory/did:plc:abc", url
      '{"service":[{"type":"AtprotoPersonalDataServer","serviceEndpoint":"https://example.pds"}]}'
    }
    client = PdsFetch::Client.new(http_get: fake)
    assert_equal "https://example.pds", client.resolve_pds("did:plc:abc")
  end

  def test_resolve_handle_strips_at_prefix
    fake = ->(_url) { '{"alsoKnownAs":["at://example.test"]}' }
    client = PdsFetch::Client.new(http_get: fake)
    assert_equal "example.test", client.resolve_handle("did:plc:abc")
  end

  def test_resolve_handle_returns_nil_when_no_at_uri_present
    fake = ->(_url) { '{"alsoKnownAs":[]}' }
    client = PdsFetch::Client.new(http_get: fake)
    assert_nil client.resolve_handle("did:plc:abc")
  end

  def test_get_record_parses_json_body
    fake = ->(_url) { '{"uri":"at://did:plc:abc/sh.tangled.repo/xyz","value":{"name":"repo"}}' }
    client = PdsFetch::Client.new(http_get: fake)
    record = client.get_record("https://pds.example", "did:plc:abc", "sh.tangled.repo", "xyz")
    assert_equal "repo", record.dig("value", "name")
  end

  def test_list_all_records_follows_cursor_until_exhausted
    pages = [
      '{"records":[{"uri":"a"}],"cursor":"a"}',
      '{"records":[{"uri":"b"}]}'
    ]
    calls = 0
    fake = ->(_url) {
      body = pages[calls]
      calls += 1
      body
    }
    client = PdsFetch::Client.new(http_get: fake)
    records = client.list_all_records("https://pds.example", "did:plc:abc", "app.bsky.feed.post")
    assert_equal [{"uri" => "a"}, {"uri" => "b"}], records
    assert_equal 2, calls
  end

  def test_list_all_records_stops_on_empty_string_cursor
    fake = ->(_url) { '{"records":[{"uri":"only"}],"cursor":""}' }
    client = PdsFetch::Client.new(http_get: fake)
    records = client.list_all_records("https://pds.example", "did:plc:abc", "app.bsky.feed.post")
    assert_equal [{"uri" => "only"}], records
  end

  def test_list_all_records_stops_at_safety_cap
    fake = ->(_url) { '{"records":[{"uri":"x"}],"cursor":"next"}' }
    client = PdsFetch::Client.new(http_get: fake)
    records = client.list_all_records("https://pds.example", "did:plc:abc", "app.bsky.feed.post")
    assert_equal PdsFetch::Client::MAX_RECORDS, records.length
  end

  def test_raise_unless_success_returns_body_for_2xx
    response = Struct.new(:code, :body).new("200", "ok body")
    assert_equal "ok body", PdsFetch::Client.raise_unless_success!(response, "https://x")
  end

  def test_raise_unless_success_raises_for_4xx_with_status_and_body_in_message
    response = Struct.new(:code, :body).new("400", '{"error":"InvalidRequest","message":"Could not find repo"}')
    error = assert_raises(RuntimeError) { PdsFetch::Client.raise_unless_success!(response, "https://x/y") }
    assert_match(/HTTP 400/, error.message)
    assert_match(/Could not find repo/, error.message)
  end

  def test_resolve_pds_memoizes_the_did_document_within_one_client
    calls = 0
    fake = ->(_url) {
      calls += 1
      '{"service":[{"type":"AtprotoPersonalDataServer","serviceEndpoint":"https://example.pds"}],"alsoKnownAs":["at://example.test"]}'
    }
    client = PdsFetch::Client.new(http_get: fake)
    client.resolve_pds("did:plc:abc")
    client.resolve_pds("did:plc:abc")
    client.resolve_handle("did:plc:abc")
    assert_equal 1, calls
  end
end
