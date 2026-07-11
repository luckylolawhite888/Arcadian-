#!/bin/bash
# O&A Bridge - Lola <-> Jenny communication
# Usage: oa_bridge.sh send "Your message here"
#        oa_bridge.sh recv

MODE="$1"
shift

MYNAME="lola"
OTHER="jenny"
MY_TOKEN="2b12dda62e89994063a008c29873c8e8a8cd663e835d18f8"
OTHER_TOKEN="jenny-work-bot-2026"
OTHER_GW="http://localhost:19200"
MY_GW="http://localhost:18790"

case "$MODE" in
    send)
        MSG="$*"
        echo "[$MYNAME → $OTHER] Sending: $MSG"
        # Try HTTP webhook first
        curl -s -X POST "$OTHER_GW/hooks/lola" \
            -H "Authorization: Bearer $OTHER_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"$MSG\"}" 2>/dev/null && echo "[✓ HTTP delivered]" && exit 0
        
        # Fallback: file bridge
        echo "[!] HTTP failed, using file bridge..."
        TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        FILENAME="/tmp/oa-bridge/${MYNAME}_to_${OTHER}_$(date +%s).json"
        mkdir -p /tmp/oa-bridge
        cat > "$FILENAME" << EOF
{
  "from": "${MYNAME}",
  "to": "${OTHER}",
  "timestamp": "${TS}",
  "message": "${MSG}"
}
EOF
        echo "[✓ File bridge: $FILENAME]"
        ;;
    recv)
        for f in /tmp/oa-bridge/${OTHER}_to_${MYNAME}_*.json; do
            [ -f "$f" ] || continue
            echo "=== Message from $OTHER ==="
            cat "$f"
            rm -f "$f"
            echo ""
        done
        ;;
    status)
        echo "=== Bridge Status ==="
        echo "My gateway: $MY_GW"
        echo "Other gateway: $OTHER_GW"
        echo "Pending messages:"
        ls /tmp/oa-bridge/ 2>/dev/null | grep -v "\.sh$" | head -10 || echo "  (none)"
        echo "File bridge: /tmp/oa-bridge/"
        echo "HTTP bridge: $OTHER_GW/hooks/$MYNAME"
        ;;
    *)
        echo "Usage: $0 {send|recv|status} [message]"
        ;;
esac
