## README

## Setup

Due to versioning issues with pg-native and later versions of node this project was setup in Node version 12~, please ensure that node version manager is using 12 before installing dependencies.

To install dependencies checkout branch pdw-dev, for the latest working branch, and run `npm install` to install all dependencies

### DB

This project requires a PostgresQL database. 

Once you have initialized a new database please run `cp example.env .env` or equivalent from your console and fill out the following fields with the relevant PostgresQL credentials: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME.

### DB RESET

The script `npm run db:reset` will initialize all the relevant tables and seeds. I recommend adjusting the users seeds with user data, and emails that pertain to yourself so that you can test the nodemailer functionality on the admin side. Passwords are stored hashed with bcrypt, the example seeds are the phrase 'password' hashed. 

You may reset your password from the app after logging in initially.

### More Environment Variables
Variable | Description
:--- | ---:
`PORT` | the port on which you would like to run the http server.
`KEY1` | a private key used for session cookies
`KEY2` | an additional private key used for session cookies
`MAILER_USER` | a gmail address that has been configured to allow ["less secure apps"](https://mailtrap.io/blog/nodemailer-gmail/)
`MAILER_PASS` | the password associated with the MAILER_USER gmail account
`MAILER_NOTICE` | a monitored email address that will receive nodemailer failure notices that are note related to rate limit (if rate limit is met notices will be logged in the server console only)
`FRONT_END_PATH` | the path for the front end server (i.e. http://localhost:3030)
`BACK_END_PATH` | the path for the back end  (i.e. http://localhost:8080)

