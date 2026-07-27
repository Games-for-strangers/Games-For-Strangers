"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { AvatarPicker } from "@/components/avatar-picker";
import { IdentityDisplay } from "@/components/identity-display";
import { LoadingScreen } from "@/components/loading-screen";
import type { RoundEndEvent } from "@/hooks/use-socket";
import { useSocket } from "@/hooks/use-socket";
import type { GuessFeedbackState } from "./components/guess-feedback";
import { GuessFeedback } from "./components/guess-feedback";
import { GuessInput } from "./components/guess-input";
import { RoundEndOverlay } from "./components/round-end-overlay";
import { StreetViewImage } from "./components/street-view-image";
import { TimerBar } from "./components/timer-bar";
import { WinnerStrip } from "./components/winner-strip";

type GamePhase = "connecting" | "waiting" | "playing" | "guessed" | "roundEnd";

interface WinnerEntry {
  animal: string;
  country: string;
  time: number;
  id: string;
}

export default function WhereIsThis() {
  const { identity, setAnimal, setIdentity, allAnimals, allColors } = useAnonymousIdentity();
  const [phase, setPhase] = useState<GamePhase>("connecting");
  const [playerCount, setPlayerCount] = useState(0);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ city: string; country: string; landmark: string } | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [guessFeedback, setGuessFeedback] = useState<GuessFeedbackState>({ type: "idle" });
  const [roundEndData, setRoundEndData] = useState<RoundEndEvent | null>(null);
  const [winnerEntries, setWinnerEntries] = useState<WinnerEntry[]>([]);

  const onPlayerCount = useCallback((data: { count: number }) => {
    setPlayerCount(data.count);
  }, []);

  const onNewRound = useCallback((data: { imageUrl: string; roundId: string; endTime: number; city: string; country: string; landmark: string }) => {
    setImageUrl(data.imageUrl);
    setImageMeta({ city: data.city, country: data.country, landmark: data.landmark });
    setRoundId(data.roundId);
    setEndTime(data.endTime);
    setPhase("playing");
    setGuessFeedback({ type: "idle" });
    setRoundEndData(null);
  }, []);

  const onGuessResult = useCallback(
    (data: { animal: string; time: number; correct: boolean; blurred: boolean }) => {
      if (data.correct && data.animal === identity?.animal) {
        setGuessFeedback({ type: "correct", time: data.time, animal: data.animal });
        setPhase("guessed");
      } else if (!data.correct && data.animal === identity?.animal) {
        setGuessFeedback({ type: "incorrect", animal: data.animal });
      } else if (data.blurred) {
        setGuessFeedback({ type: "blurred", animal: data.animal, time: data.time });
      }
    },
    [identity?.animal],
  );

  const onRoundEnd = useCallback((data: RoundEndEvent) => {
    setRoundEndData(data);
    setPhase("roundEnd");
    setRoundId(null);
    setEndTime(null);
  }, []);

  const socket = useSocket(
    "where-is-this",
    identity ? { animal: identity.animal, color: identity.color } : null,
    { onPlayerCount, onNewRound, onGuessResult, onRoundEnd },
  );

  useEffect(() => {
    if (!roundEndData) return;
    if (roundEndData.winner) {
      setWinnerEntries((prev) => [
        ...prev.slice(-19),
        {
          animal: roundEndData.winner!.animal,
          country: roundEndData.answer,
          time: roundEndData.winner!.time,
          id: Math.random().toString(36).slice(2, 9),
        },
      ]);
    }
    const myEntry = roundEndData.scores.find((s) => s.playerId === socket.socketId);
    if (myEntry) setMyScore(myEntry.score);
  }, [roundEndData, socket.socketId]);

  const handleGuess = useCallback(
    (guess: string) => {
      if (!roundId) return;
      setGuessFeedback({ type: "pending" });
      socket.submitGuess(roundId, guess);
    },
    [roundId, socket],
  );

  if (!identity) {
    return <LoadingScreen message="Setting up your identity..." />;
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Where Is This?</span>
          <span className="text-xs text-muted-foreground">
            🟢 {playerCount} online
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Score: <span className="font-medium text-foreground">{myScore}</span>
          </span>
          <AvatarPicker
            currentAnimal={identity.animal}
            currentColor={identity.color}
            allAnimals={allAnimals}
            allColors={allColors}
            onSelectAnimal={setAnimal}
            onSelectColor={(color) => setIdentity({ animal: identity.animal, color })}
          />
          <IdentityDisplay animal={identity.animal} color={identity.color} />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {phase === "connecting" || phase === "waiting" ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingScreen
              message={
                phase === "connecting"
                  ? "Connecting to game..."
                  : "Waiting for next round..."
              }
            />
          </div>
        ) : imageUrl && endTime ? (
          <div className="relative flex flex-1 flex-col">
            <div className="relative flex-1">
              <StreetViewImage
                imageUrl={imageUrl}
                city={imageMeta?.city ?? ""}
                country={imageMeta?.country ?? ""}
                landmark={imageMeta?.landmark ?? ""}
              />
            </div>

            <div className="flex flex-col items-center gap-3 border-t p-4">
              {endTime ? (
                <TimerBar
                  endTime={endTime}
                  onExpired={() => {
                    if (phase === "playing" || phase === "guessed") {
                      setPhase("roundEnd");
                    }
                  }}
                />
              ) : null}

              <div className="flex items-center gap-3">
                <GuessInput
                  onSubmit={handleGuess}
                  disabled={phase === "guessed" || phase === "roundEnd" || !socket.connected}
                />
                <GuessFeedback state={guessFeedback} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {roundEndData ? (
        <RoundEndOverlay data={roundEndData} playerId={socket.socketId} />
      ) : null}

      <WinnerStrip entries={winnerEntries} />
    </div>
  );
}
