import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { useVotes } from "@/hooks/votes"
import { useVoteStats } from "@/hooks/vote-stats"
import { useLoading } from "@/hooks/loading"
import { cn } from "@/utils/cn"
import { Nav } from "./components/nav"
import { VoteButtons } from "./components/vote-buttons"
import { Votes } from "./components/votes"
import { VoteTimer } from "./components/vote-timer"
import { VoteStats } from "./components/vote-stats"
import { ThemeProvider } from "./components/theme-provider"
import "./styles/globals.css"

export default function UIV2() {
  const { display } = useVotes()
  const { width, height } = useWindowSize()
  const { consensus } = useVoteStats()
  const loading = useLoading()

  return (
    <ThemeProvider>
      <div
        className={cn(
          "grid grid-rows-[auto_1fr] place-items-center h-screen",
          loading && "cursor-progress",
        )}
      >
        <Nav />
        <div className="flex flex-col gap-6 my-8 mx-4">
          <VoteButtons />
          <Votes />
          {!display && <VoteTimer />}
          <VoteStats />
        </div>
      </div>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={consensus ? 500 : 0}
        onConfettiComplete={(confetti) => confetti?.reset()}
      />
    </ThemeProvider>
  )
}

// [ ]: Dialog stuff
// [ ]: option for feedback
// [ ]: dark mode
