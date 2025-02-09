import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useKVStorage from "@/lib/kv-storage/useKVStorage";
import { Conversation, Message, RequestBody } from "@/types";
import { MessageForm, type OnSubmit } from "@/components/message-form";
import { Messages } from "@/components/messages";
import { chat } from "@/api";
import invariant from "@/lib/invariant";

export function ConversationView() {
    const { conversationId } = useParams<{ conversationId?: string }>();

    invariant(conversationId, "conversationId must be defined");

    const [conversation, setConversation] = useKVStorage(
        `conversation-${conversationId}`,
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

    const handleSubmit: OnSubmit = ({ content, model }) => {
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

    return (
        <div className="flex h-screen flex-col">
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-12 p-4">
                    <Messages messages={conversation.messages} />
                </div>
            </div>
            <div className="mx-auto w-full max-w-2xl px-4 pb-4">
                <MessageForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
