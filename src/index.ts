import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  console.log(orm.em);
  // Create a post
  const post = orm.em.create(Post, { title: "my first post" });
  // Insert post into database
  await orm.em.persistAndFlush(post);
};

main().catch((err) => {
  console.log(err);
});
