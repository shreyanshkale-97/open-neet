const webpack = require('webpack');
const path = require('path');

const tsLoaderPath = path.resolve(
  __dirname,
  'node_modules/.pnpm/ts-loader@9.6.2_loader-utils@2.0.4_typescript@6.0.3_webpack@5.105.2/node_modules/ts-loader'
);

const config = {
  entry: path.resolve(__dirname, 'apps/api/src/main.ts'),
  target: 'node',
  mode: 'none',
  devtool: false,
  stats: 'errors-only',
  output: {
    path: path.resolve(__dirname, 'dist/apps/api'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@neet-ai/shared/types': path.resolve(__dirname, 'libs/shared/types/src/index.ts'),
      '@neet-ai/shared/constants': path.resolve(__dirname, 'libs/shared/constants/src/index.ts'),
      '@neet-ai/shared/validators': path.resolve(__dirname, 'libs/shared/validators/src/index.ts'),
      '@neet-ai-platform/types': path.resolve(__dirname, 'libs/shared/types/src/index.ts'),
      '@neet-ai-platform/constants': path.resolve(__dirname, 'libs/shared/constants/src/index.ts'),
      '@neet-ai-platform/validators': path.resolve(__dirname, 'libs/shared/validators/src/index.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: tsLoaderPath,
        options: {
          configFile: path.resolve(__dirname, 'apps/api/tsconfig.app.json'),
          transpileOnly: true,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
    ],
  },
  externals: [
    function ({ context, request }, callback) {
      if (
        request.startsWith('@nestjs') ||
        request.startsWith('@prisma') ||
        request.startsWith('prisma') ||
        request.startsWith('express') ||
        request.startsWith('rxjs') ||
        request.startsWith('bullmq') ||
        request.startsWith('axios') ||
        request.startsWith('reflect-metadata') ||
        request.startsWith('@napi-rs') ||
        request.startsWith('pdfjs-dist') ||
        request.endsWith('.node')
      ) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    },
  ],
};

console.log('📦 Bundling API via Webpack...');
const compiler = webpack(config);
compiler.run((err, stats) => {
  if (err || (stats && stats.hasErrors())) {
    console.error('❌ Webpack compilation failed:', err || stats.toString({ colors: true }));
    process.exit(1);
  }
  console.log('✅ API successfully bundled to dist/apps/api/main.js!');
  compiler.close(() => process.exit(0));
});
