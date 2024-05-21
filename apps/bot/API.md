API
===

- Тестовый бот: @avito_speculant_test_bot
- $SESSION берем из /start бота и передаем в заголовке Authorization
- $BASE_URL для тестов https://slavaworkz.fvds.ru

User
----

Если activeSubscriptionId не Null то у пользователя есть оплаченная подписка.

```
userId: идентификатор пользователя
tgFromId: идентификатор телеграма
activeSubscriptionId: идентификатор подписки
subscriptions: количество подписок
categories: количество категорий
bots: количество ботов
createdAt: время создания
updatedAt: время обновления
```

GET /v1/user

Информация о юзере.

```
curl -X GET \
    -H "Authorization: $SESSION" \
    "$BASE_URL/v1/user"
```

Plan
----

```
planId - идентификатор тарифа
categoriesMax - максимальное количество категорий
durationDays - продолжительность дней
intervalSec - интервал для уведомлений
analyticsOn - аналитика
priceRub - цена в рублях
isEnabled - включен/выключен
```

GET /v1/plan/:planId

Получить тарифный план по Id.

```
# Получить тариф с идентификатором #1:
curl -X GET \
    -H "Authorization: $SESSION" \
    "$BASE_URL/v1/plan/1"
```

GET /v1/plans

Получить список всех тарифных планов.

```
# Список всех тарифных планов:
curl -X GET \
    -H "Authorization: $SESSION" \
    "$BASE_URL/v1/plans"
```

Subscription
------------

```
subscriptionId - идентификатор подписки
planId - идентификатор плана
priceRub - цена, может отличаться от цены тарифного плана
status - статус: wait, cancel, active, finish
createdAt - время создания
timeoutAt - время таймаута
finishAt - время окончания подписки
```

GET /v1/subscription/:subscriptionId

Получить подписку по Id.

```
# Получить подписку с идентификатором #1
curl -X GET \
    -H "Authorization: $SESSION" \
    "$BASE_URL/v1/subscription/1"
```

POST /subscription

  - planId - Идентификатор тарифного плана

Создание подписки

```
# Создать подписку для тарифного плана #1
curl -X POST \
    -H 'authorization: $SESSION' \
    -H 'Content-Type: application/json' \
    -d '{"planId":1}' \
    "$BASE_URL/v1/subscription"
```

PUT /subscription/:subscriptionId/cancel

Отмена подписки. Только для подписок со статусом 'wait'.

```
# Отменить подписку #1:
curl -X PUT \
    -H 'authorization: $SESSION' \
    -H 'Content-Type: application/json' \
    -d '{}' \
    "$BASE_URL/v1/subscription/1"
```

GET /v1/subscriptions

Получить все подписки пользователя.

```
# Все подписки пользователя:
curl -X GET \
    -H "Authorization: $SESSION" \
    "$BASE_URL/v1/subscriptions"
```

Bot
---

```
botId - идентификатор бота
token - токен бота
isLinked - бот подключен к категории?
isEnabled - бот включен?
isOnline - бот онлайн?, NULL
tgFromId - идентификатор телеграма, NULL
username - пользователь телеграма, NULL
totalCount - общий счетчик проверок, NULL
successCount - успешный счетчик проверок, NULL
createdAt - время создания
updatedAt - время обновления

```

GET /v1/bot/:botId

Получить бота по Id.


POST /v1/bot

  - token - токен бота

Создать бота.


PUT /v1/bot/:botId/enable

Включить бота.

PUT /v1/bot/:botId/disable

Выключить бота.

GET /v1/bots

Список ботов пользователя.

Category
--------

```
categoryId - идентификатор категории
urlPath - путь url для авито
botId - идентификатор бота, NULL
scraperId - идентификатор скрапера, NULL
isEnabled - категория включена?
createdAt - время создания
updatedAt - время обновления
reportedAt - время для отчета, NULL

```

GET /v1/category/:categoryId

Получить категорию по Id.


POST /v1/category

  - urlPath - путь из url авито

Создать категорию.


PUT /v1/category/:categoryId/enable

Включить категорию.

PUT /v1/category/:categoryId/disable

Выключить категорию.

GET /v1/categories

Список категорий пользователя.

Scraper
-------

```
scraperId - идентификатор скрапера
urlPath - путь из url авито
totalCount - все запросы
successCount - успешные запросы
```

GET /v1/scraper/:scraperId

Получить скрапер по Id.

