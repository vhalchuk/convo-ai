# Base image for Python
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Install Python dependencies
COPY requirements/app.txt requirements/app.txt
RUN pip install --no-cache-dir -r requirements/app.txt

# Copy the rest of the application code
COPY . .

# Expose the server port
EXPOSE 8000

# Start the server with watchmedo for live reloading
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
