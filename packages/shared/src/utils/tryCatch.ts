import { invariant } from "./invariant";

type SuccessResult<T> = {
    data: T;
    error: null;
};

type ErrorResult = {
    data: null;
    error: Error;
};

/**
 * Executes a function or promise and returns a result object containing either the data or an error message.
 * This simplifies error handling and avoids try-catch blocks in the calling code, making asynchronous code cleaner.
 * Supports both synchronous and asynchronous functions, as well as existing promises.
 * */
export async function tryCatch<T>(
    func: (() => T | Promise<T>) | Promise<T>
): Promise<SuccessResult<T> | ErrorResult> {
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

        return { data: result, error: null };
    } catch (e: unknown) {
        return { data: null, error: e as Error };
    }
}
