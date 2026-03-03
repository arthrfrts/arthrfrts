'use strict';

const tumblr = require('tumblr.js');
const { postUrl } = require('../utils/post-url');

const BLOG_NAME = 'arthrfrts';
const SITE_URL = 'https://arthr.me';

async function postToTumblr(frontmatter, body, postRelPath) {
  const client = tumblr.createClient({
    consumer_key: process.env.TUMBLR_CONSUMER_KEY,
    consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
    token: process.env.TUMBLR_TOKEN,
    token_secret: process.env.TUMBLR_TOKEN_SECRET,
  });

  const postPath = `${SITE_URL}${postUrl(postRelPath)}`;
  let postData;

  switch (frontmatter.category) {
    case 'Links':
      postData = {
        type: 'link',
        title: frontmatter.title,
        url: frontmatter.source,
        description: body,
      };
      break;
    case 'Fotos':
      if (!frontmatter.image) throw new Error(`Fotos post "${frontmatter.title}" has no image field`);
      postData = {
        type: 'photo',
        source: `${SITE_URL}${frontmatter.image}`,
        caption: `<a href="${postPath}">${frontmatter.title}</a>`,
      };
      break;
    default: // Notas, Impressões
      postData = {
        type: 'text',
        title: frontmatter.title,
        body,
      };
  }

  const response = await client.createPost(BLOG_NAME, postData);

  return `https://${BLOG_NAME}.tumblr.com/post/${response.id}`;
}

module.exports = { postToTumblr };
