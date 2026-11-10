# Career Coach Pro

Version 1.0.0

## Overview

Modular bilingual career coaching skill for Claude.

Capabilities:
- Resume and ATS optimization.
- Tailored cover letters.
- Behavioral and technical interview practice.
- STAR coaching.
- LinkedIn profile optimization.
- Current job discovery when live research is available.
- Career transitions.
- Compensation and career strategy.

## Folder Structure

The root folder contains:
- SKILL.md
- README.md
- references/
- assets/
- tests/

All references are linked from SKILL.md.

## Installation — Claude.ai

1. Verify that your Claude plan supports custom Skills.
2. Create the career-coach-pro directory.
3. Save each file at its documented path.
4. Compress the career-coach-pro folder into a ZIP archive.
5. Open Claude's Skills configuration.
6. Upload the ZIP.
7. Enable the Skill if required.
8. Start a new conversation and test it.

## Installation — Claude Code

Place the skill directory in:

~/.claude/skills/career-coach-pro/

Alternatively, for project-scoped usage:

.claude/skills/career-coach-pro/

## Suggested First Tests

- Optimize my CV for this job description.
- Interview me for a Senior Product Manager role.
- Review my LinkedIn About section.
- Find current remote roles suitable for my experience.
- Help me move from operations to project management.

## Operational Requirements

Live job search requires browsing or an appropriate connected tool.

Document output requires the relevant document generation capability.

Skills do not automatically enable external tools, recruiters' databases or application submission.

## Customization

Modify:
- Language behavior.
- Writing style.
- Target industries.
- Geographic defaults.
- Job-search priorities.
- Interview scoring.
- Output templates.

Avoid modifying factual-integrity rules.

## Maintenance

Review tests/acceptance-tests.md after any change.

Keep skill instructions modular.
Update version information when behavior changes.

## Privacy

Use candidate documents only for the intended task.
Do not store or transmit private information without authorization.
Review information before sharing with external services.

## Executive coaching extensions (v1.1)
This revised package adds `references/executive-interview-coach.md` and `references/executive-english-and-compensation.md` for the bilingual VP-level interview experience. Skills guide behavior but do not carry over private ChatGPT conversation memory automatically; provide your CV, job posting, and a concise career dossier in Claude for equivalent personalization.
