# Правила аудита SEO, производительности и мультиязычности

## Цель
Предоставить стандартные операционные процедуры для аудита технического SEO, скорости загрузки, микроразметки Schema и доступности для ИИ-сканеров по всем языковым маршрутам (`?lang=lt`, `?lang=en`, `?lang=ru`).

## Порядок действий
1. Откройте веб-интерфейс каждого из указанных ниже инструментов.
2. Введите URL целевого сайта (например, `[https://website.ivoev.workers.dev/](https://website.ivoev.workers.dev/)/`).
3. Запустите проверку и убедитесь, что показатели соответствуют нормам SEO и микроразметки.

## Спецификация инструментов

### 1. Google PageSpeed Insights
- **URL инструмента:** https://pagespeed.web.dev/
- **Сфера проверки:** Техническое SEO, удобство для мобильных устройств, доступность (Accessibility), метрики Core Web Vitals и базовая структура HTML-метатегов.
- **Целевой URL:** Основной адрес сайта (`[https://website.ivoev.workers.dev/](https://website.ivoev.workers.dev/)/`).

### 2. Google Rich Results Test
- **URL инструмента:** https://search.google.com/test/rich-results
- **Сфера проверки:** Валидация микроразметки JSON-LD (`LegalService` / Schema.org) и извлечение данных для Графа знаний Google и ИИ-алгоритмов.
- **Целевой URL:** Основной адрес сайта (`[https://website.ivoev.workers.dev/](https://website.ivoev.workers.dev/)/`).

### 3. Merkle Hreflang Testing Tool
- **URL инструмента:** https://technicalseo.com/tools/hreflang/
- **Сфера проверки:** Проверка перекрестных языковых тегов `hreflang` для параметров запроса (`?lang=lt`, `?lang=en`, `?lang=ru`).
- **Целевой URL:** Страницы с языковыми параметрами.

### 4. Ручная проверка читаемости для ИИ (`llms.txt`)
- **URL инструмента:** `[https://yourdomain.lt/llms.txt](https://website.ivoev.workers.dev/llms.txt)`
- **Сфера проверки:** Подтверждение отдачи чистого текста для поисковых ИИ-сканеров и языковых моделей (LLM).
- **Действие:** Перейдите по адресу `[https://yourdomain.lt/llms.txt](https://website.ivoev.workers.dev/llms.txt)` в обычном браузере для проверки исходного текстового вывода.
