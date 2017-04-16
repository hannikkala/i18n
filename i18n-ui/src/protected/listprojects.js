//import {computedFrom} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {AuthedHttpClient} from '../service/authedHttpClient';

@inject(AuthedHttpClient)
export class Welcome {
  projects = [];

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  activate() {
    this.httpClient.fetch('/projects')
      .then(response => response.json())
      .then(projects => this.projects = projects);
  }

  remove(project) {
    window.alert('Not implemented yet');
  }
}
