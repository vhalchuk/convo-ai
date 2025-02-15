import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MODELS } from "@/constants";
import invariant from "@/lib/invariant";
import { Model } from "@/types";

export type OnSubmit = (data: { content: string; model: Model }) => void;

type Props = {
    onSubmit: OnSubmit;
};

export function MessageForm({ onSubmit }: Props) {
    return (
        <form
            onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const content = formData.get("content") as string | undefined;
                const model = formData.get("model") as Model | undefined;

                invariant(content, "Content must be defined");
                invariant(model, "Model must be defined");

                onSubmit({ content, model });
                event.currentTarget.reset();
            }}
        >
            <div className="bg-input space-y-1 rounded-xl p-1">
                <Textarea
                    name="content"
                    placeholder="Message AI"
                    className="min-h-16 resize-none p-2 shadow-none"
                    onInput={(event) => {
                        event.currentTarget.style.height = "auto"; // Reset height to calculate new height
                        const nextHeight = Math.min(
                            event.currentTarget.scrollHeight,
                            256
                        );
                        event.currentTarget.style.height = `${nextHeight}px`; // Set height to scrollHeight
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit(); // Submits the form
                        }
                    }}
                />
                <Select name="model" defaultValue={MODELS.GPT4oMini}>
                    <SelectTrigger className="w-[140px] shadow-none">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(MODELS).map((model) => (
                            <SelectItem key={model} value={model}>
                                {model}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </form>
    );
}
