import { MoreVertical } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu"
import { clearVotes } from "@/utils/rtdb"
import { setEditNameDialogOpen } from "./edit-name-dialog"
import { setChangeVoteOptionsDialogOpen } from "./change-vote-options-dialog"

export function MoreDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={clearVotes}>Clear Votes</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setChangeVoteOptionsDialogOpen(true)
          }}
        >
          Change Vote Options
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setEditNameDialogOpen(true)
          }}
        >
          Edit Username
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}