import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    icon: false,
                    ref: true,
                    memo: true,
                    svgProps: {
                        className: '{props.className}',
                    },
                    dimensions: false,
                },
                include: '**/*.svg',
                exclude: '',
            }),
            tsconfigPaths(),
        ],
        resolve: {
            alias: [
                { find: '@', replacement: resolve(__dirname, './src/') },
                { find: 'shared', replacement: resolve(__dirname, './shared/') },
            ],
        },
        define: {
            'process.env': JSON.stringify(env),
        },
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            sourcemap: true,
        },
        server: {
            port: 3000,
            open: true,
        },
    }
})
