import {Entity, PrimaryKey, Property } from "@mikro-orm/core";
import {Field, Int, ObjectType} from "type-graphql";


@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({type: 'date', default: 'NOW()'})
  createdAt = new Date();

  @Field(() => String)
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({type: "text",unique: true})
  username!: string

  @Field()
  @Property({type: "text",unique: true})
  email!: string

  @Field()
  @Property({type: "text"})
  password!: string
}
