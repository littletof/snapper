import { Application, Router, send } from "https://deno.land/x/oak@v9.0.1/mod.ts";

export function buildServer(): Application {
    const router = new Router();
    router
    .get("/", (context) => {
        context.response.body = 'use POST';
    })
    .post("/", async (context) => {
        const body = await context.request.body({ type: 'json'});
        const formData = await body.value;
        const termtext = decodeURI(formData['text'])/*  : context.request.url.searchParams.get('text') */;
        // console.log('POST', decodeURI(termtext));
        const template = Deno.readTextFileSync('./terminal_template.html');

        // const template = Deno.readTextFileSync('./terminal.html');

        context.response.body = new String(template).replace('\'##REPLACEME##\'', `\`${termtext.replace(/([`'"$])/g, '\\$1')}\``);
        // console.log(context.response.body);
        // context.response.status=200;
    })

    const app = new Application();
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(async (context) => {
        await send(context, context.request.url.pathname, {
            root: `${Deno.cwd()}/`,
            // index: "index.html",
        });
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