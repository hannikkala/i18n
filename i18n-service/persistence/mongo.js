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
        { project: project._id, locale: locale._id, key: key, translated: translated },
        { upsert: true, new: true }
      ).exec();
    });
}

function initialize(project, locales) {
  const promises = [];
  const proj = new models.Project({ name: project });
  promises.push(proj.save());
  for (const j in locales) {
    const locale = new models.Locale({ locale: locales[j], project: proj._id }).save();
    promises.push(locale);
  }
  return Promise.all(promises);
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
            };
            proj.locales = _.map(locales, (locale) => {
              return locale.locale;
            });
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
