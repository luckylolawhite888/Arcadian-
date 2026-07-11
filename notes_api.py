import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import datetime

DATA_FILE = '/root/lola-notes/notes.json'
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

def load_notes():
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_notes(notes):
    with open(DATA_FILE, 'w') as f:
        json.dump(notes, f, indent=2)

class NotesHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        notes = load_notes()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(notes).encode())

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode()
        data = json.loads(body) if body else {}
        
        notes = load_notes()
        note = {
            'id': 'note_' + str(int(datetime.datetime.now().timestamp() * 1000)),
            'title': data.get('title', 'Untitled'),
            'body': data.get('body', ''),
            'created': datetime.datetime.now().isoformat(),
            'updated': datetime.datetime.now().isoformat()
        }
        notes.insert(0, note)
        save_notes(notes)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(note).encode())

    def do_DELETE(self):
        parsed = urlparse(self.path)
        note_id = parsed.path.rstrip('/').split('/')[-1]
        notes = load_notes()
        notes = [n for n in notes if n.get('id') != note_id]
        save_notes(notes)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'ok': True}).encode())

    def do_PUT(self):
        parsed = urlparse(self.path)
        note_id = parsed.path.rstrip('/').split('/')[-1]
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode()
        data = json.loads(body) if body else {}
        
        notes = load_notes()
        for n in notes:
            if n.get('id') == note_id:
                n['title'] = data.get('title', n['title'])
                n['body'] = data.get('body', n['body'])
                n['updated'] = datetime.datetime.now().isoformat()
                break
        save_notes(notes)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'ok': True}).encode())

if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 8022), NotesHandler)
    print('Notes API running on port 8022')
    server.serve_forever()
