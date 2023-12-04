// Функция добавления кнопок редактирования и удаления к задаче
function addEditDeleteButtons(task_elem) {
    const editBtn = $('<span>')
        .addClass('edit-btn')
        .text('✎')
        .on('click', function () {
            const updatedTask = prompt('Редактировать задание:', task_elem.find('span.task-text').text());
            if (updatedTask !== null) {
                task_elem.find('span.task-text').text(updatedTask);
            }
        });

    const deleteBtn = $('<span>')
        .addClass('edit-btn')
        .text('❌')
        .on('click', function () {
            if (task_elem.hasClass('important')) {
                // Если задача важная, показываем модальное окно подтверждения удаления
                const confirmDelete = confirm('Вы уверены, что хотите удалить этот важный пост?');
                if (confirmDelete) {
                    task_elem.remove();
                }
            } else {
                task_elem.remove();
            }
        });

    task_elem.append(editBtn).append(deleteBtn);
}

// Функция для получения имени пользователя по его ID
async function fetchUserData(userId) {
    const userUrl = `https://jsonplaceholder.typicode.com/users/${userId}`;

    try {
        const response = await $.ajax({
            url: userUrl,
            method: 'get',
            dataType: 'json'
        });

        return response.name;
    } catch (error) {
        return 'Unknown User';
    }
}

// Функция для отображения ошибки
function showError(message) {
    $('#userIdError').text(message);
}

// Обработчик события при отправке формы
$('#taskForm').on('submit', async function (e) {
    e.preventDefault();

    const title = $('#title').val();
    const body = $('#body').val();
    const userId = $('#userId').val();
    const isImportant = $('#important').prop('checked');

    if (userId < 1 || userId > 10 || isNaN(userId)) {
        showError('Введите корректный ID пользователя (1-10).');
        return;
    } else {
        showError('');
    }

    // Создание элемента задачи
    const task_elem = $('<div>')
        .addClass('task')
        .append('<input type="checkbox">')
        .append(`<span class="task-text">${title}</span>`)
        .append('<div class="creator"></div>');

    if (isImportant) {
        task_elem.addClass('important');
    }

    // Добавление кнопок редактирования и удаления
    addEditDeleteButtons(task_elem);

    if (isImportant) {
        $('#tasks').prepend(task_elem);
    } else {
        $('#tasks').append(task_elem);
    }

    try {
        // Отправка данных на сервер и получение ответа
        const response = await $.ajax({
            url: 'https://jsonplaceholder.typicode.com/todos',
            method: 'post',
            dataType: 'json',
            data: {
                title: title,
                body: body,
                userId: userId,
                completed: false
            }
        });

        // Получение имени пользователя по ID и отображение создателя задачи
        const creatorName = await fetchUserData(userId);
        task_elem.find('.creator').text('Created by: ' + creatorName);

        console.log(response);
        console.log(JSON.stringify(response));
    } catch (error) {
        console.error(error);
    }
});

// Обработчик события при клике на чекбокс задачи
$('body').on('click', 'input[type="checkbox"]', function () {
    const task = $(this).parents('.task');

    if (task.hasClass('strikeout')) {
        task.removeClass('strikeout');
        if (task.hasClass('important')) {
            task.prependTo($('#tasks'));
        } else {
            task.appendTo($('#tasks'));
        }
    } else {
        task.addClass('strikeout');
        task.appendTo($('#done'));
    }
});

// Обработчики событий при наведении и уходе мыши с задачи
$('#tasks, #done').on('mouseenter', '.task', function () {
    $(this).find('.edit-btn').show();
});

$('#tasks, #done').on('mouseleave', '.task', function () {
    $(this).find('.edit-btn').hide();
});

// Функция для применения сохраненной темы
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        $('body, #tasks, #done').removeClass('light-mode dark-mode').addClass(savedTheme + '-mode');
    }
}

// Функция для переключения темы
function toggleTheme() {
    $('body').toggleClass('light-mode dark-mode');
    $('#tasks, #done').removeClass('light-mode dark-mode').addClass($('body').attr('class'));
    const currentTheme = $('body').hasClass('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
}

// Применение сохраненной темы при загрузке страницы
applyTheme();
