import { useState, useEffect, useCallback } from "react";
import KVStorage from "./KVStorage";
import { KVStorageKey, KVStorageValue } from "@/types"; // adjust the import path as needed

function useKVStorage<T extends KVStorageKey>(
    key: T,
    initialValue: KVStorageValue<T>
) {
    const [state, setState] = useState<KVStorageValue<T>>(initialValue);

    // Load initial value from KVStorage on mount
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const stored = await KVStorage.getItem(key);
                if (stored !== undefined && isMounted) {
                    setState(stored);
                }
            } catch (error) {
                console.error(`Error loading key "${key}":`, error);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [key]);

    useEffect(() => {
        return KVStorage.subscribe(key, (value) => {
            setState(value);
        });
    }, [key]);

    // Setter that updates both state and KVStorage
    const setKVState = useCallback(
        (
            value:
                | KVStorageValue<T>
                | ((prev: KVStorageValue<T>) => KVStorageValue<T>)
        ) => {
            setState((prev) => {
                const newValue =
                    typeof value === "function"
                        ? (
                              value as (
                                  prev: KVStorageValue<T>
                              ) => KVStorageValue<T>
                          )(prev)
                        : value;
                KVStorage.setItem(key, newValue).catch((error) =>
                    console.error(`Error setting key "${key}":`, error)
                );
                return newValue;
            });
        },
        [key]
    );

    // Optional updater that uses KVStorage's updateItem
    const updateKVState = useCallback(
        (
            updater: (prev: KVStorageValue<T> | undefined) => KVStorageValue<T>
        ) => {
            setState((prev) => {
                const newValue = updater(prev);
                KVStorage.setItem(key, newValue).catch((error) =>
                    console.error(`Error updating key "${key}":`, error)
                );
                return newValue;
            });
        },
        [key]
    );

    return [state, setKVState, updateKVState] as const;
}

export default useKVStorage;
