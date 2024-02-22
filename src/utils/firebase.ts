import { initializeApp } from "@firebase/app"
import {
  child,
  get,
  getDatabase,
  ref,
  serverTimestamp,
  update,
} from "@firebase/database"
import { getAuth, signInAnonymously, updateProfile, User } from "@firebase/auth"
import { has } from "lodash-es"
import LogRocket from "logrocket"
import { asyncQueue } from "../hooks/loading"
import { roomId } from "./room-id"

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
export const db = getDatabase(app)

if (import.meta.env.DEV) {
  const { connectAuthEmulator } = await import("@firebase/auth")
  const { connectDatabaseEmulator } = await import("@firebase/database")

  connectAuthEmulator(auth, "http://127.0.0.1:9099")
  connectDatabaseEmulator(db, "127.0.0.1", 9001)
}

export const roomRef = ref(db, `rooms/${roomId}`)

export const user = {
  get currentUser() {
    return auth.currentUser as User
  },
  get currentUserId() {
    return this.currentUser.uid
  },
  get username() {
    return this.currentUser.displayName
  },
}

;(async () => {
  try {
    try {
      await asyncQueue.add(() => signInAnonymously(auth))
    } catch (error) {
      if (error instanceof Error) {
        LogRocket.captureException(error, {
          extra: { errorMessage: "Error while signing in anonymously" },
        })
      } else {
        LogRocket.captureMessage("Error while signing in anonymously", {
          extra: { errorMessage: error as string },
        })
      }
      throw error
    }

    LogRocket.identify(user.currentUserId)
    if (!user.username) {
      await asyncQueue.add(() =>
        updateProfile(user.currentUser, {
          displayName: `player ${user.currentUserId.slice(0, 3)}`,
        }),
      )
    }

    // Setup room
    const roomSnapshot = await asyncQueue.add(() =>
      get(child(ref(db), `rooms/${roomId}`)),
    )

    let updates: Partial<RoomUpdates> = {}
    if (!roomSnapshot?.exists()) {
      // Initializing room
      updates = {
        endTime: 0,
        voteOptionsList: {
          "0": { ...[0.5, 1, 2, 3, 5, 8, 13, 20] },
          "1": { ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        },
        selectedVoteOptionsKey: "0",
      }
    }

    if (!has(roomSnapshot?.val(), "users")) {
      // Set startTime if first user to join
      updates.startTime = serverTimestamp()
    }

    // Add current user
    updates[`users/${user.currentUserId}/name`] = user.username as string
    updates[`users/${user.currentUserId}/hasVoted`] = false
    updates[`users/${user.currentUserId}/vote`] = 0

    await asyncQueue.add(() => update(roomRef, updates))
  } catch (error) {
    if (error instanceof Error) {
      LogRocket.captureException(error, {
        extra: { errorMessage: "Error while setting up room" },
      })
    } else {
      LogRocket.captureMessage("Error while setting up room", {
        extra: { errorMessage: error as string },
      })
    }
    throw error
  }
})()
