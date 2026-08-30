#!/usr/bin/env python3
"""Local preview server.

The same thing `python3 -m http.server` does, minus the caching. Without these
headers a browser hangs on to styles.css and app.js between edits, and every
change looks like it did nothing.
"""
import sys
from http.server import SimpleHTTPRequestHandler, test


class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    test(HandlerClass=NoCache, port=port, bind='127.0.0.1')
