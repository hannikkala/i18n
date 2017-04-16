const mongoose = require('mongoose');

const schema = mongoose.Schema({
  locale: {
    type: String,
    required: true,
    match: [
      /^[a-z]{2}(-[a-zA-Z]{2})?$/,
      'Locale does not match to format ({VALUE})'
    ]
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
});

schema.index({ project: 1, locale: 1 }, { unique: 1 });

module.exports = mongoose.model('Locale', schema);
