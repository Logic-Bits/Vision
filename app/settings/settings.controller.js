(function () {
    'use strict';

    angular
        .module('app')
        .controller('Settings.SettingsController', Controller);

    function Controller($window, SettingsService, FlashService) {
        var vm = this;

        vm.user = null;
        vm.deleteUseCases = deleteUseCases;
        vm.resetUseCaseCounter = resetUseCaseCounter;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function deleteUser() {
            UserService.Delete(vm.user._id)
                .then(function () {
                    // log user out
                    $window.location = '/login';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        function deleteUseCases()
        {

        }

        function resetUseCaseCounter()
        {

        }

    }

})();
