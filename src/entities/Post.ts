import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {
  // These correspond to columns
  @PrimaryKey()
  id!: number;

  @Property({ type: "date" })
  createdAt: Date = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ type: "text" })
  title!: string;
}
