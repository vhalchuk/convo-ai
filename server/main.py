from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Send a 200 OK response with headers
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()

        # Send the plain text response body
        self.wfile.write("<h1>Hello World!</h1>".encode('utf-8'))
    def do_POST(self):
        # Read the length of the incoming data
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)  # Read the received POST data

        # Decode the incoming data (assuming it's JSON)
        try:
            received_data = json.loads(post_data)
            question = received_data.get('question', '')  # Extract "question" value
        except json.JSONDecodeError:
            question = ''

        # Construct a response
        response = {
            "message": "Answer received!",
            "duplicated_question": question if question else ""
        }

        # Send a 200 OK response with a JSON content type
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        # Send the JSON response
        self.wfile.write(json.dumps(response).encode('utf-8'))

# Create the server
server_address = ('0.0.0.0', 8000)  # Address and port
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)

print("Server running on http://0.0.0.0:8000...")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    # Explicitly handle graceful shutdown
    print("\nKeyboard interrupt received. Exiting...")