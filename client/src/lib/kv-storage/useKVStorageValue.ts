import { useEffect, useState } from "react";
import { KVStorageKey, KVStorageValue } from "@/types";
import KVStorage from "./KVStorage";

// adjust the import path as needed

function useKVStorageValue<T extends KVStorageKey>(
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

    return state;
}

export default useKVStorageValue;
