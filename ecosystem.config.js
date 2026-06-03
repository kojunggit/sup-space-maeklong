// PM2 process config — รันด้วย:  pm2 start ecosystem.config.js
// ดู log:  pm2 logs sup-space   ·   restart:  pm2 restart sup-space
module.exports = {
  apps: [
    {
      name: "sup-space",
      // รัน production server ของ Next.js (ต้อง `npm run build` ก่อน)
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
