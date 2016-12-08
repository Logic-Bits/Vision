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
        vm.select = select;

        initController();

        function initController() {
            UseCaseService.GetAll().then(function (ucs){
                  vm.usecases = ucs;

                  console.log("found usecases: " + vm.usecases.length);

                  if(vm.usecases.length > 0)
                  {
                    vm.usecase = vm.usecases[0];
                  }
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

        function createUseCase() {
          UseCaseService.Create(vm.newusecase)
              .then(function () {
                  FlashService.Success('Use Case created');
                  //todo refresh
              })
              .catch(function (error) {
                  FlashService.Error(error);
              });
        }

        function select(usecase){
          console.log("Clicked");
          UseCaseService.GetById(usecase._id).then(function(uc){
            vm.usecase = uc;
          });
        }


    }

})();
