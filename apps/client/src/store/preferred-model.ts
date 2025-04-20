import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MODELS, type Model } from "@convo-ai/shared";

type PreferredModelState = {
    model: Model;
    setModel: (model: Model) => void;
};

export const usePreferredModelStore = create<PreferredModelState>()(
    persist(
        (set) => ({
            model: MODELS["gpt-4.1-mini"],
            setModel: (model) => {
                set({ model });
            },
        }),
        {
            name: "preferred-model",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
