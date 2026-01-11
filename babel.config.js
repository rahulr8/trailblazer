module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          unstable_transformProfile: "hermes-stable",
        },
      ],
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: {
            "@": ".",
          },
        },
      ],
    ],
  };
};
