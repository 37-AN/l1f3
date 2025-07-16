# LIF3 Project Structure & Maintenance Guide

## 🗂️ Clean Directory Layout

```
/
├── backend/                # NestJS backend (modules, database, integrations, tests, logs)
├── frontend/               # React frontend (components, hooks, pages, config, utils)
├── lif3-agent/             # Python agent (core scripts, logs, config, README)
├── lif3-integrations/      # Node/JS integration microservices (Slack, Discord, etc.)
├── scripts/                # Essential cross-project scripts
├── logs/                   # Top-level logs (preserved)
├── documents/              # All documentation
│   └── AI_RULES_AND_PROMPTS/  # Claude, Gemini, and AI prompt/rules docs
├── prompts/                # System and RAG prompt guides (referenced in AI_RULES_AND_PROMPTS)
├── config/                 # Global config files (if any)
├── deployment/             # Deployment configs/scripts
├── .github/                # GitHub workflows, issue templates, etc.
├── .gitignore
├── docker-compose.yml
├── README.md                # Main project README
└── ...                     # Other essential root files
```

## 🤖 AI Rules & Prompt Guides
- All Claude, Gemini, and general AI rules, prompt guides, and best practices are in:
  - `documents/AI_RULES_AND_PROMPTS/`
  - `prompts/` (referenced, not moved)
- See `AI_RULES_AND_PROMPTS/README.md` for an index of all prompt guides and rules.

## 🧹 Automating Future Cleanups
- To keep your project clean:
  - Remove `.DS_Store` and other OS metadata: `find . -name ".DS_Store" -delete`
  - Delete demo/test/backup files: `find . -type f -iname '*demo*' -o -iname '*test*' -o -iname '*backup*' -delete`
  - Move all AI rules/prompt docs to `documents/AI_RULES_AND_PROMPTS/`
- Review this README after major changes to ensure structure is up to date.

---

# (Original README content below) 