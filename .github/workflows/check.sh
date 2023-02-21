#!/bin/bash

set -e

# Install
yarn

# Depcheck
yarn depcheck

# Lint
yarn prettier

# Test
yarn test

# Build
yarn build
