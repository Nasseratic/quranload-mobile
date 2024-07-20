/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  settings: {
    react: {
      version: "detect",
    },
  },
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
    // project: './tsconfig.json', | required for rules that need type information
    // but slows down linting considerably. could consider adding as a CI/prepush step
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/README.md
  },
  plugins: [
    "lenus-mobile-custom-rules",
    "@typescript-eslint",
    "unused-imports",
    "unicorn",
    "import",
  ],
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // "plugin:@typescript-eslint/recommended-requiring-type-checking" | enables rules that need type information
    "prettier",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:unicorn/recommended",
  ],
  overrides: [
    {
      files: "*.tsx",
      rules: {
        // https://github.com/typescript-eslint/typescript-eslint/issues/2063#issuecomment-675156492
        "@typescript-eslint/ban-types": [
          "error",
          {
            extendDefaults: true,
            types: {
              "{}": false,
              Function: false,
            },
          },
        ],
      },
    },
    {
      files: "src/shared/@lui/**/*.tsx",
      excludedFiles: "*.stories*.tsx",
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: `ImportDeclaration[source.value='~/src/shared/@lui']`,
            message:
              "Do not import from the @lui index file in LUI, as it gives circular dependencies. Import from the specific component instead.",
          },
        ],
      },
    },
    {
      // Process all typescript files, and extract gql template literals into .graphql files
      files: ["src/**/*.{tsx,ts}"],
      processor: "@graphql-eslint/graphql",
    },
    {
      plugins: ["@graphql-eslint"],
      files: ["*.graphql"],
      parser: "@graphql-eslint/eslint-plugin",
      extends: "plugin:@graphql-eslint/operations-recommended",
      rules: {
        "@graphql-eslint/no-deprecated": "warn",
        "@graphql-eslint/naming-convention": "off",
        "@graphql-eslint/unique-fragment-name": "error",
        "@graphql-eslint/unique-operation-name": "error",
        "@graphql-eslint/selection-set-depth": "off",
      },
    },
    {
      files: ["src/shared/@lui/**"], // Or *.test.js
      rules: {
        "lenus-mobile-custom-rules/no-tamagui-imports": ["off"],
      },
    },
  ],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@apollo/client",
            importNames: ["gql"],
            message:
              "Use the graphql function from graphql codegen instead of gql from apollo client.",
          },
          {
            name: "graphql-tag",
            message:
              "Use the graphql function from graphql codegen instead of gql from grapqhl-tag.",
          },
          {
            name: "react-native-hold-menu",
            message: "Use the imports from @lui instead.",
          },
        ],
        patterns: [
          {
            group: ["**/packages/react-native-hold-menu/**"],
            message: "Use the imports from @lui instead.",
          },
        ],
      },
    ],
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        groups: [["builtin", "external"], "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
      },
    ],
    "lenus-mobile-custom-rules/no-relative-import-paths": [
      "error",
      { allowSameFolder: true, rootdir: "~/src" },
    ],
    "lenus-mobile-custom-rules/no-tamagui-imports": ["error", { rootdir: "~/src" }],
    "lenus-mobile-custom-rules/no-icons-imports": ["error", { rootdir: "~/src" }],
    "lenus-mobile-custom-rules/use-streamlined-statusbar": "error",
    "react/prop-types": "off", // TypeScript already checks prop types
    "react/display-name": "off",
    "react/react-in-jsx-scope": "off",
    "react/no-unescaped-entities": "off",

    "unicorn/no-unreadable-array-destructuring": "off",
    "unicorn/no-null": "off",
    "unicorn/no-await-expression-member": "off",
    "unicorn/no-process-exit": "off",
    "unicorn/prevent-abbreviations": "off",
    "unicorn/filename-case": "off",
    "unicorn/prefer-node-protocol": "off",
    "unicorn/prefer-module": "off",
    "unicorn/import-style": "off",
    "unicorn/no-useless-undefined": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/no-array-reduce": "off",
    "unicorn/prefer-spread": "off",
    "unicorn/numeric-separators-style": "off",
    "unicorn/prefer-query-selector": "off",
    "unicorn/prefer-number-properties": "off",
    "unicorn/no-array-callback-reference": "off",
    "unicorn/consistent-destructuring": "off",
    "unicorn/no-nested-ternary": "off",
    // probably a good rule to enable, but causes some type errors
    "unicorn/prefer-at": "off",
    "unicorn/prefer-top-level-await": "off",
    // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1079
    "unicorn/prefer-ternary": ["error", "only-single-line"],

    "react-hooks/exhaustive-deps": "off", // maybe we want this at some point?
    // 'spaced-comment': 'error',
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/prefer-ts-expect-error": "error",
    "@typescript-eslint/no-explicit-any": "off", // any has its uses ;)
    "@typescript-eslint/ban-ts-comment": "off", // we want to be able to use @ts-ignore
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off", // this is a tricky one, maybe we should consider enabling it at some point
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-throw-literal": "error",
    curly: ["error", "all"],
  },
  ignorePatterns: [],
};
