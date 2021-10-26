import { puppeteer } from "./deps.ts";
import { startServer } from "./server.ts";
import { template } from './template.ts';

/** Parameters for a single image output */
export interface SnapParams {
    /** Output path for the generated image. `JPEG` and `PNG` formats are supported. */
    imageSavePath: string ; // `${string}${'.png' | '.jpg' | '.jpeg'}`
    /** ANSI text to generate image from */
    content: string;
    /** Size settings for the generated image */
    viewport?: {
        /** Defines how wide the terminal should be. If its smaller, than the output in on line, it will wrap its content into multiple lines. */
        width?: number;
        /** Defines the height of the terminal. If its set to be smaller than the output in the terminal, it will cut the output in the generated image. */
        height?: number;
        /** Defines the scale factor for the generated image. If set to `x`, the output image's resolution will be `x` times the original resolution.
         * 
         * Defaults to `3`. */
        deviceScaleFactor?: number; // TODO get scaleFactor out
    },
    /** `CSS` style padding around the output. */
    padding?: string;

    /** Color theme for terminal output. */
    theme?: ThemeColors;
    /** Font family of the output text in the terminal. */
    fontFamily?: 'default' | string;
    /** Font size of the output text in the terminal. */
    fontSize?: number;
}

/** Options for the whole group of cases. */
export interface SnapOptions extends Omit<SnapParams, 'content' | 'imageSavePath'>{
    snapServerUrl?: string;
    /** Puppeteer options, which get passed straight to deno puppeteer */
    puppeteerLaunchOptions?: PuppeteerLaunchOptions;
    /** Whether or not to log progress in the terminal. */
    verbose?: boolean;
}

interface RenderOptions {
    text: string;
    theme?: ThemeColors;
    fontFamily?: string;
    fontSize?: number;
    padding?: string;
}

interface POSTRenderOptions {
    text: string;
    theme?: string;
    fontFamily?: string;
    fontSize?: number;
    padding?: string;
}

/** XTermJs ITheme */
export interface ThemeColors {
    /** The default foreground color */
    foreground?: string,
    /** The default background color */
    background?: string,
    /** The cursor color */
    cursor?: string,
    /** The accent color of the cursor (used as the foreground color for a block cursor) */
    cursorAccent?: string,
    /** The selection color (can be transparent) */
    selection?: string,
    /** ANSI black (eg. `\x1b[30m`) */
    black?: string,
    /** ANSI red (eg. `\x1b[31m`) */
    red?: string,
    /** ANSI green (eg. `\x1b[32m`) */
    green?: string,
    /** ANSI yellow (eg. `\x1b[33m`) */
    yellow?: string,
    /** ANSI blue (eg. `\x1b[34m`) */
    blue?: string,
    /** ANSI magenta (eg. `\x1b[35m`) */
    magenta?: string,
    /** ANSI cyan (eg. `\x1b[36m`) */
    cyan?: string,
    /** ANSI white (eg. `\x1b[37m`) */
    white?: string,
    /** ANSI bright black (eg. `\x1b[1;30m`) */
    brightBlack?: string,
    /** ANSI bright red (eg. `\x1b[1;31m`) */
    brightRed?: string,
    /** ANSI bright green (eg. `\x1b[1;32m`) */
    brightGreen?: string,
    /** ANSI bright yellow (eg. `\x1b[1;33m`) */
    brightYellow?: string,
    /** ANSI bright blue (eg. `\x1b[1;34m`) */
    brightBlue?: string,
    /** ANSI bright magenta (eg. `\x1b[1;35m`) */
    brightMagenta?: string,
    /** ANSI bright cyan (eg. `\x1b[1;36m`) */
    brightCyan?: string,
    /** ANSI bright white (eg. `\x1b[1;37m`) */
    brightWhite?: string
}

// TODO Deno puppeteer types
export type PuppeteerLaunchOptions = any;

export async function snap(snaps: SnapParams[], options?: SnapOptions) {
    const log = createLog(options);
    log('\x1b[42m \x1b[1m\x1b[37mSnapper\x1b[39m\x1b[22m 📷  \x1b[49m');
    log('\nStarting server...');
    const {listen, abort} = startServer();

    log('Launching puppeteer...');
    const browser = await puppeteer.launch(options?.puppeteerLaunchOptions || {
        env: { PUPPETEER_PRODUCT: 'chrome' },
        defaultViewport: {width: 1080, height: 15},
        // headless: false,
        // dumpio: true,
    });

    const page = await browser.newPage();
    log('\nSnapping pictures: ');
    for(let textCase of snaps) {
        const viewPort = {deviceScaleFactor: 3, width: 1080, height: 15, ...options?.viewport, ...textCase.viewport};
        // TODO handle headless looking different
        // if(typeof options?.puppeteerLaunchOptions?.headless === "boolean" && !options.puppeteerLaunchOptions.headless) {
        //     viewPort.width += 15;
        // }
        page.setViewport(viewPort);

        const postData = getPostDataFromOptions(options || {}, textCase);

        await page.setRequestInterception(true);
        page.once("request", async interceptedRequest => {
            await interceptedRequest.continue({
                method: "POST",
                postData: JSON.stringify(postData),
                headers: {
                ...interceptedRequest.headers(),
                "Content-Type": "application/json"
                },
            });
            // only first post, not scripts
            page.setRequestInterception(false);
        });

        
        await page.goto(options?.snapServerUrl || `http://localhost:7777`);
        await page.waitForSelector('#done');
        // TODO checkexists imageSavePath
        log(`\t- ${textCase.imageSavePath}`);
        const heightSet = !isNaN(options?.viewport?.height as number) || !isNaN(textCase.viewport?.height as number);
        await page.screenshot({ path: textCase.imageSavePath, fullPage: !heightSet});
    }

    await browser.close();

    abort();
    await listen;
    log('\nPuppeteer, server closed.\n\x1b[42m \x1b[1m\x1b[37mSnapping done \x1b[39m\x1b[22m\x1b[49m');
}

export function getHTML(options: RenderOptions) {
    const content = options.text.replace(/([`'"$])/g, '\\$1'); // escape spec chars
    const theme = {...defaultTheme, ...options.theme };
    const fontFamily = options.fontFamily || defaultFontFamily;
    const padding = options.padding || '10px';


    return new String(template)
            .replace('\'##THEME##\'', `${JSON.stringify(theme)}`)
            .replace('// ##FONTFAMILY##', fontFamily !== 'default' ? `term.setOption('fontFamily', '${fontFamily}');` : '')
            .replace('// ##FONTSIZE##', options.fontSize ? `term.setOption(\'fontSize\', \'${options.fontSize}\');` : '')
            .replace('##PADDING##', padding)
            .replace('\'##TERMINAL_CONTENT##\'', `\`${content}\``) // keep last
}

export function getPostDataFromOptions(options: SnapOptions, textCase: SnapParams): POSTRenderOptions {
    const text = encodeURI(textCase.content);
    const theme = textCase.theme || options.theme;
    return {
        text,
        theme: theme ? JSON.stringify(theme) : undefined,
        fontFamily: textCase.fontFamily || options.fontFamily,
        fontSize: textCase.fontSize || options.fontSize,
        padding: textCase.padding || options.padding
    }
}

export function getRenderOptionsFromPostData(post: POSTRenderOptions): RenderOptions {
    return {
        text: decodeURI(post.text),
        theme: post.theme ? JSON.parse(decodeURI(post.theme)) : undefined,
        fontFamily: post.fontFamily,
        fontSize: post.fontSize,
        padding: post.padding
    };
}

export function createLog(options?: SnapOptions) {
    if(options?.verbose) {
        return (...text: any[]) => console.log(...text);
    }
    return (...text: any[]) => {}
}
export const defaultFontFamily = 'Consolas, "Courier New", monospace';
export const defaultTheme: ThemeColors = {
    foreground: "#cccccc",
    background: "#1e1e1e",
    black: "#000000",
    brightBlack: "#666666",
    red: "#CD3131",
    brightRed: "#F14C4C",
    green: "#0DBC79",
    brightGreen: "#23D18B",
    yellow: "#E5E510",
    brightYellow: "#F5F543",
    blue: "#2472C8",
    brightBlue: "#3B8EEA",
    magenta: "#BC3FBC",
    brightMagenta: "#D670D6",
    cyan: "#11A8CD",
    brightCyan: "#29B8DB",
    white: "#E5E5E5",
    brightWhite: "#E5E5E5"
};

export const testText = `[1mbold            [22m[2mdim             [22m[3mitalic          [23m[4munderline       [24m[7minverse         [27m[9mstrikethrough   [29m 
[1m[30mblack           [39m[22m[1m[31mred             [39m[22m[1m[32mgreen           [39m[22m[1m[33myellow          [39m[22m[1m[34mblue            [39m[22m[1m[35mmagenta         [39m[22m[1m[36mcyan            [39m[22m[1m[37mwhite         [39m[22m
[1m[90mgray            [39m[22m[30m[91mredBright       [30m[39m[30m[92mgreenBright     [30m[39m[30m[93myellowBright    [30m[39m[30m[94mblueBright      [30m[39m[30m[95mmagentaBright   [30m[39m[30m[96mcyanBright      [30m[39m[30m[97mwhiteBright  [30m[39m
[37m[1m[40mbgBlack         [49m[22m[39m[30m[1m[41mbgRed           [49m[22m[39m[30m[1m[42mbgGreen         [49m[22m[39m[30m[1m[43mbgYellow        [49m[22m[39m[30m[1m[44mbgBlue          [49m[22m[39m[30m[1m[45mbgMagenta       [49m[22m[39m[30m[1m[46mbgCyan          [49m[22m[39m[30m[1m[47mbgWhite       [49m[22m[39m
[37m[3m[100mbgBlackBright   [49m[23m[39m[30m[3m[101mbgRedBright     [49m[23m[39m[30m[3m[102mbgGreenBright   [49m[23m[39m[30m[3m[103mbgYellowBright  [49m[23m[39m[30m[3m[104mbgBlueBright    [49m[23m[39m[30m[3m[105mbgMagentaBright [49m[23m[39m[30m[3m[106mbgCyanBright    [49m[23m[39m[30m[3m[107mbgWhiteBright [49m[23m[39m`;

