from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError, AuthenticationError, RateLimitError

# Load environment variables from .env file
load_dotenv()

# Retrieve the API key from the environment variable
openai_api_key = os.getenv("OPENAI_API_KEY")

# Check if the API key is valid
if not openai_api_key or not openai_api_key.strip():  # Ensure the key isn't missing or blank
    raise ValueError("OPENAI_API_KEY environment variable is missing or invalid")

allowed_origin = os.getenv("ALLOWED_ORIGIN")

if not allowed_origin or not allowed_origin.strip():  # Ensure the key isn't missing or blank
    raise ValueError("ALLOWED_ORIGIN environment variable is missing or invalid")

# Initialize the OpenAI client
client = OpenAI(api_key=openai_api_key)

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    # Override end_headers to add CORS to every response
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', allowed_origin)
        super().end_headers()

    # Handle preflight OPTIONS requests
    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.send_header('Access-Control-Allow-Origin', allowed_origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                received_data = json.loads(post_data)
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON format")
                return

            # Extract the messages and model from the request
            messages = received_data.get("messages", None)
            model = received_data.get("model", None)

            # Validate messages
            if not messages or not isinstance(messages, list):
                self.send_error(400, "Invalid request: 'messages' field is required and must be an array")
                return

            # Validate model
            valid_models = ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"]
            if model not in valid_models:
                self.send_error(400, f"Invalid request: 'model' field must be one of: {', '.join(valid_models)}")
                return

            # Route the request to the selected model
            completion = client.chat.completions.create(
                model=model,  # Use the selected model
                messages=messages  # Pass the conversation history
            )

            # Extract the assistant's response
            assistant_content = completion.choices[0].message.content

            # Append the assistant's response to the messages
            messages.append({
                "role": "assistant",
                "content": assistant_content
            })

            # Send a successful response
            response = {
                "messages": messages
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))


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