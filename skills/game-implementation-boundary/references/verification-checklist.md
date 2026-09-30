# Verification Checklist

- TypeScript compile passed.
- Relevant tests or manual checks completed.
- No unresolved promise.
- No dangling callback.
- No tween leak.
- No skeletal animation callback leak.
- No event listener leak.
- No schedule / timer callback leak.
- No pool reference leak.
- No obvious lifecycle issue.
- No public API regression.
- No unrelated architecture change.
- Node / display object access does not introduce per-frame lookups or heavy traversal (see `engines/<engine>/boundary.md`).
- Shader changes, if any, were compile-tested or explicitly marked as high risk pending compile verification.
- Performance-sensitive loops avoid unnecessary allocation and heavy per-frame (`update()` / `ENTER_FRAME`) work.