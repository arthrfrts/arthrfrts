'use strict';

const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const { postUrl } = require('../utils/post-url');

const BLOG_NAME = 'arthrfrts';
const SITE_URL = 'https://arthr.me';
const API_URL = `https://api.tumblr.com/v2/blog/${BLOG_NAME}/post`;

async function postToTumblr(frontmatter, body, postRelPath) {
  const oauth = new OAuth({
    consumer: {
      key: process.env.TUMBLR_CONSUMER_KEY,
      secret: process.env.TUMBLR_CONSUMER_SECRET,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base, key) {
      return crypto.createHmac('sha1', key).update(base).digest('base64');
    },
  });

  const token = {
    key: process.env.TUMBLR_TOKEN,
    secret: process.env.TUMBLR_TOKEN_SECRET,
  };

  const postPath = `${SITE_URL}${postUrl(postRelPath)}`;
  let postData;

  switch (frontmatter.category) {
    case 'Links':
      postData = {
        type: 'link',
        title: frontmatter.title,
        url: frontmatter.source,
        description: body.trim(),
        format: 'markdown',
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
        body: body.trim(),
        format: 'markdown',
      };
  }

  const authHeader = oauth.toHeader(
    oauth.authorize({ url: API_URL, method: 'POST', data: postData }, token),
  );

  const response = await axios.post(API_URL, new URLSearchParams(postData).toString(), {
    headers: {
      ...authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return `https://${BLOG_NAME}.tumblr.com/post/${response.data.response.id}`;
}

module.exports = { postToTumblr };
