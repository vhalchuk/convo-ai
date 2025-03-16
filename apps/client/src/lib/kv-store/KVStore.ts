import { KVStoreKey, KVStoreValue } from "@/types";

type Updater<T> = (oldValue: T | undefined) => T;

type Store = {
    get<T = unknown>(key: string): Promise<T | undefined>;
    set(key: string, value: unknown): Promise<void>;
    update<T = unknown>(
        key: string,
        updater: (oldValue: T | undefined) => T
    ): Promise<void>;
    del(key: string): Promise<void>;
};

/**
 * KVStore is a singleton that abstracts an asynchronous key-value store.
 * It maintains an in-memory cache with debounced deletion and supports subscriptions.
 */
export default class KVStore {
    static instance: KVStore | null = null;
    // @ts-expect-error Store is actually being properly initialized in the constructor
    private store: Store;
    // Map a key to its subscriber callbacks
    private subscriptions = new Map<
        KVStoreKey,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((value: any) => void)[]
    >();
    // In-memory cache for sync snapshots.
    private cache = new Map<KVStoreKey, any>();
    // Track active subscriptions per key.
    private subscriptionCounts = new Map<KVStoreKey, number>();
    // Map to store pending deletion timers.
    private deletionTimers = new Map<
        KVStoreKey,
        ReturnType<typeof setTimeout>
    >();
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
     * Initializes the KVStore singleton with the provided store.
     * Subsequent calls will return the same instance.
     * @param store The underlying store implementation.
     * @returns The KVStore instance.
     */
    static getInstance(store: Store) {
        if (!KVStore.instance) {
            KVStore.instance = new KVStore(store);
        }
        return KVStore.instance;
    }

    /**
     * Initializes a key with an initial value if not present,
     * and loads the actual value asynchronously.
     * @param key The key to initialize.
     * @param initialValue The initial value if the key is not in the cache.
     */
    initKey<T extends KVStoreKey>(key: T, initialValue: KVStoreValue<T>) {
        if (!this.cache.has(key)) {
            this.cache.set(key, initialValue);
            this.store
                .get(key)
                .then((storedValue) => {
                    if (storedValue !== undefined) {
                        this.cache.set(key, storedValue);
                        this.notifySubscribers(key, storedValue);
                    }
                })
                .catch((error) => {
                    console.error(
                        "Error loading initial value for key:",
                        key,
                        error
                    );
                });
        }
    }

    /**
     * Sets the value for a given key.
     * @param key The key to set.
     * @param value The value to set.
     * @returns Promise resolving to true on success.
     */
    async setItem<T extends KVStoreKey>(key: T, value: KVStoreValue<T>) {
        try {
            await this.store.set(key, value);
            this.cache.set(key, value);
            this.notifySubscribers(key, value);
            return true;
        } catch (error) {
            console.error("Error setting item:", error);
            throw error;
        }
    }

    /**
     * Retrieves the value for a given key.
     * @param key The key to retrieve.
     * @returns Promise resolving to the value or undefined.
     */
    async getItem<T extends KVStoreKey>(
        key: T
    ): Promise<KVStoreValue<T> | undefined> {
        try {
            let value = this.cache.get(key);
            if (value === undefined) {
                value = await this.store.get(key);
                this.cache.set(key, value);
            }
            return value;
        } catch (error) {
            console.error("Error getting item:", error);
            throw error;
        }
    }

    /**
     * Updates the value for a given key using an updater function.
     * @param key The key to update.
     * @param updater Function that receives the old value and returns the new value.
     */
    async updateItem<T extends KVStoreKey>(
        key: T,
        updater: Updater<KVStoreValue<T>>
    ) {
        try {
            await this.store.update<KVStoreValue<T> | undefined>(
                key,
                (oldValue) => {
                    const newValue = updater(oldValue);
                    this.cache.set(key, newValue);
                    this.notifySubscribers(key, newValue);
                    return newValue;
                }
            );
        } catch (error) {
            console.error("Error updating item:", error);
            throw error;
        }
    }

    /**
     * Deletes the value for a given key.
     * @param key The key to delete.
     */
    async deleteItem(key: KVStoreKey) {
        try {
            await this.store.del(key);
            this.cache.delete(key);
            this.notifySubscribers(key, undefined);
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error;
        }
    }

    /**
     * Subscribes to changes for a given key.
     * @param key The key to subscribe to.
     * @param callback Callback invoked when the key's value changes.
     * @returns Unsubscribe function.
     */
    subscribe<T extends KVStoreKey>(
        key: T,
        callback: (value: any) => void
    ): () => void {
        if (!this.subscriptions.has(key)) {
            this.subscriptions.set(key, []);
        }
        // Cancel pending cache deletion if it exists.
        this.cancelCacheDeletion(key);
        const subs = this.subscriptions.get(key)!;
        subs.push(callback);
        // Increment subscription count.
        const count = this.subscriptionCounts.get(key) || 0;
        this.subscriptionCounts.set(key, count + 1);

        return () => {
            const subs = this.subscriptions.get(key);
            if (subs) {
                this.subscriptions.set(
                    key,
                    subs.filter((cb) => cb !== callback)
                );
            }
            const currentCount = this.subscriptionCounts.get(key) || 1;
            if (currentCount <= 1) {
                this.subscriptionCounts.delete(key);
                // Schedule debounced deletion of cache.
                this.scheduleCacheDeletion(key);
            } else {
                this.subscriptionCounts.set(key, currentCount - 1);
            }
        };
    }

    /**
     * Returns a synchronous snapshot of the current value for a given key.
     * @param key The key to retrieve.
     * @returns The current value or undefined.
     */
    public getSnapshot<T extends KVStoreKey>(
        key: T
    ): KVStoreValue<T> | undefined {
        return this.cache.get(key);
    }

    /**
     * Schedules a debounced deletion of the cache for a key.
     * If no new subscriptions are added within the delay, the cache is deleted.
     * @param key The key for which to schedule deletion.
     */
    private scheduleCacheDeletion(key: KVStoreKey): void {
        const timer = setTimeout(() => {
            if (!this.subscriptionCounts.has(key)) {
                console.log(`Deleting cache for key: ${key}`);
                this.cache.delete(key);
            }
            this.deletionTimers.delete(key);
        }, this.deletionDelay);
        this.deletionTimers.set(key, timer);
    }

    /**
     * Cancels any pending cache deletion for a given key.
     * @param key The key for which to cancel deletion.
     */
    private cancelCacheDeletion(key: KVStoreKey): void {
        if (this.deletionTimers.has(key)) {
            clearTimeout(this.deletionTimers.get(key));
            this.deletionTimers.delete(key);
        }
    }

    /**
     * Notifies all subscribers of a key about a value change.
     * @param key The key that has changed.
     * @param value The new value.
     */
    private notifySubscribers(key: KVStoreKey, value: unknown) {
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
