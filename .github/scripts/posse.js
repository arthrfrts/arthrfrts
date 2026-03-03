'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');
const { postToBluesky } = require('./platforms/bluesky');
const { postToTumblr } = require('./platforms/tumblr');
const { postToFlickr } = require('./platforms/flickr');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function git(...args) {
  const result = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`git ${args[0]} failed (exit ${result.status}): ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function getChangedPosts() {
  try {
    const output = git('diff', '--name-only', 'HEAD^', 'HEAD', '--', '_posts/');
    return output ? output.split('\n').filter(f => f.endsWith('.md')) : [];
  } catch {
    return []; // First commit or git error — nothing to syndicate
  }
}

async function main() {
  const changedPosts = getChangedPosts();
  if (changedPosts.length === 0) {
    console.log('No posts changed, skipping syndication');
    return;
  }

  let anyUpdated = false;

  for (const postRelPath of changedPosts) {
    const postPath = path.join(REPO_ROOT, postRelPath);
    if (!fs.existsSync(postPath)) continue; // deleted post

    const raw = fs.readFileSync(postPath, 'utf8');
    const { data, content } = matter(raw);

    // Skip if no syndication requested or already syndicated
    if (!Array.isArray(data.syndicate_to) || data.syndicate_to.length === 0 || data.syndication_urls) continue;

    console.log(`Syndicating ${postRelPath} to: ${data.syndicate_to.join(', ')}`);
    const syndUrls = {};

    for (const platform of data.syndicate_to) {
      try {
        let url;
        switch (platform) {
          case 'bluesky':
            url = await postToBluesky(data, content);
            break;
          case 'tumblr':
            url = await postToTumblr(data, content);
            break;
          case 'flickr':
            if (data.category !== 'Fotos') {
              console.log('  flickr: skipping (not a Fotos post)');
              continue;
            }
            url = await postToFlickr(data, REPO_ROOT);
            break;
          default:
            console.log(`  unknown platform: ${platform}`);
        }
        if (url) {
          syndUrls[platform] = url;
          console.log(`  ${platform}: ${url}`);
        }
      } catch (err) {
        console.error(`  ${platform}: FAILED —`, err.message);
      }
    }

    if (Object.keys(syndUrls).length > 0) {
      data.syndication_urls = syndUrls;
      fs.writeFileSync(postPath, matter.stringify(content, data));
      anyUpdated = true;
    }
  }

  if (anyUpdated) {
    git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
    git('config', 'user.name', 'github-actions[bot]');
    git('add', '_posts/');
    git('commit', '-m', 'chore: add syndication URLs [skip posse]');
    git('push');
    console.log('Committed and pushed syndication URLs');
  }
}

main().catch(err => {
  console.error('POSSE failed:', err);
  process.exit(1);
});
