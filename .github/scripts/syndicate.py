#!/usr/bin/env python3
"""
Syndicate new/modified Jekyll posts to social networks via Bridgy.

For each post listed in CHANGED_POSTS_FILE, checks if any syndicate_to
targets are missing from syndication_urls and publishes them via Bridgy's
webmention endpoint. Writes the returned URLs back into the post's front matter.
"""

import os
import re
import sys
import time

import frontmatter
import requests

SITE_URL = os.environ.get("SITE_URL", "https://arthr.me").rstrip("/")
CHANGED_POSTS_FILE = os.environ.get("CHANGED_POSTS_FILE", "changed_posts.txt")

BRIDGY_ENDPOINTS = {
    "bluesky": "https://brid.gy/publish/bluesky",
    "mastodon": "https://brid.gy/publish/mastodon",
    "flickr": "https://brid.gy/publish/flickr",
    "tumblr": "https://brid.gy/publish/tumblr",
}


def get_post_url(post_path, post):
    """Build the live URL for a post using Jekyll's permalink format."""
    filename = os.path.basename(post_path)
    match = re.match(r"(\d{4})-(\d{2})-(\d{2})-(.+)\.md$", filename)
    if not match:
        return None

    year, month, day, slug = match.groups()
    category = str(post.get("category", "")).lower()

    if category:
        return f"{SITE_URL}/{category}/{year}/{month}/{day}/{slug}/"
    return f"{SITE_URL}/{year}/{month}/{day}/{slug}/"


def publish_to_bridgy(post_url, target):
    """
    Send a webmention to Bridgy's publish endpoint for a target network.
    Returns the syndicated URL on success, or None on failure.
    """
    endpoint = BRIDGY_ENDPOINTS.get(target)
    if not endpoint:
        print(f"    Unknown target: {target}, skipping.")
        return None

    try:
        resp = requests.post(
            "https://brid.gy/publish/webmention",
            data={"source": post_url, "target": endpoint},
            timeout=30,
        )
    except requests.RequestException as e:
        print(f"    Request error: {e}")
        return None

    if resp.status_code in (200, 201):
        url = resp.headers.get("location")
        if not url:
            try:
                url = resp.json().get("url")
            except Exception:
                pass
        return url

    print(f"    Bridgy returned {resp.status_code}: {resp.text[:300]}")
    return None


def main():
    with open(CHANGED_POSTS_FILE) as f:
        changed = [line.strip() for line in f if line.strip()]

    if not changed:
        print("No changed posts to process.")
        return

    any_written = False

    for post_path in changed:
        if not os.path.exists(post_path):
            print(f"Skipping {post_path} (deleted).")
            continue

        post = frontmatter.load(post_path)
        syndicate_to = list(post.get("syndicate_to") or [])
        syndication_urls = dict(post.get("syndication_urls") or {})

        pending = [t for t in syndicate_to if t not in syndication_urls]
        if not pending:
            print(f"{post_path}: already syndicated to all targets, skipping.")
            continue

        post_url = get_post_url(post_path, post)
        if not post_url:
            print(f"{post_path}: could not determine post URL, skipping.")
            continue

        print(f"\nSyndicating: {post_url}")

        for target in pending:
            print(f"  -> {target} ...", end=" ", flush=True)
            url = publish_to_bridgy(post_url, target)
            if url:
                syndication_urls[target] = url
                print(f"OK: {url}")
            else:
                print("FAILED (will retry on next push)")
            time.sleep(2)

        if syndication_urls != dict(post.get("syndication_urls") or {}):
            post["syndication_urls"] = syndication_urls
            with open(post_path, "wb") as f:
                frontmatter.dump(post, f)
            print(f"  Wrote syndication_urls back to {post_path}")
            any_written = True

    if any_written:
        print("\nDone. Syndication URLs written back to posts.")
        sys.exit(0)
    else:
        print("\nNo syndication URLs to write back.")
        sys.exit(0)


if __name__ == "__main__":
    main()
