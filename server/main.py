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

# Initialize the OpenAI client
client = OpenAI(api_key=openai_api_key)


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read and parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            # Parse incoming JSON body
            try:
                received_data = json.loads(post_data)
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON format")
                return

            # Validate the structure of the received request
            messages = received_data.get("messages", None)
            if not messages or not isinstance(messages, list):
                self.send_error(400, "Invalid request: 'messages' field is required and must be an array")
                return

            # Check that all messages have the required structure
            for message in messages:
                if not isinstance(message, dict) or 'role' not in message or 'content' not in message:
                    self.send_error(400, "Invalid message format: Each message must have 'role' and 'content'")
                    return

            # Call the OpenAI API with the conversation so far
            try:
                completion = client.chat.completions.create(
                    model="gpt-4o-mini",  # Use GPT-4 or any appropriate model
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

            # Debug: Final response being sent
                print("Final response (messages) being sent to client:", messages)

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