import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

// middleware runs before the resolver
// "MiddlewareFn" is a special type from type-graphql
// we pass it MyContext type so it's aware of the types of the context
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("not authenticated");
  }

  // if its all good, continue
  return next();
};
