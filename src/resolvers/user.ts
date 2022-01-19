import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "src/utils/sendEmail";
import { v4 } from "uuid";

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
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { em }: MyContext) {
    const user = await em.findOne(User, { email });
    if (!user) {
      // if no user back. email is not in the db
      // in this case we return true but dont actually send an email
      return true;
    }

    // uuid library gives us random string
    const token = v4();

    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password </a>`
    );
    return true;
  }

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
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    // Hash the password before storing it, for extra protection
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });
    // let user;
    try {
      await em.persistAndFlush(user);
      // ------> Another way to write "persistAndFlush" command. With QueryBuilder
      // const [user] = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
      //   username: options.username,
      //   email: options.email,
      //   password: options.password,
      //   created_at: new Date(),
      //   updated_at: new Date(),
      // }).returning("*");
      // user = result[0]
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // Try to find user, if it doesn't exist, return error
    const user = await em.findOne(
      User,
      // if there is an "@", we assume its an email, otherwise its an username
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username/email doesn't exist",
          },
        ],
      };
    }
    // Verify password. If wrong, return error
    const valid = await argon2.verify(user.password, password);
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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
