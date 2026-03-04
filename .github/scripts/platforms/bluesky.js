'use strict';

const { BskyAgent, RichText } = require('@atproto/api');
const { stripMarkdown } = require('../utils/markdown');
const { postUrl } = require('../utils/post-url');

const SITE_URL = 'https://arthr.me';
const MAX_CHARS = 300;

async function postToBluesky(frontmatter, body, postRelPath) {
  const service = process.env.BLUESKY_SERVICE || 'https://bsky.social';
  const agent = new BskyAgent({ service });
  await agent.login({
    identifier: process.env.BLUESKY_IDENTIFIER,
    password: process.env.BLUESKY_PASSWORD,
  });

  const postPath = `${SITE_URL}${postUrl(postRelPath)}`;
  let text;

  if (frontmatter.category === 'Notas') {
    const plain = stripMarkdown(body);
    const rt = new RichText({ text: plain });
    if (rt.graphemeLength <= MAX_CHARS) {
      text = plain;
    } else {
      const suffix = `… ${postPath}`;
      const suffixRt = new RichText({ text: suffix });
      const available = MAX_CHARS - suffixRt.graphemeLength;
      // Trim by characters until grapheme length fits
      let trimmed = plain;
      while (new RichText({ text: trimmed }).graphemeLength > available) {
        trimmed = trimmed.slice(0, -1);
      }
      text = `${trimmed}… ${postPath}`;
    }
  } else {
    // Links, Impressões, Fotos → link post back to arthr.me
    text = `${frontmatter.title}\n${postPath}`;
  }

  const response = await agent.post({ text });
  const rkey = response.uri.split('/').pop();
  return `https://bsky.app/profile/${agent.session.did}/post/${rkey}`;
}

module.exports = { postToBluesky };
