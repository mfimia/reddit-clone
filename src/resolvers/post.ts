import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

// Decorate the class with resolver from graphql
@Resolver(Post)
export class PostResolver {
  // this creates a text snippet field
  // we can request the snippet instead of the text (to avoid huge chunks in homepage)
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  // GraphQL query syntax that returns all posts, using Post entity
  @Query(() => [Post])
  // Take em from context and find all posts
  async posts(
    @Arg("limit", () => Int) limit: number,
    // cursor refers to what location in our data we want to point (similar to offset)
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    // syntax from type orm docs
    // query builder to get latests posts (50 || limit -> whichever smaller)

    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      // need to wrap the quotes with single quotes to make sure it respects case sensitivity
      .orderBy('"createdAt"', "DESC")
      .take(realLimit);
    // conditionally check if there is a cursor and add it as a condition to SQL query
    if (cursor) {
      qb.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }
    return qb.getMany();
    // await sleep(3000);
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
