const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support WASM files for Rapier physics engine
config.resolver.assetExts.push('wasm');

// Support for three.js and related packages
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
