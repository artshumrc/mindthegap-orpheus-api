# Mind the Gap Digital Immigratiomn Histories Orphe.us GraphQL Server

An API providing data to the Mind the Gap Frontend at http://gitlab.archimedes.digital/archimedes/mindthegap-orpheus. Built with `express` and `graphql`. The application is used for easily making digital collections interfaces. The data model is a simple implementation of a multitenant application that supports many different Projects and their corresponding Collections and Items. User accounts are shared across the application.

## Developing

First, clone this repository. Ensure you have installed `yarn`, node 8.x, Mongo, and Redis installed on your local machine or configure the appropriate `.env.*.local` file with credentials as necessary to connect to your Mongo and Redis data sources. Then run the following commands:

Install dependencies:
```bash
yarn
```

Start application:
```bash
yarn start
```

The application GraphiQL API explorer should be available at http://localhost:3001/graphiql.


## More on environment variables

Priority of environment variables in `.env` files (client and server):

1.	Development:

	1.	`.env.development.local`
	2.	`.env.development`
	3.	`.env.local`
	4.	`.env`

2.	Production:

	1.	`.env.production.local`
	2.	`.env.production`
	3.	`.env.local`
	4.	`.env`

**!IMPORTANT** do NOT commit `.env*.local` files to the repository. These should be used for __personal configuration__ and __secret values__.
