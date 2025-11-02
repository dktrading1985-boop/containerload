# Container Load Optimization — Backend README

This README documents the backend (Node/Express/Prisma) of the **Container Load Optimization** project and lists the exact commands you can run on your droplet to build, deploy, test, and troubleshoot the API.

> Location on droplet: `/home/deploy/containerload/backend`

---

## Quick status checks

```bash
# show current working dir and files
pwd
ls -la /home/deploy/containerload/backend

# docker & compose versions
docker --version
docker compose version

# show containers and status
cd /home/deploy/containerload/backend
docker compose ps
```

---

## Build (TypeScript -> dist)

Run inside `/home/deploy/containerload/backend`.

```bash
# install deps (if needed)
npm ci

# compile TypeScript to dist/
npm run build

# quick check compiled file
sed -n '1,120p' dist/routes/load.js
```

If `npm run build` shows TypeScript errors, copy the full error output and fix the indicated file or paste the error into this chat for help.

---

## Rebuild Docker image & restart services

When you change source files (`src/*.ts`) you must `npm run build` and then rebuild the Docker image so the new `dist/` is baked into the container.

```bash
# stop stack (optional)
docker compose down

# rebuild api image (no-cache recommended to avoid stale layers)
docker compose build --no-cache api

# start stack detached
docker compose up -d --force-recreate

# follow logs
docker compose logs api --tail 200 --follow
```

If `docker compose build` fails, copy the full output and paste here for help.

---

## Health check and endpoints

* Health: `GET /api/health` → returns `{ "ok": true }`
* Optimize (no DB lookup required): `POST /api/v1/loads/optimize` with body:

```json
{
  "container": { "length": 12, "width": 2.35, "height": 2.39, "maxWeight": 20000 },
  "pallets": [{ "length": 1.2, "width": 1, "height": 1, "weight": 500, "quantity": 2 }]
}
```

Example (from droplet):

```bash
curl -sS -X POST http://127.0.0.1:4000/api/v1/loads/optimize \
  -H "Content-Type: application/json" \
  -d '{"container":{"length":12,"width":2.35,"height":2.39,"maxWeight":20000},"pallets":[{"length":1.2,"width":1,"height":1,"weight":500,"quantity":2}]}' | jq .
```

Example (from remote laptop after opening firewall or using SSH tunnel):

```bash
curl -sS -X POST http://<DROPLET_IP>:4000/api/v1/loads/optimize \
  -H "Content-Type: application/json" \
  -d '<same JSON body as above>' | jq .
```

`/api/v1/loads/simulate` is identical to `/optimize` for testing with a container object.

---

## Firewall / Remote access

Temporarily allow remote access to test:

```bash
sudo ufw allow 4000/tcp
sudo ufw status
```

To restrict to a single IP (recommended):

```bash
# remove open rule
sudo ufw delete allow 4000/tcp

# allow only your laptop IP
sudo ufw allow from <YOUR_IP> to any port 4000 proto tcp
```

Alternative (more secure): use an SSH tunnel from your laptop:

```bash
# from laptop
ssh -L 4000:127.0.0.1:4000 deploy@<DROPLET_IP>
# then on laptop
curl -sS -X POST http://127.0.0.1:4000/api/v1/loads/optimize -H "Content-Type: application/json" -d '<payload>' | jq .
```

---

## Useful dev helpers

Use `tmux` to run long builds or follow logs without losing session on SSH disconnect:

```bash
sudo apt update && sudo apt install -y tmux
# start
tmux new -s work
# inside tmux run build or docker commands
# detach: Ctrl+B then D
# attach later: tmux attach -t work
```

If your droplet reboots, ensure the docker compose stack starts on boot. A simple way is to add a systemd service (example placed in README main project) — contact me and I will provide the unit file.

---

## Troubleshooting common errors

### `PrismaClientValidationError: Argument where needs at least one of id` when calling `/optimize`

This happens when you call the handler with a `container` object but the running compiled code expects `containerId`. Fix: ensure you `npm run build` and `docker compose build --no-cache api` after editing `src/routes/load.ts` so `dist/` is updated and the container uses the new code.

### `Recv failure: Connection reset by peer` when calling optimize

Watch logs live while you send the request:

```bash
# in one terminal
docker compose logs --follow api
# in another
curl -v -X POST http://127.0.0.1:4000/api/v1/loads/optimize -H "Content-Type: application/json" -d '<payload>'
```

Paste the logs here for diagnosis.

---

## Optional improvements (next steps)

* Add API key or JWT authentication for `/optimize` and other endpoints.
* Add an Nginx reverse proxy with HTTPS via Let's Encrypt and route `/api` to the backend.
* Add unit tests for `optimizeLoad` and integration tests for `/optimize`.
* Build a small React/Next.js dashboard to call the API and visualize placements.

---

If anything in this README is unclear, or you want me to generate the systemd unit, a React test page, or an API-key patch automatically, just ask — I can create the file and give you the exact commands to apply it.
