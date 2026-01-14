import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import readline from "readline";

const prisma = new PrismaClient();

const ACCESS_ADMIN_SECRET = process.env.ACCESS_ADMIN_SECRET!;
const REFRESH_ADMIN_SECRET = process.env.REFRESH_ADMIN_SECRET!;

/* =======================
   READLINE SETUP
======================= */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => rl.question(question, resolve));

/* =======================
   SCRIPT
======================= */

async function createAdmin() {
  try {
    console.log("\n🔐 Création d’un compte ADMIN\n");

    const firstName = await ask("Prénom : ");
    const lastName = await ask("Nom : ");
    const email = await ask("Email : ");
    const password = await ask("Mot de passe : ");

    rl.close();

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        role: "ADMIN",
        password: hashedPassword,
      },
      create: {
        email,
        password: hashedPassword,
        role: "ADMIN",
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
    });

    /* =======================
       TOKENS
    ======================= */

    const accessToken = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      },
      ACCESS_ADMIN_SECRET,
      { expiresIn: "8h" }
    );

    const refreshToken = jwt.sign(
      { sub: admin.id },
      REFRESH_ADMIN_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: admin.id },
      data: { refreshToken },
    });

    console.log("\n✅ Admin créé avec succès\n");
    console.log("Email:", email);
    console.log("Role:", admin.role);
    console.log("AccessToken:", accessToken);
    console.log("RefreshToken:", refreshToken);

    await prisma.$disconnect();
  } catch (error) {
    console.error("\n❌ Erreur:", error);
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
