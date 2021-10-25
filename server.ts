import { Application, Router } from "https://deno.land/x/oak@v9.0.1/mod.ts";
import {xterm} from './static/xterm/packed.ts';
import { getHTML, getRenderOptionsFromPostData, testText } from "./snapper.ts";

export function buildServer(): Application {
    const router = new Router();
    router
    .get("/", (context) => {
        context.response.body = getHTML({text: 'use POST method\n' + testText});
    })
    .post("/", async (context) => {
        const body = await context.request.body({ type: 'json'});
        const formData = await body.value;

        const renderOptions = getRenderOptionsFromPostData(formData);
        context.response.body = getHTML(renderOptions);
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