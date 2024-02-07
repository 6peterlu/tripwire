import { PrismaClient } from "@prisma/client";

console.log(process.env.DATABASE_URL);
const prisma = new PrismaClient();

async function main() {
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.userStatus.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.customer.deleteMany({});
}

main();
