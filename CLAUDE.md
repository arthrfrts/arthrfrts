# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Arthur Freitas's personal website/blog at [arthr.me](https://arthr.me). It's a Jekyll 4.4.1 site using a custom gem-based theme called `linus`. The site is deployed to Cloudflare Pages and written primarily in Portuguese (pt-BR).

The blog was previously hosted on Tumblr (accounts `arthrfrts` and `irrelefante`). Many posts have a `tumblr_url` front matter field from that migration.

## Commands

```sh
# Serve locally with drafts and incremental builds
bundle exec jekyll serve --drafts --incremental

# Clean build artifacts
bundle exec jekyll clean

# Update gems
bundle update
```

## Architecture

### Theme

The site uses a custom gem theme `linus` (~> 1.0). The theme provides layouts, includes, and styles. Local includes override gem stubs:

- `_includes/head.html` — IndieAuth, webmention endpoints, syndication links
- `_includes/below-post.html` — webmention display (`{% webmentions page.url %}`)
- `_includes/end.html` — webmention JS (`{% webmentions_js %}`)

### Content

Posts live in `_posts/YYYY-MM-DD-slug.md`. The standard front matter for a post:

```yaml
---
layout: post
title: 'Post title'
date: '2024-01-01T10:00:00-03:00'
category: Notas        # One of: Notas, Links, Impressões, Fotos
tags:
  - tag-name
tumblr_url: https://arthrfrts.tumblr.com/post/...   # optional, migrated posts only
source: https://example.com                          # optional, for Links category
image: /uploads/image.jpg                            # optional, cover image
syndicate_to:                                        # optional, POSSE targets
  - bluesky
  - tumblr
  - flickr                                           # Fotos only
syndication_urls:                                    # written back by GitHub Action
  bluesky: https://bsky.app/profile/.../post/...
  tumblr: https://arthrfrts.tumblr.com/post/...
  flickr: https://flickr.com/photos/arthrfrts/...
---
```

The four categories have designated colors defined in `_config.yml`:
- **Notas** — yellow (`#F5C842`)
- **Links** — blue (`#6BAED6`)
- **Impressões** — red-orange (`#F06A55`)
- **Fotos** — light blue (`#88C0D0`)

### Redirects

`_redirects` is processed as a Jekyll template and generates Cloudflare Pages redirect rules. It maps old Tumblr post URLs and `/tagged/` URLs to their current equivalents. When adding new redirect rules, add them to this file.

### Static Pages

- `index.html` — uses `blog` layout
- `sobre.md` — About page (`/sobre/`)
- `arquivo.md` — Archive page (`/arquivo/`)
- `404.html` — Error page

### Feeds & IndieWeb

The site exposes RSS at `/feed.xml` and JSON Feed at `/feed.json`. It supports Webmentions via `jekyll-webmention_io` and IndieAuth via the `head.html` include.

### Media

Upload images to `/uploads/`. The `.pages.yml` configures the Nova CMS for content editing.

## Code Style

EditorConfig enforces: 2-space indentation, LF line endings, 80-character max line length, no trailing whitespace (trailing whitespace is preserved in `.md` files).
