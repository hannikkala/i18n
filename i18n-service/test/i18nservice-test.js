const I18NService = require('../i18n-service');
const memory = require('../persistence/memory');
const chai = require('chai');
chai.should();

describe('I18NService', () => {
  it('can import locales from class params', (done) => {
    const i18nService = new I18NService({ localeDir: __dirname + '/locales' });
    i18nService.importProjects();
    memory.data.should.have.property('default');
    memory.data.should.have.property('second');
    memory.data['default'].should.have.property('en');
    memory.data['second'].should.have.property('en');
    done();
  });

  it('can import locales from method parameter', (done) => {
    const i18nService = new I18NService();
    i18nService.importProjects(__dirname + '/locales');
    memory.data.should.have.property('default');
    memory.data.should.have.property('second');
    memory.data['default'].should.have.property('en');
    memory.data['second'].should.have.property('en');
    done();
  });
});
