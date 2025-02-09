import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function NewConvoButton() {
    const navigate = useNavigate();

    return (
        <Button
            variant="ghost"
            size="icon"
            className={"h-7 w-7"}
            onClick={() => {
                navigate("/");
            }}
        >
            <SquarePen />
            <span className="sr-only">New conversation</span>
        </Button>
    );
}
