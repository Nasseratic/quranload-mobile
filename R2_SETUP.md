# R2 Configuration Instructions

## Setting up Cloudflare R2

You'll need to configure the following environment variables in your Convex deployment:

```bash
npx convex env set R2_ACCESS_KEY_ID <your-access-key>
npx convex env set R2_SECRET_ACCESS_KEY <your-secret-key>
npx convex env set R2_ENDPOINT <your-r2-endpoint>
npx convex env set R2_BUCKET <your-bucket-name>
npx convex env set R2_TOKEN <your-token>
```

### How to get these values:

1. **Create Cloudflare Account** (if you don't have one)
   - Go to https://cloudflare.com
   - Sign up or log in

2. **Enable R2**
   - In your Cloudflare dashboard, navigate to R2
   - Accept the R2 terms if this is your first time

3. **Create a Bucket**
   - Click "Create bucket"
   - Choose a name (e.g., `quranload-recordings`)
   - Select a region close to your users
   - Note the bucket name for `R2_BUCKET`

4. **Get API Credentials**
   - Go to R2 → Overview → Manage R2 API Tokens
   - Click "Create API Token"
   - Select permissions: "Object Read & Write"
   - Copy the Access Key ID → This is `R2_ACCESS_KEY_ID`
   - Copy the Secret Access Key → This is `R2_SECRET_ACCESS_KEY`
   - **Important**: Save the secret key immediately, you can't view it again!

5. **Get Endpoint**
   - In your bucket settings, find the "S3 API" section
   - Copy the endpoint URL (format: `https://<account-id>.r2.cloudflarestorage.com`)
   - This is your `R2_ENDPOINT`

6. **Token** (Optional)
   - The `R2_TOKEN` can be the same as your API token or left empty
   - This is used for additional authentication if needed

### After Configuration

Once you've set these environment variables, deploy your Convex schema:

```bash
npx convex deploy
```

This will create the new tables for recording sessions and fragments.
