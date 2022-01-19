import { InputType, Field } from "type-graphql";

// ---> Import for alternative query
// import { EntityManager } from "@mikro-orm/postgresql";
// Input type for arguments
@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
