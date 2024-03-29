import {
  ref,
  serverTimestamp,
  update,
  push,
  onDisconnect,
} from "@firebase/database"
import { updateProfile } from "@firebase/auth"
import LogRocket from "logrocket"
import { asyncQueue } from "../hooks/loading"
import { deferVoteUpdate, getStore, setCurrentVote } from "../hooks/store"
import { currentUser, currentUserId, db, roomRef } from "./firebase"
import { roomId } from "./room-id"

export async function vote(selectedOption: number): Promise<void> {
  try {
    // To defer vote update until everyone has voted
    deferVoteUpdate(`users/${currentUserId}/vote`, selectedOption)
    // To show the current user their vote
    setCurrentVote(selectedOption)

    const updates: Partial<RoomUpdates> = {
      endTime: serverTimestamp(),
    }
    updates[`users/${currentUserId}/hasVoted`] = true
    await updateDb(updates)
  } catch (error) {
    if (error instanceof Error) {
      LogRocket.captureException(error, {
        extra: { errorMessage: "Error in voting" },
      })
    } else {
      LogRocket.captureMessage("Error in voting", {
        extra: { errorMessage: error as string },
      })
    }
    throw error
  }
}

export async function clearVotes(): Promise<void> {
  try {
    setCurrentVote("?")
    await updateDb(getClearVotesUpdates())
  } catch (error) {
    if (error instanceof Error) {
      LogRocket.captureException(error, {
        extra: { errorMessage: "Error in clearing votes" },
      })
    } else {
      LogRocket.captureMessage("Error in clearing votes", {
        extra: { errorMessage: error as string },
      })
    }
    throw error
  }
}

export async function selectVoteOptions(
  selectedVoteOptionsKey: string,
): Promise<void> {
  try {
    if (getStore().selectedVoteOptionsKey !== selectedVoteOptionsKey) {
      await updateDb({ selectedVoteOptionsKey, ...getClearVotesUpdates() })
    }
  } catch (error) {
    if (error instanceof Error) {
      LogRocket.captureException(error, {
        extra: { errorMessage: "Error in selecting vote options" },
      })
    } else {
      LogRocket.captureMessage("Error in selecting vote options", {
        extra: { errorMessage: error as string },
      })
    }
    throw error
  }
}

export async function createVoteOptions(newVoteOptions: {
  [key: number]: number
}): Promise<void> {
  try {
    await asyncQueue.add(() =>
      update(push(ref(db, `rooms/${roomId}/voteOptionsList`)), newVoteOptions),
    )
  } catch (error) {
    if (error instanceof Error) {
      LogRocket.captureException(error, {
        extra: { errorMessage: "Error in creating vote options" },
      })
    } else {
      LogRocket.captureMessage("Error in creating vote options", {
        extra: { errorMessage: error as string },
      })
    }
    throw error
  }
}

export async function setName(name: string): Promise<void> {
  try {
    if (!name || name === currentUser.displayName) {
      return
    }

    LogRocket.identify(currentUserId, { name })
    await asyncQueue.addAll([
      () =>
        updateProfile(currentUser, {
          displayName: name,
        }),
      () => update(roomRef, { [`users/${currentUserId}/name`]: name }),
    ])
  } catch (error) {
    if (error instanceof Error) {
      LogRocket.captureException(error, {
        extra: { errorMessage: "Error while setting name" },
      })
    } else {
      LogRocket.captureMessage("Error while setting name", {
        extra: { errorMessage: error as string },
      })
    }
    throw error
  }
}

function getClearVotesUpdates(): Partial<RoomUpdates> {
  const updates: Partial<RoomUpdates> = {
    startTime: serverTimestamp(),
    endTime: 0,
  }
  for (const id of Object.keys(getStore().users)) {
    updates[`users/${id}/hasVoted`] = false
  }

  return updates
}

export async function updateDb(updates: Partial<RoomUpdates>): Promise<void> {
  await asyncQueue.add(() => update(roomRef, updates))
}

export async function setupReconnection(): Promise<void> {
  try {
    const updates: Partial<RoomUpdates> = {}
    updates[`users/${currentUserId}/name`] = currentUser.displayName as string
    updates[`users/${currentUserId}/hasVoted`] = false
    updates[`users/${currentUserId}/vote`] = 0
    await updateDb(updates)
    // Delete user from db on disconnect
    await onDisconnect(
      ref(db, `rooms/${roomId}/users/${currentUserId}`),
    ).remove()
  } catch (error) {
    if (error instanceof Error) {
      LogRocket.captureException(error, {
        extra: { errorMessage: "Error while setting up reconnection" },
      })
    } else {
      LogRocket.captureMessage("Error while setting up reconnection", {
        extra: { errorMessage: error as string },
      })
    }
    throw error
  }
}
