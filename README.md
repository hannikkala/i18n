# I18N Service

Internationalization service to use for your projects and give non-technical people simple interface to translate application texts.

## Quickstart

There is [docker-compose.example.yml](docker-compose.example.yml) in root directory. It uses 
MongoDB persistence.

`docker run -v /my/locale/dir:/locales hannikkala/i18n`

 and `/locales` as import directory

Service contains two parts: UI and REST API.

### REST API

More detailed information can be found [here](i18n-service).

### UI



### Environment variables

#### UI_PORT

Which port UI is listening. Defaults to `9000`.

#### LOCALES_FOLDER

Folder which contains initial locale files (and project subfolders).

#### PERSISTENCE

Chooses persistence mode. At this point there are two: `memory` and `mongo`. Defaults to `memory`.

#### MONGO_URL

Sets MongoDB URL to connect to. Has an effect only if PERSISTENCE is set to `mongo`. Defaults to `mongodb://localhost:27017/i18n`.

#### ADMIN_PASSWORD

Sets password for user `admin`. This username/password combination can be used for getting JWT token from the endpoint `/api/access_token`. Defaults to `password`.

#### JWT_SECRET

This value is used for JWT encryption secret key. Set it to something long and complicated.
 