import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from "path";


export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: [
                "frontend/css/app.css",
                "frontend/app.js",
                "frontend/js/bootstrap.js",
            ],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "frontend"),
        },
    }
});
