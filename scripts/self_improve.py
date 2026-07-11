#!/usr/bin/env python3
"""
Lola's Self-Improvement Engine v2
===================================
Extracts patterns from recent conversations, suggests skill creations,
detects skill gaps, stale skills, and knowledge consolidation opportunities.
Runs as a cron job at 05:00 UTC daily.

Read-only: writes to .improvement_suggestions.md for Lola to review.
"""

import os
import re
import json
from datetime import datetime, timedelta
from pathlib import Path

WORKSPACE = Path(os.path.expanduser("~/.openclaw/workspace"))
MEMORY_DIR = WORKSPACE / "memory"
SKILLS_DIR = WORKSPACE / "skills"
SUGGESTIONS_FILE = WORKSPACE / ".improvement_suggestions.md"

def get_recent_memory_files(days=3):
    """Get memory files from the last N days."""
    now = datetime.utcnow()
    files = []
    for i in range(days):
        d = now - timedelta(days=i)
        f = MEMORY_DIR / f"{d.strftime('%Y-%m-%d')}.md"
        if f.exists():
            files.append(f)
    return files

def extract_topics_from_memory(content):
    topics = set()
    patterns = [
        (r'##\s*(.+?)(?:\n|$)', 'section'),
        (r'\*\*(.+?)\*\*', 'bold_term'),
    ]
    for pattern, ptype in patterns:
        matches = re.findall(pattern, content)
        for m in matches:
            clean = m.strip().lower()
            if len(clean) > 3 and len(clean) < 100:
                topics.add(clean)
    return topics

def find_repeated_patterns(files):
    all_content = ""
    for f in files:
        try:
            all_content += f.read_text() + "\n"
        except:
            continue
    
    action_patterns = [
        r'(?:checked|checked for|looked at|monitored)\s+(.+?)(?:\n|\.|—)',
        r'(?:created|wrote|built|set up|made|installed|configured)\s+(.+?)(?:\n|\.|—)',
        r'(?:investigated|researched|looked into|searched|found)\s+(.+?)(?:\n|\.|—)',
        r'(?:fixed|resolved|debugged|solved|recovered|restored)\s+(.+?)(?:\n|\.|—)',
        r'(?:deployed|published|uploaded|released|launched)\s+(.+?)(?:\n|\.|—)',
        r'(?:integrated|connected|linked|synced|hooked up)\s+(.+?)(?:\n|\.|—)',
        r'(?:tested|verified|validated|confirmed)\s+(.+?)(?:\n|\.|—)',
    ]
    
    actions = []
    seen = set()
    for pattern in action_patterns:
        matches = re.findall(pattern, all_content, re.IGNORECASE)
        for m in matches:
            clean = m.strip().lower()[:100]
            if clean and clean not in seen:
                seen.add(clean)
                actions.append(clean)
    
    return actions

def check_for_skill_candidates():
    files = get_recent_memory_files(days=7)
    if not files:
        return []
    
    actions = find_repeated_patterns(files)
    
    candidates = []
    action_counts = {}
    for a in actions:
        action_counts[a] = action_counts.get(a, 0) + 1
    
    for action, count in action_counts.items():
        if count >= 2:
            candidates.append({
                'type': 'recurring_task',
                'description': action,
                'frequency': count
            })
    
    return candidates

def check_skill_gaps():
    """Check for projects in MEMORY.md without skill files."""
    memory_file = WORKSPACE / "MEMORY.md"
    if not memory_file.exists():
        return []
    
    content = memory_file.read_text()
    gaps = []
    
    # Find project names
    project_pattern = r'\*\*(.+?) Project\*\*'
    projects = re.findall(project_pattern, content)
    
    for project in projects:
        slug = project.lower().replace(" ", "-")
        skill_path = SKILLS_DIR / slug
        if not skill_path.exists():
            gaps.append({
                'type': 'missing_skill',
                'project': project,
                'reason': f'Project "{project}" mentioned in MEMORY.md but no skill file'
            })
    
    return gaps

def check_orphaned_scripts():
    """Find Python scripts in workspace root that don't have corresponding skills."""
    orphaned = []
    known_skill_names = {d.name.lower() for d in SKILLS_DIR.iterdir() if d.is_dir()}
    
    for f in WORKSPACE.iterdir():
        if f.suffix == '.py' and f.name != 'self_improve.py' and not f.name.startswith('.'):
            stem = f.stem.lower()
            # Check if this script is covered by any skill
            covered = False
            for skill_name in known_skill_names:
                skill_normalized = skill_name.replace('-', '_').replace(' ', '_')
                if stem in skill_normalized or skill_normalized in stem:
                    covered = True
                    break
            if not covered:
                orphaned.append(f.name)
    
    return orphaned

def check_stale_skills():
    """Find skills that might be outdated."""
    stale = []
    today = datetime.utcnow()
    
    for skill_dir in SKILLS_DIR.iterdir():
        if not skill_dir.is_dir():
            continue
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            continue
        
        content = skill_file.read_text()
        
        # Check for "pending" or "not yet" indicators
        pending_indicators = ['not built', 'not yet', 'needs testing', 'stalled', 'parked']
        for indicator in pending_indicators:
            if indicator in content.lower():
                stale.append({
                    'type': 'stale_skill',
                    'skill': skill_dir.name,
                    'reason': f'Contains "{indicator}" — may need status update'
                })
                break
        
        # Check if skill has no version field
        if 'version:' not in content:
            stale.append({
                'type': 'unversioned',
                'skill': skill_dir.name,
                'reason': 'No version field in front matter'
            })
    
    return stale

def check_consolidation_opportunities():
    """Find skills that could be merged (very similar topics)."""
    consolidations = []
    skill_names = [d.name.lower() for d in SKILLS_DIR.iterdir() if d.is_dir()]
    
    # Check for overlapping skills
    overlap_pairs = [
        ('out-and-about', 'out-about-backend', 'Out & About frontend and backend could be merged'),
        ('ghost-blog', 'ghost-publishing', 'Ghost blog management and publishing could be merged'),
        ('ghost-blog', 'ghost-jwt', 'Ghost JWT could be a section in ghost-blog'),
        ('cloudflare-dns', 'cloudflare-tunnel', 'Cloudflare DNS and deployment could be merged'),
        ('ionos-server', 'monitoring-systems', 'Server admin and healthchecks could be merged'),
        ('sms-works', 'tom-reminders', 'Tom reminders is a specific use case of SMS'),
    ]
    
    for a, b, reason in overlap_pairs:
        if a in skill_names and b in skill_names:
            consolidations.append({
                'type': 'consolidation',
                'skills': (a, b),
                'reason': reason
            })
    
    return consolidations

def generate_suggestions():
    candidates = check_for_skill_candidates()
    gaps = check_skill_gaps()
    orphaned = check_orphaned_scripts()
    stale = check_stale_skills()
    consolidations = check_consolidation_opportunities()
    
    if not any([candidates, gaps, orphaned, stale, consolidations]):
        return None
    
    lines = [
        "# 🦊 Self-Improvement Suggestions",
        f"_Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}_",
        "",
    ]
    
    if gaps:
        lines.append("## 📋 Missing Skills (from MEMORY.md)")
        for g in gaps:
            lines.append(f"- **{g['project']}**: {g['reason']}")
        lines.append("")
    
    if candidates:
        lines.append("## 🔄 Recurring Tasks (Skill Candidates)")
        for c in sorted(candidates, key=lambda x: x['frequency'], reverse=True):
            lines.append(f"- `{c['description']}` (appeared {c['frequency']}x)")
        lines.append("")
    
    if orphaned:
        lines.append("## 📜 Orphaned Scripts (no covering skill)")
        for s in sorted(orphaned):
            lines.append(f"- `{s}`")
        lines.append("")
    
    if stale:
        lines.append("## ⏳ Stale or Unversioned Skills")
        for s in stale:
            lines.append(f"- **{s['skill']}**: {s['reason']}")
        lines.append("")
    
    if consolidations:
        lines.append("## 🧩 Consolidation Opportunities")
        for c in consolidations:
            lines.append(f"- {c['reason']} (`{'` + `'.join(c['skills'])}`)")
        lines.append("")
    
    lines.append("---")
    lines.append("_Review these on next heartbeat and decide what to action._")
    lines.append("_Priority: Missing Skills > Orphaned Scripts > Consolidation > Stale_")
    
    return "\n".join(lines)

def main():
    suggestions = generate_suggestions()
    if suggestions:
        SUGGESTIONS_FILE.write_text(suggestions)
        print(f"✅ Suggestions written to {SUGGESTIONS_FILE}")
        print(f"\n{suggestions}")
    else:
        print("✅ No new suggestions — everything looks current.")

if __name__ == "__main__":
    main()
