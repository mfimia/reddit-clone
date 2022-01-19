import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

// Decorate the class with resolver from graphql
@Resolver()
export class PostResolver {
  // GraphQL query syntax that returns all posts, using Post entity
  @Query(() => [Post])
  // Take em from context and find all posts
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    // await sleep(3000);
    return em.find(Post, {});
  }

  // Get a single post ---- Query = GET
  // Type: returns post or null
  @Query(() => Post, { nullable: true })
  post(
    // Takes id as argument (we can use the name that we want in the first argument)
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): // Returns a type promise that is type post or null
  Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  // Add a post ---- Mutation = POST/PUT/DELETE
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  // Update a post ---- Mutation = POST/PUT/DELETE
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  // Delete a post ---- Mutation = POST/PUT/DELETE
  @Mutation(() => Boolean, { nullable: true })
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      const post = await em.findOne(Post, { id });
      if (!post) {
        return false;
      }
      await em.nativeDelete(Post, { id });
    } catch {
      return false;
    }
    return true;
  }
}
