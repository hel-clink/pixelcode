#!/usr/bin/env python3
"""
PixelCode – lokaler Entwicklungsserver
Starte mit:  python3 server.py
Dann öffne:  http://localhost:8080
"""

import http.server
import socketserver
import os
import sys

PORT = 8080

# In das Verzeichnis wechseln, in dem dieses Skript liegt
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    # Korrekter MIME-Type für JavaScript-Module und Worker
    def guess_type(self, path):
        mime = super().guess_type(path)
        # In Python 3.10+ guess_type returns a single string, older versions a tuple
        if isinstance(mime, tuple):
            mime = mime[0]
        if str(path).endswith('.js'):
            return 'application/javascript'
        return mime

    def log_message(self, fmt, *args):
        # Etwas kompaktere Ausgabe
        print(f"  {self.address_string()}  {fmt % args}")

print(f"""
╔══════════════════════════════════════╗
║       PixelCode – Lokaler Server     ║
╠══════════════════════════════════════╣
║  URL:  http://localhost:{PORT}          ║
║  Stop: Strg+C                        ║
╚══════════════════════════════════════╝
""")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.allow_reuse_address = True
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer gestoppt.")
        sys.exit(0)
