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

Получить подписку план по Id.

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



Category
--------


Scraper
-------


