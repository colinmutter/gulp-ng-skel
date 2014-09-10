/**
 * Session Service
 * from http://goo.gl/ZndAnv, https://medium.com/@GHengeveld
 */
(function () {

  function SessionService() {
    this.create = function (sessionId, userId, userRole) {
      this.id = sessionId;
      this.userId = userId;
      this.userRole = userRole;
    };
    this.destroy = function () {
      this.id = null;
      this.userId = null;
      this.userRole = null;
    };
    return this;
  }

  angular
    .module('common.services')
    .service('SessionService', SessionService);

})();