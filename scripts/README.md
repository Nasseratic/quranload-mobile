# Scripts

This directory contains utility scripts for managing the QuranLoad application.

## Export Users to CSV

Export all users from the Convex database to a CSV file.

### Prerequisites

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Ensure your environment variables are set up correctly. You need either:
   - `EXPO_PUBLIC_CONVEX_URL` in your `.env` file, or
   - `CONVEX_URL` environment variable

### Usage

Run the export script:

```bash
pnpm run export-users
```

Or directly with npx:

```bash
npx tsx scripts/exportUsers.ts
```

### Output

The script will:
1. Connect to your Convex database
2. Fetch all users from the `userInfo` table
3. Generate a CSV file with the following columns:
   - User ID
   - Platform
   - Current OTA Version
   - Current App Version
   - Last Seen (timestamp)
   - Last Seen Date (ISO format)
4. Save the file as `users-export.csv` in the project root

### Example Output

```
User ID,Platform,Current OTA Version,Current App Version,Last Seen,Last Seen Date
"user123","ios","1.0.0","1.0.0","1702857600000","2024-12-18T00:00:00.000Z"
"user456","android","1.0.0","1.0.0","1702944000000","2024-12-19T00:00:00.000Z"
```

### Troubleshooting

If you encounter the error:
```
Error: CONVEX_URL environment variable is not set
```

Make sure your `.env` file contains the Convex deployment URL:
```
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```
