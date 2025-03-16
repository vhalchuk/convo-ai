import { type ComponentProps } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tryCatch } from "@convo-ai/shared";
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
import { db } from "@/lib/db.ts";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const navigate = useNavigate();

    const conversations = useLiveQuery(
        () => db.conversations.orderBy("lastMessageAt").reverse().toArray(),
        [],
        []
    );

    const { conversationId } = useParams<{ conversationId?: string }>();

    const handleDelete = (conversationIdToDelete: string) => {
        void tryCatch(
            db.transaction("rw", db.conversations, db.messages, async () => {
                await db.messages
                    .where("conversationId")
                    .equals(conversationIdToDelete)
                    .delete();
                await db.conversations.delete(conversationIdToDelete);
            })
        );

        if (conversationId === conversationIdToDelete) {
            void navigate("/");
        }
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
                            {conversations.map((item) => (
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
                                        className="invisible absolute top-0 right-0 bottom-0 size-8 group-hover/menu-item:visible"
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
