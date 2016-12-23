(function() {
  'use strict';

  angular
    .module('app')
    .controller('Qm.UseCasesController', Controller);

  function Controller($window, UseCaseService, FlashService) {
    var vm = this;
    vm.usecase = null;
    vm.createUseCase = createUseCase;
    vm.updateUseCase = updateUseCase;
    vm.select = select;
    vm.deleteUseCase = deleteUseCase;

    initController();

    function initController() {
      UseCaseService.GetAll().then(function(ucs) {
        vm.usecases = ucs;

        console.log("found usecases: " + vm.usecases.length);

        if (vm.usecases.length > 0) {
          vm.usecase = vm.usecases[0];
        }
      });
    }

    function updateUseCase() {
      UseCaseService.Update(vm.usecase)
        .then(function() {
          FlashService.Success('Use Case updated');

          //now update the item in the master list. no full refresh needed
          for (var i = 0; i < vm.usecases.length; i++) {
            if (vm.usecases[i]._id === vm.usecase._id) {
              vm.usecases[i] = vm.usecase;
              break;
            }
          }
        })
        .catch(function(error) {
          FlashService.Error(error);
        });
    }

    function createUseCase() {
      UseCaseService.Create(vm.newusecase)
        .then(function() {
          FlashService.Success('Use Case created');
          initController();

          $("#frmNewUsecase")[0].reset();

          //todo refresh
        })
        .catch(function(error) {
          FlashService.Error(error);
        });
    }

    function select(usecase) {
      UseCaseService.GetById(usecase._id).then(function(uc) {
        vm.usecase = uc;
      });
    }

    function deleteUseCase(usecase) {
      UseCaseService.Delete(usecase._id).then(function() {
          FlashService.Success('Use Case deleted');
          $('#confirm-delete').modal('hide');
          initController();

        })
        .catch(function(error) {
          FlashService.Error(error);
        });
    }
  }

})();
