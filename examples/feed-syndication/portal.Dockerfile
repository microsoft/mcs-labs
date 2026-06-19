# Portal image for the feed-syndication demo: Ruby/Jekyll (to render the site) +
# Node 20 (to run the feed producer/consumer scripts, which use global fetch).
# Built from the repo root as context so the Gemfile is available for gem caching.
FROM mcr.microsoft.com/devcontainers/ruby:3.1

# Node 20 for scripts/build-feed.js + scripts/consume-feed.js (fetch needs >= 18).
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /site

# Pre-install gems at build time so container start is fast. The repo (incl.
# node_modules and the scripts) is bind-mounted over /site at runtime; gems live
# in the system bundle path and are unaffected by the mount.
COPY Gemfile Gemfile.lock ./
RUN bundle lock --add-platform x86_64-linux aarch64-linux 2>/dev/null || true \
    && bundle install

CMD ["bash", "examples/feed-syndication/portal-entrypoint.sh"]
