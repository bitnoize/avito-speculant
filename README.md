Avito-Speculant
===============

Библиотеки:

* [@avito-speculant/config](https://github.com/bitnoize/avito-speculant/tree/main/libs/config)
* [@avito-speculant/logger](https://github.com/bitnoize/avito-speculant/tree/main/libs/logger)
* [@avito-speculant/database](https://github.com/bitnoize/avito-speculant/tree/main/libs/database)
* [@avito-speculant/redis](https://github.com/bitnoize/avito-speculant/tree/main/libs/redis)
* [@avito-speculant/queue](https://github.com/bitnoize/avito-speculant/tree/main/libs/queue)

Приложения:
* [@avito-speculant/bot](https://github.com/bitnoize/avito-speculant/tree/main/apps/bot) - Телеграм бот
* [@avito-speculant/manager](https://github.com/bitnoize/avito-speculant/tree/main/apps/manager) - Консольное приложения для управления кластером
* [@avito-speculant/worker-heartbeat](https://github.com/bitnoize/avito-speculant/tree/main/apps/worker-heartbeat) - Воркер для очереди **heartbeat**
* [@avito-speculant/worker-business](https://github.com/bitnoize/avito-speculant/tree/main/apps/worker-business) - Воркер для очереди **business**
* [@avito-speculant/worker-proxycheck](https://github.com/bitnoize/avito-speculant/tree/main/apps/worker-proxycheck) - Воркер для очереди **proxycheck**
* [@avito-speculant/worker-scraper](https://github.com/bitnoize/avito-speculant/tree/main/apps/worker-scraper) - Воркер для очереди **scraper**

```
# Собрать все модули
npm --ws run build

# Отформатировать код для всех модулей
npm --ws run format

# Статический анализ кода всех модулей
npm --ws run lint

# Удалить временные файлы всех модулей
npm --ws run clean
```

