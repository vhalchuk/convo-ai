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
        <div className="group/code-block relative mt-6 mb-6 overflow-visible">
            <div className="flex h-9 items-center justify-between rounded-t-[5px] bg-gray-700 px-4 py-2 text-xs select-none">
                {language}
            </div>
            <div className="sticky top-9">
                <Button
                    variant="link"
                    size="icon"
                    onClick={() => {
                        void copyToClipboard();
                    }}
                    className="absolute right-0 bottom-0 h-9 group-hover/code-block:visible"
                    aria-label="Copy code"
                >
                    {copied ? <Check /> : <Copy />}
                </Button>
            </div>
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
