"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnonymousIdentity } from "@gamesforstrangers/ui/hooks/use-anonymous-identity";
import { usePlayerIdentity } from "@gamesforstrangers/ui/hooks/use-player-identity";
import { AvatarPicker } from "@/components/avatar-picker";
import { IdentityDisplay } from "@/components/identity-display";
import { LoadingScreen } from "@/components/loading-screen";
import { PageTransition } from "@/components/page-transition";
import { TimerBar } from "@/components/timer-bar";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { UsernameDialog } from "@/components/username-dialog";
import { useSocket } from "@/hooks/use-socket";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import { HigherLowerButtons } from "./components/higher-lower-buttons";
import { RoundEndOverlay } from "./components/round-end-overlay";
import { StatPrompt } from "./components/stat-prompt";
import type {
  HigherLowerChoice,
  HigherLowerNewRoundEvent,
  HigherLowerRoundEndEvent,
  PublicCountry,
} from "./types";

type GamePhase = "connecting" | "waiting" | "playing" | "guessed" | "roundEnd";

export default function HigherOrLower() {
  const { identity: animalIdentity, setAnimal, setIdentity, allAnimals, allColors } = useAnonymousIdentity();
  const { identity: playerIdentity, setUsername, generateAndSetUsername } = usePlayerIdentity();
  const [usernameDone, setUsernameDone] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("connecting");
  const [playerCount, setPlayerCount] = useState(0);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [prompt, setPrompt] = useState<{
    stat: HigherLowerNewRoundEvent["stat"];
    countryA: PublicCountry;
    countryB: PublicCountry;
  } | null>(null);
  const [myGuess, setMyGuess] = useState<HigherLowerChoice | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [roundEndData, setRoundEndData] = useState<HigherLowerRoundEndEvent | null>(null);
  const play = useSoundEffect();

  const onPlayerCount = useCallback((data: { count: number }) => {
    setPlayerCount(data.count);
  }, []);

  const onNewRound = useCallback((data: HigherLowerNewRoundEvent) => {
    setPrompt({ stat: data.stat, countryA: data.countryA, countryB: data.countryB });
    setRoundId(data.roundId);
    setEndTime(data.endTime);
    setPhase("playing");
    setMyGuess(null);
    setRoundEndData(null);
    play("round-start");
  }, [play]);

  const onGuessResult = useCallback(
    (data: { animal: string; time: number; correct: boolean; blurred: boolean }) => {
      if (data.animal !== animalIdentity?.animal) return;
      if (data.correct) {
        play("correct-guess");
      } else {
        play("incorrect-guess");
      }
    },
    [animalIdentity?.animal, play],
  );

  const onRoundEnd = useCallback((data: HigherLowerRoundEndEvent) => {
    setRoundEndData(data);
    setPhase("roundEnd");
    setRoundId(null);
    setEndTime(null);
    play("time-up");
  }, [play]);

  const [cfToken, setCfToken] = useState<string | null>(null);

  const socket = useSocket<HigherLowerNewRoundEvent, HigherLowerRoundEndEvent>({
    gameId: "higher-or-lower",
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
    if (socket.connected) {
      setPhase((prev) => (prev === "connecting" ? "waiting" : prev));
    }
  }, [socket.connected]);

  useEffect(() => {
    if (!roundEndData || !playerIdentity) return;
    const myEntry = roundEndData.scores.find((s) => s.playerId === playerIdentity.uuid);
    if (myEntry) setMyScore(myEntry.score);
  }, [roundEndData, playerIdentity]);

  const handleChoose = useCallback(
    (choice: HigherLowerChoice) => {
      if (!roundId || phase !== "playing") return;
      setMyGuess(choice);
      setPhase("guessed");
      socket.submitGuess(roundId, choice);
    },
    [roundId, phase, socket],
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
            <span className="text-sm font-semibold text-text-primary">Higher or Lower</span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="h-2 w-2 rounded-full bg-presence-online" />
              <span>{playerCount.toLocaleString()} online</span>
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
          ) : prompt && endTime ? (
            <div className="relative flex flex-1 flex-col">
              <StatPrompt
                stat={prompt.stat}
                countryA={prompt.countryA}
                countryB={prompt.countryB}
              />

              <div className="flex flex-col items-center gap-3 border-t p-4">
                <TimerBar
                  endTime={endTime}
                  onExpired={() => {
                    if (phase === "playing" || phase === "guessed") {
                      setPhase("roundEnd");
                    }
                  }}
                />

                <HigherLowerButtons
                  onChoose={handleChoose}
                  disabled={phase !== "playing" || !socket.connected}
                  chosen={myGuess}
                />

                {phase === "guessed" ? (
                  <p className="text-xs text-text-muted">
                    You picked{" "}
                    <span className={`font-semibold ${myGuess === "higher" ? "text-emerald-400" : "text-red-400"}`}>
                      {myGuess?.toUpperCase()}
                    </span>{" "}
                    — waiting for the round to end...
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {roundEndData ? (
          <RoundEndOverlay
            data={roundEndData}
            playerId={playerIdentity.uuid}
            myGuess={myGuess}
          />
        ) : null}

        <div className="fixed bottom-2 right-2 z-30">
          <TurnstileWidget onToken={setCfToken} />
        </div>
      </div>
    </PageTransition>
  );
}
