const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 개발 환경에서만 CSP 수정
  if (env.mode === 'development') {
    if (!config.devServer) {
      config.devServer = {};
    }
    if (!config.devServer.headers) {
      config.devServer.headers = {};
    }

    config.devServer.headers['Content-Security-Policy'] = "default-src 'self' ws:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://firebasestorage.googleapis.com; connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://firebasestorage.googleapis.com";
  }

  return config;
}; 