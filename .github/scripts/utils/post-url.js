'use strict';

const path = require('path');

/**
 * Derive the Jekyll permalink from a post filename.
 * Filename format: _posts/YYYY-MM-DD-slug.md
 * Jekyll default permalink: /YYYY/MM/DD/slug/
 */
function postUrl(postRelPath) {
  const basename = path.basename(postRelPath, '.md');
  const match = basename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!match) throw new Error(`Cannot derive URL from filename: ${basename}`);
  const [, year, month, day, slug] = match;
  return `/${year}/${month}/${day}/${slug}/`;
}

module.exports = { postUrl };
