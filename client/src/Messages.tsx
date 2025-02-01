import { Message } from "@/types.ts";

type Props = {
    messages: Message[];
};

export default function Messages({ messages }: Props) {
    return messages.map(({ role, content }, index) => {
        if (role === "assistant") {
            return (
                <div key={index}>
                    <div>{content}</div>
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
