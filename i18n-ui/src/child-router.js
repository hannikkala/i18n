export class ChildRouter {
  heading = 'Child Router';

  configureRouter(config, router) {
    config.map([
      {
        route: ['', 'list'],
        name: 'list',
        moduleId: './protected/listprojects',
        nav: true,
        auth: true,
        title: 'Project list'
      },
      {
        route: 'edit/:project',
        name: 'edit',
        moduleId: './protected/editproject',
        nav: false,
        auth: true,
        title: 'Edit project'
      },
      {
        route: 'logout',
        name: 'logout',
        moduleId: './logout',
        nav: true,
        title: 'Log out'
      },
    ]);

    this.router = router;
  }
}
