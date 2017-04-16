import {AuthService} from 'aurelia-auth';
import {inject} from 'aurelia-framework';
import {ErrorUtil} from './service/errorutil';

@inject(AuthService, ErrorUtil)
export class Login {
  username='';
  password='';

  constructor(auth, msg) {
    this.auth = auth;
    this.msg = msg;
  }

  login(){
    console.log('test', this.username, this.password);
    return this.auth.login({ username: this.username, password: this.password })
      .then(response => {
        console.log("success logged " + response);
      }).catch((res) => {
        console.log('error', res);
        this.msg.error('Login failed');
      });
  };
}