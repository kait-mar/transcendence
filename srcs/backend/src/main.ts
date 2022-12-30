import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'
import * as passport from 'passport'
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeormSession } from './typeOrm/entities/Session';
import { DataSource, getConnection, getRepository } from 'typeorm';
import { Next, Req, Res } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import {join} from 'path'

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const Port = process.env.PORT;
  let cwd = process.cwd()
  app.useStaticAssets(`${__dirname}/../public`);

  app.enableCors({
    origin: 'http://' + process.env.IP_ADDRESS + ':3001',
    credentials: true
  })

  const appDataSource = new DataSource({
    type: 'postgres',
    host: process.env.PG_DB_Host,
    port: Number.parseInt(process.env.PG_DB_PORT),
    username: process.env.PG_DB_USER,
    password: process.env.PG_DB_PASS,
    database: process.env.PG_DB_NAME,
  })
  appDataSource.initialize();
  const SessionRepo = appDataSource.getRepository(TypeormSession);
  app.use(session({
    cookie: {
      maxAge: 86400000,
    },
    secret: 'kfepkfepka^pkfâpkfapk',
    resave: false,
    saveUninitialized: false,
  }),);
  app.use(passport.initialize());
  app.use(passport.session());
  // app.enableCors();
  await app.listen(Port, () => console.log('Runing On Port', Port));
}
bootstrap();
