import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

import { readFileSync } from 'fs';

import pkg from './package.json';

const name = 'Schach.Pathfinding';
const header = readFileSync('header.js', 'utf-8');

export default [
	{
        input: 'src/main.ts',
        output: [
            {
                name,
                file: `./dist/${pkg.name}.js`,
                format: 'iife',
                sourcemap: false,
                plugins: [
                    terser({
                        keep_fnames: true,
                        toplevel: true,
                        format: {
                            comments: false,
                            preamble: header
                        }
                    })
                ]
            },
            {
                name,
                file: `../plugins/${pkg.name}.debug.js`,
                format: 'iife',
                sourcemap: true,
                banner: header
            }
        ],
        plugins: [
            typescript()
        ]
	}
];
