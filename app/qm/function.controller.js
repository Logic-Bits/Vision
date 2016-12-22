(function () {
    'use strict';

    angular
        .module('app')
        .controller('Qm.FunctionController', Controller);

    function Controller($window, UseCaseService, FunctionService, FlashService) {
        var vm = this;
        //vm.usecase = null;
        vm.functionspezs = null; //all function spezification
        vm.functionspez = null; //selected one
        vm.newfunctionspez = null; //the new created one
        vm.createFunction = createFunction;
        vm.updateFunction= updateFunction;
        vm.select = select;
        vm.deleteFunction = deleteFunction;

        initController();

        function initController() {
            FunctionService.GetAll().then(function (functionspezs){
                  vm.functionspezs = functionspezs;

                  console.log("found usecases: " + vm.functionspezs.length);

                  if(vm.functionspezs.length > 0)
                  {
                    vm.functionspez = vm.functionspezs[0];
                  }
            });
        }

        function updateFunction() {
            FunctionService.Update(vm.functionspez)
                .then(function () {
                    FlashService.Success('Function Spezification updated');

                    //now update the item in the master list. no full refresh needed
                    for (var i=0; i < vm.functionspezs.length; i++) {
                        if (vm.functionspezs[i]._id === vm.functionspez._id) {
                            vm.functionspezs[i] = vm.functionspez;
                            break;
                        }
                    }
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        function createFunction() {
          FunctionService.Create(vm.newfunctionspez)
              .then(function () {
                  FlashService.Success('Use Case created');
                  initController();
                  //todo refresh
              })
              .catch(function (error) {
                  FlashService.Error(error);
              });
        }

        function select(functionspez){
          FunctionService.GetById(functionspez._id).then(function(func){
            vm.functionspez = func;
          });
        }

        function deleteFunction(functionspez){
          FunctionService.Delete(functionspez._id).then(function () {
              FlashService.Success('Function Spezification deleted');
              $('#confirm-delete').modal('hide');
              initController();
          })
          .catch(function (error) {
              FlashService.Error(error);
          });
        }
    }

})();
