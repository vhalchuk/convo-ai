module.exports = {
    trailingComma: "es5",
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    plugins: ["@trivago/prettier-plugin-sort-imports"],
    importOrder: [
        "^react-scan$",
        "^react$",
        "<THIRD_PARTY_MODULES>",
        "^@convo-ai/(.*)$",
        "^@/(.*)$",
        "^[./]",
    ],
    importOrderSortSpecifiers: true,
};
