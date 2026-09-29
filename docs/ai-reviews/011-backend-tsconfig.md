# AI Review: Backend tsconfig

## Commit

- Message: Drop unused baseUrl so TypeScript 6 accepts the API project.
- Scope: `backend/tsconfig.json` and the living-doc note for this fix.

## What the assistant proposed

- Keep `"baseUrl": "./"` and silence the deprecation with `"ignoreDeprecations": "6.0"`.
- Add a `paths` map that only mirrored relative imports so `baseUrl` stayed meaningful.
- Leave the option in place because Nest templates often ship with it.

## What was accepted, and why

- Remove `"baseUrl": "./"`. Every backend import already uses a relative path such as `../prisma/prisma.service`. With no `paths` entries, `baseUrl` did nothing useful and TypeScript 6 warned on every `tsc` run.
- Verified with `npx tsc --noEmit -p tsconfig.json` in `backend/` after the change.

## What was rejected or changed, and why

- Rejected `ignoreDeprecations`. That hides the warning without fixing the unused option.
- Rejected inventing `paths` only to justify `baseUrl`. The shop does not use path aliases in the API.

## Reflection

- Decision: match the compiler to how the code is written, instead of keeping template leftovers.
- Risk left open: if a later module introduces `@/` aliases, `baseUrl` and `paths` must be added together. That is acceptable; aliases are not in use today.
