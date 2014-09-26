/**
 * Login Controller
 */
(function () {

  /**
   * @ngInject
   */
  function LoginController($scope, $location, AuthService, flare) {
    $scope.login = function login() {
      return AuthService.login($scope.username, $scope.password)
        .success(function onSuccess(user) {
          flare.success('Successful login', 10000);
          // Tell parent controller about the user
          $scope.setCurrentUser(user);
          return $location.path('/');
        })
        .error(function onError(err) {
          flare.error(err);
        });
    };
  }

  angular
    .module('app')
    .controller('LoginController', LoginController);

})();