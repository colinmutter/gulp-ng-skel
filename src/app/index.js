/**
 * Application module/configuration
 */
(function () {

  /**
   * HTTP interceptor config
   * @ngInject
   */
  function authConfig($httpProvider) {

    /**
     * Authentication interceptor for $http calls
     * @ngInject
     */
    function authInterceptor($q, $location, AuthService, flash) {
      return {
        'response': function responseInterceptor(response) {
          // Everything is OK
          if (response.status < 400) {
            return response;
          }

          // Otherwise, we have a problem...
          var currentPath = $location.path();
          // Response is unauthorized but we exclude /login so we don't get into
          //   an infinite redirect
          if (response.status === 401 && response.config.url !== '/login') {
            AuthService.user = null;
            $location.search('redirectUrl', currentPath)
              .path('/login');
            // Access denied
          }
          else if (response.status === 403) {
            flash.error('Access denied', 10000);
            // Server error
          }
          else if (response.status === 500) {
            flash.error('Internal server error', 10000);
          }
          return $q.reject(response);
        }
      };
    }


    // Add the auth interceptor onto the response interceptors stack
    $httpProvider.interceptors.push(authInterceptor);
  }

  /**
   * Flash messaging config
   * @ngInject
   */
  function flashConfig(flashProvider) {
    // Support bootstrap 3.0 "alert-danger" class with error flash types
    flashProvider.errorClassnames.push('alert-danger');
  }

  /**
   * Routes config
   * @ngInject
   */
  function routeConfig($routeProvider) {
    $routeProvider
      .when('/login', {
        controller: 'LoginController',
        templateUrl: 'app/login/login.tpl.html'
      })
      .when('/', {
        templateUrl: 'app/index.tpl.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }

  // Define the main app module (feel free to rename 'app')
  angular.module('app', [
    'ngRoute',
    'ngResource',
    'templates',
    'common.services',
    'angular-flash.service',
    'angular-flash.flash-alert-directive'
  ])
  // Configure http interceptor
  .config(authConfig)
  // Configure routes
  .config(routeConfig)
  // Configure flash
  .config(flashConfig)
  // Global service constants
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })
  // Global service authorizaton roles
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
  });

  // Stub for templates
  angular.module('templates', []);

})();