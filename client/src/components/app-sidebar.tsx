import { type ComponentProps } from "react";
import { X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NewConvoButton } from "@/components/new-convo-button";
import { Button } from "@/components/ui/button.tsx";
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
import invariant from "@/lib/invariant.ts";
import KVStorage from "@/lib/kv-storage/KVStorage.ts";
import useKVStorageValue from "@/lib/kv-storage/useKVStorageValue";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const navigate = useNavigate();

    const conversationIds = useKVStorageValue("conversation-list", []);
    const { conversationId } = useParams<{ conversationId?: string }>();

    const handleDelete = (id: string) => {
        if (conversationId === id) {
            navigate("/");
        }

        void KVStorage.updateItem("conversation-list", (conversationList) => {
            invariant(conversationList, "Conversation list must be defined");
            return conversationList.filter((item) => item.id !== id);
        });
        void KVStorage.deleteItem(`conversation-${id}`);
    };

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
                                <SidebarMenuItem
                                    key={item.id}
                                    className="group/menu-item"
                                >
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.id === conversationId}
                                    >
                                        <Link to={item.id}>{item.title}</Link>
                                    </SidebarMenuButton>
                                    <Button
                                        variant="link"
                                        size="icon"
                                        className="absolute bottom-0 top-0 right-0 size-8 invisible group-hover/menu-item:visible"
                                        aria-label="Delete conversation"
                                        onClick={() => {
                                            handleDelete(item.id);
                                        }}
                                    >
                                        <X />
                                    </Button>
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
