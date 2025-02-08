import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import App from "@/App.tsx";
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
