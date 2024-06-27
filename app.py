from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

DATABASE = 'tasks.db'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                done BOOLEAN NOT NULL CHECK (done IN (0, 1))
            )
        ''')
    print("Database initialized.")

@app.route('/tasks', methods=['GET'])
def get_tasks():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks")
        tasks = cursor.fetchall()
        return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    description = data.get('description', '')
    if description:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO tasks (description, done) VALUES (?, ?)", (description, False))
            conn.commit()
        return jsonify({'status': 'Task added.'}), 201
    return jsonify({'status': 'Invalid data.'}), 400

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    description = data.get('description', '')
    done = data.get('done', False)
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE tasks SET description = ?, done = ? WHERE id = ?", (description, done, task_id))
        conn.commit()
    return jsonify({'status': 'Task updated.'})

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
    return jsonify({'status': 'Task deleted.'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
