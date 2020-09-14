import 'reflect-metadata'
import {MikroORM} from '@mikro-orm/core'
// import {Post} from "./entities/Post";
import microConfig from './mikro-orm.config'
import express from 'express'
import CONFIG from './config/config'
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import {__prod__, COOKIE_NAME} from "./constants";
import {MyContext} from "./types";
import cors from 'cors'


const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express()

  const RedisStore = connectRedis(session)
  const redis = new Redis();

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
  }))
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //ten years
        httpOnly: true,
        sameSite: 'lax', //csrf
        secure: __prod__, //cookies only works in https
      },
      saveUninitialized: false,
      secret: 'qwewqewqeqwzdasadxczlml',
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false
    }),
    context: ({req,res}):MyContext => <MyContext>({em: orm.em, req, res,redis})
  })

  apolloServer.applyMiddleware({
    app,
    cors: false
  })

  app.listen(CONFIG.PORT, () => console.log('Server is working on port: ', CONFIG.PORT))
}


main().catch(err => console.error(err))
