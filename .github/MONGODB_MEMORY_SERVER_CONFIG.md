# MongoDB Memory Server Configuration

## Overview

This project uses `mongodb-memory-server` as a dev dependency for testing purposes. However, in CI/CD environments with firewall restrictions (such as GitHub Actions), the package's postinstall script may be blocked from downloading MongoDB binaries from `fastdl.mongodb.org`.

## Solution

We've configured the project to skip MongoDB Memory Server binary downloads in CI/CD environments by setting the following environment variables:

- `MONGOMS_DISABLE_POSTINSTALL=1` - Disables the postinstall script
- `MONGOMS_SKIP_DOWNLOAD=1` - Skips the binary download

## Configuration Files

### 1. GitHub Workflows (`.github/workflows/`)

All npm operations in our CI/CD workflows now include these environment variables:
- `ci.yml` - Main CI workflow
- `test.yml` - Test workflow

### 2. Backend Configuration (`backend/.mongodb-memory-server.config.json`)

A configuration file that documents the skip settings for mongodb-memory-server.

### 3. Environment Template (`env.example`)

The environment template includes documentation about these variables for local development.

## Why This Works

1. **CI/CD Environments**: Our GitHub Actions workflows already use a real MongoDB service (mongo:5.0 container), so we don't need MongoDB Memory Server binaries during `npm install`.

2. **Local Development**: Developers can still use mongodb-memory-server for testing by allowing the binary download on their local machines (or by configuring it appropriately).

3. **Firewall Safe**: By skipping the download during install, we avoid firewall blocks that prevent access to `fastdl.mongodb.org`.

## Testing Without Binary Download

When the binaries are not downloaded, you have two options:

1. **Use Real MongoDB**: Connect to a real MongoDB instance (recommended for CI/CD)
2. **Allow Download Locally**: On your local machine, you can remove these environment variables to allow mongodb-memory-server to download binaries

## Related Files

- `.github/workflows/ci.yml` - CI workflow configuration
- `.github/workflows/test.yml` - Test workflow configuration
- `backend/.mongodb-memory-server.config.json` - MongoDB Memory Server config
- `env.example` - Environment variable documentation
- `UPGRADE_NOTES.md` - Upgrade notes with fix details

## References

- [mongodb-memory-server Documentation](https://github.com/nodkz/mongodb-memory-server)
- [MongoDB Memory Server Configuration Options](https://github.com/nodkz/mongodb-memory-server#available-options)
