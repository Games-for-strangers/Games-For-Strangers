import type { Server as SocketIOServer, Socket } from "socket.io";
import type { BaseGameEngine, BaseRound, PlayerInfo } from "./game-engine";
import { GeoGuesserEngine } from "./engines/geoguesser-engine";

/**
 * Routes socket events to the right game engine based on the client-supplied
 * gameId (which is the game slug). Unknown slugs get a `game-error` event
 * instead of silently receiving another game's rounds.
 */
export class RoundManager {
  private engines: Map<string, BaseGameEngine<BaseRound>> = new Map();

  constructor(io: SocketIOServer) {
    const engines: BaseGameEngine<BaseRound>[] = [
      new GeoGuesserEngine(io),
    ];
    for (const engine of engines) {
      this.engines.set(engine.slug, engine);
    }
  }

  init() {
    for (const engine of this.engines.values()) {
      engine.init();
    }
  }

  joinGame(socket: Socket, gameId: string, playerInfo: PlayerInfo) {
    this.engineFor(socket, gameId)?.joinGame(socket, gameId, playerInfo);
  }

  leaveGame(socket: Socket, gameId: string) {
    this.engineFor(socket, gameId)?.leaveGame(socket, gameId);
  }

  submitGuess(socket: Socket, gameId: string, roundId: string, guess: string) {
    this.engineFor(socket, gameId)?.submitGuess(socket, gameId, roundId, guess);
  }

  disconnect(socket: Socket) {
    for (const engine of this.engines.values()) {
      engine.disconnect(socket);
    }
  }

  private engineFor(
    socket: Socket,
    gameId: string,
  ): BaseGameEngine<BaseRound> | null {
    const engine = this.engines.get(gameId);
    if (!engine) {
      socket.emit("game-error", { message: `Unknown game: ${gameId}` });
      return null;
    }
    return engine;
  }
}
