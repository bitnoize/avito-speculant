@avito-speculant/redis
----------------------

Модели и коллекции в Редисе

Стек:

* [Redis](https://redis.io/) - Старый добрый Редис 😄

Реализует сервисы:

* redisService - общий сервис
* systemService
* userCacheService - Пользователи
* planCacheService - Тарифные планы
* subscriptionCacheService - Подписки
* categoryCacheService - Категории

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

