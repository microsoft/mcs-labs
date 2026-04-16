#!/bin/bash

# Exit on error
set -e

RUBY_VERSION="3.1"

echo "Checking for Homebrew..."
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "Homebrew is already installed."
fi

echo "Checking for Ruby ${RUBY_VERSION}..."
if ! command -v ruby &> /dev/null || [[ ! $(ruby -v) =~ ${RUBY_VERSION} ]]; then
    echo "Installing Ruby ${RUBY_VERSION} using Homebrew..."

    # Fix potential permissions issues with Homebrew directories
    if [[ -d "/usr/local/share/zsh" && ! -w "/usr/local/share/zsh" ]]; then
        echo "Fixing permissions for Homebrew directories..."
        sudo chown -R $(whoami) /usr/local/share/zsh /usr/local/share/zsh/site-functions 2>/dev/null || true
    fi

    HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1 brew install ruby@${RUBY_VERSION}

    # Add Ruby to PATH
    echo "export PATH=\"/opt/homebrew/opt/ruby@${RUBY_VERSION}/bin:\$PATH\"" >> ~/.zprofile
    echo "export PATH=\"/usr/local/opt/ruby@${RUBY_VERSION}/bin:\$PATH\"" >> ~/.zprofile

    # Update PATH for current session
    if [[ -d "/opt/homebrew/opt/ruby@${RUBY_VERSION}/bin" ]]; then
        export PATH="/opt/homebrew/opt/ruby@${RUBY_VERSION}/bin:$PATH"
    elif [[ -d "/usr/local/opt/ruby@${RUBY_VERSION}/bin" ]]; then
        export PATH="/usr/local/opt/ruby@${RUBY_VERSION}/bin:$PATH"
    fi

    echo "Ruby installed."
else
    echo "Validated Ruby installation."
fi

echo "Checking for Bundler gem..."
if ! gem list bundler -i > /dev/null 2>&1; then
    echo "Installing Bundler gem..."
    gem install bundler
    echo "Bundler gem installed."
else
    echo "Validated Bundler gem installation."
fi

echo "Running bundle install..."
bundle install --quiet
echo "Bundle install completed."
