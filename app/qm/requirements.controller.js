(function () {
    'use strict';

    angular
        .module('app')
        .controller('Qm.Requirementsontroller', Controller);

    function Controller($window, RequirementsService, FlashService) {
        var vm = this;

        vm.requirement.requirementname = 'test';
        vm.requirement.category = null;

        initController();

        function initController() {
            // get current user
            // RequirementsService.GetCurrent().then(function (user) {
            //     vm.user = user;
            // });
        }

        function saveRequirement() {
            RequirementsService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
    }

})();
