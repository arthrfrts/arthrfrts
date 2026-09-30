require "minitest/autorun"
require_relative "../../lib/pds_fetch/grain"

class GrainTest < Minitest::Test
  def test_join_gallery_photos_orders_by_position_and_builds_blob_url
    galleries = [{"uri" => "gallery1", "value" => {"title" => "Catedral"}}]
    gallery_items = [
      {"value" => {"gallery" => "gallery1", "item" => "photo2", "position" => 1}},
      {"value" => {"gallery" => "gallery1", "item" => "photo1", "position" => 0}}
    ]
    photos = [
      {"uri" => "photo1", "value" => {"alt" => "first", "photo" => {"ref" => {"$link" => "cid1"}}, "aspectRatio" => {"width" => 100, "height" => 200}}},
      {"uri" => "photo2", "value" => {"alt" => "second", "photo" => {"ref" => {"$link" => "cid2"}}, "aspectRatio" => {"width" => 300, "height" => 400}}}
    ]

    result = PdsFetch::Grain.join_gallery_photos("https://teal.town", "did:plc:me", galleries, gallery_items, photos)
    assert_equal ["first", "second"], result.first["photos"].map { |p| p["alt"] }
    assert_equal "https://teal.town/xrpc/com.atproto.sync.getBlob?did=did:plc:me&cid=cid1", result.first["photos"].first["blob_url"]
  end

  def test_join_gallery_photos_skips_missing_photo_records
    galleries = [{"uri" => "gallery1", "value" => {}}]
    gallery_items = [{"value" => {"gallery" => "gallery1", "item" => "missing-photo", "position" => 0}}]
    photos = []

    result = PdsFetch::Grain.join_gallery_photos("https://teal.town", "did:plc:me", galleries, gallery_items, photos)
    assert_equal [], result.first["photos"]
  end

  def test_join_gallery_photos_handles_photo_missing_aspect_ratio_and_alt
    galleries = [{"uri" => "gallery1", "value" => {}}]
    gallery_items = [{"value" => {"gallery" => "gallery1", "item" => "photo1", "position" => 0}}]
    photos = [{"uri" => "photo1", "value" => {"photo" => {"ref" => {"$link" => "cid1"}}}}]

    result = PdsFetch::Grain.join_gallery_photos("https://teal.town", "did:plc:me", galleries, gallery_items, photos)
    photo = result.first["photos"].first
    assert_nil photo["alt"]
    assert_nil photo["width"]
    assert_nil photo["height"]
    assert_equal "https://teal.town/xrpc/com.atproto.sync.getBlob?did=did:plc:me&cid=cid1", photo["blob_url"]
  end

  def test_fetch_galleries_fetches_and_joins_all_three_collections
    fake_client = Object.new
    def fake_client.list_all_records(_pds, _did, collection)
      case collection
      when "social.grain.gallery"
        [{"uri" => "gallery1", "value" => {"title" => "Catedral"}}]
      when "social.grain.gallery.item"
        [{"value" => {"gallery" => "gallery1", "item" => "photo1", "position" => 0}}]
      when "social.grain.photo"
        [{"uri" => "photo1", "value" => {"alt" => "sino", "photo" => {"ref" => {"$link" => "cid1"}}, "aspectRatio" => {"width" => 10, "height" => 20}}}]
      end
    end

    result = PdsFetch::Grain.fetch_galleries(fake_client, "https://teal.town", "did:plc:me")
    assert_equal "sino", result.first["photos"].first["alt"]
  end
end
