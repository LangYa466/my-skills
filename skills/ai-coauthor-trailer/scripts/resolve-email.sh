#!/usr/bin/env bash
# Report which GitHub account a commit email links to, using real commits that carry it.
# Usage: resolve-email.sh <email> [max_commits]
# Needs: gh (authenticated), jq.
set -euo pipefail

email=${1:?usage: resolve-email.sh <email> [max_commits]}
max=${2:-5}

shas=$(gh api -X GET search/commits -f q="\"$email\"" -f per_page="$max" \
  --jq '.items[] | "\(.repository.owner.login) \(.repository.name) \(.sha)"')
if [[ -z $shas ]]; then
  echo "$email: no public commit found; cannot verify (treat as unlinked)"
  exit 1
fi

while read -r owner repo sha; do
  gh api graphql -f owner="$owner" -f repo="$repo" -f sha="$sha" -f query='
    query($owner: String!, $repo: String!, $sha: GitObjectID!) {
      repository(owner: $owner, name: $repo) {
        object(oid: $sha) { ... on Commit { authors(first: 20) { nodes { email user { login } } } } }
      }
    }' --jq '.data.repository.object.authors.nodes[] | "\(.email)\t\(.user.login // "UNLINKED")"'
done <<<"$shas" | awk -F'\t' -v e="$email" 'tolower($1) == tolower(e) { print $2 }' | sort | uniq -c
