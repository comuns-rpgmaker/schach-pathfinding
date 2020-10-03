import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

import { terser } from 'rollup-plugin-terser';
import externalGlobals from "rollup-plugin-external-globals";

import { readFileSync } from 'fs';

import pkg from './package.json';

const header = readFileSync(`${__dirname}/dist/annotations.js`)
                + '\n'
                + readFileSync('header.js', 'utf-8');

const wasm = readFileSync(`${__dirname}/wasm/rea-star/dist/rea_star.js`);

export default [
	{
        input: 'src/main.ts',
        output: [
            // Release
            {
                file: `${__dirname}/dist/js/plugins/${pkg.name}.js`,
                name: pkg.namespace,
                format: 'iife',
                sourcemap: false,
                outro: wasm,
                plugins: [
                    replace({
                        __pluginId__: pkg.name
                    }),
                    terser({
                        format: {
                            comments: false,
                            preamble: header
                        }
                    })
                ]
            },

            // Debug
            {
                file: `${pkg.testProjectDir || `${__dirname}/dist`}/js/plugins/${pkg.name}.debug.js`,
                name: pkg.namespace,
                format: 'iife',
                sourcemap: true,
                banner: header,
                outro: wasm,
                plugins: [
                    replace({
                        __pluginId__: `${pkg.name}.debug`
                    })
                ]
            }
        ],
        plugins: [
            typescript(),
            externalGlobals({
                "rmmz": "window"
            })
        ],
        onwarn: () => {}
	}
];
