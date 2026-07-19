# Бенчмарк LLM-шлюза (LLM Gateway Benchmark)

**Воспроизводимый бенчмарк задержки, доступности и цены для OpenAI-совместимых
шлюзов нейросетей.** Без зависимостей (только встроенный Node.js),
автообновление через GitHub Actions. Безопасно по построению: не сохраняет ни
API-ключ, ни промпт, ни ответы моделей.

[English](README.md) · [Русский](README.ru.md) · [简体中文](README.zh-CN.md)

[![Try DaoXE](https://img.shields.io/badge/Попробовать_DaoXE-daoxe.com-ff6b6b)](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_badge&utm_term=ru)

> **Зачем это нужно:** «быстро и стабильно» — это заявление. Здесь оно
> превращается в число, которое вы можете перепроверить сами. Скрипт опрашивает
> набор моделей через OpenAI-совместимый шлюз и публикует **успешность запросов,
> задержку p50/p95 и цену за 1M токенов** в виде живой таблицы.

## 📊 Таблица результатов

Актуальная таблица — в файле **[`data/leaderboard.md`](data/leaderboard.md)**
(машиночитаемо: [`data/summary.json`](data/summary.json)). Она пересобирается при
каждом запуске.

> **⚠️ Значения в репозитории — ПРИМЕР (иллюстрация), а не реальное измерение.**
> Они нужны только чтобы таблица отображалась до первого платного запуска. Чтобы
> опубликовать реальные результаты — включите живой запуск (ниже). Требуется
> бюджет: `{{NEEDS_BENCHMARK_BUDGET}}`.

## Что измеряется

- **Доступность / успешность** — доля ответов `HTTP 200` за N повторов.
- **Задержка** — p50 / p95 / среднее для маленького фиксированного запроса.
- **Цена** — `$/1M` входных и выходных токенов из [`data/pricing.json`](data/pricing.json).

## Как запустить реальный бенчмарк

Режим определяется автоматически: если задан секрет `DAOXE_API_KEY` — запускается
**реальное** измерение, иначе обновляются **ПРИМЕРНЫЕ** данные (без расходов).

1. В **Settings → Secrets and variables → Actions**:
   - секрет **`DAOXE_API_KEY`** — ключ из кабинета [DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_setup&utm_term=ru);
   - переменная **`DAOXE_MODELS`** — точные ID моделей из `GET /v1/models` через запятую;
   - *(необязательно)* **`DAOXE_BASE_URL`** (по умолчанию `https://daoxe.com/v1`).
2. Впишите реальные цены в [`data/pricing.json`](data/pricing.json) со страницы
   [daoxe.com/pricing](https://daoxe.com/pricing). Ячейки `{{CONFIRM_PRICING}}`
   остаются, пока это не сделано.
3. Запустите workflow **benchmark** (вкладка Actions) или дождитесь ежедневного
   расписания. Результаты коммитятся автоматически.

## О DaoXE (шлюз по умолчанию)

[DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=gateway_benchmark&utm_content=readme_about&utm_term=ru) —
это OpenAI-совместимый мультимодельный мультипротокольный шлюз: OpenAI Chat
Completions, OpenAI Responses и **Anthropic Messages (Claude-протокол)** по адресу
`https://daoxe.com/v1`. Доступ к Claude / GPT / Gemini / DeepSeek / Kimi / Qwen /
Doubao через один base URL и один ключ. Примеры настройки (Cursor, Claude Code,
Cline и др.) — в **[seven7763/DaoXE-AI](https://github.com/seven7763/DaoXE-AI)**.

- Стартовый бонус при регистрации: `{{FREE_CREDIT}}` *(уточняется)*
- Русскоязычный канал поддержки: Telegram [@daoxe_ai](https://t.me/daoxe_ai)

> Раскрытие: DaoXE — сервис, который ведёт автор репозитория. Недоступен в
> материковом Китае. Бенчмарк устроен так, чтобы цифры можно было проверить
> самостоятельно.
