import { user } from "@/utils/firebase"
import { isNewPlayer } from "@/utils/misc"

type NameProps = {
  children: string
}

export function Name({ children }: NameProps) {
  const isCurrentPlayer = children === user.username

  return (
    <div className="col-start-2 text-left">
      {children} {isNewPlayer() && isCurrentPlayer && "(you)"}
    </div>
  )
}
