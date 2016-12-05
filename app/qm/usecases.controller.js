(function () {
    'use strict';

    angular
        .module('app')
        .controller('Qm.UseCasesController', Controller);

    function Controller() {
        var vm = this;

        initController();

        function initController() {
            // get current user
            // RequirementsService.GetCurrent().then(function (user) {
            //     vm.user = user;
            // });
        }

        function saveRequirement() {
            UseCaseService.Update(vm.usecase)
                .then(function () {
                    FlashService.Success('User updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
    }

})();
