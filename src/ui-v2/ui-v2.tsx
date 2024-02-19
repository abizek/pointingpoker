import { Suspense, lazy, useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { useVoteStats } from "@/hooks/vote-stats"
import { useLoading } from "@/hooks/loading"
import { cn } from "@/utils/cn"
import { ThemeProvider } from "./components/theme-provider"
import {
  AppContentSkeletonLoader,
  GraphSkeletonLoader,
  NavSkeletonLoader,
} from "./components/skeleton-loader"

const Nav = lazy(() => import("./components/nav"))
const VoteButtons = lazy(() => import("./components/vote-buttons"))
const Votes = lazy(() => import("./components/votes"))
const VotesGraph = lazy(() => import("./components/votes-graph"))
const DisconnectedDrawerDialog = lazy(
  () => import("./components/disconnected-drawer-dialog"),
)
const NameDrawerDialog = lazy(() => import("./components/name-drawer-dialog"))
const VoteOptionsDrawerDialog = lazy(
  () => import("./components/vote-options-drawer-dialog"),
)
const FeedbackDrawerDialog = lazy(
  () => import("./components/feedback-drawer-dialog"),
)

export default function UIV2() {
  const { width, height } = useWindowSize()
  const { consensus } = useVoteStats()
  const loading = useLoading()
  const [isConfettiVisible, setIsConfettiVisible] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (consensus) {
      setIsConfettiVisible(true)
      timer = setTimeout(() => {
        setIsConfettiVisible(false)
      }, 1000 * 10)
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
        <Suspense fallback={<NavSkeletonLoader />}>
          <Nav />
        </Suspense>
        <Suspense fallback={<AppContentSkeletonLoader />}>
          <div className="flex flex-col gap-6 my-8 mx-4 max-w-xl">
            <VoteButtons />
            <Votes />
            <Suspense fallback={<GraphSkeletonLoader />}>
              <VotesGraph />
            </Suspense>
          </div>
        </Suspense>
      </div>
      {isConfettiVisible && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          onConfettiComplete={(confetti) => confetti?.reset()}
        />
      )}
      <Suspense>
        <DisconnectedDrawerDialog />
        <NameDrawerDialog />
        <VoteOptionsDrawerDialog />
        <FeedbackDrawerDialog />
      </Suspense>
    </ThemeProvider>
  )
}
