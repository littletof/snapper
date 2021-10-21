import { iter } from "https://deno.land/std@0.104.0/io/util.ts";
import { snap } from "./mod.ts";

// deno run -A --unstable ./example.ts

export async function runPrompt(): Promise<string> {
    const process = Deno.run({
      stdin: "piped",
      stdout: "piped",
      cmd: [
        "powershell", "kopo", "search", "charmd", "-e",
      ],
      /* env: {
        NO_COLOR: "true",
      },clearEnv:true */
    });   


    let result = '';
    
    process.stdin.write(new TextEncoder().encode('')).then(async _ => {await process.stdin.write(new TextEncoder().encode('\u0003'));/* Simulate CTRL+C */});
    for await (let a of iter(process.stdout)) {
      result += new TextDecoder().decode(a);
    }

    process.stdin.close();
    process.stdout.close();
    process.close();
  
    return result;
  }
const res = await runPrompt();

await snap([
    {content: `\x1b[42m \x1b[1m\x1b[37mSnapper\x1b[39m\x1b[22m 📷  \x1b[49m`, imageSavePath: 'snapper.png', viewport: {width: 145, height: 35}},
], /*{ puppeteerLaunchOptions: {headless: false},  theme: {background: "#ccc"}}*/);