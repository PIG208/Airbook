# Airbook
A project for ticket management system

This is a project built with React using Typescript, and Flask with MySQL.

## Setup
First, go to the root directory of the project

```
   cd airbook
```

To setup the project, run

```
   scripts/setup
```

To build the frontend, run

```
   scripts/build
```

To deploy the server, run

```
   scripts/run
```

And then you can access the website via http://localhost:5000 (this will require you to build the project prior to running)

Alternatively, you can also run the frontend separately that will be rebuilt automatically without restarting the server with

```
   scripts/run-react
```

But you need to make sure that the backend is running with `scripts/run`.

To run the automated tests, run
```
   scripts/test
```

The recommended deployment environment is Linux.

## API
For API documentation, please look at [API](backend/API.md).
