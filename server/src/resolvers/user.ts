import {Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver} from "type-graphql";
import {MyContext} from "../types";
import {User} from "../entities/User";
import argon2 from 'argon2'
import {EntityManager} from '@mikro-orm/postgresql'
import {COOKIE_NAME, FORGET_PASSWORD_COOKIE_LIFE, FORGET_PASSWORD_PREFIX} from "../constants";
import {UsernamePasswordInput} from "../utils/entitiesTypes/UsernamePasswordInput";
import {validateRegister} from "../utils/validateRegister";
import {sendEmail} from "../utils/sendEmail";
import {v4} from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[]

  @Field(() => User, {nullable: true})
  user?: User

}


@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email : string,
    @Ctx() {em,redis} : MyContext
  ){
    const user = await em.findOne(User,{email})
    if (!user) {
      //the email is not in database
      return true
    }

    const token = v4();

    redis.set(FORGET_PASSWORD_PREFIX + token, user.id,'ex',FORGET_PASSWORD_COOKIE_LIFE)

    await sendEmail(
      email,
      `<a href='http://localhost:3000/change-password/${token}'>Reset Password</a>`
    )
    return true;
  };
  @Query(() => User, {nullable: true})
  async me(@Ctx() {req, em}: MyContext) {
    console.log("Session:", req.session);
    //you are not logged in

    if (!req.session.userId) {
      return null
    }
    return await em.findOne(User, {id: req.session.userId});
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if(errors) {
      return {errors}
    }
    const hashedPassword = await argon2.hash(options.password)
    let user;
    try {
      const result = await (em as EntityManager).createQueryBuilder(User)
        .getKnexQuery()
        .insert({
        username: options.username,
        password: hashedPassword,
        email: options.email,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('*')
      user = result[0]
      await em.persistAndFlush(user);
    } catch (error) {
      //duplicate username error
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "that username already exist"
            }
          ]
        }
      }
    }
    //store user id session
    //this will set a cookie  on the user
    //keep them logged in
    req.session.userId = user.id
    return {user}
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User,
      usernameOrEmail.includes("@") ? {email: usernameOrEmail} : {username: usernameOrEmail});
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username doesn't exist",
          },
        ],
      }
    }
    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      }
    }
    console.log("i'm a user: ", user);
    req.session.userId = user.id

    return {user}
  }
  
  @Mutation(() => Boolean)
  async logout(@Ctx() {req,res}: MyContext){
     return await new Promise(resolve => req.session.destroy(err => {
       res.clearCookie(COOKIE_NAME)
       if (err) {
        console.log(err);
        resolve(false)
        return;
      }
      resolve(true)
    }))
  }

}
