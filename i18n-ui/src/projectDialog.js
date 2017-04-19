import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import _ from 'lodash';

@inject(DialogController)
export class ProjectDialog {

  newLocale;
  newProject;
  errors = {
    name: true,
    newLocale: true
  };

  constructor(controller) {
    this.controller = controller;

    /*  .ensure('newProject.name').required().minLength(2).matches(/^[a-z]+$/)
      .ensure('newLocale').matches(/^[a-z]{2}(-[a-zA-Z]{2})?$/)
      .on(this);*/
  }

  activate(newProject) {
    this.newProject = newProject;
  }

  add() {
    this.newProject.locales.push(this.newLocale);
    this.newLocale = '';
  }

  remove(locale) {
    this.newProject.locales.splice(this.newProject.locales.indexOf(locale), 1);
  }

  validateName() {
    this.errors.name = !(this.newProject.name && this.newProject.name.length > 2 && this.newProject.name.match(/^[0-9a-z]+$/));
  }

  validateNewLocale() {
    this.errors.newLocale = !(this.newLocale && this.newLocale.match(/^[a-z]{2}(-[a-zA-Z]{2})?$/));
  }
}
