import { messageAI } from "./api.ts";

function App() {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <aside className="h-full w-[260px] bg-gray-900"></aside>
            <main className="flex h-full grow flex-col bg-gray-800">
                <div className="flex-1 overflow-hidden">Messages section</div>
                <div className="p-4">
                    <div className="bg-gray-700">
                        <textarea
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

                                    const response = messageAI(
                                        event.currentTarget.value
                                    );

                                    event.currentTarget.value = "";

                                    response.then(({ response_message }) => {
                                        alert(response_message);
                                    });
                                }
                            }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
