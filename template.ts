export const template = `
<!doctype html>
  <html>
    <head>
      <link rel="stylesheet" href="./static/xterm/xterm.css" />
      <script src="./static/xterm/xterm.js"></script>
      <script src="./static/xterm/fitAddon.js"></script>
      <style>
        .terminal {
          padding: 10px 10px 0; /* TODO allow to remove padding */
        }
      </style>
    </head>
    <body style="margin: 0;">
      <div id="terminal" style="visibility: hidden;"></div>
      <script>
        var term = new Terminal();
        var fitAddon = new this.fitAddon();
        term.loadAddon(fitAddon);

        term.setOption('theme', '##THEME##');
        // ##FONTFAMILY##
        // ##FONTSIZE##

        term.open(document.getElementById('terminal'));
        fitAddon.fit();
        const text = '##TERMINAL_CONTENT##';
        term.write(text.replace(/\\n/g, '\\r\\n'));

        setTimeout(() =>{
            const outHeight = document.getElementsByClassName('xterm-scroll-area')[0].scrollHeight;
            console.log(outHeight);
            console.log(document.getElementById('terminal'));
            document.getElementById('terminal').style.height = \`\${outHeight}px\`;
            document.getElementById('terminal').style.visibility = \`unset\`;
            fitAddon.fit();
            const done = document.createElement('div');
            done.setAttribute('id', 'done');
            document.getElementById('terminal').appendChild(done);
        }, 500); // TODO wait for actual print
      </script>
    </body>
  </html>`;