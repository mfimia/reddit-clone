import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

// Decorate the class with resolver from graphql
@Resolver()
export class PostResolver {
  // GraphQL query syntax that returns all posts, using Post entity
  @Query(() => [Post])
  // Take em from context and find all posts
  async posts(): Promise<Post[]> {
    // await sleep(3000);
    return Post.find();
  }

  // Get a single post ---- Query = GET
  // Type: returns post or null
  @Query(() => Post, { nullable: true })
  post(
    // Takes id as argument (we can use the name that we want in the first argument)
    @Arg("id") id: number
  ): // Returns a type promise that is type post or null
  Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // Add a post ---- Mutation = POST/PUT/DELETE
  @Mutation(() => Post)
  @UseMiddleware(isAuth) // authenticate using middleware function
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  // Update a post ---- Mutation = POST/PUT/DELETE
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | undefined> {
    const post = Post.findOne({ where: { id } });
    if (!post) {
      return undefined;
    }
    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }
    return post;
  }

  // Delete a post ---- Mutation = POST/PUT/DELETE
  @Mutation(() => Boolean, { nullable: true })
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
