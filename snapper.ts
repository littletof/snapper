import { puppeteer } from "./deps.ts";
import { startServer } from "./server.ts";

export interface SnapParams {
    imageSavePath: string;
    content: string;
    viewport?: {width: number, height: number, deviceScaleFactor?: number}, // TODO get scaleFactor out, make w/h optional
}

export interface SnapOptions {
    snapServerUrl?: string;
    theme?: ThemeColors;
    puppeteerLaunchOptions?: PuppeteerLaunchOptions;
    verbose?: boolean;
}

export interface ThemeColors {
    foreground?: string;
    background?: string;
    black?: string;
    brightBlack?: string;
    red?: string;
    brightRed?: string;
    green?: string;
    brightGreen?: string;
    yellow?: string;
    brightYellow?: string;
    blue?: string;
    brightBlue?: string;
    magenta?: string;
    brightMagenta?: string;
    cyan?: string;
    brightCyan?: string;
    white?: string;
    brightWhite?: string;
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
        defaultViewport: {width: 1080, height: 30},
        // headless: false,
        // dumpio: true,
    });

    const page = await browser.newPage();
    log('\nSnapping pictures: ');
    for(let textCase of snaps) {
        const viewPort = {deviceScaleFactor: 3, width: 1080, height: 30, ...textCase.viewport};
        // TODO handle headless looking different
        // if(typeof options?.puppeteerLaunchOptions?.headless === "boolean" && !options.puppeteerLaunchOptions.headless) {
        //     viewPort.width += 15;
        // }
        page.setViewport(viewPort);

        let postData: any = {text: encodeURI(textCase.content)};
        if(options?.theme) {
            postData.theme = JSON.stringify(options.theme);
        }

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
        await page.screenshot({ path: textCase.imageSavePath, fullPage: !textCase.viewport });
    }

    await browser.close();

    abort();
    await listen;
    log('\nPuppeteer, server closed.\n\x1b[42m \x1b[1m\x1b[37mSnapping done \x1b[39m\x1b[22m\x1b[49m');
}

export function createLog(options?: SnapOptions) {
    if(options?.verbose) {
        return (...text: any[]) => console.log(...text);
    }
    return (...text: any[]) => {}
}

