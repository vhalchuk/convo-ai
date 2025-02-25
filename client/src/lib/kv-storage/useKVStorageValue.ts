import { useEffect, useState } from "react";
import { tryCatch } from "@/lib/tryCatch.ts";
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
            const { data } = await tryCatch(KVStorage.getItem(key));

            if (data && isMounted) {
                setState(data);
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
