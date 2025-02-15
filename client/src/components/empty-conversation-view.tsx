import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { chat } from "@/api";
import { MessageForm, type OnSubmit } from "@/components/message-form";
import KVStorage from "@/lib/kv-storage/KVStorage";
import { Conversation, RequestBody } from "@/types";

export function EmptyConversationView() {
    const navigate = useNavigate();

    const chatMutation = useMutation({
        mutationFn: (body: RequestBody) => chat(body),
    });

    const handleSubmit: OnSubmit = async ({ content, model }) => {
        const newId = crypto.randomUUID();
        const newConversationId = `conversation-${newId}` as const;
        const newTitle =
            content.length > 32 ? content.slice(0, 32) + "..." : content;

        const newConv: Conversation = {
            id: newId,
            title: newTitle,
            messages: [{ role: "user", content }],
        };

        try {
            await Promise.all([
                KVStorage.setItem(newConversationId, newConv),
                KVStorage.updateItem("conversation-list", (oldValue = []) => [
                    {
                        id: newConv.id,
                        title: newConv.title,
                    },
                    ...oldValue,
                ]),
            ]);
        } catch (error) {
            console.error("Error creating a new conversation:", error);
            return;
        }

        navigate(`/${newId}`, { replace: true });

        const { messages } = await chatMutation.mutateAsync({
            messages: newConv.messages,
            model,
        });

        void KVStorage.updateItem(newConversationId, (oldValue) => ({
            ...(oldValue as Conversation),
            messages,
        }));
    };

    return (
        <div className="flex h-screen flex-col">
            <h2 className="prose prose-invert mx-auto flex max-w-2xl flex-1 items-center justify-center space-y-12 p-4 text-xl">
                Write a message to AI
            </h2>
            <div className="mx-auto w-full max-w-2xl px-4 pb-4">
                <MessageForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
