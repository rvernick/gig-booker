# Cup of Sugar Backend
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

### Constants needed:
- JTW_SECRET
- COLUMN_ENCRYPTION_KEY
- PORT
- DATABASE
- AWS_S3_ACCESS_KEY_ID
- AWS_S3_SECRET_ACCESS_KEY
- MAILGUN_API_KEY
- STRAVA_CLIENT_ID
- STRAVA_CLIENT_SECRET
- BYPASS_STRAVA

## Installation

Clone the repository (if not already cloned)
```bash
$ git clone https://github.com/rvernick/cup-of-sugar
```
Move to backend repository on local device
```bash
$ cd cup-of-sugar/backend/
```
Install Backend package.json
```bash
npm install
npm run typeorm migration:run -- -d src/data-source.ts
```

Create Migrations
We use a database just for migration creation.  The idea is that a dev database will automatically add tables/columns.  Having a DB that just takes an install and then creates the delta for migrating is better
using --dryrun is handy for testing

Might need to run this first to apply previous migrations:
```bash
npm run typeorm migration:run -- -d src/migration-source.ts
```

```bash
npm run typeorm migration:generate -- -d src/migration-source.ts ./migrations/<NameOfMigration>
```
## Updating instructions
Baseline instructions are held in the instructions.ts file.  When updated, the instructions stored in the DB can be updated with the following API call:
https://cup-of-sugar-be.onrender.com/instruction/synchronize?secret=<SYNCHRONIZE_SECRET>
SYNCHRONIZE_SECRET is an environment variable kept on Render

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
