'use strict';

const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const UPLOAD_URL = 'https://up.flickr.com/services/upload/';
const FLICKR_USER = 'arthrfrts'; // path alias; replace with NSID if needed

async function postToFlickr(frontmatter, repoRoot) {
  if (!frontmatter.image) throw new Error(`Fotos post "${frontmatter.title}" has no image field`);
  for (const v of ['FLICKR_API_KEY', 'FLICKR_API_SECRET', 'FLICKR_TOKEN', 'FLICKR_TOKEN_SECRET']) {
    if (!process.env[v]) throw new Error(`Missing required env var: ${v}`);
  }

  const oauth = OAuth({
    consumer: {
      key: process.env.FLICKR_API_KEY,
      secret: process.env.FLICKR_API_SECRET,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base, key) {
      return crypto.createHmac('sha1', key).update(base).digest('base64');
    },
  });

  const token = {
    key: process.env.FLICKR_TOKEN,
    secret: process.env.FLICKR_TOKEN_SECRET,
  };

  const imagePath = path.join(repoRoot, frontmatter.image.replace(/^\//, ''));
  const imageBuffer = fs.readFileSync(imagePath);

  const form = new FormData();
  form.append('title', frontmatter.title);
  form.append(
    'description',
    `Publicado originalmente em https://arthr.me${frontmatter.url || ''}`
  );
  form.append('tags', (frontmatter.tags || []).join(' '));
  form.append('is_public', '1');
  form.append('photo', imageBuffer, { filename: path.basename(imagePath) });

  const authHeader = oauth.toHeader(
    oauth.authorize({ url: UPLOAD_URL, method: 'POST' }, token)
  );

  const response = await axios.post(UPLOAD_URL, form, {
    headers: { ...authHeader, ...form.getHeaders() },
  });

  const photoId = response.data.match(/<photoid>(\d+)<\/photoid>/)?.[1];
  if (!photoId) throw new Error(`Unexpected Flickr response: ${response.data}`);

  return `https://flickr.com/photos/${FLICKR_USER}/${photoId}`;
}

module.exports = { postToFlickr };
