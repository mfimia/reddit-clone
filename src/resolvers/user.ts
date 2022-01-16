import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";

// Input type for arguments
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

// We will return this object everytime there is an error
// Error contains two properties: field of the error and message
@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

// Object type for returns
// Returns error array if errors, or user type if user
// Contains the Field error and user that we created
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  // Setting errors as an array because there could be more than one
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

// Decorate the class with resolver from graphql
@Resolver()
export class UserResolver {
  // Me query
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // You are not logged in
    if (!req.session.userId) {
      return null;
    }
    // If the user is logged in, we fetch it and return it
    // We know if an user is logged in = if they have cookie
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  // Add an user
  @Mutation(() => UserResponse)
  async register(
    // Different way of passing argument. Creating a class and passing it
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 3",
          },
        ],
      };
    }

    // Hash the password before storing it, for extra protection
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }
    // Return the user in the object because we have a response object
    return { user };
  }

  // Login
  @Mutation(() => UserResponse)
  async login(
    // Takes same arguments as registration
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // Try to find user, if it doesn't exist, return error
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username doesn't exist",
          },
        ],
      };
    }
    // Verify password. If wrong, return error
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    // This is the data we want to store in the session
    // We can add more stuff
    req.session.userId = user.id;

    return { user };
  }
}
