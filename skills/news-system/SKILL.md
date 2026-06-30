---
name: news-system
description: Fetch and summarize AI/crypto news for morning briefing
version: 1.0
author: Lola
created: 2026-05-16
---

# News System

## Providers
- **Tavily API** — Web search for latest news (primary)
- **The Rundown** — Email newsletter via Gmail (priority source)

## Scripts
- `enhanced_news_system.py` — News fetching and summarization
- `generate_daily_news.sh` — Shell wrapper for news generation

## Topics
- AI/tech news (primary)
- Cryptocurrency (Bitcoin)
- General interest when relevant

## Integration
- News snippet included in morning briefing daily
- The Rundown summary is prioritized over web-scraped news
- Sources: Web search → Tavily, Newsletter → Gmail IMAP

## Style
- Brief, punchy summaries (2-3 bullet points max)
- Link to full article if interesting
- No process narration
