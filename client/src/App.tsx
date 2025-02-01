import MessageForm, { OnSubmit } from "@/MessageForm.tsx";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Message, RequestBody } from "@/types.ts";
import { chat } from "@/api.ts";
import Messages from "@/Messages.tsx";

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const chatMutation = useMutation({
        mutationFn: (body: RequestBody) => chat(body),
        onSuccess: (data) => {
            setMessages(data.messages);
        },
    });

    const handleSubmit: OnSubmit = ({ content, model }) => {
        const newMessages: Message[] = [...messages, { role: "user", content }];
        setMessages(newMessages);
        chatMutation.mutate({
            messages: newMessages,
            model,
        });
    };

    return (
        <div className="flex h-full w-full overflow-hidden">
            <aside className="h-full w-[260px] shrink-0 border-r border-neutral-800"></aside>
            <main className="flex h-full grow flex-col">
                <div className="flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <div className="mx-auto max-w-2xl space-y-12 p-4">
                            <Messages messages={messages} />
                        </div>
                    </div>
                </div>
                <div className="mx-auto w-full max-w-2xl px-4 pb-4">
                    <MessageForm onSubmit={handleSubmit} />
                </div>
            </main>
        </div>
    );
}

export default App;
