import { describe, expect, it } from "vitest";
import { tryCatch } from "./tryCatch";

describe("tryCatch", () => {
    it("should return data for a synchronous function", async () => {
        const syncFn = () => "sync result";
        const result = await tryCatch(syncFn);
        expect(result).toEqual({ data: "sync result", error: null });
    });

    it("should return data for an asynchronous function", async () => {
        const asyncFn = () => Promise.resolve("async result");
        const result = await tryCatch(asyncFn);
        expect(result).toEqual({ data: "async result", error: null });
    });

    it("should return data for a promise", async () => {
        const promise = Promise.resolve("promise result");
        const result = await tryCatch(promise);
        expect(result).toEqual({ data: "promise result", error: null });
    });

    it("should return an error object for a synchronous function that throws", async () => {
        const syncFn = () => {
            throw new Error("sync error");
        };
        const result = await tryCatch(syncFn);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe("sync error");
        expect(result.data).toBeNull();
    });

    it("should return an error object for an asynchronous function that rejects", async () => {
        const asyncFn = () => {
            return Promise.reject(new Error("async error"));
        };
        const result = await tryCatch(asyncFn);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe("async error");
        expect(result.data).toBeNull();
    });

    it("should return an error object for a rejected promise", async () => {
        const promise = Promise.reject(new Error("promise error"));
        const result = await tryCatch(promise);
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe("promise error");
        expect(result.data).toBeNull();
    });

    it("should throw an error for invalid input", async () => {
        // @ts-expect-error deliberately passing a wrong value
        await expect(tryCatch("not a function")).rejects.toThrowError(
            "Expected a function or a promise."
        );
    });

    it("should handle a resolved promise with a thenable value", async () => {
        const thenable = {
            then: (resolve: (value: string) => void) =>
                resolve("thenable result"),
        };
        const promise = Promise.resolve(thenable);

        const result = await tryCatch(promise);
        expect(result).toEqual({ data: "thenable result", error: null });
    });
});
