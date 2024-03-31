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

```
# Собрать модуль
npm -w @avito-speculant/redis run build

# Отформатировать код
npm -w @avito-speculant/redis run format

# Статический анализ кода
npm -w @avito-speculant/redis run lint

# Удалить временные файлы
npm -w @avito-speculant/redis run clean
```

