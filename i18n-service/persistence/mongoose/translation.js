const mongoose = require('mongoose');

const schema = mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  locale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Locale',
    required: true
  },
  key: {
    type: String,
    required: true
  },
  translated: {
    type: String,
    required: true
  }
});

schema.index({ project: 1, locale: 1, key: 1 }, { unique: 1 });

module.exports = mongoose.model('Translation', schema);
