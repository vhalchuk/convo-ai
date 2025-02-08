import { Route, Routes } from "react-router-dom";
import ConversationView from "@/ConversationView.tsx";
import Layout from "@/components/layout.tsx";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<ConversationView />} />
                <Route path="/:conversationId" element={<ConversationView />} />
            </Route>
        </Routes>
    );
}
