import { create } from "zustand";

type StreamingState = {
    streaming: boolean;
    setStreaming: (isStreaming: boolean) => void;
};

export const useStreamingStore = create<StreamingState>((set) => ({
    streaming: false,

    setStreaming: (isStreaming: boolean) => {
        set(() => ({
            streaming: isStreaming,
        }));
    },
}));

export const useStreamingActions = () => {
    return useStreamingStore((state) => ({
        setStreaming: state.setStreaming,
    }));
};
