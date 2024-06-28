from flask import Flask, request, jsonify
import flask
import sqlite3

app = Flask(__name__)

DATABASE = 'tasks.db'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT NOT NULL,
                description TEXT NOT NULL,
                done BOOLEAN NOT NULL CHECK (done IN (0, 1))
            )
        ''')
    print("Database initialized.")

@app.route('/')
def get_root():
    return flask.send_file('index.html', mimetype='text/html')

@app.route('/tasks', methods=['GET'])
def get_tasks():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks")
        tasks = cursor.fetchall()
        return jsonify([{ 'uuid': task[1], 'description': task[2], 'done': task[3] > 0 } for task in tasks])

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    description = data.get('description', '')
    uuid = data.get('uuid', '')
    if description:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO tasks (uuid, description, done) VALUES (?, ?, ?)", (uuid, description, False))
            conn.commit()
        return jsonify({'status': 'Task added.'}), 201
    return jsonify({'status': 'Invalid data.'}), 400

@app.route('/tasks/<task_uuid>', methods=['PUT'])
def update_task(task_uuid):
    data = request.json
    description = data.get('description', '')
    done = data.get('done', False)
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE tasks SET description = ?, done = ? WHERE uuid = ?", (description, done, task_uuid))
        conn.commit()
    return jsonify({'status': 'Task updated.'})

@app.route('/tasks/<task_uuid>', methods=['DELETE'])
def delete_task(task_uuid):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE uuid = ?", (task_uuid,))
        conn.commit()
    return jsonify({'status': 'Task deleted.'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
