require "yaml"

module PdsFetch
  module Writer
    def self.write_source(path)
      data = yield
      File.write(path, data.to_yaml)
      { status: :ok, count: data.length }
    rescue StandardError => e
      { status: :error, message: e.message }
    end
  end
end
