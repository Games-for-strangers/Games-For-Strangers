import type { Server as SocketIOServer } from "socket.io";

interface RoomState {
  playerCount: number;
  gameSlug: string;
}

class GameState {
  private rooms = new Map<string, RoomState>();
  private io: SocketIOServer | null = null;

  setIO(io: SocketIOServer) {
    this.io = io;
  }

  joinRoom(gameId: string, slug: string) {
    const existing = this.rooms.get(gameId);
    if (existing) {
      existing.playerCount++;
    } else {
      this.rooms.set(gameId, { playerCount: 1, gameSlug: slug });
    }
  }

  leaveRoom(gameId: string) {
    const room = this.rooms.get(gameId);
    if (!room) return;
    room.playerCount--;
    if (room.playerCount <= 0) {
      this.rooms.delete(gameId);
    }
  }

  getPlayerCount(gameId: string): number {
    return this.rooms.get(gameId)?.playerCount ?? 0;
  }

  getAllGameCounts(): { slug: string; players: number }[] {
    const counts = new Map<string, number>();
    for (const [, room] of this.rooms) {
      counts.set(room.gameSlug, (counts.get(room.gameSlug) ?? 0) + room.playerCount);
    }
    return Array.from(counts.entries()).map(([slug, players]) => ({ slug, players }));
  }

  getTotalPlayers(): number {
    let total = 0;
    for (const [, room] of this.rooms) {
      total += room.playerCount;
    }
    return total;
  }
}

export const gameState = new GameState();
