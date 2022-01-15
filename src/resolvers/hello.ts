import { Query, Resolver } from "type-graphql";

// Decorate the class with resolver from graphql
@Resolver()
export class HelloResolver {
  // GraphQL query syntax that returns "hello world"
  @Query(() => String)
  hello() {
    return "Successful response";
  }
}
