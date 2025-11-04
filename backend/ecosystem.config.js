module.exports = {
  apps: [{
    name: "containerload-backend",
    script: "./dist/start.js",
    interpreter: "node",
    env_production: {
      NODE_ENV: "production",
      PORT: 4000
    },
    cwd: "/home/deploy/containerload/backend"
  }]
}
