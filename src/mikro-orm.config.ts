import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
  entities: [Post, User],
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  dbName: "reddit-clone",
  user: "postgres",
  password: "postgres",
  type: "postgresql",
  // Only true when we are not on production
  debug: !__prod__,
  // We declare is as the type that MikroOrm expects as its first parameter (TS trick)
} as Parameters<typeof MikroORM.init>[0];
