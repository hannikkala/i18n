const config = require('../config');
const expressJwt = require('express-jwt')({ secret: config.jwtSecret });
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
let persistence;

/**
 * @swagger
 * /projects:
 *  get:
 *    tags:
 *      - api
 *    description: Lists all available projects.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: When successful.
 *      500:
 *        description: When any error occurred.
 */
router.get('/projects', (req, res) => {
  persistence.listProjects()
    .then((projects) => {
      res.json(projects);
    }).catch((err) => {
      res.status(500).send(err);
    });
});

const findTranslations = (project, locale) => {
  return persistence.find(project, locale);
};

const saveProject = (req, res) => {
  persistence.initialize(req.params.project || req.body.name, req.body.locales)
    .then((project) => {
      res.status(201).json(project);
    }).catch((err) => {
      res.status(500).send(err);
    });
};

/**
 * @swagger
 * /projects:
 *  post:
 *    tags:
 *      - api
 *    description: Creates a new project.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: When successful.
 *      500:
 *        description: When any error occurred.
 */
router.post('/projects', saveProject);

/**
 * @swagger
 * /projects:
 *  put:
 *    tags:
 *      - api
 *    description: Updates existing project.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: When successful.
 *      500:
 *        description: When any error occurred.
 */
router.put('/projects/:project', saveProject);

/**
 * @swagger
 * /{project}/{locale}:
 *  get:
 *    tags:
 *      - api
 *    parameters:
 *      - name: project
 *        in: path
 *        type: string
 *        required: true
 *      - name: locale
 *        in: path
 *        type: string
 *        required: true
 *    description: Lists translations of specific project and locale.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: When successful.
 *      500:
 *        description: When any error occurred.
 */
router.get('/:project/:locale?.:format?', (req, res) => {
  findTranslations(req.params.project, req.params.locale)
    .then((translations) => {
      res.status(200);
      switch(req.params.format) {
        case "properties":
          res.set('Content-Type', 'text/x-java-properties');
          res.render('properties', { translations });
          break;
        case "json":
        default:
          res.json(translations);
          break;
      }
    }).catch((err) => {
      res.status(500).send(err);
    });
});

const saveTranslation = (req, res) => {
  const promises = _.map(req.body, (key, value) => persistence.save(req.params.project, req.params.locale, key, value));
  Promise.all(promises)
    .then(() => findTranslations(req.params.project, req.params.locale))
    .then((translations) => {
      res.status(200).json(translations);
    }).catch((err) => {
      res.status(500).send(err);
    });
};

/**
 * @swagger
 * /{project}/{locale}:
 *  post:
 *    tags:
 *      - api
 *    parameters:
 *      - name: project
 *        in: path
 *        type: string
 *        required: true
 *      - name: locale
 *        in: path
 *        type: string
 *        required: true
 *    security:
 *      - Bearer
 *    description: Updates (or creates) translation(s) into project with specific locale.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: When successful.
 *      500:
 *        description: When any error occurred.
 */
router.post('/:project/:locale', expressJwt, saveTranslation);

/**
 * @swagger
 * /{project}/{locale}:
 *  put:
 *    tags:
 *      - api
 *    parameters:
 *      - name: project
 *        in: path
 *        type: string
 *        required: true
 *      - name: locale
 *        in: path
 *        type: string
 *        required: true
 *    security:
 *      - Bearer
 *    description: Updates (or creates) translation(s) into project with specific locale.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: When successful.
 *      500:
 *        description: When any error occurred.
 */
router.put('/:project/:locale', expressJwt, saveTranslation);


/**
 * @swagger
 * /{project}/{locale}/{key}:
 *  delete:
 *    tags:
 *      - api
 *    parameters:
 *      - name: project
 *        in: path
 *        type: string
 *        required: true
 *      - name: locale
 *        in: path
 *        type: string
 *        required: true
 *      - name: key
 *        in: path
 *        type: string
 *        required: true
 *    security:
 *      - Bearer
 *    description: Removes a translation from project and locale
 *    produces:
 *      - application/text
 *    responses:
 *      204:
 *        description: When successfully deleted.
 *      500:
 *        description: When any error occurred.
 */
router.delete('/:project/:locale?/:key?', expressJwt, (req, res) => {
  persistence.remove(req.params.project, req.params.locale, req.params.key)
    .then(() => {
      res.status(204).json();
    }).catch((err) => {
      res.status(500).send(err);
    });
});

/**
 * @swagger
 * /access_token:
 *  post:
 *    tags:
 *      - login
 *    parameters:
 *      - name: username
 *        in: formData
 *        type: string
 *        required: true
 *      - name: password
 *        in: formData
 *        type: string
 *        required: true
 *    description: Creates an access token for user.
 *    consumes:
 *      - application/x-www-form-urlencoded
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: When successful.
 *      401:
 *        description: If login was unsuccessful.
 *      500:
 *        description: When any error occurred.
 */
router.post('/access_token', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username === 'admin' && password === config.adminPassword) {
    const user = jwt.sign({sub: 'admin'}, config.jwtSecret, {});
    res.json({ token: user });
  } else {
    res.status(401).send('Auth failed.');
  }
});

module.exports = (pers) => {
  persistence = pers;
  return router;
};