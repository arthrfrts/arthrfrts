---
---

{%- for post in site.posts %}
  {%- if post.tumblr_url -%}
    {{- post.tumblr_url | remove: "https://arthrfrts.tumblr.com" | remove: "https://irrelefante.tumblr.com" }}    {{ post.url | relative_url }}    301
  {%- endif -%}
{% endfor -%}
{%- for tag in site.tags %}
	{%- assign tag_slug = tag.first | slugify: site.slug_mode -%}
	{%- assign tag_url = site.jekyll-archives.permalinks.tag | replace: ":name", tag_slug -%}
	/tagged/{{- tag_slug }}    {{ tag_url }}    301
{% endfor -%}
/rss	/feed.xml
/archive	/arquivo/
