(function () {
    'use strict';

    angular
        .module('app')
        .controller('Qm.UseCasesController', Controller);

    function Controller($window, UseCaseService, FlashService) {
        var vm = this;
        vm.usecase = null;
        vm.createUseCase = createUseCase;
        vm.updateUseCase= updateUseCase;

        initController();

        function initController() {
            // get current user
            // RequirementsService.GetCurrent().then(function (user) {
            //     vm.user = user;
            // });

            UseCaseService.GetAll().then(function (ucs){
                  vm.usecases = ucs;
            });
        }

        function updateUseCase() {
            UseCaseService.Update(vm.usecase)
                .then(function () {
                    FlashService.Success('Use Case updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        function createUseCase()
        {
          UseCaseService.Create(vm.usecase)
              .then(function () {
                  FlashService.Success('Use Case created');
                  //todo refresh
              })
              .catch(function (error) {
                  FlashService.Error(error);
              });
        }

    }

})();
