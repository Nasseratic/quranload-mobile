// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
process.env.TAMAGUI_TARGET = "native";

module.exports = function (api) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
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
      "transform-inline-environment-variables",
      "react-native-reanimated/plugin",
    ],
  };
};
