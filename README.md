# LoRA-адаптеры и эффективная донастройка нейросетевых моделей

Статический учебный курс на русском языке для GitHub Pages.

## Состав

- `index.html` — оглавление курса.
- `lectures/lecture1.html` ... `lectures/lecture8.html` — восемь лекций.
- `practicals/practical1.html` ... `practicals/practical8.html` — восемь практических заданий по 20 пунктов.
- `test.html` — итоговый тест из 36 вопросов пяти типов.
- `game.html` — обучающая игра "LoRA Quest: Adapter Engineer".
- `css/style.css` — адаптивная светлая и темная тема, liquid glass-панели, визуальные вкладки, карточки и тренажёры.
- `js/main.js` — тема, вкладки, калькулятор LoRA-параметров, LoRA Config Studio, LoRA Quest, прогресс, уведомления, drag-and-drop и проверка теста.

## Интерактивные элементы

- Визуальная схема LoRA на главной странице.
- Вкладки: карта курса, методы PEFT, пайплайн обучения, деплой.
- Калькулятор числа параметров LoRA для заданных `d_out`, `d_in` и `r`.
- Лаборатория LoRA-параметров со слайдерами `rank`, `alpha`, `dropout` и QLoRA-переключателем.
- В лекциях есть мини-тесты и короткие примеры того, как тема применяется в реальном ML/LLM-проекте.
- LoRA Config Studio остаётся в практических заданиях: помогает собрать `LoraConfig`, выбрать `target_modules`, QLoRA, batch size, sequence length, learning rate и validation split.
- Практические страницы сохраняют заметки в `localStorage` и дают честную проверку конфигурационного плана: Studio показывает live-preview конфига, предупреждает про высокий rank/alpha, отсутствие validation split, неподходящие target modules и риск OOM.
- Командная палитра `Ctrl+K` для быстрого перехода по сайту.
- LoRA Quest с пятью миссиями Adapter Engineer: full fine-tuning vs LoRA, rank/alpha/dropout, target_modules, QLoRA survival, eval и deploy.
- Сессионные достижения за удачные действия.
- Учебные уведомления используются только для явных действий пользователя: прогресс, проверка заданий и достижения.

Важно: сайт не запускает Python в браузере. Все интерактивные проверки работают как статический помощник по конфигурации и инженерным рискам.

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
