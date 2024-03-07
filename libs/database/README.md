@avito-speculant/database
-------------------------

Модели и коллекции в базе данных.

Стек:

* [PostgreSQL](https://www.postgresql.org/) - Старый добрый Постгрис 😄
* [Kysely](https://kysely.dev/) - Конструктор SQL запросов

Реализует сервисы:

* databaseService - общий сервис
* userService - Пользователи
* userLogService - Логи пользователей
* planService - Тарифные планы
* planLogService - Логи тарифных планов
* subscriptionService - Подписки
* subscriptionLogService - Логи подписок
* categoryService - Категории
* categoryLogService - Логи категорий
* proxyService - Прокси
* proxyLogService - Логи проксей

```
# Собрать модуль
npm -w @avito-speculant/database run build

# Отформатировать код
npm -w @avito-speculant/database run format

# Статический анализ кода
npm -w @avito-speculant/database run lint

# Удалить временные файлы
npm -w @avito-speculant/database run clean
```

