import json
from http.server import HTTPServer, BaseHTTPRequestHandler


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Handle GET requests
        response = {
            "status": "success",
            "message": "You sent a GET request"
        }

        # Send HTTP response headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        # Write the JSON response
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_POST(self):
        # Handle POST requests
        # Get the content length (size of the incoming data)
        content_length = int(self.headers['Content-Length'])

        # Read the data from the request body
        post_data = self.rfile.read(content_length)

        # Decode the received data
        try:
            data = json.loads(post_data.decode('utf-8'))
            response = {
                "status": "success",
                "message": f"You sent a POST request with data: {data}"
            }
        except json.JSONDecodeError:
            response = {
                "status": "failure",
                "message": "Invalid JSON format in your POST request"
            }

        # Send HTTP response headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        # Write the JSON response
        self.wfile.write(json.dumps(response).encode('utf-8'))


# Create the server
server_address = ('0.0.0.0', 8000)  # Address and port
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)

print("Server running on http://0.0.0.0:8000...")
# Run the server
httpd.serve_forever()