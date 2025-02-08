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
import useKVStorage from "@/lib/kv-storage/useKVStorage.ts";
import { ConversationListItem } from "@/types.ts";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const [conversationIds] = useKVStorage<ConversationListItem[]>(
        "conversation-list",
        []
    );
    const { conversationId } = useParams<{ conversationId?: string }>();

    return (
        <Sidebar {...props}>
            <SidebarContent>
                <SidebarHeader>Convo AI</SidebarHeader>
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
