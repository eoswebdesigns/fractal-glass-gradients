import react from "@vitejs/plugin-react";
import { transformWithEsbuild } from "vite";
import restart from "vite-plugin-restart";
import glsl from "vite-plugin-glsl";

export default {
    root: "src/",
    publicDir: "../public/",
    base: "/",
    plugins: [
        restart({ restart: ["../public/**"] }),
        glsl(),
        react(),
        {
            name: "load+transform-js-files-as-jsx",
            async transform(code, id) {
                if (!id.match(/src\/.*\.js$/)) return null;
                return transformWithEsbuild(code, id, {
                    loader: "jsx",
                    jsx: "automatic",
                });
            },
        },
    ],
    server: {
        host: true,
        open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env),
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        sourcemap: true,
        // FIX: Split Three.js into its own chunk
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                },
            },
        },
        chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 kB
    },
};
