document.addEventListener("DOMContentLoaded", () => {
    class Task {
        constructor(description) {
            this.description = description;
            this.done = false;
        }
    }

    class TodoList {
        constructor() {
            this.tasks = [];
        }

        addTask(description) {
            const task = new Task(description);
            this.tasks.push(task);
            this.renderTasks();
        }

        deleteTask(index) {
            this.tasks.splice(index, 1);
            this.renderTasks();
        }

        toggleDone(index) {
            this.tasks[index].done = !this.tasks[index].done;
            this.renderTasks();
        }

        editTask(index, newDescription) {
            this.tasks[index].description = newDescription;
            this.renderTasks();
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

    const todoList = new TodoList();

    document.getElementById("add-task-btn").onclick = () => {
        const taskInput = document.getElementById("new-task");
        const taskText = taskInput.value.trim();
        if (taskText) {
            todoList.addTask(taskText);
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
