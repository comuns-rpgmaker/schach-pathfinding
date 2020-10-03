# Schach - Pathfinding

This plugin provides implementations of shortest path algorithms that can be
used directly with game characters on the map or on generic graph structures.

It is also extensible via definition of custom path finding/following
strategies following a common interface.

Please read the documentation an plugin instructions before asking any
questions. Feel free to report bugs and request features via Github issues.

## Releases

If you're interested on getting the latest versions of the plugin, see the
[Releases](https://github.com/comuns-rpgmaker/schach-pathfinding/releases)
page.

## Building from source

This plugin is built with [Node](https://nodejs.org/en/) and
[Emscripten](https://emscripten.org/), so make sure you have both installed.

If you're on Windows, you'll most likely need to install
[make](https://chocolatey.org/packages/make) too.

To build the project, run:

    npm ci
    npm run build

This will output a file named `schach-pathfinding.js` on the `dist/js/plugins`
directory and a file named `schach-pathfinding.debug.js` on `../../js/plugins`.
The relative path is intenteded to be used such that you can clone the plugin
repository into the `js` folder of a RMMZ project and test it easily.

We recommend using [VS Code](https://code.visualstudio.com/) to build and edit
sources, since we provide ready-made settings for building and debugging the
plugin on it. 

## License

See [LICENSE](./LICENSE).

This project uses Emscripten, which is licensed under the MIT license. For more
information see [LICENSE.emscripten](./LICENSE.emscripten).
