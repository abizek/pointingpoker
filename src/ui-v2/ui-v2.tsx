import { Suspense, lazy, useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { useVoteStats } from "@/hooks/vote-stats"
import { useLoading } from "@/hooks/loading"
import { cn } from "@/utils/cn"
import { Nav } from "./components/nav"
import { VoteButtons } from "./components/vote-buttons"
import { DisconnectedDrawerDialog } from "./components/disconnected-drawer-dialog"
import { NameDrawerDialog } from "./components/name-drawer-dialog"
import { VoteOptionsDrawerDialog } from "./components/vote-options-drawer-dialog"
import { VotesCard } from "./components/votes-card"
import { ThemeProvider } from "./components/theme-provider"
import { FeedbackDrawerDialog } from "./components/feedback-drawer-dialog"
import { StatsSkeletonLoader } from "./components/skeleton-loader"
import { NewPlayerHint } from "./components/new-player-hint"
import { useStore } from "@/hooks/store"
import { ShareSessionCard } from "./components/share-session-card"

const StatsCard = lazy(() => import("./components/stats-card"))

export default function UIV2() {
  const { width, height } = useWindowSize()
  const { consensus } = useVoteStats()
  const loading = useLoading()
  const [isConfettiVisible, setIsConfettiVisible] = useState(false)
  const { users } = useStore()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (consensus) {
      setIsConfettiVisible(true)
      timer = setTimeout(() => {
        setIsConfettiVisible(false)
      }, 10 * 1000)
    } else {
      setIsConfettiVisible(false)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [consensus])

  return (
    <ThemeProvider>
      <div
        className={cn(
          "grid grid-rows-[auto_1fr] place-items-center h-dvh",
          loading && "cursor-progress",
        )}
      >
        <Nav />
        <div className="flex flex-col gap-6 my-8 mx-4 max-w-xl">
          {Object.keys(users).length > 1 ? (
            <>
              <VoteButtons />
              <NewPlayerHint />
              <VotesCard />
              <Suspense fallback={<StatsSkeletonLoader />}>
                <StatsCard />
              </Suspense>
            </>
          ) : (
            <ShareSessionCard />
          )}
        </div>
      </div>
      {isConfettiVisible && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          onConfettiComplete={(confetti) => confetti?.reset()}
        />
      )}
      <DisconnectedDrawerDialog />
      <NameDrawerDialog />
      <VoteOptionsDrawerDialog />
      <FeedbackDrawerDialog />
    </ThemeProvider>
  )
}
