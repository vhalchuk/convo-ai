import { Result, err, ok } from "neverthrow";
import { invariant } from "./invariant";

/**
 * Executes a function or promise and returns a neverthrow Result containing either the successful value or an error.
 *
 * This utility simplifies error handling by avoiding try/catch blocks in the calling code.
 * It supports synchronous and asynchronous functions as well as existing promises.
 *
 * The returned Result is:
 *   - Ok: with the value accessible via `.value`
 *   - Err: with the error accessible via `.error`
 */
export async function tryCatch<T>(
    func: (() => T | Promise<T>) | Promise<T>
): Promise<Result<T, unknown>> {
    invariant(
        typeof func === "function" || func instanceof Promise,
        "Expected a function or a promise."
    );

    try {
        let result: T;
        if (func instanceof Promise) {
            result = await func;
        } else {
            result = await Promise.resolve(func());
        }

        return ok(result);
    } catch (e: unknown) {
        return err(e);
    }
}
