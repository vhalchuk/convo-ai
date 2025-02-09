import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/app-layout";
import { EmptyConversationView } from "@/components/empty-conversation-view";
import { ConversationView } from "@/components/conversation-view";

export default function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<EmptyConversationView />} />
                <Route path="/:conversationId" element={<ConversationView />} />
            </Route>
        </Routes>
    );
}
