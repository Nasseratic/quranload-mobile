module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "module:metro-react-native-babel-preset"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: {
            tests: ["./tests/"],
            "@assets": "./src/assets",
            "@components": "./src/components",
            "@constants": "./src/constants",
            "@screens": "./src/screens",
            "@types": "./src/types",
          },
        },
      ],
    ],
  };
};
