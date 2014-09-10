/**
 * Application Controller
 *
 */
(function () {
  /**
   * @ngInject
   */
  function ApplicationController($scope, AuthService) {

    // Init so that it can be set leter
    $scope.currentUser = null;
    $scope.isAuthorized = AuthService.isAuthorized;

    // By using a setter, setting primitives will trickle downstream
    $scope.setCurrentUser = function (user) {
      $scope.currentUser = user;
    };
  }

  angular
    .module('app')
    .controller('ApplicationController', ApplicationController);

})();