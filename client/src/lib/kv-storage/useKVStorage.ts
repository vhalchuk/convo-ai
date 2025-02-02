import { useState, useEffect, useCallback } from "react";
import KVStorage from "./KVStorage"; // adjust the import path as needed

function useKVStorage<T>(key: string, initialValue: T) {
    const [state, setState] = useState<T>(initialValue);

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

    // Setter that updates both state and KVStorage
    const setKVState = useCallback(
        (value: T | ((prev: T) => T)) => {
            setState((prev) => {
                const newValue =
                    typeof value === "function"
                        ? (value as (prev: T) => T)(prev)
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
        (updater: (prev: T | undefined) => T) => {
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
