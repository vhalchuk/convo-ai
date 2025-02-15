import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { SidebarProvider } from "@/components/ui/sidebar";
import "@/index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <SidebarProvider>
                    <App />
                </SidebarProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>
);
