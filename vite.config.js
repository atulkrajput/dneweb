import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Optimize chunk size
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate heavy vendor libraries so they cache independently
                    'vendor-motion': ['framer-motion'],
                },
            },
        },
        // Increase warning threshold (we know about large chunks)
        chunkSizeWarningLimit: 500,
    },
});
