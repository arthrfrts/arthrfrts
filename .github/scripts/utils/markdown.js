'use strict';

/**
 * Strip Markdown to plain text for Bluesky posts.
 */
function stripMarkdown(md) {
  return md
    .replace(/^#{1,6}\s+/gm, '')             // headers
    .replace(/\*\*(.+?)\*\*/g, '$1')         // bold
    .replace(/\*(.+?)\*/g, '$1')             // italic
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')  // images → remove (must precede links)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → label only
    .replace(/`{1,3}[^`]*`{1,3}/g, '')       // code
    .replace(/^\s*[-*+]\s+/gm, '')           // list markers
    .replace(/\n{3,}/g, '\n\n')              // excess blank lines
    .trim();
}

module.exports = { stripMarkdown };
