import { db } from "../lib/db";
import { user, account } from "../lib/db/schema";

async function main() {
    try {
        console.log("Checking users table...");
        const users = await db.select().from(user);
        console.log(`Found ${users.length} users:`);
        console.log(JSON.stringify(users, null, 2));

        console.log("\nChecking accounts table...");
        const accounts = await db.select().from(account);
        console.log(`Found ${accounts.length} accounts:`);
        console.log(JSON.stringify(accounts, null, 2));

        const { attendances } = await import("../lib/db/schema");
        console.log("\nChecking attendances table...");
        const att = await db.select().from(attendances);
        console.log(`Found ${att.length} attendances:`);

        const joko = users.find(u => u.email === "joko@gmail.com");
        if (joko) {
            console.log(`Joko found: ${joko.id}`);
            const jokoAtt = att.filter(a => a.userId === joko.id);
            console.log(`Joko has ${jokoAtt.length} attendances`);
            console.log(JSON.stringify(jokoAtt, null, 2));
        } else {
            console.log("Joko not found!");
        }
    } catch (error) {
        console.error("Error during DB check:", error);
    } finally {
        process.exit(0);
    }
}

main();
