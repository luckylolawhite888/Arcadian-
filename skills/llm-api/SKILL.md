---
name: llm-api
description: LLM API testing and analysis for various model providers
version: 1.0
author: Lola
created: 2026-05-16
---

# LLM API Testing

## Purpose
Test and evaluate different LLM API providers for performance, cost, and capability.

## Scripts
- `test_llmapi.py` — General LLM API test
- `llmapi_analysis.md` — Analysis of different providers

## Providers Tested
| Provider | Models | Status |
|----------|--------|--------|
| DeepSeek | chat, reasoner | ✅ Active (primary) |
| Tavily | Search API | ✅ Active |
| OpenRouter | Multi-model gateway | ⏸️ Available |
| Various others | — | Researched |

## Key Findings
- DeepSeek is cost-effective (~$0.14-0.28/M tokens)
- Cache hits reduce costs by ~90%
- OpenRouter offers fallback options
- modelsw switching via API config

## Files
- `check_deepseek_balance.py` — Balance monitoring on server
- `llmapi_analysis.md` — Detailed provider comparison
