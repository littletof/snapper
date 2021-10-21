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

        context.response.body = new String(template).replace('\'##REPLACEME##\'', `\`${termtext.replace(/([`'"$])/g, '\\$1')}\``);
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