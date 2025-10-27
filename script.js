document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const emptyState = document.getElementById('emptyState');
    
    // Загрузка задач из localStorage при загрузке страницы
    loadTasks();
    
    // Обработчик отправки формы
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (title) {
            addTask(title, description);
            titleInput.value = '';
            descriptionInput.value = '';
            
            // Сохранение задач в localStorage
            saveTasks();
        }
    });
    
    // Функция добавления задачи
    function addTask(title, description) {
        // Скрываем сообщение о пустом списке
        emptyState.style.display = 'none';
        
        // Создаем карточку задачи
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(title)}</h3>
            </div>
            ${description ? `<p class="task-description">${escapeHtml(description)}</p>` : ''}
            <div class="task-actions">
                <button class="btn btn-delete">Удалить</button>
            </div>
        `;
        
        // Добавляем обработчик удаления
        const deleteBtn = taskCard.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', function() {
            taskCard.remove();
            
            // Проверяем, остались ли задачи
            if (tasksContainer.children.length === 1) { // только emptyState
                emptyState.style.display = 'block';
            }
            
            // Сохранение задач в localStorage
            saveTasks();
        });
        
        // Добавляем карточку в контейнер
        tasksContainer.appendChild(taskCard);
    }
    
    // Функция сохранения задач в localStorage
    function saveTasks() {
        const tasks = [];
        const taskCards = document.querySelectorAll('.task-card');
        
        taskCards.forEach(card => {
            const title = card.querySelector('.task-title').textContent;
            const descriptionElement = card.querySelector('.task-description');
            const description = descriptionElement ? descriptionElement.textContent : '';
            
            tasks.push({ title, description });
        });
        
        localStorage.setItem('dailyPlannerTasks', JSON.stringify(tasks));
    }
    
    // Функция загрузки задач из localStorage
    function loadTasks() {
        const savedTasks = localStorage.getItem('dailyPlannerTasks');
        
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            
            if (tasks.length > 0) {
                emptyState.style.display = 'none';
                
                tasks.forEach(task => {
                    addTask(task.title, task.description);
                });
            }
        }
    }
    
    // Функция для экранирования HTML-символов (защита от XSS)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
