# Snapper 📷

> Snapper allows you to generate images of ANSI formatted text.

> 🚧 Project is WIP, expect breaking changes

# Usage

#### Set up puppeteer
> In the background the module uses [deno Puppeteer](https://deno.land/x/puppeteer@9.0.2), which is a wrapper around [Puppeteer](https://github.com/puppeteer/puppeteer).

Follow the [current setup steps](https://github.com/lucacasonato/deno-puppeteer#installation), the basic setups should be something like:

```bash
PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@9.0.2/install.ts

#windows
$env:PUPPETEER_PRODUCT='chrome'; deno run -A --unstable https://deno.land/x/puppeteer@9.0.2/install.ts
```

## Module

```ts
import { snap } from "https://deno.land/x/snapper/mod.ts";

await snap([
    {content: `\x1b[42m \x1b[1m\x1b[37mSnapper\x1b[39m\x1b[22m 📷  \x1b[49m`, imageSavePath: 'snapper.png', viewport: {width: 145, height: 35}},
]);
```

> To run it, you will need `--allow-env`, `--allow-net`, `--allow-write`, `--allow-read`, `--unstable`.

The result should be a png file placed into `cwd+imageSavePath`:
![result](./docs/snapper.png)

When creating multiple images, provide your inputs to `snap` in bulk, otherwise, calling the function one-by-one will take a lot of time to finish.

To get whole image for the output, simply leave out the `viewport` property from the parameters. 

> `height` cuts the image, while a small `width` will result in the content wrapping

# TODO

- [ ] Try polyfill DOM+canvas, use xterm without puppeteer
- [ ] Improve server, so it can be hosted as a standalone site