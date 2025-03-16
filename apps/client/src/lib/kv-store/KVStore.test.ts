import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import KVStore from "./KVStore";

const createDummyStore = () => {
    const map = new Map<string, any>();
    return {
        get: async (key: string) => map.get(key),
        set: async (key: string, value: any) => {
            map.set(key, value);
        },
        update: async (key: string, updater: (oldValue: any) => any) => {
            const oldValue = map.get(key);
            const newValue = updater(oldValue);
            map.set(key, newValue);
        },
        del: async (key: string) => {
            map.delete(key);
        },
    };
};

let kvStore: KVStore;

beforeEach(() => {
    // Reset the singleton instance by accessing the private static property.
    // (TypeScript private doesn't exist at runtime.)
    (KVStore as any).instance = null;
    const dummyStore = createDummyStore();
    kvStore = KVStore.initialize(dummyStore);
});

afterEach(() => {
    vi.useRealTimers();
});

describe("KVStore", () => {
    it("should initialize a key with initial value and update it from store", async () => {
        const key = "testKey";
        const initialValue = "init";
        kvStore.initKey(key, initialValue);

        // Now set a new value in the store to simulate an asynchronous update.
        await kvStore.setItem(key, "storedValue");

        // Allow asynchronous operations to complete.
        await new Promise((resolve) => setTimeout(resolve, 10));

        const snapshot = kvStore.getSnapshot(key);
        expect(snapshot).toBe("storedValue");
    });

    it("should set and get an item", async () => {
        const key = "key1";
        await kvStore.setItem(key, 42);
        const value = await kvStore.getItem(key);
        expect(value).toBe(42);
    });

    it("should update an item", async () => {
        const key = "key2";
        await kvStore.setItem(key, 10);
        // @ts-ignore
        await kvStore.updateItem(key, (old) => (old || 0) + 5);
        const value = await kvStore.getItem(key);
        expect(value).toBe(15);
    });

    it("should delete an item", async () => {
        const key = "key3";
        await kvStore.setItem(key, "value");
        await kvStore.deleteItem(key);
        const value = await kvStore.getItem(key);
        expect(value).toBeUndefined();
    });

    it("should notify subscribers on value change", async () => {
        const key = "key4";
        const callback = vi.fn();
        kvStore.subscribe(key, callback);
        await kvStore.setItem(key, "newValue");
        expect(callback).toHaveBeenCalledWith("newValue");
    });

    it("should clean up cache with debounced deletion after last unsubscribe", async () => {
        vi.useFakeTimers();
        const key = "key5";
        const callback = vi.fn();

        const unsubscribe = kvStore.subscribe(key, callback);
        // Set a value so it's cached.
        await kvStore.setItem(key, "cached");

        // Cache should exist immediately.
        expect(kvStore.getSnapshot(key)).toBe("cached");

        // Unsubscribe, which should schedule cache deletion.
        unsubscribe();

        // Immediately after unsubscribing, cache is still there.
        expect(kvStore.getSnapshot(key)).toBe("cached");

        // Advance timers beyond the deletion delay.
        vi.advanceTimersByTime(600);

        // Cache should now be deleted.
        expect(kvStore.getSnapshot(key)).toBeUndefined();
    });

    it("should cancel scheduled deletion if a new subscription occurs", async () => {
        vi.useFakeTimers();
        const key = "key6";
        const callback = vi.fn();

        const unsubscribe = kvStore.subscribe(key, callback);
        await kvStore.setItem(key, "cached");

        // Unsubscribe to schedule deletion.
        unsubscribe();

        // Immediately subscribe again to cancel deletion.
        kvStore.subscribe(key, callback);

        vi.advanceTimersByTime(600);

        // Cache should still be present.
        expect(kvStore.getSnapshot(key)).toBe("cached");
    });
});
