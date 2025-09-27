/**
 * @param {string} name
 */
const createNoopRule = (name) => ({
  meta: {
    type: "suggestion",
    docs: {
      description: `Placeholder implementation for ${name}`,
    },
    schema: [
      {
        type: "object",
        additionalProperties: true,
      },
    ],
  },
  create: () => ({}),
});

module.exports = {
  rules: {
    "no-tamagui-imports": createNoopRule("no-tamagui-imports"),
    "no-icons-imports": createNoopRule("no-icons-imports"),
    "no-relative-import-paths": createNoopRule("no-relative-import-paths"),
    "use-streamlined-statusbar": createNoopRule("use-streamlined-statusbar"),
  },
};
