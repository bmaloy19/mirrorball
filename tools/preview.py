#!/usr/bin/env python3
"""Local preview server.

The same thing `python3 -m http.server` does, minus the caching. Without these
headers a browser hangs on to styles.css and app.js between edits, and every
change looks like it did nothing.
"""
import errno
import sys
from http.server import SimpleHTTPRequestHandler, test


class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    # Line-buffer stdout. VS Code's task runner reads this over a pipe, and
    # Python block-buffers to a pipe by default — the "Serving HTTP on ..."
    # line would sit unflushed and .vscode/launch.json would wait forever for
    # a server that is already up.
    sys.stdout.reconfigure(line_buffering=True)

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    try:
        test(HandlerClass=NoCache, port=port, bind='127.0.0.1')
    except OSError as exc:
        if exc.errno != errno.EADDRINUSE:
            raise
        sys.exit(
            f"Port {port} is already in use — something else is serving there "
            f"(another ./serve.sh, or the editor's preview).\n"
            f"Stop that one, or pick another port:  python3 tools/preview.py {port + 1}"
        )
