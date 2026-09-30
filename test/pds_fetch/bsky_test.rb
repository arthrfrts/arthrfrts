require "minitest/autorun"
require_relative "../../lib/pds_fetch/bsky"

class BskyTest < Minitest::Test
  def test_reply_true_when_reply_field_present
    record = {"value" => {"reply" => {"root" => {}}}}
    assert PdsFetch::Bsky.reply?(record)
  end

  def test_reply_false_when_no_reply_field
    record = {"value" => {"text" => "hello"}}
    refute PdsFetch::Bsky.reply?(record)
  end

  def test_fetch_posts_filters_out_replies
    fake_client = Object.new
    def fake_client.list_all_records(_pds, _did, _collection)
      [
        {"uri" => "root", "value" => {"text" => "root post"}},
        {"uri" => "reply", "value" => {"text" => "a reply", "reply" => {"root" => {}}}}
      ]
    end

    result = PdsFetch::Bsky.fetch_posts(fake_client, "https://pds.example", "did:plc:abc")
    assert_equal ["root"], result.map { |r| r["uri"] }
  end
end
