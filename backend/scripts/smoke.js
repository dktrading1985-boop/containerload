const http = require("http");
const opts = { host: "127.0.0.1", port: 4000, path: "/api/health", timeout: 5000 };
const req = http.get(opts, res => {
  if (res.statusCode === 200) { console.log("smoke OK"); process.exit(0); }
  else { console.error("smoke failed, status", res.statusCode); process.exit(2); }
});
req.on("error", err => { console.error("smoke error", err.message); process.exit(2); });
