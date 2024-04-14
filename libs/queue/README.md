@avito-speculant/queue
----------------------

Очереди, задания и воркеры

Стек:

* [BullMQ](https://docs.bullmq.io/) - Продвинутая очередь заданий

Реализует сервисы:

* queueService
* heartbeatService
* treatmentService
* proxycheckService
* scrapingService
* broadcastService
* throttleService
* sendreportService

```
# Собрать модуль
npm -w @avito-speculant/queue run build

# Отформатировать код
npm -w @avito-speculant/queue run format

# Статический анализ кода
npm -w @avito-speculant/queue run lint

# Удалить временные файлы
npm -w @avito-speculant/queue run clean
```

