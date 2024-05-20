API
===

Авторизация через заголовок Authorization:

```
curl -X GET https://slavaworkz.fvds.ru/api/v1/bots -H 'Authorization: 793d7220a8924816a7ce375b42f224f4' | jq .
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

GET /v1/plans

Получить список всех тарифных планов.

```
curl -X GET \
  -H 'Authorization: <SESSION>' \
  https://slavaworkz.fvds.ru/v1/plans \
  | jq .
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

POST /subscription

  - planId - Идентификатор тарифного плана

Bot
---

Category
--------

