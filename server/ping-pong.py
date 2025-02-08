import socket
import threading
import base64
import hashlib

GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def do_handshake(client):
    request = client.recv(1024).decode('utf-8')
    headers = {}
    for line in request.split("\r\n"):
        if ": " in line:
            key, value = line.split(": ", 1)
            headers[key.strip()] = value.strip()
    key = headers.get("Sec-WebSocket-Key")
    if not key:
        client.close()
        return False
    accept = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
    response = (
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept}\r\n\r\n"
    )
    client.send(response.encode())
    return True

def recv_frame(client):
    # Read the first 2 bytes of the frame header
    header = client.recv(2)
    if not header:
        return None, None
    b1, b2 = header[0], header[1]
    opcode = b1 & 0x0F
    mask = b2 & 0x80
    length = b2 & 0x7F

    if length == 126:
        length = int.from_bytes(client.recv(2), 'big')
    elif length == 127:
        length = int.from_bytes(client.recv(8), 'big')

    if mask:
        masking_key = client.recv(4)
        payload = bytearray(client.recv(length))
        payload = bytes(b ^ masking_key[i % 4] for i, b in enumerate(payload))
    else:
        payload = client.recv(length)
    return opcode, payload

def send_frame(client, message, opcode=1):
    # Create a simple text frame (FIN set, opcode=1)
    encoded = message.encode('utf-8')
    frame = bytearray()
    frame.append(0x80 | opcode)  # FIN + opcode
    length = len(encoded)
    if length < 126:
        frame.append(length)
    elif length < (1 << 16):
        frame.append(126)
        frame.extend(length.to_bytes(2, 'big'))
    else:
        frame.append(127)
        frame.extend(length.to_bytes(8, 'big'))
    frame.extend(encoded)
    client.send(frame)

def handle_client(client, addr):
    print(f"Client connected: {addr}")
    if not do_handshake(client):
        print("Handshake failed")
        return

    while True:
        try:
            opcode, payload = recv_frame(client)
            if opcode is None:
                break

            # Handle connection close
            if opcode == 8:
                print("Client requested close")
                break

            # If it's a ping frame (opcode 9), reply with a pong (opcode 10)
            if opcode == 9:
                frame = bytearray()
                frame.append(0x80 | 0xA)  # FIN + pong opcode (10)
                length = len(payload)
                if length < 126:
                    frame.append(length)
                elif length < (1 << 16):
                    frame.append(126)
                    frame.extend(length.to_bytes(2, 'big'))
                else:
                    frame.append(127)
                    frame.extend(length.to_bytes(8, 'big'))
                frame.extend(payload)
                client.send(frame)
                continue

            # For a text frame (opcode 1), echo "pong" if message is "ping"
            if opcode == 1:
                text = payload.decode('utf-8')
                print(f"Received message: {text}")
                if text.lower() == "ping":
                    send_frame(client, "pong")
                else:
                    send_frame(client, f"Echo: {text}")
        except Exception as e:
            print("Error:", e)
            break
    client.close()
    print(f"Client disconnected: {addr}")

def start_server(port=8000):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("0.0.0.0", port))
    server.listen(5)
    print(f"WebSocket server listening on port {port}")
    try:
        while True:
            client, addr = server.accept()
            threading.Thread(target=handle_client, args=(client, addr), daemon=True).start()
    except KeyboardInterrupt:
        print("\nServer shutting down.")
    finally:
        server.close()

if __name__ == "__main__":
    start_server(8000)
