import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {

  const hashedPassword = await bcrypt.hash("123456", 10)

  await prisma.user.create({
    data: {
      email: "admin@stms.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE"
    }
  })

  console.log("Admin created")
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })