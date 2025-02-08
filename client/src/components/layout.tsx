import { AppSidebar } from "@/components/app-sidebar.tsx";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { Outlet } from "react-router-dom";

export default function Layout() {
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
