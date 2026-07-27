import { env } from "@gamesforstrangers/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

export function createPrismaClient() {
  const url = new URL(env.DATABASE_URL);
  url.searchParams.set("client_encoding", "utf8");
  const adapter = new PrismaPg({
    connectionString: url.toString(),
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
export default prisma;
