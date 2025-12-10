document.addEventListener('DOMContentLoaded', initTaskManager);

function initTaskManager() {
    // Конфигурация
    const CONFIG = {
        PRIORITY_MAP: {
            low: { text: 'Низкий', class: 'priority-low' },
            medium: { text: 'Средний', class: 'priority-medium' },
            high: { text: 'Высокий', class: 'priority-high' }
        },
        STORAGE_KEY: 'tasks',
        NOTIFICATION_DURATION: 3000
    };

    // Элементы DOM
    const DOM = {
        addTaskForm: document.getElementById('addTaskForm'),
        taskTitleInput: document.getElementById('taskTitle'),
        taskDescriptionInput: document.getElementById('taskDescription'),
        taskPriorityInput: document.getElementById('taskPriority'),
        tasksList: document.getElementById('tasksList'),
        taskCount: document.getElementById('taskCount'),
        emptyState: document.getElementById('emptyState'),
        clearAllBtn: document.getElementById('clearAllBtn')
    };

    // Состояние приложения
    let state = {
        tasks: loadTasksFromStorage()
    };

    // Инициализация
    function initialize() {
        setupEventListeners();
        render();
        DOM.taskTitleInput.focus();
    }

    // Работа с хранилищем
    function loadTasksFromStorage() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            return [];
        }
    }

    function saveTasksToStorage() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.tasks));
        } catch (error) {
            console.error('Ошибка сохранения задач:', error);
        }
    }

    // Утилиты
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTaskWord(count) {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastDigit === 1 && lastTwoDigits !== 11) return 'задача';
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) return 'задачи';
        return 'задач';
    }

    function generateTaskId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Создание элементов
    function createTaskElement(task) {
        const priority = CONFIG.PRIORITY_MAP[task.priority] || CONFIG.PRIORITY_MAP.medium;
        
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${priority.class}`;
        taskCard.dataset.taskId = task.id;
        
        const header = document.createElement('div');
        header.className = 'task-header';
        
        const title = document.createElement('h3');
        title.className = 'task-title';
        title.textContent = task.title;
        
        const priorityBadge = document.createElement('span');
        priorityBadge.className = `task-priority ${priority.class}`;
        priorityBadge.textContent = priority.text;
        
        header.appendChild(title);
        header.appendChild(priorityBadge);
        
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.innerHTML = '🗑️ Удалить';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        actions.appendChild(deleteBtn);
        
        taskCard.appendChild(header);
        
        if (task.description) {
            const description = document.createElement('p');
            description.className = 'task-description';
            description.textContent = task.description;
            taskCard.appendChild(description);
        }
        
        taskCard.appendChild(actions);
        
        return taskCard;
    }

    function createNotification(message, type = 'info') {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: colors[type] || colors.info,
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, CONFIG.NOTIFICATION_DURATION);
    }

    // Операции с задачами
    function addTask(title, description, priority) {
        const newTask = {
            id: generateTaskId(),
            title: title.trim(),
            description: description.trim(),
            priority: priority || 'medium',
            createdAt: new Date().toISOString(),
            completed: false
        };
        
        state.tasks.push(newTask);
        saveTasksToStorage();
        render();
        createNotification('Задача успешно добавлена!', 'success');
    }

    function deleteTask(taskId) {
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            createNotification('Задача не найдена', 'error');
            return;
        }
        
        const taskTitle = state.tasks[taskIndex].title;
        
        if (confirm(`Вы уверены, что хотите удалить задачу "${taskTitle}"?`)) {
            state.tasks.splice(taskIndex, 1);
            saveTasksToStorage();
            render();
            createNotification(`Задача "${taskTitle}" удалена`, 'info');
        }
    }

    function clearAllTasks() {
        if (state.tasks.length === 0) {
            createNotification('Нет задач для очистки', 'info');
            return;
        }
        
        const taskCount = state.tasks.length;
        const taskWord = formatTaskWord(taskCount);
        
        if (confirm(`Вы уверены, что хотите удалить все задачи (${taskCount} ${taskWord})?`)) {
            state.tasks = [];
            saveTasksToStorage();
            render();
            createNotification('Все задачи удалены', 'info');
        }
    }

    // Рендеринг
    function render() {
        renderTaskList();
        renderTaskCount();
        updateEmptyState();
    }

    function renderTaskList() {
        DOM.tasksList.innerHTML = '';
        
        state.tasks.forEach(task => {
            DOM.tasksList.appendChild(createTaskElement(task));
        });
    }

    function renderTaskCount() {
        const count = state.tasks.length;
        DOM.taskCount.textContent = `${count} ${formatTaskWord(count)}`;
    }

    function updateEmptyState() {
        const hasTasks = state.tasks.length > 0;
        
        DOM.emptyState.style.display = hasTasks ? 'none' : 'block';
        DOM.clearAllBtn.style.display = hasTasks ? 'inline-flex' : 'none';
    }

    // Обработчики событий
    function setupEventListeners() {
        DOM.addTaskForm.addEventListener('submit', handleFormSubmit);
        DOM.clearAllBtn.addEventListener('click', clearAllTasks);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        
        const title = DOM.taskTitleInput.value;
        const description = DOM.taskDescriptionInput.value;
        const priority = DOM.taskPriorityInput.value;
        
        if (!title.trim()) {
            createNotification('Пожалуйста, введите название задачи', 'error');
            DOM.taskTitleInput.focus();
            return;
        }
        
        addTask(title, description, priority);
        
        // Сброс формы
        DOM.addTaskForm.reset();
        DOM.taskPriorityInput.value = 'medium';
        DOM.taskTitleInput.focus();
    }

    // Запуск
    initialize();
}
