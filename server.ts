import { Application, Router, send } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import {template} from './template.ts';
import {xterm} from './static/xterm/packed.ts';
import { ThemeColors } from "./snapper.ts";

export function buildServer(): Application {
    const router = new Router();
    router
    .get("/", (context) => {
        context.response.body = new String(template).replace('\'##REPLACEME##\'', `\`${'use POST method'.replace(/([`'"$])/g, '\\$1')}\``);
    })
    .post("/", async (context) => {
        const body = await context.request.body({ type: 'json'});
        const formData = await body.value;
        const termtext = decodeURI(formData['text'])/*  : context.request.url.searchParams.get('text') */;
        const termTheme = {...defaultTheme, ...(formData['theme'] ? JSON.parse(decodeURI(formData['theme'])) : {}) };
        context.response.body = new String(template)
            .replace('\'##REPLACEME##\'', `\`${termtext.replace(/([`'"$])/g, '\\$1')}\``)
            .replace('\'##THEME##\'', `${JSON.stringify(termTheme)}`);
    })

    const app = new Application();
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(async (context) => {
        if(context.request.url.toString().indexOf('/static') > 0) {
            const split = context.request.url.toString().split('/static/xterm/');
            context.response.body = (xterm as any)[split.at(-1) as any];
            context.response.type = (split.at(-1) as any).split('.')[1];
        }
    });

    return app;
}

export function startServer(opts?: {port?: number}) {
    const controller = new AbortController();
    const { signal } = controller;

    return {
        listen: buildServer().listen({port: opts?.port || 7777, signal}),
        abort: () => controller.abort()
    };
}

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