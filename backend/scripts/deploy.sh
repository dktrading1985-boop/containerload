# /home/deploy/containerload/backend/scripts/deploy.sh
# Safe PM2 deploy script for ContainerLoad
# - Default: git pull --ff-only origin/main
# - To force hard reset+clean: run with FORCE_CLEAN=true
# - Logs saved into /home/deploy/deploy-logs/deploy.<TIMESTAMP>.log
set -euo pipefail

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOGDIR="/home/deploy/deploy-logs"
REPO_DIR="/home/deploy/containerload"
BACKEND_DIR="$REPO_DIR/backend"
PM2_ECOSYS="$BACKEND_DIR/ecosystem.config.js"
SMOKE="$BACKEND_DIR/scripts/smoke.js"
BRANCH="${BRANCH:-main}"
FORCE_CLEAN="${FORCE_CLEAN:-false}"
DRY_RUN="${DRY_RUN:-false}"

if [ "$(id -un)" != "deploy" ]; then
  echo "ERROR: Must run as 'deploy'. Use: sudo -u deploy -H bash /home/deploy/containerload/backend/scripts/deploy.sh"
  exit 10
fi

mkdir -p "$LOGDIR"
exec &> >(tee -a "$LOGDIR/deploy.$TIMESTAMP.log")

echo "[$TIMESTAMP] Starting deploy (branch=$BRANCH, FORCE_CLEAN=$FORCE_CLEAN, DRY_RUN=$DRY_RUN)"

_run() {
  if [ "$DRY_RUN" = "true" ]; then
    echo "[DRY_RUN] $*"
  else
    eval "$@"
  fi
}

echo "[$TIMESTAMP] Saving pm2 dump (pre-deploy)"
_run "pm2 save --force" || true

echo "[$TIMESTAMP] Updating repository"
cd "$REPO_DIR"

# Ensure safe git state
_run "git fetch --all --prune"
_run "git checkout $BRANCH" || true

if [ "$FORCE_CLEAN" = "true" ]; then
  echo "[$TIMESTAMP] FORCE_CLEAN=true — performing hard reset and clean"
  _run "git reset --hard origin/$BRANCH"
  _run "git clean -fdx --exclude node_modules || true"
else
  echo "[$TIMESTAMP] Performing git pull --ff-only origin/$BRANCH"
  if ! _run "git pull --ff-only origin $BRANCH"; then
    echo "[$TIMESTAMP] git pull failed (non-fast-forward). Use FORCE_CLEAN=true to force a clean state. Aborting."
    exit 20
  fi
fi

# Backend build steps
echo "[$TIMESTAMP] Installing backend dependencies (npm ci)"
cd "$BACKEND_DIR"
_run "npm ci --silent"

echo "[$TIMESTAMP] Building backend (npm run build)"
_run "npm run build --silent"

# Run smoke test (do not reload PM2 until smoke passes)
if [ -x "$(command -v node)" ] && [ -f "$SMOKE" ]; then
  echo "[$TIMESTAMP] Running smoke test: node $SMOKE"
  if _run "node $SMOKE"; then
    echo "[$TIMESTAMP] Smoke OK — proceeding to reload PM2"
  else
    echo "[$TIMESTAMP] Smoke FAILED — aborting deploy, not reloading PM2"
    exit 30
  fi
else
  echo "[$TIMESTAMP] Smoke test script not present or node missing; aborting for safety"
  exit 31
fi

# Reload PM2 gracefully and save state
echo "[$TIMESTAMP] Reloading PM2 using $PM2_ECOSYS"
_run "pm2 reload '$PM2_ECOSYS' --update-env"
sleep 2
_run "pm2 save --force" || true

echo "[$TIMESTAMP] Deploy finished successfully. Log: $LOGDIR/deploy.$TIMESTAMP.log"
exit 0
