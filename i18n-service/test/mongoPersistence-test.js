const mongo = require('../persistence/mongo');
const models = require('../persistence/mongoose');
const _ = require('lodash');
const chai = require('chai');
chai.should();

describe('Mongo persistence', () => {

  beforeEach(() => Promise.all(_.map(models, model => model.remove({}))));

  it('can initialize project', () => {
    return mongo.initialize('test', ['en', 'fi-FI'])
      .then(() => models.Project.find())
      .then((projects) => projects.should.have.length(1))
      .then(() => models.Locale.find())
      .then((locales) => locales.should.have.length(2));
  });

  it('can save translation', () => {
    return mongo.initialize('test', ['en'])
      .then(() => mongo.save('test', 'en', 'hello', 'world'))
      .then(() => models.Translation.find())
      .then((translations) => translations.should.have.length(1));
  });

  it('can list projects', () => {
    return mongo.initialize('testproj', ['en', 'fi-FI'])
      .then(() => mongo.listProjects())
      .then((list) => {
        list.should.have.length(1);
        list[0].locales.should.have.length(2);
      })
  });

});