import {inject} from 'aurelia-framework';
import {AuthedHttpClient} from '../service/authedHttpClient';
import {ErrorUtil} from '../service/errorutil';
import {json} from 'aurelia-fetch-client';
import _ from 'lodash';

@inject(AuthedHttpClient, ErrorUtil)
export class EditProject {
  project = {};
  locales = [];
  translations = new Map();
  newKey;
  msg;

  constructor(http, msg) {
    this.http = http;
    this.msg = msg;
  }

  activate(params) {
    this.project = params.project;
    this.http.fetch(`/${params.project}`)
      .then(res => res.json())
      .then(project => {
        this.locales = _.map(project, (translation, locale) => locale);
        this.translations = toDisplayFormat(project);
      });
  }

  save(locale) {
    const translations = fromDisplayFormat(this.translations);
    this.http.fetch(`/${this.project}/${locale}`,
      {
        method: 'post',
        body: json(translations[locale])
      }
    ).then(() => {
      this.msg.info(`Locale ${locale} saved.`);
    }).catch((err) => {
      this.msg.error(err);
    });
  }

  addNew() {
    if(!this.newKey || "" == this.newKey) {
      this.msg.error('Please, input value for a new key.');
      return;
    }
    const obj = {};
    for(const locale of this.locales) {
      obj[locale] = '';
    }
    this.translations.set(this.newKey, obj);
    this.msg.info('New key has been added. Please save translations for permanent save.');
    this.newKey = '';
  }
}

const toDisplayFormat = (project) => {
  const map = new Map();
  _.map(project, (translations, locale) => {
    _.map(translations, (value, key) => {
      if (map.get(key)) {
        map.get(key)[locale] = value;
      } else {
        const obj = {};
        obj[locale] = value;
        map.set(key, obj);
      }
    });
  });
  return map;
};

const fromDisplayFormat = (project) => {
  const obj = {};
  for(const [value, translation] of project.entries()) {
    _.map(translation, (key, locale) => {
      if(!obj[locale]) {
        obj[locale] = {};
      }
      obj[locale][key] = value;
    });
  }
  return obj;
};