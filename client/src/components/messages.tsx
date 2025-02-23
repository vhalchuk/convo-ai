import Markdown from "react-markdown";
import { Message } from "@/types";

type Props = {
    messages: Message[];
};

export function Messages({ messages }: Props) {
    return messages.map(({ role, content }, index) => {
        if (role === "assistant") {
            return (
                <div key={index} className="prose prose-invert">
                    <Markdown>{content}</Markdown>
                </div>
            );
        }

        // role === "user"
        return (
            <div key={index} className="flex justify-end">
                <div className="bg-muted max-w-[80%] rounded-2xl p-4">
                    {content}
                </div>
            </div>
        );
    });
}
