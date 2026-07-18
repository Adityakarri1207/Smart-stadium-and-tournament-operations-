# Stage 1: Builder
FROM node:20-slim AS builder

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all server source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Stage 2: Production
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy everything from builder
COPY --from=builder /app .

# Expose the port Cloud Run expects
EXPOSE 8080

# Run seed then start the server
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma && npx tsx prisma/seed.ts && PORT=8080 npx tsx src/index.ts"]
