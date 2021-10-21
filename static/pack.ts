const data: any = {};

data['fitAddon.js'] = Deno.readTextFileSync('static/xterm/fitAddon.js');
data['xterm.js'] = Deno.readTextFileSync('static/xterm/xterm.js');
data['xterm.css'] = Deno.readTextFileSync('static/xterm/xterm.css');

const content = `export const xterm = ${JSON.stringify(data, undefined, 2)};`;

Deno.writeTextFileSync('static/xterm/packed.ts', content);