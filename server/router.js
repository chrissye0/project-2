const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getPokemon', mid.requiresLogin, controllers.Pokemon.getPokemon);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Pokemon.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Pokemon.makePokemon);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
