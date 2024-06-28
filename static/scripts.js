document.addEventListener("DOMContentLoaded", async () => {
    class Task {
        constructor(uuid, description) {
            this.uuid = uuid
            this.description = description;
            this.done = false;
        }
    }

    class TodoList {
        constructor(list) {
            this.tasks = list;
        }

        async addTask(description) {
            const task = new Task(crypto.randomUUID(), description);
            this.tasks.push(task);
            
            await fetch("/tasks", {
                method: 'POST',
                body: JSON.stringify({
                    'uuid': task.uuid,
                    'description': task.description,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            this.renderTasks();
        }

        async deleteTask(index) {
            let deletedTask = this.tasks[index];
            console.log(deletedTask)
            this.tasks.splice(index, 1);
            this.renderTasks();

            await fetch(`/tasks/${deletedTask.uuid}`, {
                method: 'DELETE',
            });
        }

        async toggleDone(index) {
            this.tasks[index].done = !this.tasks[index].done;
            let updatedTask = this.tasks[index];
            this.renderTasks();

            await fetch(`/tasks/${updatedTask.uuid}`, {
                method: 'PUT',
                body: JSON.stringify(updatedTask),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        async editTask(index, newDescription) {
            this.tasks[index].description = newDescription;
            let updatedTask = this.tasks[index];
            this.renderTasks();

            await fetch(`/tasks/${updatedTask.uuid}`, {
                method: 'PUT',
                body: JSON.stringify(updatedTask),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        renderTasks() {
            const taskList = document.getElementById("task-list");
            taskList.innerHTML = "";
            this.tasks.forEach((task, index) => {
                const taskItem = document.createElement("li");
                taskItem.innerHTML = `
                    <span class="task-number">${index + 1}.</span>
                    <span class="task-text">${task.description}</span>
                    <div class="task-buttons">
                        <button class="done-btn" onclick="toggleDone(${index})">Done</button>
                        <button class="edit-btn" onclick="editTask(${index})">Edit</button>
                        <button class="save-btn" onclick="saveTask(${index})" style="display:none;">Save</button>
                        <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
                    </div>
                `;
                if (task.done) {
                    taskItem.classList.add("done");
                }
                taskList.appendChild(taskItem);
            });
        }
    }

    const todoList = new TodoList(JSON.parse(await (await fetch('/tasks')).text()));
    todoList.renderTasks();

    document.getElementById("add-task-btn").onclick = async () => {
        const taskInput = document.getElementById("new-task");
        const taskText = taskInput.value.trim();
        if (taskText) {
            await todoList.addTask(taskText);
            taskInput.value = "";
        } else {
            alert("Please enter a task.");
        }
    };

    window.deleteTask = (index) => {
        todoList.deleteTask(index);
    };

    window.toggleDone = (index) => {
        todoList.toggleDone(index);
    };

    window.editTask = (index) => {
        const taskItem = document.getElementById("task-list").children[index];
        const taskText = taskItem.querySelector(".task-text");
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = taskText.textContent;
        editInput.className = "edit-input";
        taskItem.replaceChild(editInput, taskText);
        taskItem.querySelector(".edit-btn").style.display = "none";
        taskItem.querySelector(".save-btn").style.display = "inline-block";
    };

    window.saveTask = (index) => {
        const taskItem = document.getElementById("task-list").children[index];
        const editInput = taskItem.querySelector(".edit-input");
        const newDescription = editInput.value.trim();
        if (newDescription) {
            todoList.editTask(index, newDescription);
        } else {
            alert("Please enter a task description.");
        }
    };
});
