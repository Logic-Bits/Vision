(function() {
  'use strict';

  angular
    .module('app')
    .controller('Qm.UseCasesController', Controller);

  function Controller($window, UseCaseService, FunctionService, FlashService) {
    var vm = this;
    vm.usecase = null;
    vm.createUseCase = createUseCase;
    vm.updateUseCase = updateUseCase;
    vm.select = select;
    vm.deleteUseCase = deleteUseCase;
    vm.openFunctionModal = openFunctionModal;
    vm.addFunctionRef = addFunctionRef;

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

      //maybe have to use then function
      var oldSelectedUsecase = angular.element( document.querySelector( "#container_" + vm.usecase._id ) );

      if(oldSelectedUsecase != null)
        oldSelectedUsecase.removeClass('active');

      var myEl = angular.element( document.querySelector( "#container_" + usecase._id ) );
      myEl.addClass('active');


      UseCaseService.GetById(usecase._id).then(function(uc) {

        if(uc != null)
        {
          vm.usecase = uc;
          getLinkedSpezifications(uc);
        }
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

    function openFunctionModal()
    {

        FunctionService.GetAll().then(function(fs) {

          if(fs != null)
          {
            vm.functions = fs;
            console.log("found functions: " + fs.length);
          }
        });


      $('#functionsmodal').modal('show');
    }

    function addFunctionRef(func)
    {

      if(vm.usecase.linkedFS == null)
        vm.usecase.linkedFS = new Array();

        //console.log(vm.usecase.linkedFS);

        var indx = vm.usecase.linkedFS.indexOf(func._id);

        console.log("index of Spezification id is " + indx);

      if(indx == -1) //-1 not in array
      {
        vm.usecase.linkedFS.push(func._id);

        UseCaseService.Update(vm.usecase)
          .then(function() {
            FlashService.Success('Use Case updated');
              $('#functionsmodal').modal('hide');
          })
          .catch(function(error) {
            FlashService.Error(error);
            alert(error);
          });
      }
      else {
        alert("already in list");
      }
    }

    function getLinkedSpezifications(usecase)
    {
      UseCaseService.GetConnectedSpezifications(usecase._id).then(function (functions){
        console.log("for current UC we got specifications: " + functions.length);

        //load all the spezifications

          vm.usecase.functions = functions;
      });
    }

  }

})();
