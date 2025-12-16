#!/usr/bin/env node

/**
 * Export Users to CSV Script
 *
 * This script exports all users from the Convex database to a CSV file.
 *
 * Usage:
 *   npx tsx scripts/exportUsers.ts
 *
 * The CSV file will be saved to ./users-export.csv
 */

import { ConvexHttpClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";

// Get the Convex deployment URL from environment variables
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL environment variable is not set");
  console.error("Please set EXPO_PUBLIC_CONVEX_URL or CONVEX_URL in your .env file");
  process.exit(1);
}

async function exportUsers() {
  console.log("Connecting to Convex...");
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log("Fetching users...");
    const csvContent = await client.query("services/user:exportUsersToCSV");

    const outputPath = path.join(process.cwd(), "users-export.csv");
    fs.writeFileSync(outputPath, csvContent);

    console.log(`✓ Successfully exported users to: ${outputPath}`);

    // Count the number of users (subtract 1 for header row)
    const userCount = csvContent.split('\n').length - 1;
    console.log(`✓ Total users exported: ${userCount}`);
  } catch (error) {
    console.error("Error exporting users:", error);
    process.exit(1);
  }
}

exportUsers();
