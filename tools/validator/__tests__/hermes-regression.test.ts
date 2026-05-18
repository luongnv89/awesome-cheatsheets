/**
 * Hermes regression snapshot — locks the validator output for the PoC
 * contract-anchor fixture.
 *
 * Issue #4 / AC #2: a snapshot test that captures the current validator
 * output for `cheatsheets/hermes-agent/hermes-agent.md` and fails if the
 * shape changes. Hermes is the cheatsheet the contract was derived from
 * (PoC PR ba85ed5 → ba80b27 "lock template contract"); any future change to
 * the contract, validator, or rules MUST keep Hermes passing or be a
 * deliberate, reviewed update of this snapshot.
 *
 * The companion CI workflow (.github/workflows/lint.yml) wires this test
 * plus a CLI smoke step into every PR.
 *
 * The path is resolved from `import.meta.dirname` so the test is independent
 * of the vitest CWD — matches the established pattern in `index.test.ts`.
 *
 * @see ../index.ts          (the `validate()` entry point)
 * @see ../README.md         (Hermes documented as the contract-anchor fixture)
 * @see .github/workflows/lint.yml (CI gate)
 */
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

import { validate } from "../index.js";

describe("Hermes regression snapshot", () => {
  it("captures the validator output shape for the contract-anchor fixture", async () => {
    const result = await validate(
      resolve(
        import.meta.dirname,
        "../../../cheatsheets/hermes-agent/hermes-agent.md",
      ),
      { skipLinks: true },
    );

    // If this snapshot ever needs updating, the contract changed or Hermes
    // drifted — review BOTH carefully before regenerating with
    // `pnpm test -- -u`.
    expect(result).toMatchInlineSnapshot(`
      {
        "errors": [],
        "ok": true,
      }
    `);
  });
});
