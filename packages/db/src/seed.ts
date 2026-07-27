import { createPrismaClient } from "./index";
import locations from "./locations.json" with { type: "json" };

const prisma = createPrismaClient();

async function seed() {
  const oldSlug = "where-is-this";
  const newSlug = "geoguesser-race";

  const oldGame = await prisma.game.findUnique({ where: { slug: oldSlug } });
  if (oldGame) {
    await prisma.game.update({
      where: { slug: oldSlug },
      data: { slug: newSlug, title: "GeoGuesser Race" },
    });
    console.log(`Renamed game: ${oldSlug} -> ${newSlug}`);
  }

  const game = await prisma.game.upsert({
    where: { slug: newSlug },
    update: {},
    create: {
      slug: newSlug,
      title: "GeoGuesser Race",
    },
  });

  console.log(`Seeded game: ${game.title} (${game.id})`);

  const existingRounds = await prisma.round.count({ where: { gameId: game.id } });
  if (existingRounds === 0 || locations.length !== existingRounds) {
    if (existingRounds > 0) {
      await prisma.round.deleteMany({ where: { gameId: game.id } });
    }
    for (const loc of locations) {
      await prisma.round.create({
        data: {
          gameId: game.id,
          imageUrl: loc.url,
          answer: loc.country,
          city: loc.city,
          landmark: loc.landmark,
          region: loc.region,
          funFact: loc.funFact,
        },
      });
    }
    console.log(`Seeded ${locations.length} location rounds`);
  } else {
    console.log(`${existingRounds} rounds already exist, skipping location seed`);
  }
}

seed()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  });
