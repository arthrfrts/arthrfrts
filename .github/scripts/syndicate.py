#!/usr/bin/env python3
"""
Syndicate Jekyll posts to social networks via Bridgy (POSSE).

Reads post paths from positional arguments, --from-file, or stdin. For each
post, checks `syndicate_to` in front matter against `syndication_urls` and
publishes any pending targets via Bridgy. Writes returned URLs back to the
post's front matter.

Examples:
    syndicate.py _posts/2024-01-01-hello.md
    syndicate.py --from-file changed.txt
    git diff --name-only HEAD~1 HEAD -- '_posts/*.md' | syndicate.py
    syndicate.py --dry-run _posts/2024-01-01-hello.md
"""

import argparse
import os
import re
import sys
import time

import frontmatter
import requests

DEFAULT_SITE_URL = "https://arthr.me"
DEFAULT_THROTTLE = 2.0  # seconds between Bridgy requests

BRIDGY_WEBMENTION = "https://brid.gy/publish/webmention"
BRIDGY_ENDPOINTS = {
    "bluesky": "https://brid.gy/publish/bluesky",
    "mastodon": "https://brid.gy/publish/mastodon",
    "flickr": "https://brid.gy/publish/flickr",
    "tumblr": "https://brid.gy/publish/tumblr",
}

POST_FILENAME_RE = re.compile(r"(\d{4})-(\d{2})-(\d{2})-(.+)\.md$")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Syndicate Jekyll posts to social networks via Bridgy.",
    )
    parser.add_argument(
        "posts",
        nargs="*",
        help="Post paths. If empty, read from --from-file or stdin.",
    )
    parser.add_argument(
        "--from-file",
        help="Read post paths from a file (one per line).",
    )
    parser.add_argument(
        "--site-url",
        default=os.environ.get("SITE_URL", DEFAULT_SITE_URL),
        help=f"Base URL of the live site (default: {DEFAULT_SITE_URL}).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be syndicated without calling Bridgy or writing files.",
    )
    parser.add_argument(
        "--throttle",
        type=float,
        default=DEFAULT_THROTTLE,
        help=f"Seconds between Bridgy requests (default: {DEFAULT_THROTTLE}).",
    )
    return parser.parse_args()


def collect_posts(args):
    """Resolve the list of post paths from args, file, or stdin."""
    if args.posts:
        return args.posts
    if args.from_file:
        with open(args.from_file) as f:
            return [line.strip() for line in f if line.strip()]
    if not sys.stdin.isatty():
        return [line.strip() for line in sys.stdin if line.strip()]
    return []


def get_post_url(post_path, post, site_url):
    """
    Build the live URL for a post.

    Honors `permalink:` in front matter if present (with no template
    variable expansion — only literal paths). Otherwise, falls back to
    the Jekyll default of /:category/:year/:month/:day/:title/, omitting
    the category segment if not set.
    """
    site_url = site_url.rstrip("/")

    permalink = post.get("permalink")
    if permalink and "/:" not in permalink:
        # Literal permalink, e.g. /about/ or /custom-post-name/
        path = permalink if permalink.startswith("/") else f"/{permalink}"
        if not path.endswith("/"):
            path = f"{path}/"
        return f"{site_url}{path}"

    filename = os.path.basename(post_path)
    match = POST_FILENAME_RE.match(filename)
    if not match:
        return None

    year, month, day, slug = match.groups()
    category = str(post.get("category", "")).lower()

    if category:
        return f"{site_url}/{category}/{year}/{month}/{day}/{slug}/"
    return f"{site_url}/{year}/{month}/{day}/{slug}/"


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
            BRIDGY_WEBMENTION,
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
            except ValueError:
                pass
        return url

    print(f"    Bridgy returned {resp.status_code}: {resp.text[:300]}")
    return None


def syndicate_post(post_path, site_url, dry_run, throttle):
    """Process a single post. Returns True if its file was modified."""
    if not os.path.exists(post_path):
        print(f"Skipping {post_path} (deleted).")
        return False

    post = frontmatter.load(post_path)
    syndicate_to = list(post.get("syndicate_to") or [])
    syndication_urls = dict(post.get("syndication_urls") or {})

    pending = [t for t in syndicate_to if t not in syndication_urls]
    if not pending:
        print(f"{post_path}: already syndicated, skipping.")
        return False

    post_url = get_post_url(post_path, post, site_url)
    if not post_url:
        print(f"{post_path}: could not determine post URL, skipping.")
        return False

    print(f"\nSyndicating: {post_url}")

    for target in pending:
        print(f"  -> {target} ...", end=" ", flush=True)
        if dry_run:
            print("(dry run, not sent)")
            continue

        url = publish_to_bridgy(post_url, target)
        if url:
            syndication_urls[target] = url
            print(f"OK: {url}")
        else:
            print("FAILED (will retry on next push)")

        if throttle > 0:
            time.sleep(throttle)

    if dry_run:
        return False

    if syndication_urls != dict(post.get("syndication_urls") or {}):
        post["syndication_urls"] = syndication_urls
        with open(post_path, "wb") as f:
            frontmatter.dump(post, f)
        print(f"  Wrote syndication_urls back to {post_path}")
        return True

    return False


def main():
    args = parse_args()
    posts = collect_posts(args)

    if not posts:
        print("No posts to process.")
        return 0

    if args.dry_run:
        print("[DRY RUN] No requests will be sent and no files modified.\n")

    any_written = False
    for post_path in posts:
        if syndicate_post(post_path, args.site_url, args.dry_run, args.throttle):
            any_written = True

    if any_written:
        print("\nDone. Syndication URLs written back to posts.")
    else:
        print("\nNo syndication URLs to write back.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
