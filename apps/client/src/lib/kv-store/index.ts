import { useSyncExternalStore } from "react";
import { del, get, set, update } from "idb-keyval";
import { invariant } from "@convo-ai/shared";
import { KVStoreKey, KVStoreValue } from "@/types.ts";
import KVStore from "./KVStore.ts";

export const kvStore = KVStore.initialize({
    get,
    del,
    set,
    update,
}) as {
    initKey<K extends KVStoreKey>(key: K, initialValue: KVStoreValue<K>): void;
    getItem<K extends KVStoreKey>(key: K): Promise<KVStoreValue<K> | undefined>;
    setItem<K extends KVStoreKey>(
        key: K,
        value: KVStoreValue<K>
    ): Promise<void>;
    updateItem<K extends KVStoreKey>(
        key: K,
        updater: (oldValue: KVStoreValue<K> | undefined) => KVStoreValue<K>
    ): Promise<void>;
    deleteItem(key: KVStoreKey): Promise<void>;
    getSnapshot<K extends KVStoreKey>(key: K): KVStoreValue<K> | undefined;
    subscribe<K extends KVStoreKey>(
        key: K,
        callback: (oldValue: KVStoreValue<K> | undefined) => void
    ): () => void;
};

export function useKVStoreValue<T extends KVStoreKey>(
    key: T,
    initialValue: KVStoreValue<T>
) {
    kvStore.initKey(key, initialValue);

    const value = useSyncExternalStore(
        (callback) => kvStore.subscribe(key, callback),
        () => kvStore.getSnapshot(key)
    );

    invariant(value, `Store value for "${key}" key is missing`);

    return value;
}
