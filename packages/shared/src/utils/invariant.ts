export class InvariantError extends Error {
    constructor(message: string) {
        super(message);
        // Explicitly set the prototype of the instance to `InvariantError.prototype`.
        // This is necessary because when extending a built-in class like `Error`,
        // the prototype chain is not always set correctly by default in some older JavaScript
        // environments or when using transpiled code (e.g., TypeScript or Babel).
        // Without this line, instance checks like `instanceof InvariantError` might fail.
        Object.setPrototypeOf(this, InvariantError.prototype);
    }
}

/**
 * Provide a condition and if that condition is falsy, this throws an error
 * with the given message.
 *
 * @example
 * invariant(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw
 *
 * @throws {InvariantError} if condition is falsy
 */
export function invariant(
    condition: unknown,
    message: string
): asserts condition {
    if (!condition) {
        throw new InvariantError(message);
    }
}
