// PM2 process config for the Nimad Kirana API.
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 status / pm2 logs nimad-api / pm2 restart nimad-api
module.exports = {
  apps: [
    {
      name: 'nimad-api',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
