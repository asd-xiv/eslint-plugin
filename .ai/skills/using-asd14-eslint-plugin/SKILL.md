---
name: using-asd14-eslint-plugin
description:
  Use when enforcing throw error argument format or function call argument
  format via custom ESLint rules (@asd14/eslint-plugin) in eslint.config.js.
---

# @asd14/eslint-plugin

- ESLint rules for overly fidgety namers
- Requires `eslint ^9 || ^10` as peer dependency

## Rules

| Rule | Description | Autofix |
| :- | :- | :-: |
| [`@asd14/throw-argument-format`](references/rule-throw-argument-format.md) | Enforce error message format in `throw` statements | no |
| [`@asd14/call-argument-format`](references/rule-call-argument-format.md) | Enforce argument format in function calls | no |
