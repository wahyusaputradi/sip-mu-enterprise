import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('framer-motion')) {
                            return 'vendor-framer';
                        }
                        if (id.includes('recharts') || id.includes('d3')) {
                            return 'vendor-recharts';
                        }
                        if (id.includes('face-api.js')) {
                            return 'vendor-faceapi';
                        }
                        if (id.includes('leaflet')) {
                            return 'vendor-leaflet';
                        }
                    }
                },
            },
        },
    },
});
