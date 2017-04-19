const mongoose = require('mongoose');
const Promise = require('bluebird');
const _ = require('lodash');
const assert = require('assert');

mongoose.Promise = Promise;

const models = require('./mongoose');
const config = require('../config');

mongoose.connect(config.mongoUrl, function(err) {
  if (err) throw err;
});

async function findProjectAndLocale(project, locale) {
  const projectObj = await models.Project.findOne({ name: project || 'default' });
  const localeObj = await (locale ? models.Locale.findOne({ locale: locale }).exec() : Promise.resolve());
  return { project: projectObj, locale: localeObj };
}

async function find(projectName, localeName, key) {
  const {project, locale} = await findProjectAndLocale(projectName, localeName);
  assert(project, 'Project cannot be found.');
  let conditions = { project: project._id };
  if (locale) {
    conditions.locale = locale._id;
  }
  if (key) {
    conditions.key = new RegExp('^' + key);
  }
  const locales = locale ? [locale] : await models.Locale.find({ project: project._id }).exec();
  const translations = await models.Translation.find(conditions)
    .populate('locale')
    .exec();
  const obj = {};
  _.map(locales, (loc) => {
    obj[loc.locale] = {};
  });
  _.map(translations, (translation) => {
    obj[translation.locale.locale][translation.key] = translation.translated;
  });
  return localeName ? obj[localeName] : obj;
}

async function save(projectName, localeName, key, translated) {
  const {project, locale} = await findProjectAndLocale(projectName, localeName);
  assert(project, 'Project cannot be found.');
  assert(locale, 'Locale cannot be found.');
  return models.Translation.findOneAndUpdate(
    { project: project._id, locale: locale._id, key: key },
    { $set: { project: project._id, locale: locale._id, key: key, translated: translated } },
    { upsert: true, new: true }
  ).exec();
}

function initialize(project, locales) {
  let options = { new: true, upsert: true };
  return models.Project.findOneAndUpdate({ name: project }, { $set: { name: project } }, options).exec()
    .then((proj) => {
      return Promise.map(locales, (locale) =>
        models.Locale.findOneAndUpdate(
          { locale: locale, project: proj._id },
          { $set: { locale: locale, project: proj._id } },
          options
        ).exec())
        .then(() => models.Locale.find({ project: proj._id }))
        .then((locs) => {
          const p = proj.toObject();
          p.locales = _.map(locs, (loc) => loc.locale);
          return p;
        })
    });
}

async function remove(projectName, localeName, key) {
  if (key) {
    const {project, locale} = await findProjectAndLocale(projectName, localeName);
    assert(project, 'Project cannot be found.');
    assert(locale, 'Locale cannot be found.');
    return models.Translation.findOneAndRemove({ project: project._id, locale: locale._id, key })
  } else if (localeName) {
    return models.Locale.findOne({ name: projectName })
      .populate('project')
      .exec()
      .then((loc) => {
        assert(loc, 'Locale cannot be found.');
        models.Translation.find({ locale: loc._id }).remove().exec();
        return loc.remove();
      });
  } else if (projectName) {
    return models.Project.find({ name: projectName })
      .then((proj) => {
        return models.Translation.find({ project: proj._id }).remove().exec()
          .then(() => {
            return models.Locale.find({ project: proj._id }).remove().exec();
          })
      })
  }
  return Promise.resolve();
}

async function listProjects() {
  const projects = await models.Project.find();
  return Promise.map(projects, async (project) => {
    const locales = await models.Locale.find({ project: project._id });
    return {
      name: project.name,
      locales: _.map(locales, (locale) => locale.locale)
    };
  });
}

module.exports = {
  find,
  save,
  initialize,
  remove,
  listProjects
};
