import { MODELS, Model, invariant } from "@convo-ai/shared";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePreferredModelStore } from "@/store/preferred-model";

export type OnSubmit = (data: {
    content: string;
    model: Model;
}) => Promise<void>;

type Props = {
    onSubmit: OnSubmit;
};

const OPTIONS = [
    "auto",
    MODELS["gpt-4.1-mini"],
    MODELS["gpt-4.1"],
    MODELS["o4-mini"],
    MODELS.o3,
];

export function MessageForm({ onSubmit }: Props) {
    const { model: preferredModel, setModel } = usePreferredModelStore();

    return (
        <form
            data-testid="message-form"
            onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const content = formData.get("content") as string | undefined;
                const model = formData.get("model") as Model | undefined;

                invariant(content, "Content must be defined");
                invariant(model, "Model must be defined");

                void onSubmit({ content, model });
                event.currentTarget.reset();
            }}
        >
            <div className="bg-input space-y-1 rounded-xl p-1">
                <Textarea
                    name="content"
                    placeholder="Message AI"
                    data-testid="message-input"
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
                <Select
                    name="model"
                    value={preferredModel}
                    onValueChange={(value) => {
                        setModel(value as Model);
                    }}
                >
                    <SelectTrigger className="w-[140px] shadow-none">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        {OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </form>
    );
}
