const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  const browser = env.browser || 'chrome';
  const manifestFile = `manifest.${browser}.json`;

  return {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    context: path.resolve(__dirname, 'hold-it-lol'),
    entry: {
      'service-worker': './service-worker.js',
      'content/main': './content/main.js',
      'popup/popup': './popup/popup.js',
      'options/options': './options/options.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: manifestFile, to: 'manifest.json' },

          { from: 'assets', to: 'assets' },
          { from: 'popup/popup.html', to: 'popup/' },
          { from: 'popup/popup.css', to: 'popup/' },
          { from: 'popup/*.svg', to: 'popup/[name][ext]' },
          { from: 'options/options.html', to: 'options/' },
          { from: 'options/options.css', to: 'options/' },
          { from: 'options/previews', to: 'options/previews' },
          { from: 'toggle-switch.css' },
          { from: 'content/style.css', to: 'content/' },
          { from: 'inject', to: 'inject' },
        ],
      }),
    ],
  };
};
