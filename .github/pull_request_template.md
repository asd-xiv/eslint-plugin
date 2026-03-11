Before submitting your PR:

- Name the PR using [conventional commits](https://www.conventionalcommits.org)
  (enforced by CI)
- Check for existing rules that might cover the same case

---

## Primary

1. Add rule `foo` to enforce `bar`

## Secondary

1. Fix false positive in existing rule

## Checklist

- [ ] Consult `DECISIONS.md`
- [ ] Rule in its own folder under `src/rules/`
- [ ] Tests with 100% coverage
- [ ] Export in `src/index.ts`
