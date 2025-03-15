// @ts-check
import js from "@eslint/js";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [
            js.configs.recommended,
            tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
            {
                languageOptions: {
                    parserOptions: {
                        project: [
                            "./tsconfig.node.json",
                            "./tsconfig.app.json",
                        ],
                        tsconfigRootDir: import.meta.dirname,
                    },
                },
            },
        ],
        files: ["**/*.{ts,tsx}"],
        ignores: [
            "dist",
            "**/*.test.{ts,tsx}",
            // FIXME: remove ui directory from `ignores`
            "src/components/ui/**/*.{ts,tsx}",
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "react-compiler": reactCompiler,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "react-compiler/react-compiler": "error",
            "@typescript-eslint/consistent-type-definitions": ["error", "type"],
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allowNumber: true,
                },
            ],
        },
    }
);
