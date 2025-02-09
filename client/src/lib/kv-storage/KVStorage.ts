import { del, get, set, update } from "idb-keyval";
import { KVStorageKey, KVStorageValue } from "@/types";

type Updater<T> = (oldValue: T | undefined) => T;

class KVStorage {
    static instance: KVStorage | null = null;
    // Map a key to its subscriber callbacks
    private subscriptions = new Map<
        KVStorageKey,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Array<(value: any) => void>
    >();

    constructor() {
        if (KVStorage.instance) return KVStorage.instance;
        KVStorage.instance = this;
    }

    static getInstance() {
        if (!KVStorage.instance) {
            KVStorage.instance = new KVStorage();
        }
        return KVStorage.instance;
    }

    async setItem<T extends KVStorageKey>(key: T, value: KVStorageValue<T>) {
        try {
            await set(key, value);
            this.notifySubscribers(key, value);
            return true;
        } catch (error) {
            console.error("Error setting item:", error);
            throw error;
        }
    }

    async getItem<T extends KVStorageKey>(
        key: T
    ): Promise<KVStorageValue<T> | undefined> {
        try {
            return await get(key);
        } catch (error) {
            console.error("Error getting item:", error);
            throw error;
        }
    }

    async updateItem<T extends KVStorageKey>(
        key: T,
        updater: Updater<KVStorageValue<T>>
    ) {
        try {
            await update(key, (oldValue) => {
                const newValue = updater(oldValue);
                this.notifySubscribers(key, newValue);
                return newValue;
            });
        } catch (error) {
            console.error("Error updating item:", error);
            throw error;
        }
    }

    async deleteItem(key: KVStorageKey) {
        try {
            await del(key);
            this.notifySubscribers(key, undefined);
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error;
        }
    }

    // Subscribe to changes on a key.
    // Returns an unsubscribe function.
    subscribe<T extends KVStorageKey>(
        key: T,
        callback: (value: KVStorageValue<T>) => void
    ): () => void {
        if (!this.subscriptions.has(key)) {
            this.subscriptions.set(key, []);
        }
        this.subscriptions.get(key)!.push(callback);
        return () => {
            const subs = this.subscriptions.get(key);
            if (subs) {
                this.subscriptions.set(
                    key,
                    subs.filter((cb) => cb !== callback)
                );
            }
        };
    }

    // Call all subscriber callbacks for a key
    private notifySubscribers(key: KVStorageKey, value: unknown) {
        const subs = this.subscriptions.get(key);
        if (subs) {
            subs.forEach((cb) => {
                try {
                    cb(value);
                } catch (err) {
                    console.error(`Subscriber error for key ${key}:`, err);
                }
            });
        }
    }
}

export default KVStorage.getInstance();
