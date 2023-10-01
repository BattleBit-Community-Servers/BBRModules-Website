# BBRModules

## Development

```shell
# Enable Corepack (optional)
corepack enable

# Install dependencies
pnpm i

# Initialize environment variables
cp .env.example .env

# Set the NextAuth secret (you can also just generate one with your favourite password manager)
sed "s/# NEXTAUTH_SECRET=\"\"/NEXTAUTH_SECRET=\"$(openssl rand -base64 32 | sed -E  -e 's/(\/|\+)//g')\"/" .env > .env

# Run database
docker compose -f compose.yml -f compose.development.yml up -d

# Run development server
pnpm dev
```
