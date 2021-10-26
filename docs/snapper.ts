import { snap } from "../mod.ts";
import { testText } from "../snapper.ts";

// deno run --unstable -A docs\snapper.ts

const snapperText = `\x1b[42m \x1b[1m\x1b[37mSnapper\x1b[39m\x1b[22m 📷  \x1b[49m`;

await snap([
    {content: testText, imageSavePath: 'docs/images/all.png', viewport: {width: 1045}},
    {content: snapperText, imageSavePath: 'docs/images/snapper.png'},
    {content: snapperText, imageSavePath: 'docs/images/snapper_theme.png', theme: {background: '#acacac', green: '#4E9A06', brightWhite: '#ddd'}},
    {content: snapperText, imageSavePath: 'docs/images/snapper_font.png', fontFamily: "fantasy", fontSize: 10},
    {content: snapperText, imageSavePath: 'docs/images/snapper_padding.png', padding: '0px 0px 0px 0px', viewport: {width: 115}},
    {content: snapperText, imageSavePath: 'docs/images/snapper_viewport.png', viewport: {width: 135, height: 35, deviceScaleFactor: 1}},
], { verbose: true, viewport: {width: 135}});