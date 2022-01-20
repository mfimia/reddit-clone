import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

// Stacking decorators
@ObjectType()
@Entity()
// generate post entity as part of base entity to get its functionality
export class Post extends BaseEntity {
  // These correspond to columns
  // Adding the Field decorator will expose them into our graphQL
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  // foreign key will be stored in this field
  @Field()
  @Column()
  creatorId: number;

  // set up many to one relationship
  // many posts can belong to the same user
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
