import { describe, expect, it } from "vitest";
import { InvariantError, invariant } from "./invariant";

describe("InvariantError", () => {
    it("should create an instance with the correct message", () => {
        const error = new InvariantError("test error");
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(InvariantError);
        expect(error.message).toBe("test error");
    });
});

describe("invariant function", () => {
    it("should not throw when the condition is truthy", () => {
        expect(() => invariant(true, "should not throw")).not.toThrow();
        expect(() => invariant(1, "should not throw")).not.toThrow();
        expect(() => invariant("non-empty", "should not throw")).not.toThrow();
    });

    it("should throw an InvariantError when the condition is falsy", () => {
        expect(() => invariant(false, "falsy condition")).toThrowError(
            InvariantError
        );
        expect(() => invariant(0, "falsy condition")).toThrowError(
            InvariantError
        );
        expect(() => invariant("", "falsy condition")).toThrowError(
            InvariantError
        );
        expect(() => invariant(null, "falsy condition")).toThrowError(
            InvariantError
        );
        expect(() => invariant(undefined, "falsy condition")).toThrowError(
            InvariantError
        );
    });

    it("should throw with the correct error message", () => {
        try {
            invariant(false, "specific error message");
        } catch (error) {
            expect(error).toBeInstanceOf(InvariantError);
            if (error instanceof InvariantError) {
                expect(error.message).toBe("specific error message");
            }
        }
    });
});
