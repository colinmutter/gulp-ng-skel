/**
 * Login Controller
 */
(function () {

  /**
   * @ngInject
   */
  function LoginController($scope, $location, AuthService, flash) {
    $scope.login = function login() {
      return AuthService.login($scope.username, $scope.password)
        .success(function onSuccess(user) {
          flash.success('Successful login', 10000);
          // Tell parent controller about the user
          $scope.setCurrentUser(user);
          return $location.path('/');
        })
        .error(function onError(err) {
          flash.error(err);
        });
    };
  }

  angular
    .module('app')
    .controller('LoginController', LoginController);

})();