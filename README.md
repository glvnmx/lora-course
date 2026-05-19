# LoRA-адаптеры и эффективная донастройка нейросетевых моделей

Статический учебный курс на русском языке для GitHub Pages.

## Состав

- `index.html` — оглавление курса.
- `lectures/lecture1.html` ... `lectures/lecture8.html` — восемь лекций.
- `practicals/practical1.html` ... `practicals/practical8.html` — восемь практических заданий по 20 пунктов.
- `test.html` — итоговый тест из 36 вопросов пяти типов.
- `css/style.css` — адаптивная светлая и темная тема.
- `js/main.js` — навигационная логика, тема, drag-and-drop и проверка теста.

## Локальный запуск

Откройте `index.html` в браузере. Сайт не требует сборки, npm или сервера.

## GitHub Pages

1. Создайте пустой репозиторий на GitHub.
2. Выполните команды из папки проекта:

```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

3. В GitHub откройте `Settings -> Pages`.
4. В разделе `Build and deployment` выберите `Deploy from a branch`.
5. Укажите ветку `main` и папку `/root`, затем сохраните.
