
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
  },

  datasource: {
    // Prisma Client generation does not need a live database URL.
    // Migrations must provide DATABASE_URL through the environment.
    url: process.env.DATABASE_URL ?? 'mysql://placeholder:placeholder@localhost:3306/placeholder',
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
