/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { invariant } from "@convo-ai/shared";

type Store = {
    get<T = unknown>(key: string): Promise<T | undefined>;
    set(key: string, value: unknown): Promise<void>;
    update<T = unknown>(
        key: string,
        updater: (oldValue: T | undefined) => T
    ): Promise<void>;
    del(key: string): Promise<void>;
};

type Value = Exclude<unknown, undefined>;

/**
 * KVStore is a singleton that abstracts an asynchronous key-value store.
 * It maintains an in-memory cache with debounced deletion and supports subscriptions.
 */
export default class KVStore {
    static instance: KVStore | null = null;
    // @ts-expect-error Store is actually being properly initialized in the constructor
    private store: Store;
    // Map a key to its subscriber callbacks
    private subscriptions = new Map<string, ((value: unknown) => void)[]>();
    // In-memory cache for sync snapshots.
    private cache = new Map<string, unknown>();
    // Track active subscriptions per key.
    private subscriptionCounts = new Map<string, number>();
    // Map to store pending deletion timers.
    private deletionTimers = new Map<string, ReturnType<typeof setTimeout>>();
    // Debounce delay in milliseconds.
    private deletionDelay = 500;

    /**
     * Private constructor to enforce singleton pattern.
     * @param store The underlying store implementation.
     */
    private constructor(store: Store) {
        if (KVStore.instance) return KVStore.instance;
        this.store = store;
        KVStore.instance = this;
    }

    /**
     * Schedules debounced cache deletion for a key.
     * If no new subscriptions occur within the delay, the cache is removed.
     * @param key The key.
     */
    private scheduleCacheDeletion(key: string): void {
        const timer = setTimeout(() => {
            if (!this.subscriptionCounts.has(key)) {
                this.cache.delete(key);
            }
            this.deletionTimers.delete(key);
        }, this.deletionDelay);
        this.deletionTimers.set(key, timer);
    }

    /**
     * Cancels any scheduled cache deletion for a key.
     * @param key The key.
     */
    private cancelCacheDeletion(key: string): void {
        if (this.deletionTimers.has(key)) {
            clearTimeout(this.deletionTimers.get(key));
            this.deletionTimers.delete(key);
        }
    }

    /**
     * Notifies all subscribers of a key about its new value.
     * @param key The key.
     * @param value The new value.
     */
    private notifySubscribers(key: string, value: Value): void {
        const subs = this.subscriptions.get(key);
        if (subs) {
            subs.forEach((cb) => {
                try {
                    cb(value);
                } catch (err) {
                    console.error(
                        `Subscriber error for key ${String(key)}:`,
                        err
                    );
                }
            });
        }
    }

    /**
     * Initializes the KVStore singleton with the provided store.
     * Subsequent calls return the same instance.
     * @param store The underlying store implementation.
     * @returns The KVStore instance.
     */
    public static initialize(store: Store) {
        if (!KVStore.instance) {
            KVStore.instance = new KVStore(store);
        }
        return KVStore.instance;
    }

    /**
     * Returns the KVStore instance.
     * @throws if KVStore has not been initialized.
     */
    public static getInstance(): KVStore {
        if (!KVStore.instance) {
            throw new Error(
                "KVStore not initialized. Call KVStore.initialize() first."
            );
        }
        return KVStore.instance;
    }

    /**
     * Initializes a key with an initial value if not already cached,
     * then asynchronously loads the actual value from the store.
     * @param key The key to initialize.
     * @param initialValue The fallback value.
     */
    public initKey(key: string, initialValue: unknown): void {
        if (!this.cache.has(key)) {
            this.cache.set(key, initialValue);
            this.store
                .get(String(key))
                .then((storedValue) => {
                    if (storedValue !== undefined) {
                        this.cache.set(key, storedValue);
                        this.notifySubscribers(key, storedValue);
                    }
                })
                .catch((error: unknown) => {
                    console.error(
                        "Error loading initial value for key:",
                        key,
                        error
                    );
                });
        }
    }

    /**
     * Retrieves the value for the specified key.
     * @param key The key.
     * @returns The value or undefined.
     */
    public async getItem(key: string): Promise<Value | undefined> {
        try {
            let value = this.cache.get(key);
            if (value === undefined) {
                value = await this.store.get(String(key));
                this.cache.set(key, value);
            }
            return value;
        } catch (error) {
            console.error("Error getting item:", error);
            throw error;
        }
    }

    /**
     * Sets a value for the specified key.
     * @param key The key.
     * @param value The value.
     * @returns Resolves to true on success.
     */
    public async setItem(key: string, value: unknown) {
        try {
            await this.store.set(String(key), value);
            this.cache.set(key, value);
            this.notifySubscribers(key, value);
        } catch (error) {
            console.error("Error setting item:", error);
            throw error;
        }
    }

    /**
     * Updates the value for a key using an updater function.
     * @param key The key.
     * @param updater Function that transforms the old value.
     */
    public async updateItem(
        key: string,
        updater: (oldValue: unknown) => unknown
    ): Promise<void> {
        try {
            await this.store.update(String(key), (oldValue: unknown) => {
                const newValue = updater(oldValue);
                this.cache.set(key, newValue);
                this.notifySubscribers(key, newValue);
                return newValue;
            });
        } catch (error) {
            console.error("Error updating item:", error);
            throw error;
        }
    }

    /**
     * Deletes the specified key.
     * @param key The key.
     */
    public async deleteItem(key: string): Promise<void> {
        try {
            await this.store.del(String(key));
            this.cache.delete(key);
            this.notifySubscribers(key, undefined);
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error;
        }
    }

    /**
     * Returns a synchronous snapshot of the value for a given key.
     * @param key The key.
     * @returns The current value or undefined.
     */
    public getSnapshot(key: string): Value | undefined {
        return this.cache.get(key);
    }

    /**
     * Subscribes to changes for the specified key.
     * @param key The key.
     * @param callback Callback invoked with the updated value.
     * @returns An unsubscribe function.
     */
    public subscribe(
        key: string,
        callback: (value: Value | undefined) => void
    ): () => void {
        if (!this.subscriptions.has(key)) {
            this.subscriptions.set(key, []);
        }
        // Cancel pending cache deletion if any.
        this.cancelCacheDeletion(key);
        const subs = this.subscriptions.get(key);

        invariant(subs, "Subscribers must be defined");

        subs.push(callback as (value: unknown) => void);
        const count = this.subscriptionCounts.get(key) ?? 0;
        this.subscriptionCounts.set(key, count + 1);

        return () => {
            const subs = this.subscriptions.get(key);
            if (subs) {
                this.subscriptions.set(
                    key,
                    subs.filter((cb) => cb !== callback)
                );
            }
            const currentCount = this.subscriptionCounts.get(key) ?? 1;
            if (currentCount <= 1) {
                this.subscriptionCounts.delete(key);
                this.scheduleCacheDeletion(key);
            } else {
                this.subscriptionCounts.set(key, currentCount - 1);
            }
        };
    }
}
