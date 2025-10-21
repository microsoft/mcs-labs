# Multi-stage Dockerfile for MCS Labs development with PDF generation capabilities
# Includes Jekyll, Pandoc, Node.js, and Puppeteer for complete local development

FROM node:18-bullseye AS node-base

# Stage 1: Ruby and Jekyll setup
FROM ruby:3.1-bullseye

# Install system dependencies including Pandoc and Puppeteer requirements
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    wget \
    pandoc \
    fonts-liberation \
    fonts-dejavu-core \
    ca-certificates \
    gnupg \
    lsb-release \
    libasound2 \
    libatk1.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libnss3 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy Node.js from node-base stage
COPY --from=node-base /usr/local/bin/node /usr/local/bin/
COPY --from=node-base /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Install PowerShell
RUN wget -q https://github.com/PowerShell/PowerShell/releases/download/v7.4.0/powershell_7.4.0-1.deb_amd64.deb \
    && dpkg -i powershell_7.4.0-1.deb_amd64.deb || apt-get install -f -y \
    && rm powershell_7.4.0-1.deb_amd64.deb

# Set working directory
WORKDIR /workspace

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Install PowerShell YAML module
RUN pwsh -Command "Install-Module -Name powershell-yaml -Force -Scope AllUsers -Repository PSGallery"

# Copy Gemfile and install Ruby dependencies
COPY Gemfile* ./
RUN bundle install

# Install Jekyll and Bundler globally
RUN gem install jekyll bundler

# Create directories for development
RUN mkdir -p _site assets/pdfs local-dist

# Copy project files
COPY . .

# Expose Jekyll development server port
EXPOSE 4000

# Default command runs Jekyll server with live reload
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload", "--livereload-port", "35729"]