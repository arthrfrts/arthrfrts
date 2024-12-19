source "https://rubygems.org"

gem "jekyll", "~> 4.3.4"

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

gem "jekyll-feed", "~> 0.17.0", :group => :jekyll_plugins
gem "jekyll-json-feed", "~> 1.0", :group => :jekyll_plugins
gem "jekyll-sitemap", "~> 1.4", :group => :jekyll_plugins
gem "jekyll-seo-tag", "~> 2.8", :group => :jekyll_plugins
gem "jekyll-paginate", "~> 1.1", :group => :jekyll_plugins
gem "jekyll-archives", "~> 2.3", :group => :jekyll_plugins
gem "jekyll-redirect-from", "~> 0.16.0", :group => :jekyll_plugins
gem "jekyll-last-modified-at", "~> 1.3", :group => :jekyll_plugins
gem "jekyll-compose", "~> 0.12.0", :group => :jekyll_plugins
gem "jekyll-relative-links", "~> 0.7.0", :group => :jekyll_plugins
