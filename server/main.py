import json
from http.server import HTTPServer, BaseHTTPRequestHandler


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Send a 200 OK response with headers
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()

        # Send the plain text response body
        self.wfile.write("<h1>Hello World!</h1>".encode('utf-8'))


# Create the server
server_address = ('0.0.0.0', 8000)  # Address and port
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)

print("Server running on http://0.0.0.0:8000...")
# Run the server
httpd.serve_forever()