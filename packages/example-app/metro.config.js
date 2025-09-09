const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Define workspace root (two levels up from example-app)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// Watch folders to include workspace packages and hoisted node_modules
const watchFolders = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'packages'),
];

// Node modules paths for resolution
const nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

const config = {
  watchFolders,
  resolver: {
    nodeModulesPaths,
    // Enable source extensions for TypeScript and modern JS
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
