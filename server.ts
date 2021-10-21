import { Application, Router, send } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import {template} from './template.ts';
import {xterm} from './static/xterm/packed.ts';

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

export const defaultTheme = {
    "foreground": "#cccccc",
    "background": "#1e1e1e",
    "cursorColor": "#cccccc",
    "black": "#000000",
    "red": "#c62f37",
    "green": "#37be78",
    "yellow": "#e2e822",
    "blue": "#396ec7",
    "purple": "#b835bc",
    "cyan": "#3ba7cc",
    "white": "#e5e5e5",
    "brightBlack": "#666666",
    "brightRed": "#e94a51",
    "brightGreen": "#45d38a",
    "brightYellow": "#f2f84a",
    "brightBlue": "#4e8ae9",
    "brightPurple": "#d26ad6",
    "brightCyan": "#49b7da",
    "brightWhite": "#e5e5e5"
};