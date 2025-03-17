import React, { PropsWithChildren, useState } from "react";
import { omit } from "lodash-es";
import { Check, Copy } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import Markdown, { ExtraProps } from "react-markdown";
import { Message, tryCatch } from "@convo-ai/shared";
import { Button } from "@/components/ui/button.tsx";

type Props = {
    messages: Message[];
};

type Component = React.ElementType<
    React.ClassAttributes<HTMLElement> &
        React.HTMLAttributes<HTMLElement> &
        ExtraProps
>;

const Code: Component = ({ children, className }) => {
    const language =
        /language-(\w+)/.exec(className ?? "")?.[1] ?? "javascript";

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const code = String(children).replace(/\n$/, "");

    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        const result = await tryCatch(navigator.clipboard.writeText(code));

        if (result.isOk()) {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    };

    return (
        <div className="group/code-block relative">
            <Highlight language={language} theme={themes.vsDark} code={code}>
                {({
                    className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps,
                }) => (
                    <pre className={className} style={style}>
                        {tokens.map((line, i) => (
                            <div
                                key={i}
                                {...omit(getLineProps({ line, key: i }), "key")}
                            >
                                {line.map((token, key) => (
                                    <span
                                        key={key}
                                        {...omit(
                                            getTokenProps({ token, key }),
                                            "key"
                                        )}
                                    />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
            <Button
                variant="link"
                size="icon"
                onClick={() => {
                    void copyToClipboard();
                }}
                className="invisible absolute top-2 right-2 group-hover/code-block:visible"
                aria-label="Copy code"
            >
                {copied ? <Check /> : <Copy />}
            </Button>
        </div>
    );
};
const Pre = ({ children }: PropsWithChildren) => <>{children}</>;

export function Messages({ messages }: Props) {
    return messages.map(({ role, content }, index) => {
        if (role === "assistant") {
            return (
                <div key={index} className="prose prose-invert">
                    <Markdown
                        components={{
                            code: Code,
                            pre: Pre,
                        }}
                    >
                        {content}
                    </Markdown>
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
