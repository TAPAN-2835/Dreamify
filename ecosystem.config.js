module.exports = {
  apps: [
    {
      name: 'dreamify-server',
      script: './server/server.js',
      cwd: './server',
      env: {
        NODE_ENV: 'production',
      }
    }
  ]
};
