#!/bin/bash

set -e

echo "Update hotfix"

OPT=$1

## Check branch
checkBranch() {
    BRANCH=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)
    if [ $BRANCH != "dev" ]; then
        echo "Error"
        echo "You must be on dev branch"
        exit 1
    fi
}

## Merge hotfix
merge() {
    git pull
    git checkout hotfix
    git pull
    git checkout dev
    git merge hotfix
}

## Check
check() {
    ./.github/workflows/check.sh
}

## Release
release() {
    if [ "$OPT" != "release" ]; then
        exit 0
    fi

    # package.json version
    PACKAGE_VERSION=$(cat package.json | jq -r '.version')
    NUMS=(${PACKAGE_VERSION//./ })

    # Increse minor
    ((NUMS[2]++))
    PACKAGE_NEW_VERSION=${NUMS[0]}.${NUMS[1]}.${NUMS[2]}

    # New package.json version
    jq ".version=\"${PACKAGE_NEW_VERSION}\"" package.json >/tmp/package.json
    mv /tmp/package.json package.json

    # release
    ./.github/release.sh $PACKAGE_NEW_VERSION
}

checkBranch
merge
check
release
