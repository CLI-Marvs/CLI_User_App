import eslint from "@eslint/js";
import securityPlugin from "eslint-plugin-security";

export default [
    eslint.configs.recommended,
    {
        plugins: {
            security: securityPlugin,
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                document: "readonly",
                window: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                URLSearchParams: "readonly",
                localStorage: "readonly",
                btoa: "readonly",
            },
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: true, // Recommended for ESLint 9
        },
        rules: {
            "security/detect-object-injection": "error",
            "security/detect-non-literal-regexp": "error",
            "security/detect-non-literal-require": "warn",
            "security/detect-possible-timing-attacks": "error",
            "security/detect-eval-with-expression": "error",
            "security/detect-no-csrf-before-method-override": "error",
        },
    },
];
