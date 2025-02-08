import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useKVStorage from "@/lib/kv-storage/useKVStorage.ts";
import {
    Conversation,
    ConversationListItem,
    Message,
    RequestBody,
} from "@/types.ts";
import MessageForm, { OnSubmit } from "@/MessageForm.tsx";
import Messages from "@/Messages.tsx";
import { chat } from "@/api.ts";
import KVStorage from "@/lib/kv-storage/KVStorage.ts";

export default function ConversationView() {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const navigate = useNavigate();

    // Determine the storage key:
    // - if conversationId exists, use "conversation-<id>"
    // - otherwise use a temporary key "temp-conversation"
    const storageKey = conversationId
        ? `conversation-${conversationId}`
        : "temp-conversation";

    // Initialize conversation state.
    const [conversation, setConversation] = useKVStorage<Conversation>(
        storageKey,
        conversationId
            ? { id: conversationId, title: "", messages: [] }
            : { id: "", title: "", messages: [] }
    );

    const chatMutation = useMutation({
        mutationFn: (body: RequestBody) => chat(body),
        onSuccess: (data) => {
            setConversation((prev) => ({ ...prev, messages: data.messages }));
        },
    });

    const handleNewConversationSubmit: OnSubmit = async ({
        content,
        model,
    }) => {
        const newId = crypto.randomUUID();
        const newTitle =
            content.length > 32 ? content.slice(0, 32) + "..." : content;

        const newConv: Conversation = {
            id: newId,
            title: newTitle,
            messages: [{ role: "user", content }],
        };

        try {
            await Promise.all([
                KVStorage.setItem(`conversation-${newId}`, newConv),
                KVStorage.updateItem<ConversationListItem[]>(
                    "conversation-list",
                    (oldValue = []) => [
                        ...oldValue,
                        {
                            id: newConv.id,
                            title: newConv.title,
                        },
                    ]
                ),
            ]);
        } catch (error) {
            console.error("Error creating a new conversation:", error);
            return;
        }

        navigate(`/${newId}`, { replace: true });
        chatMutation.mutate({ messages: newConv.messages, model });
    };

    const handleExistingConversationSubmit: OnSubmit = ({ content, model }) => {
        const newMessages: Message[] = [
            ...conversation.messages,
            { role: "user", content },
        ];
        const updatedConv: Conversation = {
            ...conversation,
            messages: newMessages,
        };
        setConversation(updatedConv);
        chatMutation.mutate({ messages: newMessages, model });
    };

    const handleSubmit: OnSubmit = ({ content, model }) => {
        if (!conversationId) {
            handleNewConversationSubmit({ content, model });
        } else {
            handleExistingConversationSubmit({ content, model });
        }
    };

    return (
        <div className="flex h-screen flex-col">
            <div className="overflow-y-auto">
                <div className="mx-auto max-w-2xl flex-1 space-y-12 p-4">
                    <Messages messages={conversation.messages} />
                </div>
            </div>
            <div className="mx-auto w-full max-w-2xl px-4 pb-4">
                <MessageForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
