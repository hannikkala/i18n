const Promise = require('bluebird');
const _ = require('lodash');
const PROJECTS = {};

function find(project, locale, key) {
  if (!PROJECTS[project] || (locale && !PROJECTS[project][locale]) || (key && !PROJECTS[project][locale][key])) {
    return Promise.resolve();
  }
  return Promise.resolve(
    key ? PROJECTS[project][locale][key]
    : locale ? PROJECTS[project][locale]
      : PROJECTS[project]);
}

function save(project, locale, key, translated) {
  PROJECTS[project][locale][key] = translated;
  return Promise.resolve();
}

function initialize(project, locales) {
  if(!PROJECTS[project]) {
    PROJECTS[project] = {};
  }
  _.map(locales, (locale) => {
    PROJECTS[project][locale] = {};
  });
  const retObj = {};
  retObj.name = project;
  retObj.locales = locales;
  return Promise.resolve(retObj);
}

function remove(project, locale, key) {
  if(key) {
    delete PROJECTS[project][locale][key];
  } else if (locale) {
    delete PROJECTS[project][locale];
  } else if (project) {
    delete PROJECTS[project];
  }
  return Promise.resolve();
}

function listProjects() {
  const projects = _.map(PROJECTS, (value, project) => {
    const locales = _.map(value, (v, locale) => {
      return locale;
    });
    return { name: project, locales };
  });
  return Promise.resolve(projects);
}

module.exports = {
  find,
  save,
  initialize,
  remove,
  listProjects,
  data: PROJECTS,
};
