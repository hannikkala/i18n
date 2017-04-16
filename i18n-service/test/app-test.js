process.env.LOCALES_FOLDER = __dirname + '/locales';

const I18NService = require('../i18n-service');
const supertest = require('supertest');
const server = supertest.agent('http://localhost:3000');
const _ = require('lodash');
const models = require('../persistence/mongoose');
const config = require('../config');
const jwt = require('jsonwebtoken');
const chai = require('chai');
chai.should();

const adminToken = jwt.sign({ sub: 'admin' }, config.jwtSecret);

describe('App', () => {
  const svc = new I18NService({ persistence: 'mongo' });

  before(() => Promise.all(_.map(models, model => model.remove({}))));

  before(() => svc.importProjects(process.env.LOCALES_FOLDER)
    .then(() => {
      svc.startServer(3000);
    }));

  it('can list projects', (done) => {
    server.get('/api/projects').expect(200)
      .then((res) => {
        res.body.should.have.length(2);
        done();
      }).catch(done);
  });

  it('can find translations by locale', (done) => {
    server.get('/api/default/en').expect(200)
      .then((res) => {
        res.body.should.have.property('hello');
        done();
      });
  });

  it('can find translations by project and locale', (done) => {
    server.get('/api/second/en').expect(200)
      .then((res) => {
        res.body.should.have.property('test.test');
        done();
      });
  });

  it('can save translation', () => {
    return server.post('/api/second/en')
      .set('Content-Type', 'application/json')
      .set('Authorization', `bearer ${adminToken}`)
      .send({ testkey: 'testvalue' })
      .expect(200);
  });

  it('can remove translation', () => {
    return server.delete('/api/second/en/test.test')
      .set('Content-Type', 'application/json')
      .set('Authorization', `bearer ${adminToken}`)
      .expect(204);
  })

});