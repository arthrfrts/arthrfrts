require "minitest/autorun"
require "tmpdir"
require "yaml"
require_relative "../../lib/pds_fetch/writer"

class WriterTest < Minitest::Test
  def test_write_source_writes_yaml_and_reports_count
    Dir.mktmpdir do |dir|
      path = File.join(dir, "out.yml")
      result = PdsFetch::Writer.write_source(path) { [{"a" => 1}, {"b" => 2}] }
      assert_equal({ status: :ok, count: 2 }, result)
      assert_equal [{"a" => 1}, {"b" => 2}], YAML.safe_load(File.read(path))
    end
  end

  def test_write_source_keeps_existing_file_on_error
    Dir.mktmpdir do |dir|
      path = File.join(dir, "out.yml")
      File.write(path, [{"old" => true}].to_yaml)

      result = PdsFetch::Writer.write_source(path) { raise "boom" }

      assert_equal :error, result[:status]
      assert_equal [{"old" => true}], YAML.safe_load(File.read(path))
    end
  end
end
