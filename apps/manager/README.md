@avito-speculant/manager
------------------------

Команды **system**:

* start - Запустить кластер
* stop - Остановить кластер
* status - Показать статус

```
# Получить текущий статус
docker compose run manager -- system status | pino-pretty

# Остановить кластер
docker compose run manager -- system stop | pino-pretty

# Запустить кластер
docker compose run manager -- system start | pino-pretty

```

Команды **database**:

* migrations - Применить миграции
* list-users - Список пользователей
* list-user-logs - Логи пользователя
* create-plan - Создать тарифный план
* update-plan - Обновить тарифный план
* enable-plan - Включить тарифный план
* disable-plan - Выключить тарифный план
* list-plans - Список тарифных планов
* list-plan-logs - Логи тарифного плана
* create-subscription - Создать подписку для пользователя
* activate-subscription - Активировать подписку для пользователя
* list-subscriptions - Список подписок
* list-subscription-logs - Логи подписки
* create-category - Создать категорию для пользователя
* enable-category - Включить категорию
* disable-category - Выключить категорию
* list-categories - Список категорий
* list-category-logs - Логи категории

```
# Создать тарифный план
npm -w @avito-speculant/manager run start -- database create-plan \
    --categories-max 3 \
    --price-rub 1000 \
    --duration-days 7 \
    --interval-sec 10 \
    --analytics-on 1 | pino-pretty

# Создать подписку для пользователя в тестовых целях
npm -w @avito-speculant/manager run start -- database create-subscription \
    <USER_ID> <PLAN_ID> | pino-pretty

# Активировать подписку для пользователя в тестовых целях
npm -w @avito-speculant/manager run start -- database activate-subscription \
    <SUBSCRIPTION_ID> | pino-pretty

# Список всех подписок пользователя
npm -w @avito-speculant/manager run start -- database list-subscriptions \
    <USER_ID> | pino-pretty

...
```

Команды **queue**

* monitor-heartbeat
* monitor-business
* monitor-scraper
* monitor-proxycheck

```
# Мониторинг состояния заданий в очереди **heartbeat** для отладки
npm -w @avito-speculant/manager run start -- queue monitor-heartbeat | pino-pretty
```

