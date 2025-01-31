from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError, AuthenticationError, RateLimitError

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")  # Retrieve the API key from the environment variable
client = OpenAI(api_key=openai_api_key)

# Set OpenAI API Key. You can use the environment variable "OPENAI_API_KEY" or assign it explicitly.
if not openai_api_key or not openai_api_key.strip():  # Check if it is properly set
    raise ValueError("OPENAI_API_KEY environment variable is missing or invalid")

# Optionally set it in case the environment variable is not being used automatically


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read and parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            # Parse incoming JSON data to extract the question
            try:
                received_data = json.loads(post_data)
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON format")
                return

            question = received_data.get('question', '')

            # Handle missing 'question' in the payload
            if not question:
                self.send_error(400, "Bad Request: 'question' parameter is missing")
                return

            # Call the OpenAI API with the user's question
            try:
                completion = client.chat.completions.create(model="gpt-4o-mini",  # Use GPT-4 or any other available model
                messages=[{"role": "user", "content": question}])  # Prepare user's message)

                # Extract ChatGPT response
                chatgpt_response = completion.choices[0].message.content

            # Handle OpenAI API-specific errors
            except AuthenticationError:
                self.send_error(401, "Authentication Error: Invalid OpenAI API Key")
                return
            except RateLimitError:
                self.send_error(429, "Rate Limit Exceeded: Too many requests to OpenAI API")
                return
            except OpenAIError as e:
                self.send_error(500, f"OpenAI API Error: {str(e)}")
                return

            # Send a successful response
            response = {
                "message": "Answer received!",
                "chatgpt_response": chatgpt_response
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))

        # Catch invalid JSON format errors or other unexpected errors
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON format")
        except Exception as e:
            # Log the error (useful for debugging) and respond with an internal server error
            print(f"Unexpected error: {e}")
            self.send_error(500, "Internal Server Error")


# Create the HTTP server
server_address = ('0.0.0.0', 8000)  # Listen on all available network interfaces on port 8000
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)

print("Server is running on http://0.0.0.0:8000...")
try:
    httpd.serve_forever()  # Start the server loop
except KeyboardInterrupt:
    print("\nServer shutdown triggered by Ctrl+C")