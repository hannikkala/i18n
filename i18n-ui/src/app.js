export class App {
  configureRouter(config, router) {
    config.title = 'I18N';
    config.map([
      { route: ['', 'login'],   name: 'login',        moduleId: './login',        nav: true,  title: 'Login' },
      { route: 'protected',     name: 'child-router', moduleId: './child-router', nav: false, auth: true, title: 'Child Router' }
    ]);

    this.router = router;
  }
}
