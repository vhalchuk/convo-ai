import { useSyncExternalStore } from "react";
import { del, get, set, update } from "idb-keyval";
import { KVStoreKey, KVStoreValue } from "@/types.ts";
import KVStore from "./KVStore.ts";

export const kvStore = KVStore.getInstance({
    get,
    del,
    set,
    update,
});

export function useKVStoreValue<T extends KVStoreKey>(
    key: T,
    initialValue: KVStoreValue<T>
) {
    kvStore.initKey(key, initialValue);

    return useSyncExternalStore(
        (callback) => kvStore.subscribe(key, callback),
        () => kvStore.getSnapshot(key)
    )!;
}
