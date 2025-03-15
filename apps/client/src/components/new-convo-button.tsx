import { SquarePen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NewConvoButton() {
    const navigate = useNavigate();

    return (
        <Button
            variant="ghost"
            size="icon"
            className={"h-7 w-7"}
            onClick={() => {
                void navigate("/");
            }}
        >
            <SquarePen />
            <span className="sr-only">New conversation</span>
        </Button>
    );
}
