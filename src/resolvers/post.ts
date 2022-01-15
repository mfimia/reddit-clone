import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";

// Decorate the class with resolver from graphql
@Resolver()
export class PostResolver {
  // GraphQL query syntax that returns all posts, using Post entity
  @Query(() => [Post])
  // Take em from context and find all posts
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
  // Get a single post
  // Type: returns post or null
  @Query(() => Post, { nullable: true })
  // Take em from context and find all posts
  post(
    // Takes id as argument (we can use the name that we want in the first argument)
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): // Returns a type promise that is type post or null
  Promise<Post | null> {
    return em.findOne(Post, { id });
  }
}
