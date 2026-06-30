---
name: deepseek-monitor
description: Monitor DeepSeek API balance and usage
version: 1.0
author: Lola
created: 2026-05-16
---

# DeepSeek Balance Monitor

## Balance Info
- **Current Balance:** ~$18.71 (healthy as of May 2026)
- **Alert Threshold:** $2.00
- **Top-up URL:** https://platform.deepseek.com/top_up

## Monitoring Setup
- **Server script:** `/root/check_deepseek_balance.py` on IONOS
- **Log file:** `/tmp/deepseek_balance.log`
- **Cron:** Every 6 hours (0 */6 * * *)
- **Alert file:** `/tmp/deepseek_alert.txt`

## Cache Optimization
- DeepSeek V3 auto-caches identical prompt prefixes
- ~90% cache hit rate on heartbeats → near-zero cost
- Cache resets on new sessions — keep sessions long!
- Current balance will last months at current usage

## Check Balance Remotely
```bash
ssh -i /home/node/.ssh/ionos_ubuntu root@212.227.93.74 "python3 /root/check_deepseek_balance.py"
```

## Action on Alert
If balance drops below $2.00:
1. Read `/tmp/deepseek_alert.txt`
2. Send URGENT alert to Maya on Telegram
3. Advise top-up at https://platform.deepseek.com/top_up
