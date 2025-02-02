import { get, set, update, del } from "idb-keyval";

type Updater<T> = (oldValue: T | undefined) => T;

class KVStorage {
    // Hold the singleton instance
    static instance: KVStorage | null = null;

    constructor() {
        if (KVStorage.instance) {
            return KVStorage.instance;
        }
        KVStorage.instance = this;
    }

    static getInstance() {
        if (!KVStorage.instance) {
            KVStorage.instance = new KVStorage();
        }
        return KVStorage.instance;
    }

    async setItem(key: string, value: any) {
        try {
            await set(key, value);
            return true;
        } catch (error) {
            console.error("Error setting item:", error);
            throw error;
        }
    }

    async getItem(key: string) {
        try {
            return await get(key);
        } catch (error) {
            console.error("Error getting item:", error);
            throw error;
        }
    }

    async updateItem<T>(key: string, updater: Updater<T>) {
        try {
            return await update(key, updater);
        } catch (error) {
            console.error("Error updating item:", error);
            throw error;
        }
    }

    async deleteItem(key: string) {
        try {
            await del(key);
            return true;
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error;
        }
    }
}

export default KVStorage.getInstance();
