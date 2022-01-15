import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

// Wrapping everything into main function to use async syntax with ease
const main = async () => {
  // Connect to DB
  const orm = await MikroORM.init(mikroOrmConfig);
  // Run migrations
  await orm.getMigrator().up();

  const app = express();

  // Set up Apollo
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  // Start apollo server
  await apolloServer.start();

  // Create a graphQL endpoint on express
  apolloServer.applyMiddleware({ app });

  app.listen(5000, () => {
    console.log("server started on localhost:5000");
  });

  // ------Create a post------
  // const post = orm.em.create(Post, { title: "my first post" });
  // // Insert post into database
  // await orm.em.persistAndFlush(post);

  // -----Checkout posts-----
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

// Adding catch to get nicer errors
main().catch((err) => {
  console.log(err);
});
