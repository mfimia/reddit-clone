import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";

// Wrapping everything into main function to use async syntax with ease
const main = async () => {
  // Connect to DB
  const orm = await MikroORM.init(mikroOrmConfig);
  // Run migrations
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  // Avoid cors policy errors (all routes)
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  // Session middleware
  app.use(
    session({
      name: COOKIE_NAME,
      // We tell the express session that we are using redis
      store: new RedisStore({
        client: redis,
        // Make session last forever
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https (in prod)
      },
      // Creates a session only when storing data
      saveUninitialized: false,
      secret: "randomstring",
      resave: false,
    })
  );

  // Set up Apollo
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res, redis }),
  });

  // Start apollo server
  await apolloServer.start();

  // Create a graphQL endpoint on express
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });

  // ------Create a post------
  // const post = orm.em.create(Post, { title: "my first post" });
  // // Insert post into database
  // await orm.em.persistAndFlush(post);

  // -----GET posts-----
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

// Adding catch to get nicer errors
main().catch((err) => {
  console.log(err);
});
