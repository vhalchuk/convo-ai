import MessageForm from "./MessageForm.tsx";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Message } from "./types.ts";
import { chat } from "./api.ts";

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
            <aside className="h-full w-[260px] bg-gray-900"></aside>
            <main className="flex h-full grow flex-col bg-gray-800">
                <div className="flex-1 overflow-hidden">
                    {messages.map(({ role, content }, index) => {
                        return (
                            <div key={index}>
                                {role}: {content}
                            </div>
                        );
                    })}
                </div>
                <div className="p-4">
                    <MessageForm onSubmit={handleSubmit} />
                </div>
            </main>
        </div>
    );
}

export default App;
