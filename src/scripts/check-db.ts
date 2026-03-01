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
    } catch (error) {
        console.error("Error during DB check:", error);
    } finally {
        process.exit(0);
    }
}

main();
