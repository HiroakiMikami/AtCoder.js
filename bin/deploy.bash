#! /bin/bash

set -u

name=${1:-$(git show -s --format=%H)}
root=$(dirname $0)/../

tmpdir=$(mktemp -d)

cp -r $root/out $root/.circleci $root/LICENSE $root/package.json $root/package-lock.json $tmpdir
rm -r $tmpdir/out/test

git -C $tmpdir init
push_url=$(git remote show -n origin | grep "Push" | sed -e 's/^ *Push  *URL: //g')
git -C $tmpdir remote add origin $push_url

git -C $tmpdir checkout -b release/$name
git -C $tmpdir add $tmpdir/.circleci $tmpdir/*
git -C $tmpdir commit -m "deploy $name"
git -C $tmpdir push origin release/$name

rm -rf $tmpdir
