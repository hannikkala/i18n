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

function findProjectAndLocale(project, locale) {
  const projectPromise = models.Project.findOne({ name: project || 'default' });
  const localePromise = locale ? models.Locale.findOne({ locale: locale }) : Promise.resolve();
  return Promise.all([projectPromise, localePromise]);
}

function find(project, locale, key) {
  return findProjectAndLocale(project, locale)
    .spread(function(project, locale) {
      assert(project, 'Project cannot be found.');
      let conditions = { project: project._id };
      if (locale) {
        conditions.locale = locale._id;
      }
      if (key) {
        conditions.key = new RegExp('^' + key);
      }
      return models.Translation.find(conditions).exec()
        .then(function(translations) {
          const obj = {};
          for(const i in translations) {
            const translation = translations[i];
            obj[translation.key] = translation.translated;
          }
          return obj;
        });
    });
}

function save(project, locale, key, translated) {
  return findProjectAndLocale(project, locale)
    .spread((project, locale) => {
      assert(project, 'Project cannot be found.');
      assert(locale, 'Locale cannot be found.');
      return models.Translation.findOneAndUpdate(
        { project: project._id, locale: locale._id, key: key },
        { $set: { project: project._id, locale: locale._id, key: key, translated: translated } },
        { upsert: true, new: true }
      ).exec();
    });
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

function remove(project, locale, key) {
  if (key) {
    return findProjectAndLocale(project, locale)
      .spread((proj, loc) => {
        assert(proj, 'Project cannot be found.');
        assert(loc, 'Locale cannot be found.');
        return models.Translation.findOneAndRemove({ project: proj._id, locale: loc._id, key })
      })
  } else if (locale) {
    return models.Locale.findOne({ name: project })
      .populate('project')
      .exec()
      .then((loc) => {
        assert(loc, 'Locale cannot be found.');
        models.Translation.find({ locale: loc._id }).remove().exec();
        return loc.remove();
      });
  } else if (project) {
    return models.Project.find({ name: project })
      .then((proj) => {
        return models.Translation.find({ project: proj._id }).remove().exec()
          .then(() => {
            return models.Locale.find({ project: proj._id }).remove().exec();
          })
      })
  }
  return Promise.resolve();
}

function listProjects() {
  const list = [];
  return models.Project.find()
    .then((projects) => {
      const promises = _.map(projects, (project) => {
        return models.Locale.find({ project: project._id })
          .then((locales) => {
            const proj = {
              name: project.name,
              locales: _.map(locales, (locale) => {
                return locale.locale;
              })
            };
            list.push(proj);
          });
      });
      return Promise.all(promises);
    }).then(() => list);
}

module.exports = {
  find,
  save,
  initialize,
  remove,
  listProjects
};
