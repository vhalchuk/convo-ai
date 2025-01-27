export async function messageAI(question: string) {
    const response = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({
            question,
        }),
    });

    const content = await response.json();

    return content as {
        response_message: string;
    };
}
