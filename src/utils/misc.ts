import { user } from "./firebase"

export function isNewPlayer(): boolean {
  return user.username === `player ${user.currentUserId.slice(0, 3)}`
}
