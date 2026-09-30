require "minitest/autorun"
require_relative "../../lib/pds_fetch/blog"

class BlogTest < Minitest::Test
  def test_join_url_concatenates_base_and_path
    assert_equal "https://irrelefante.com.br/notas/x", PdsFetch::Blog.join_url("https://irrelefante.com.br", "/notas/x")
  end

  def test_fetch_posts_attaches_full_url_from_publication
    fake_client = Object.new
    def fake_client.list_all_records(_pds, _did, collection)
      if collection == "site.standard.publication"
        [{"value" => {"url" => "https://irrelefante.com.br"}}]
      else
        [{"uri" => "doc1", "value" => {"path" => "/notas/2026/09/28/quieto/", "title" => "Quieto"}}]
      end
    end

    result = PdsFetch::Blog.fetch_posts(fake_client, "https://pds.example", "did:plc:blog")
    assert_equal "https://irrelefante.com.br/notas/2026/09/28/quieto/", result.first["full_url"]
  end
end
