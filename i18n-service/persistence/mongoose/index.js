const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Project = require('./project');
const Locale = require('./locale');
const Translation = require('./translation');

module.exports = {
  Project,
  Locale,
  Translation
};
