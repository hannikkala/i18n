//import {computedFrom} from 'aurelia-framework';
import {inject, bindable} from 'aurelia-framework';
import {AuthedHttpClient} from '../service/authedHttpClient';
import {DialogService} from 'aurelia-dialog';
import {ProjectDialog} from '../projectDialog';
import {ErrorUtil} from '../service/errorutil';
import {json} from 'aurelia-fetch-client';

@inject(AuthedHttpClient, DialogService, ErrorUtil)
export class Welcome {
  projects = [];

  @bindable
  newProject = {
    locales: []
  };

  constructor(httpClient, dlg, msg) {
    this.httpClient = httpClient;
    this.dlg = dlg;
    this.msg = msg;
  }

  activate() {
    this.httpClient.fetch('/projects')
      .then(response => response.json())
      .then(projects => this.projects = projects);
  }

  openAddDialog() {
    this.dlg.open({
      viewModel: ProjectDialog,
      model: this.newProject
    }).then(result => {
      if (result.wasCancelled) return;
      return this.httpClient.fetch('/projects', {
        method: 'post',
        body: json(this.newProject)
      }).then(response => response.json());
    }).then((project) => {
      console.log(project);
      this.projects.push(project);
      this.msg.info(`Project ${project.name} added.`);
    });
  }

  remove(project) {
    window.alert('Not implemented yet');
  }
}
