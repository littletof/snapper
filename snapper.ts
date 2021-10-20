import { puppeteer } from "./deps.ts";
import { startServer } from "./server.ts";

export interface SnapParams {
    imageSavePath: string;
    content: string;
    viewport?: {width: number, height: number, deviceScaleFactor?: number},
}

// TODO Deno puppeteer types
export type PuppeteerLaunchOptions = any;

export async function snap(snaps: SnapParams[], options?: {snapServerUrl?: string, puppeteerLaunchOptions?: PuppeteerLaunchOptions}) {
    const {listen, abort} = startServer();

    const browser = await puppeteer.launch(options?.puppeteerLaunchOptions || {
        env: { PUPPETEER_PRODUCT: 'chrome' },
        defaultViewport: {width: 1080, height: 30},
        // headless: false,
        // dumpio: true,
    });

    const page = await browser.newPage();
    
    for(let textCase of snaps) {
        page.setViewport({deviceScaleFactor: 3, width: 1080, height: 30, ...textCase.viewport});

        await page.setRequestInterception(true);

        page.once("request", async interceptedRequest => {
            await interceptedRequest.continue({
                method: "POST",
                postData: `{"text": "${encodeURI(textCase.content)}"}`,
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
        await page.screenshot({ path: textCase.imageSavePath, fullPage: !textCase.viewport });
    }

    await browser.close();

    abort();
    await listen;
}

