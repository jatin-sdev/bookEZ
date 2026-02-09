
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

async function promoteUser(email: string) {
  if (!email) {
    console.error("❌ Please provide an email address.");
    process.exit(1);
  }

  console.log(`🔍 Finding user with email: ${email}...`);

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.error("❌ User not found.");
    process.exit(1);
  }

  if (user.role === 'ADMIN') {
    console.log("✅ User is already an ADMIN.");
    process.exit(0);
  }

  await db.update(users)
    .set({ role: 'ADMIN' })
    .where(eq(users.id, user.id));

  console.log(`🎉 Successfully promoted ${email} to ADMIN!`);
  process.exit(0);
}

const emailArg = process.argv[2];
promoteUser(emailArg).catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
});
