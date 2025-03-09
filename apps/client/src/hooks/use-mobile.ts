import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
        undefined
    );

    React.useEffect(() => {
        const controller = new AbortController();

        const mql = window.matchMedia(
            `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
        );

        mql.addEventListener(
            "change",
            () => {
                setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
            },
            {
                signal: controller.signal,
            }
        );

        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

        return () => {
            controller.abort();
        };
    }, []);

    return !!isMobile;
}
