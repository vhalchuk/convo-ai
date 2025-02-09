import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
    return (
        <>
            <AppSidebar />
            <SidebarInset>
                <SidebarTrigger className="bg-background fixed top-3 left-3 md:hidden" />
                <Outlet />
            </SidebarInset>
        </>
    );
}
