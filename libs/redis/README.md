@avito-speculant/redis
----------------------

Операционное хранилище

Стек:

* [Redis](https://redis.io/) - Старый добрый Редис 😄
* [Lua Scripting](https://redis.io/docs/interact/programmability/eval-intro/) - Функции на Lua

Реализует сервисы:

* redisService - общий сервис
* systemService
* userCacheService - Пользователи
* planCacheService - Тарифные планы
* subscriptionCacheService - Подписки
* categoryCacheService - Категории
* proxyCacheService - Прокси
* scraperCacheService - Парсер
* advertCacheService - Объявления

Смена пароля для юзера default Редиса:

```
ACL SETUSER default on >secret sanitize-payload ~* &* +@all

```

