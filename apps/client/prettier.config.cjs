const baseConfig = require("../../prettier.config.cjs");

module.exports = {
    ...baseConfig,
    plugins: [
        ...(baseConfig.plugins ?? []),
        "prettier-plugin-tailwindcss",
    ],
}