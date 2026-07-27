"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { AvatarPicker } from "@/components/avatar-picker";
import { IdentityDisplay } from "@/components/identity-display";
import { LoadingScreen } from "@/components/loading-screen";
import { PageTransition } from "@/components/page-transition";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { UsernameDialog } from "@/components/username-dialog";
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
  username: string;
  country: string;
  time: number;
  id: string;
}

export default function WhereIsThis() {
  const { identity: animalIdentity, setAnimal, setIdentity, allAnimals, allColors } = useAnonymousIdentity();
  const { identity: playerIdentity, setUsername, generateAndSetUsername } = usePlayerIdentity();
  const [usernameDone, setUsernameDone] = useState(false);
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
      if (data.correct && data.animal === animalIdentity?.animal) {
        setGuessFeedback({ type: "correct", time: data.time, animal: data.animal });
        setPhase("guessed");
      } else if (!data.correct && data.animal === animalIdentity?.animal) {
        setGuessFeedback({ type: "incorrect", animal: data.animal });
      } else if (data.blurred) {
        setGuessFeedback({ type: "blurred", animal: data.animal, time: data.time });
      }
    },
    [animalIdentity?.animal],
  );

  const onRoundEnd = useCallback((data: RoundEndEvent) => {
    setRoundEndData(data);
    setPhase("roundEnd");
    setRoundId(null);
    setEndTime(null);
  }, []);

  const [cfToken, setCfToken] = useState<string | null>(null);

  const socket = useSocket({
    gameId: "geoguesser-race",
    playerInfo: animalIdentity && playerIdentity
      ? {
          animal: animalIdentity.animal,
          color: animalIdentity.color,
          username: playerIdentity.username,
          uuid: playerIdentity.uuid,
        }
      : null,
    handlers: { onPlayerCount, onNewRound, onGuessResult, onRoundEnd },
    cfToken,
  });

  useEffect(() => {
    if (!roundEndData) return;
    if (roundEndData.winner) {
      setWinnerEntries((prev) => [
        ...prev.slice(-19),
        {
          animal: roundEndData.winner!.animal,
          username: roundEndData.winner!.username,
          country: roundEndData.answer,
          time: roundEndData.winner!.time,
          id: Math.random().toString(36).slice(2, 9),
        },
      ]);
    }
    if (playerIdentity) {
      const myEntry = roundEndData.scores.find((s) => s.playerId === playerIdentity.uuid);
      if (myEntry) setMyScore(myEntry.score);
    }
  }, [roundEndData, playerIdentity]);

  const handleGuess = useCallback(
    (guess: string) => {
      if (!roundId) return;
      setGuessFeedback({ type: "pending" });
      socket.submitGuess(roundId, guess);
    },
    [roundId, socket],
  );

  if (!animalIdentity || !playerIdentity) {
    return <LoadingScreen message="Setting up your identity..." />;
  }

  return (
    <PageTransition>
      <UsernameDialog
        open={!usernameDone && (playerIdentity.isFirstVisit || !playerIdentity.username)}
        onConfirm={(name) => {
          setUsername(name);
          setUsernameDone(true);
        }}
        onGenerate={generateAndSetUsername}
      />
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-text-primary">GeoGuesser Race</span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="h-2 w-2 rounded-full bg-presence-online" />
              <span>{playerCount} online</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {playerIdentity.username ? (
              <span className="hidden text-xs text-text-muted sm:inline">{playerIdentity.username}</span>
            ) : null}
            <span className="text-xs text-text-muted">
              Score: <span className="font-semibold text-text-primary">{myScore}</span>
            </span>
            <AvatarPicker
              currentAnimal={animalIdentity.animal}
              currentColor={animalIdentity.color}
              allAnimals={allAnimals}
              allColors={allColors}
              onSelectAnimal={setAnimal}
              onSelectColor={(color) => setIdentity({ animal: animalIdentity.animal, color })}
            />
            <IdentityDisplay animal={animalIdentity.animal} color={animalIdentity.color} />
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

                <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center">
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
          <RoundEndOverlay data={roundEndData} playerId={playerIdentity.uuid} />
        ) : null}

        <WinnerStrip entries={winnerEntries} />

        <div className="fixed bottom-2 right-2 z-30">
          <TurnstileWidget onToken={setCfToken} />
        </div>
      </div>
    </PageTransition>
  );
}
