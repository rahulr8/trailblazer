const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude agents folder from Metro bundler - it's a separate Node.js project
config.resolver.blockList = [
  /agents\/.*/,
];
config.watchFolders = config.watchFolders?.filter(
  (folder) => !folder.includes("agents")
) || [];

// IMPORTANT: withUniwindConfig must be the outermost wrapper
module.exports = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
  dtsFile: "./uniwind-types.d.ts",
});
