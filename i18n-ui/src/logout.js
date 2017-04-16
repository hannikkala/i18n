import {inject} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';

@inject(AuthService)
export class Logout {
  constructor(auth) {
    this.auth = auth;
  }

  activate() {
    this.auth.logout('#/')
      .then(() => {

      })
  }
}