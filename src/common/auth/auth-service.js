/**
 * Auth service
 * from http://goo.gl/ZndAnv, https://medium.com/@GHengeveld
 */
(function () {

  /**
   * Service handling authorization for the app
   * @ngInject
   */
  function AuthService($http, SessionService) {
    this.$http = $http;
    this.SessionService = SessionService;
    this.user = {};
  }

  /**
   * Perform our login
   */
  AuthService.prototype.login = function login(username, password) {
    var self = this;

    return this.$http
      .post('/login', {
        username: username,
        password: password
      })
      .then(function onSuccess(res) {
        this.SessionService.create(
          res.data.id,
          res.data.user.id,
          res.data.user.role
        );
        self.user = res;
        return res;
      });
  };

  /**
   * Check if user is currently logged in
   */
  AuthService.prototype.isAuthenticated = function isAuthenticated() {
    return !!this.SessionService.userId;
  };

  AuthService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (AuthService.isAuthenticated() &&
      authorizedRoles.indexOf(this.SessionService.userRole) !== -1);
  };

  /**
   * Logout from the app
   */
  AuthService.prototype.logout = function logout() {
    var self = this;

    return this.$http
      .get('/logout')
      .then(function onSuccess( /* res */ ) {
        self.user = {};
      });
  };

  angular
    .module('common.services')
    .service('AuthService', AuthService);

})();