import React, { PropsWithChildren, useState } from "react";
import { clsx } from "clsx";
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
    const match = /language-(\w+)/.exec(className ?? "");
    const language = match?.[1] ?? "javascript";

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

    if (!match) {
        return <code className={className}>{children}</code>;
    }

    return (
        <span className="group/code-block relative mt-6 mb-6 block overflow-visible">
            <span className="flex h-9 items-center justify-between rounded-t-[5px] bg-neutral-700 px-4 py-2 text-xs select-none">
                {language}
            </span>
            <span className="sticky top-9 block">
                <Button
                    variant="link"
                    size="icon"
                    onClick={() => {
                        void copyToClipboard();
                    }}
                    className="invisible absolute right-0 bottom-0 h-9 group-hover/code-block:visible"
                    aria-label="Copy code"
                >
                    {copied ? <Check /> : <Copy />}
                </Button>
            </span>
            <Highlight language={language} theme={themes.vsDark} code={code}>
                {({
                    className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps,
                }) => (
                    <pre
                        className={clsx(
                            "mt-0 mb-0 rounded-t-[0px] rounded-b-[5px]",
                            className
                        )}
                        style={style}
                    >
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
        </span>
    );
};
const Pre = ({ children }: PropsWithChildren) => <>{children}</>;

const CopyAssistantMessageButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        const result = await tryCatch(navigator.clipboard.writeText(content));

        if (result.isOk()) {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => {
                void copyToClipboard();
            }}
            aria-label="Copy message"
        >
            {copied ? (
                <Check className="h-4 w-4" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    );
};

export function Messages({ messages }: Props) {
    return messages.map(({ role, content, model }, index) => {
        if (role === "assistant") {
            return (
                <div
                    key={index}
                    className="prose prose-invert"
                    data-testid="assistant-message"
                >
                    {model && (
                        <div className="text-muted-foreground mb-2 text-sm">
                            Using model: {model}
                        </div>
                    )}
                    <div data-testid="assistant-message-content">
                        <Markdown
                            components={{
                                code: Code,
                                pre: Pre,
                            }}
                        >
                            {content}
                        </Markdown>
                    </div>
                    <CopyAssistantMessageButton content={content} />
                </div>
            );
        }

        // role === "user"
        return (
            <div key={index} className="flex justify-end">
                <div
                    className="bg-muted max-w-[80%] rounded-2xl p-4"
                    data-testid="user-message"
                >
                    {content}
                </div>
            </div>
        );
    });
}
