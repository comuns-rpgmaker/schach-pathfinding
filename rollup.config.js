import typescript from '@rollup/plugin-typescript';

import { terser } from 'rollup-plugin-terser';
import externalGlobals from "rollup-plugin-external-globals";

import { readFileSync } from 'fs';

import pkg from './package.json';

const header = readFileSync(`${__dirname}/dist/annotations.js`)
                + '\n'
                + readFileSync('header.js', 'utf-8');

const wasm = readFileSync(`${__dirname}/wasm/dist/rea_star.js`);

export default [
	{
        input: 'src/main.ts',
        output: [
            {
                file: `${__dirname}/dist/js/plugins/${pkg.name}.js`,
                name: pkg.namespace,
                format: 'iife',
                sourcemap: false,
                outro: wasm,
                plugins: [
                    terser({
                        format: {
                            comments: false,
                            preamble: header
                        }
                    })
                ]
            },
            {
                file: `${pkg.testProjectDir || `${__dirname}/dist`}/js/plugins/${pkg.name}.debug.js`,
                name: pkg.namespace,
                format: 'iife',
                sourcemap: true,
                banner: header,
                outro: wasm
            }
        ],
        plugins: [
            typescript(),
            externalGlobals({
                "rmmz": "window"
            })
        ]
	}
];
