import { type ComponentProps } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import useKVStorageValue from "@/lib/kv-storage/useKVStorageValue";
import { NewConvoButton } from "@/components/new-convo-button";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const conversationIds = useKVStorageValue("conversation-list", []);
    const { conversationId } = useParams<{ conversationId?: string }>();

    return (
        <Sidebar {...props}>
            <SidebarContent>
                <SidebarHeader>
                    <div className="flex justify-between p-2">
                        <h1 className="font-bold">Convo AI</h1>
                        <NewConvoButton />
                    </div>
                </SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {conversationIds.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.id === conversationId}
                                    >
                                        <Link to={item.id}>{item.title}</Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
