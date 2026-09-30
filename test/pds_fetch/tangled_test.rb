require "minitest/autorun"
require_relative "../../lib/pds_fetch/tangled"

class TangledTest < Minitest::Test
  def test_parse_at_uri_extracts_did_collection_rkey
    result = PdsFetch::Tangled.parse_at_uri("at://did:plc:dtpmtcjiwfnhp4riekf7olif/sh.tangled.repo/3melenhwhc422")
    assert_equal({ did: "did:plc:dtpmtcjiwfnhp4riekf7olif", collection: "sh.tangled.repo", rkey: "3melenhwhc422" }, result)
  end

  def test_fetch_repos_returns_raw_records
    fake_client = Object.new
    def fake_client.list_all_records(_pds, _did, _collection)
      [{"uri" => "at://did:plc:me/sh.tangled.repo/linus", "value" => {"name" => "linus"}}]
    end

    result = PdsFetch::Tangled.fetch_repos(fake_client, "https://pds.example", "did:plc:me")
    assert_equal "linus", result.first.dig("value", "name")
  end

  def test_resolve_star_label_falls_back_when_target_lookup_fails
    fake_client = Object.new
    def fake_client.resolve_pds(_did)
      raise "network down"
    end

    target = { did: "did:plc:zzz", collection: "sh.tangled.repo", rkey: "abc" }
    result = PdsFetch::Tangled.resolve_star_label(fake_client, target)
    assert_nil result["owner_handle"]
    assert_nil result["repo_name"]
  end

  def test_resolve_star_label_returns_owner_and_repo_info_on_success
    fake_client = Object.new
    def fake_client.resolve_pds(_did)
      "https://target.pds"
    end
    def fake_client.get_record(_pds, _did, _collection, _rkey)
      {"value" => {"name" => "infra", "description" => "infra repo"}}
    end
    def fake_client.resolve_handle(_did)
      "esporo.net"
    end

    target = { did: "did:plc:zzz", collection: "sh.tangled.repo", rkey: "abc" }
    result = PdsFetch::Tangled.resolve_star_label(fake_client, target)
    assert_equal "esporo.net", result["owner_handle"]
    assert_equal "infra", result["repo_name"]
    assert_equal "infra repo", result["repo_description"]
  end

  def test_fetch_stars_builds_redirect_link_from_subject_and_merges_resolved_label
    fake_client = Object.new
    def fake_client.list_all_records(_pds, _did, _collection)
      [{"value" => {"subject" => "at://did:plc:owner/sh.tangled.repo/rkey123", "createdAt" => "2026-01-01T00:00:00Z"}}]
    end
    def fake_client.resolve_pds(_did)
      "https://target.pds"
    end
    def fake_client.get_record(_pds, _did, _collection, _rkey)
      {"value" => {"name" => "repo-name", "description" => "desc"}}
    end
    def fake_client.resolve_handle(_did)
      "owner.example"
    end

    result = PdsFetch::Tangled.fetch_stars(fake_client, "https://own.pds", "did:plc:me")
    assert_equal "https://tangled.org/did:plc:owner/rkey123", result.first["resolved"]["link"]
    assert_equal "owner.example", result.first["resolved"]["owner_handle"]
    assert_equal "repo-name", result.first["resolved"]["repo_name"]
  end
end
