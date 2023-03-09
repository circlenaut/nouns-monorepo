/// <reference types="vitest" />

/* 
These settings are finicky with the web3 dependencies in this package. Please modify with care.
This gist helped me got off the ground:
https://gist.github.com/FbN/0e651105937c8000f10fefdf9ec9af3d
Also, keep an eye on this. The vite team may have a much more viable/simple solution soon:
https://github.com/voracious/vite-plugin-node-polyfills
*/

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths  from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import macrosPlugin from "vite-plugin-babel-macros";
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// import ReactPlugin from 'vite-preset-react';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import lingui from '@lingui/vite-plugin'
// import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
// import nodePolyfills from 'rollup-plugin-node-polyfills';
// import { nodeModulesPolyfillPlugin } from "esbuild-plugins-node-modules-polyfill";
// import inject from '@rollup/plugin-inject';
// import customTsConfig from 'vite-plugin-custom-tsconfig';

// rollup({
//   entry: 'main.js',
//   plugins: [
//     nodePolyfills()
//   ]
// })

const aliases = {
  '@': resolve(__dirname, './src'),
  '@/public': resolve(__dirname, './public'),
  // stream: 'stream-browserify',
  // crypto: 'crypto-browserify',
  // assert: 'assert',
  // http: 'stream-http',
  // https: 'https-browserify',
  // url: 'url',
  // os: 'os-browserify/browser',
  // buffer: 'buffer',
  // util: 'util/',
    // This Rollup aliases are extracted from @esbuild-plugins/node-modules-polyfill,
    // see https://github.com/remorses/esbuild-plugins/blob/master/node-modules-polyfill/src/polyfills.ts
    // process and buffer are excluded because already managed
    // by node-globals-polyfill
    util: "util",
    sys: "util",
    // events: "rollup-plugin-node-polyfills/polyfills/events",
    stream: "rollup-plugin-node-polyfills/polyfills/stream",
    path: "rollup-plugin-node-polyfills/polyfills/path",
    querystring: "rollup-plugin-node-polyfills/polyfills/qs",
    punycode: "rollup-plugin-node-polyfills/polyfills/punycode",
    url: "rollup-plugin-node-polyfills/polyfills/url",
    // string_decoder: "rollup-plugin-node-polyfills/polyfills/string-decoder",
    http: "rollup-plugin-node-polyfills/polyfills/http",
    https: "rollup-plugin-node-polyfills/polyfills/http",
    os: "rollup-plugin-node-polyfills/polyfills/os",
    assert: "rollup-plugin-node-polyfills/polyfills/assert",
    constants: "rollup-plugin-node-polyfills/polyfills/constants",
    _stream_duplex: "rollup-plugin-node-polyfills/polyfills/readable-stream/duplex",
    _stream_passthrough: "rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough",
    _stream_readable: "rollup-plugin-node-polyfills/polyfills/readable-stream/readable",
    _stream_writable: "rollup-plugin-node-polyfills/polyfills/readable-stream/writable",
    _stream_transform: "rollup-plugin-node-polyfills/polyfills/readable-stream/transform",
    timers: "rollup-plugin-node-polyfills/polyfills/timers",
    console: "rollup-plugin-node-polyfills/polyfills/console",
    vm: "rollup-plugin-node-polyfills/polyfills/vm",
    zlib: "rollup-plugin-node-polyfills/polyfills/zlib",
    tty: "rollup-plugin-node-polyfills/polyfills/tty",
    domain: "rollup-plugin-node-polyfills/polyfills/domain",
    // buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
    // crypto: 'rollup-plugin-node-polyfills/polyfills/crypto-browserify', //https://github.com/remorses/esbuild-plugins/issues/34
};

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: ".", // important to ensure nested eslint scoping in monorepos
    plugins: [
      react({
        babel: {
          plugins: ['macros'],
        },
      }),
      AutoImport({
        imports: ['vitest'],
        dts: true, // generate TypeScript declaration
      }),
      tsconfigPaths({
        projects: [resolve(__dirname, '../../tsconfig.base.json')],
      }),
      svgrPlugin(),
      macrosPlugin(),
      // ReactPlugin({
      //   injectReact: false,
      // }),
      // rollupNodePolyFill(),
      lingui(),
      // customTsConfig({
      //   tsConfigPath: 'tsconfig.build.json'
      // }),
      // nodePolyfills({
      //   // Whether to polyfill `node:` protocol imports.
      //   protocolImports: true,
      // }),
      // commonjs()
    ],
    resolve: {
      alias: aliases,
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        external: ['history']
      },
      plugins: [
        // nodePolyfills()
        // inject({
        //   Buffer: ['Buffer', 'Buffer'],
        //   // process: 'process'

        // }),
        rollupNodePolyFill()
      ]
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['src/setupTest.ts'],
      watch: true,
      css: true
    },
    server: {
      open: false,
      port: 3000,
      // fs: {
      //   allow: [".."],
      // },
    },
    define: {
      'process.env': process.env,
      // 'global': {}
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
            
          }),
          NodeModulesPolyfillPlugin(), 
          // nodeModulesPolyfillPlugin()
        ]
      }
    }
  }
});
