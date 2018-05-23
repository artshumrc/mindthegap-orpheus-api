# Mind the Gap Digital Immigratiomn Histories Orphe.us GraphQL Server

An API providing data to the Mind the Gap Frontend at http://gitlab.archimedes.digital/archimedes/mindthegap-orpheus. Built with `express` and `graphql`. The application is used for easily making digital collections interfaces. The data model is a simple implementation of a multitenant application that supports many different Projects and their corresponding Collections and Items. User accounts are shared across the application.

## Developing

First, clone this repository. Ensure you have installed `yarn`, node 8.6, mongo, and redis installed on your local machine or configure the appropriate `.env.*.local` file with credentials as necessary to connect to your mongo and redis data sources. Then run the following commands:

Install dependencies:
```bash
yarn
```

Start application:
```bash
yarn start
```

The application GraphiQL API explorer should be available at http://localhost:3001/graphiql.
