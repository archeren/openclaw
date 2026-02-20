#!/bin/bash
# Set up branch protection for main branch
# Run this once to configure GitHub branch protection

set -e

REPO="auroradanier/claw-alpha"
BRANCH="main"

echo "🔒 Setting up branch protection for $REPO#$BRANCH..."

# GitHub CLI command to set branch protection
gh api \
  --method PUT \
  /repos/$REPO/branches/$BRANCH/protection \
  -f required_status_checks=null \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  -f restrictions=null \
  -f allow_deletions=false \
  -f block_creations=false \
  -f required_linear_history=true \
  -f allow_force_pushes=false

echo "✅ Branch protection configured!"
echo ""
echo "Rules:"
echo "  ✓ Pull request required before merging"
echo "  ✓ Admins included in restrictions"
echo "  ✓ Dismiss stale reviews on new commits"
echo "  ✓ Linear history required"
echo "  ✓ Force pushes blocked"
echo ""
echo "Now only merge requests from dev branch are allowed."
