#!/usr/bin/env bash
# Feed-first build for the demo portal, then serve.
#   1. Produce THIS portal's own feed   (build-feed.js)
#   2. Consume self + the partner feed   (consume-feed.js, using $SUBSCRIPTIONS_FILE)
#   3. Render from the materialized feed  (jekyll, via _config.feed.yml)
set -euo pipefail
cd /site

SUBSCRIPTIONS_FILE="${SUBSCRIPTIONS_FILE:-examples/feed-syndication/subscriptions/full.yml}"

# Start from a clean materialized dir. consume-feed.js writes items but does not
# prune ones that disappeared since a previous run, so switching scenarios (or a
# source dropping an item) would otherwise leave stale pages behind. CI always
# starts from a fresh checkout; this makes repeated local runs behave the same.
echo "[portal] 0/3 cleaning previous build (.feed-build)"
rm -rf .feed-build

echo "[portal] 1/3 producing own feed -> .feed-build/published"
node scripts/build-feed.js --out .feed-build/published

echo "[portal] 2/3 consuming feeds (config: ${SUBSCRIPTIONS_FILE})"
node scripts/consume-feed.js --out .feed-build --feed-dir .feed-build/published --config "${SUBSCRIPTIONS_FILE}"

echo "[portal] 3/3 serving on http://localhost:4000/mcs-labs/"
exec bundle exec jekyll serve --no-watch --host 0.0.0.0 --port 4000 \
  --config _config.yml,_config.feed.yml
