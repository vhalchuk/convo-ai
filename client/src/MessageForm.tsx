import invariant from "./utils/invariant.ts";

type Props = {
    onSubmit: (content: string) => void;
};

export default function MessageForm({ onSubmit }: Props) {
    return (
        <form
            onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const message = formData.get("message") as string | undefined;
                invariant(message, "Message must be defined");
                onSubmit(message);
                event.currentTarget.reset();
            }}
        >
            <div className="bg-gray-700">
                <textarea
                    name="message"
                    placeholder="Message AI"
                    className="block h-10 min-h-16 w-full resize-none border-0 bg-transparent p-2"
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
            </div>
            <button
                type="submit"
                className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
                Submit
            </button>
        </form>
    );
}
