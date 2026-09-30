require_relative "links"

module PdsFetch
  module Grain
    def self.join_gallery_photos(pds, did, galleries, gallery_items, photos)
      photos_by_uri = {}
      photos.each { |p| photos_by_uri[p["uri"]] = p }

      items_by_gallery = Hash.new { |h, k| h[k] = [] }
      gallery_items.each { |item| items_by_gallery[item.dig("value", "gallery")] << item }

      galleries.map do |gallery|
        items = items_by_gallery[gallery["uri"]].sort_by { |item| item.dig("value", "position") || 0 }

        photo_list = items.map do |item|
          photo = photos_by_uri[item.dig("value", "item")]
          next nil unless photo

          cid = photo.dig("value", "photo", "ref", "$link")
          aspect = photo.dig("value", "aspectRatio") || {}

          {
            "blob_url" => Links.blob_url(pds, did, cid),
            "alt" => photo.dig("value", "alt"),
            "width" => aspect["width"],
            "height" => aspect["height"]
          }
        end.compact

        gallery.merge("photos" => photo_list)
      end
    end

    def self.fetch_galleries(client, pds, did)
      galleries = client.list_all_records(pds, did, "social.grain.gallery")
      gallery_items = client.list_all_records(pds, did, "social.grain.gallery.item")
      photos = client.list_all_records(pds, did, "social.grain.photo")

      join_gallery_photos(pds, did, galleries, gallery_items, photos)
    end
  end
end
