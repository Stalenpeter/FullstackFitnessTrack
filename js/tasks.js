(function () {
    const STORAGE_KEY = 'fittrackTasks';

    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // If this page doesn't have a task section, do nothing
    if (!taskInput || !addBtn || !taskList) {
        return;
    }

    let tasks = [];

    // -----------------------
    // Storage helpers
    // -----------------------
    function loadTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            tasks = raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load tasks from storage', e);
            tasks = [];
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('Failed to save tasks to storage', e);
        }
    }

    // -----------------------
    // Rendering
    // -----------------------
    function createTaskElement(task) {
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center border-bottom py-2';
        wrapper.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input m-0';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', function () {
            toggleTaskCompleted(task.id);
        });

        const textContainer = document.createElement('div');
        textContainer.className = 'w-100 ms-3';

        const innerRow = document.createElement('div');
        innerRow.className = 'd-flex w-100 align-items-center justify-content-between';

        const textSpan = document.createElement('span');
        if (task.completed) {
            const del = document.createElement('del');
            del.textContent = task.text;
            textSpan.appendChild(del);
        } else {
            textSpan.textContent = task.text;
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm text-muted';
        deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
        deleteBtn.addEventListener('click', function () {
            deleteTask(task.id);
        });

        innerRow.appendChild(textSpan);
        innerRow.appendChild(deleteBtn);
        textContainer.appendChild(innerRow);

        wrapper.appendChild(checkbox);
        wrapper.appendChild(textContainer);

        return wrapper;
    }

    function renderTasks() {
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'text-muted small py-2';
            empty.textContent = 'No tasks yet. Add your first task above.';
            taskList.appendChild(empty);
            return;
        }

        tasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }

    // -----------------------
    // Mutations
    // -----------------------
    function addTask(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        const now = new Date();
        const id = now.getTime().toString() + '_' + Math.random().toString(16).slice(2);

        const newTask = {
            id,
            text: trimmed,
            completed: false,
            createdAt: now.toISOString()
        };

        // Add to top
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
    }

    function toggleTaskCompleted(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return {
                    ...task,
                    completed: !task.completed
                };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    // -----------------------
    // Event bindings
    // -----------------------
    addBtn.addEventListener('click', function () {
        addTask(taskInput.value);
        taskInput.value = '';
        taskInput.focus();
    });

    taskInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask(taskInput.value);
            taskInput.value = '';
        }
    });

    // -----------------------
    // Init
    // -----------------------
    loadTasks();
    renderTasks();
})();
