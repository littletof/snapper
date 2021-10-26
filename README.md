# Snapper 📷
[![snapper_deno](https://img.shields.io/badge/-snapper%20%F0%9F%93%B7-%230DBC79?style=flat-square)](https://github.com/littletof/snapper)


> Snapper allows you to generate images from ANSI formatted text.

> 🚧 Project is WIP, expect breaking changes

Generate this image:
![Example generated output](docs/images/all.png)

With this:
```ts
import { snap } from "https://deno.land/x/snapper/mod.ts";

const testText = `[1mbold            [22m[2mdim             [22m[3mitalic          [23m[4munderline       [24m[7minverse         [27m[9mstrikethrough   [29m 
[1m[30mblack           [39m[22m[1m[31mred             [39m[22m[1m[32mgreen           [39m[22m[1m[33myellow          [39m[22m[1m[34mblue            [39m[22m[1m[35mmagenta         [39m[22m[1m[36mcyan            [39m[22m[1m[37mwhite         [39m[22m
[1m[90mgray            [39m[22m[30m[91mredBright       [30m[39m[30m[92mgreenBright     [30m[39m[30m[93myellowBright    [30m[39m[30m[94mblueBright      [30m[39m[30m[95mmagentaBright   [30m[39m[30m[96mcyanBright      [30m[39m[30m[97mwhiteBright  [30m[39m
[37m[1m[40mbgBlack         [49m[22m[39m[30m[1m[41mbgRed           [49m[22m[39m[30m[1m[42mbgGreen         [49m[22m[39m[30m[1m[43mbgYellow        [49m[22m[39m[30m[1m[44mbgBlue          [49m[22m[39m[30m[1m[45mbgMagenta       [49m[22m[39m[30m[1m[46mbgCyan          [49m[22m[39m[30m[1m[47mbgWhite       [49m[22m[39m
[37m[3m[100mbgBlackBright   [49m[23m[39m[30m[3m[101mbgRedBright     [49m[23m[39m[30m[3m[102mbgGreenBright   [49m[23m[39m[30m[3m[103mbgYellowBright  [49m[23m[39m[30m[3m[104mbgBlueBright    [49m[23m[39m[30m[3m[105mbgMagentaBright [49m[23m[39m[30m[3m[106mbgCyanBright    [49m[23m[39m[30m[3m[107mbgWhiteBright [49m[23m[39m`;

await snap([
    {content: testText, imageSavePath: 'docs/images/all.png', viewport: {width: 1045}},
]);
```

# Usage

#### Set up puppeteer
> In the background the module uses [deno Puppeteer](https://deno.land/x/puppeteer@9.0.2), which is a fork of [Puppeteer](https://github.com/puppeteer/puppeteer).

Follow the [current setup steps](https://github.com/lucacasonato/deno-puppeteer#installation), the basic setups should be something like:

```bash
PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@9.0.2/install.ts

#windows
$env:PUPPETEER_PRODUCT='chrome'; deno run -A --unstable https://deno.land/x/puppeteer@9.0.2/install.ts
```

## Generate images
After puppeteer was set up, simply run the following:

```ts
import { snap } from "https://deno.land/x/snapper/mod.ts";

const snapperText = `\x1b[42m \x1b[1m\x1b[37mSnapper\x1b[39m\x1b[22m 📷  \x1b[49m`;

await snap([
    /* 1 */{content: snapperText, imageSavePath: 'snapper.png'},
    /* 2 */{content: snapperText, imageSavePath: 'snapper_theme.png', theme: {background: '#acacac', green: '#297', brightWhite: '#ddd'}},
    /* 3 */{content: snapperText, imageSavePath: 'snapper_font.png', fontFamily: "fantasy", fontSize: 10},
    /* 4 */{content: snapperText, imageSavePath: 'snapper_padding.png', padding: '5px 10px 0 5px', viewport: {width: 135}},
    /* 5 */{content: snapperText, imageSavePath: 'snapper_viewport.png', viewport: {width: 135, height: 35, deviceScaleFactor: 1}},
], { verbose: true, viewport: {width: 135}});
```

The generated images will be placed placed into `cwd`+`imageSavePath`:
|    |                                               |
|----|-----------------------------------------------|
| 1. | ![result](./docs/images/snapper.png)          |
| 2. | ![result](./docs/images/snapper_theme.png)    |
| 3. | ![result](./docs/images/snapper_font.png)     |
| 4. | ![result](./docs/images/snapper_padding.png)  |
| 5. | ![result](./docs/images/snapper_viewport.png) |

When creating multiple images, provide your inputs to `snap` in bulk, otherwise, calling the function one-by-one will take a lot of time to finish.

## Options
 See the [docs](https://doc.deno.land/https/deno.land%2Fx%2Fsnapper%2Fmod.ts) and the example code above for the different options.

> `height` cuts the image, while a small `width` will result in the content wrapping

## 🚩 Flags

|Flag| Required |Reason|
|:--|:-:|:--|
| 🚧 `--unstable`  | yes | Needed for [Puppeteer](https://deno.land/x/puppeteer) |
| 🧭 `--allow-env` | yes | Needed for [Puppeteer](https://deno.land/x/puppeteer) to access which browser to use |
| 🔍 `--allow-read` | yes | Needed for [Puppeteer](https://deno.land/x/puppeteer) to read the browser executable |
| 💾 `--allow-write` | yes | Needed for [Puppeteer](https://deno.land/x/puppeteer) to read the browser executable and to save the generated images |
| ⚠ `--allow-run` | yes | Needed for [Puppeteer](https://deno.land/x/puppeteer) to run the browser in the background |
| 🌐 `--allow-net` | yes | Needed to be able to run the background server which puppeteer visits and captures |

# Spread the word
If you use `snapper` in your module or to generate images for your documentation/Readme consider adding a badge to your readme:

[![snapper_deno](https://img.shields.io/badge/-snapper%20%F0%9F%93%B7-%230DBC79)](https://github.com/littletof/snapper)
[![snapper_deno](https://img.shields.io/badge/-snapper%20%F0%9F%93%B7-%230DBC79?style=flat-square)](https://github.com/littletof/snapper)

[![snapper_deno](https://img.shields.io/badge/-snapper%20%F0%9F%93%B7-black)](https://github.com/littletof/snapper)
[![snapper_deno](https://img.shields.io/badge/-snapper%20%F0%9F%93%B7-black?style=flat-square)](https://github.com/littletof/snapper)

[![snapper_deno](https://img.shields.io/badge/-%20snapper%20%F0%9F%93%B7-4E9A06)](https://github.com/littletof/snapper)
[![snapper_deno](https://img.shields.io/badge/-%20snapper%20%F0%9F%93%B7-4E9A06?style=flat-square)](https://github.com/littletof/snapper)

# TODO

- [ ] Try polyfill DOM+canvas, use xterm without puppeteer
- [ ] Improve server, so it can be hosted as a standalone site