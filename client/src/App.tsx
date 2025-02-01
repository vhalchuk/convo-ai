import MessageForm from "@/MessageForm.tsx";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Message } from "@/types.ts";
import { chat } from "@/api.ts";
import Messages from "@/Messages.tsx";

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const chatMutation = useMutation({
        mutationFn: (allMessages: Message[]) => chat(allMessages),
        onSuccess: (data) => {
            setMessages(data.messages);
        },
    });

    const handleSubmit = (content: string) => {
        const newMessages: Message[] = [...messages, { role: "user", content }];
        setMessages(newMessages);
        chatMutation.mutate(newMessages);
    };

    return (
        <div className="flex h-full w-full overflow-hidden">
            <aside className="h-full w-[260px] shrink-0 bg-gray-800"></aside>
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
