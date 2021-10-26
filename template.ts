export const template = `
<!doctype html>
  <html>
    <head>
      <link rel="stylesheet" href="./static/xterm/xterm.css" />
      <script src="./static/xterm/xterm.js"></script>
      <script src="./static/xterm/fitAddon.js"></script>
      <style>
        .terminal {
          padding: ##PADDING##;
        }
      </style>
    </head>
    <body style="margin: 0;">
      <div id="snap-terminal" style="visibility: hidden;"></div>
      <script>
        var term = new Terminal({rows: 1, cols: 1});
        var fitAddon = new this.fitAddon();
        term.loadAddon(fitAddon);

        term.setOption('theme', '##THEME##');
        // ##FONTFAMILY##
        // ##FONTSIZE##

        term.open(document.getElementById('snap-terminal'));
        fitAddon.fit();
        const text = '##TERMINAL_CONTENT##';
        term.write(text.replace(/\\n/g, '\\r\\n'));

        setTimeout(() =>{
            const outHeight = document.getElementsByClassName('xterm-scroll-area')[0].offsetHeight;
            console.log(outHeight);
            console.log(document.getElementById('snap-terminal'));
            document.getElementById('snap-terminal').style.height = \`\${outHeight}px\`;

            document.getElementById('snap-terminal').style.visibility = \`unset\`;
            fitAddon.fit();
            fitAddon.fit();
            const done = document.createElement('span');
            done.setAttribute('id', 'done');
            document.getElementById('snap-terminal').appendChild(done);
        }, 500); // TODO wait for actual print
      </script>
    </body>
  </html>`;