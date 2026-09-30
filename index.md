---
layout: default
---

<div class="h-feed">
  {% for entry in site.data.feed limit: 50 %}
    {% include entry.html entry=entry %}
  {% endfor %}
</div>
