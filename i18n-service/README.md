# I18N Translation service API

A simple i18n service to use as centralized translation service for your several UIs.

This project is a fork from Lucas Merencia's [i18n-service](https://github.com/merencia/i18n-service).

## Features

- Import existing localization JSON files into database
- Supports multiple projects
- Supports specific locales per project
- Supports in memory and MongoDB persistence
- Supports different output formats

## Usage

First you need create a json file in locales folder with the locale name, for example, `en.json`.
The file content needs to follow the flow structure. Name of the file will be used as locale. 

```json
{
  "hello" : "hello",
  "something": "Some text",
  "views" : {
    "login" : {
      "title": "Login page",
      "email": "E-mail",
      ...
    }
  }
}

```

or

```json
{
  "hello" : "hello",
  "something": "Some text",
  "views.login.title": "Login page",
  "views.login.email": "E-mail"
}

```

Your new locale will be available on `http://localhost:3000/api/default/en`

You can have how many locales you want. For example:

 - `http://localhost:3000/api/default/en`
 - `http://localhost:3000/api/myproject/es`
 - `http://localhost:3000/api/secondproject/pt`
 - `http://localhost:3000/api/test/pt-br`
 
You can set the locales folder by environment variable, setting LOCALES_FOLDER=/your/locales/folder/

#### Projects

You can also have several projects. While importing locales you can create subdirectory per project.

```
/ (project 'default')
  en.json
  fi-FI.json
  /myproject (project 'myproject')
    en.json
    ja-JP.json
```

In this case project `default` has locales `en` and `fi-FI` and `myproject` has locales `en` and `ja-JP`.

#### Formatting translations

There are two supported output formats available:

- `json` (default) for JSON format
- `properties` for Java projects to use

Just call URL with format parameter `http://localhost:3000/api/{project}/{locale}.{format}`.
For example `http://localhost:3000/api/default/en.properties`.

## Translating

You can get the literals by three ways.

#### Getting all locale literals

To get all locale literals you just call the url `http://localhost:3000/api/{project}/{locale}.{format}`

#### Getting a list of literals

To get a list of literals you need pass the required list by query string, for example: `http://localhost:3000/api/default/en`

The result will be:
```json
{
  "views.login.title": "Login page",
  "views.login.email": "E-mail",
  ...
}

```

## API documentation

[Swagger UI](http://swagger.io/swagger-ui/) responds at `http://localhost:3000/api-docs`.

## Environment variables

#### LOCALES_FOLDER

Folder which contains initial locale files (and project subfolders).

#### PORT

Port which the API listens. Default to `3000`.

#### PERSISTENCE

Chooses persistence mode. At this point there are two: `memory` and `mongo`. Defaults to `memory`.

#### MONGO_URL

Sets MongoDB URL to connect to. Has an effect only if PERSISTENCE is set to `mongo`. Defaults to `mongodb://localhost:27017/i18n`.

#### ADMIN_PASSWORD

Sets password for user `admin`. This username/password combination can be used for getting JWT token from the endpoint `/api/access_token`. Defaults to `password`.

#### JWT_SECRET

This value is used for JWT encryption secret key. Set it to something long and complicated.
 
## Use service as module

```javascript
const I18NService = require('i18n-service');
const i18nService = new I18NService({
  localeDir: '/home/user/locales',
  port: 5000,
  persistence: 'mongo',
  mongoUrl: 'mongodb://localhost:27017/i18n',
  adminPassword: 'myadminpassword',
  jwtSecret: 'somethinglongandcomplicated'
});
i18nService.importProjects();
i18nService.startServer();
```