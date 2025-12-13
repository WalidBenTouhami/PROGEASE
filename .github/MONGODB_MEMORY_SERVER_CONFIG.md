# MongoDB Memory Server Configuration

## Overview

This project uses `mongodb-memory-server` as a dev dependency for testing purposes. However, in CI/CD environments with firewall restrictions (such as GitHub Actions), the package's postinstall script may fail when blocked from downloading MongoDB binaries from `fastdl.mongodb.org`.

## Solution

We've configured the project to skip MongoDB Memory Server binary downloads in CI/CD environments by setting the following environment variables:

- `MONGOMS_DISABLE_POSTINSTALL=1` - Disables the postinstall script
- `MONGOMS_SKIP_DOWNLOAD=1` - Skips the binary download

## Configuration Files

### 1. NPM Configuration Files (`.npmrc`)

To prevent firewall blocks globally, we've added `.npmrc` files that set the environment variables for all npm operations:
- `.npmrc` (root) - Global configuration for all packages (includes MONGOMS settings and legacy-peer-deps)
- `backend/.npmrc` - Backend-specific configuration with MONGOMS settings to prevent mongodb-memory-server downloads
- `frontend/.npmrc` - Frontend configuration (only contains legacy-peer-deps for Angular compatibility)

The root and backend .npmrc files ensure that mongodb-memory-server never attempts to download binaries during npm install, preventing firewall blocks from occurring.

### 2. GitHub Workflows (`.github/workflows/`)

All npm operations in our CI/CD workflows include these environment variables:
- `ci.yml` - Main CI workflow
- `test.yml` - Test workflow

### 3. Backend Configuration (`backend/.mongodb-memory-server.config.json`)

A configuration file that documents the skip settings for mongodb-memory-server.

### 4. Environment Template (`env.example`)

The environment template includes documentation about these variables for local development.

## Why This Works

1. **Global Configuration**: The `.npmrc` files set environment variables that are automatically picked up by npm during all install operations, including postinstall scripts. This ensures mongodb-memory-server never attempts to download binaries, regardless of how npm is invoked.

2. **CI/CD Environments**: Our GitHub Actions workflows already use a real MongoDB service (mongo:5.0 container), so we don't need MongoDB Memory Server binaries during `npm install`.

3. **Local Development**: Developers can still use mongodb-memory-server for testing by allowing the binary download on their local machines (by removing or overriding the .npmrc settings if needed).

4. **Firewall Safe**: By skipping the download during install at the npm configuration level, we prevent firewall blocks that would occur when trying to access `fastdl.mongodb.org`.

## Testing Without Binary Download

When the binaries are not downloaded, you have two options:

1. **Use Real MongoDB**: Connect to a real MongoDB instance (recommended for CI/CD)
2. **Allow Download Locally**: On your local machine, you can remove these environment variables to allow mongodb-memory-server to download binaries

## Related Files

- `.npmrc` - Root-level npm configuration (disables mongodb-memory-server postinstall)
- `backend/.npmrc` - Backend npm configuration (disables mongodb-memory-server postinstall)
- `frontend/.npmrc` - Frontend npm configuration (legacy-peer-deps)
- `.github/workflows/ci.yml` - CI workflow configuration
- `.github/workflows/test.yml` - Test workflow configuration
- `backend/.mongodb-memory-server.config.json` - MongoDB Memory Server config
- `env.example` - Environment variable documentation
- `UPGRADE_NOTES.md` - Upgrade notes with fix details

## References

- [mongodb-memory-server Documentation](https://github.com/nodkz/mongodb-memory-server)
- [MongoDB Memory Server Configuration Options](https://github.com/nodkz/mongodb-memory-server#available-options)
