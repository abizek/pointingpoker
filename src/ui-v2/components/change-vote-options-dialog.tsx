import { useState, useSyncExternalStore } from "react"
import { useStore } from "@/hooks/store"
import { createExternalStore } from "@/utils/create-external-store"
import { selectVoteOptions } from "@/utils/rtdb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { VoteButtonsPreview } from "./vote-buttons-preview"

const [subscribe, getSnapshot, setOpen] = createExternalStore(false)

export const setChangeVoteOptionsDialogOpen = setOpen

export function ChangeVoteOptionsDialog() {
  const open = useSyncExternalStore(subscribe, getSnapshot)
  const { voteOptionsList, selectedVoteOptionsKey } = useStore()
  const [currentSelectedKey, setCurrentSelectedKey] = useState(
    selectedVoteOptionsKey,
  )

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    await selectVoteOptions(currentSelectedKey)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl gap-6">
        <DialogHeader>
          <DialogTitle>Change Vote Options</DialogTitle>
          <DialogDescription>
            You can change this room&apos;s vote options here. Click save when
            done. Do note that changing the vote options will clear votes and
            reset the timer.
          </DialogDescription>
        </DialogHeader>
        <VoteButtonsPreview
          voteValues={Object.values(voteOptionsList[+currentSelectedKey])}
        />
        <form onSubmit={handleSubmit}>
          <RadioGroup
            value={currentSelectedKey}
            onValueChange={setCurrentSelectedKey}
            className="justify-center mb-6"
            name="voteOptions"
          >
            {Object.entries(voteOptionsList).map(([key, options]) => (
              <div key={key} className="flex gap-3 items-center">
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key} className="text-base">
                  {Object.values(options).join(", ")}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}