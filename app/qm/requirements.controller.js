(function () {
    'use strict';

    angular
        .module('app')
        .controller('Qm.RequirementsController', Controller);

    function Controller() {
        var vm = this;

        initController();

        function initController() {
            // get current user
            // RequirementsService.GetCurrent().then(function (user) {
            //     vm.user = user;
            // });
        }

    }

})();
