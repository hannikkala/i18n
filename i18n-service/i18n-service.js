#!/usr/bin/env node

const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const _ = require('lodash');
const dot = require('dot-object');
const config = require('./config');
const fs = require('fs');
const i18nRoute = require('./routes/i18n');
const Promise = require('bluebird');

// swagger definition
const swaggerDefinition = {
  info: {
    title: 'I18N Service API',
    version: '0.1.0',
    description: 'Management API for translations.',
  },
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
    },
  },
  security: [{ Bearer: [] }],
  host: 'localhost:3000',
  basePath: '/api',
};

// options for the swagger docs
const swaggerOptions = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the API docs
  apis: ['./routes/*.js'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(swaggerOptions);

class I18NService {

  constructor(opts) {
    this.config = _.assignIn({}, config, opts);
    this.persistence = this.configurePersistence();
  }

  importLocales(project, locale, file) {
    const json = require(file);
    const dotobj = dot.dot(json);
    const promises = [];
    for (const key in dotobj) {
      promises.push(this.persistence.save(project, locale, key, dotobj[key]));
    }
    return Promise.all(promises);
  };

  importProjects(rootdir) {
    if (!rootdir) {
      rootdir = this.config.localeDir;
    } else if (!this.config.localeDir) {
      this.config.localeDir = rootdir;
    }
    if(!rootdir) {
      return;
    }
    const projectName = rootdir.substring(this.config.localeDir.length).replace('/', '') || 'default';
    const locales = [];
    const files = [];
    const promises = [];
    const localesFiles = fs.readdirSync(rootdir);
    for (const i in localesFiles) {
      const file = localesFiles[i];
      const fullfilename = `${rootdir}/${file}`;
      const lstat = fs.lstatSync(fullfilename);
      if (lstat.isDirectory()) {
        promises.push(this.importProjects(fullfilename));
      } else if (_.endsWith(file, '.json')) {
        let locale = file.substring(0, file.length - '.json'.length);
        locales.push(locale);
        files.push({ file: fullfilename, locale: locale })
      }
    }
    console.log(`Importing project ${projectName}...`);
    return this.persistence.initialize(projectName, locales)
      .then(() => {
        for(const i in files) {
          const file = files[i];
          console.log(`Importing locale ${file.locale}`);
          promises.push(this.importLocales(projectName, file.locale, file.file));
        }
        return Promise.all(promises);
      });
  };

  configurePersistence() {
    switch (this.config.persistence) {
      case 'memory':
        return require('./persistence/memory');
      case 'mongo':
        return require('./persistence/mongo');
        break;
    }
  };

  startServer(port) {
    if (!port) {
      port = this.config.port;
    } else if (!this.config.port) {
      this.config.port = port;
    }
    const app = express();

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.engine('hbs', exphbs({ extname: '.hbs' }));
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'hbs');

    app.use('/api', i18nRoute(this.persistence));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.server = app.listen(port, function () {
      console.log(`I18n service listening on port ${port}`);
    });

    return app;
  }
}

module.exports = I18NService;
