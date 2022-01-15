import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Ctx, Query, Resolver } from "type-graphql";

// Decorate the class with resolver from graphql
@Resolver()
export class PostResolver {
  // GraphQL query syntax that returns "hello world"
  @Query(() => [Post])
  // Take em from context and find all posts
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
}
