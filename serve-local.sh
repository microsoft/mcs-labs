#!/usr/bin/env bash
# Local review server for the mcs-labs Jekyll site, using the same Ruby
# version CI does (3.3). Gems persist in the `mcslabs-gems` Docker volume,
# so only the first run pays the bundle install cost.
#
#   ./serve-local.sh          # http://localhost:4000/mcs-labs/
#
set -euo pipefail
cd "$(dirname "$0")"
docker run --rm -it \
  -v "$PWD":/srv \
  -v mcslabs-gems:/usr/local/bundle \
  -p 4000:4000 \
  -w /srv \
  ruby:3.3 \
  bash -lc "bundle install --quiet && bundle exec jekyll serve --config _config.yml,_config.local.yml --host 0.0.0.0 --port 4000"
