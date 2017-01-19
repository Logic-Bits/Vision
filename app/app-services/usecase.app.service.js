(function () {
    'use strict';

    angular
        .module('app')
        .factory('UseCaseService', Service);

    function Service($http, $q) {
        var service = {};

        //service.GetCurrent = GetCurrent;
        service.GetAll = GetAll;
        service.GetById = GetById;
        //service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.DeleteAll = DeleteAll;
        service.GetConnectedSpezifications = GetConnectedSpezifications;
        service.Duplicate = Duplicate;

        return service;

        // function GetCurrent() {
        //     return $http.get('/api/users/current').then(handleSuccess, handleError);
        // }

        function GetAll() {
            return $http.get('/api/usecases/').then(handleSuccess, handleError);
        }

        function GetById(_id) {
            return $http.get('/api/usecases/' + _id).then(handleSuccess, handleError);
        }

        // function GetByUsername(username) {
        //     return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        // }

        function Create(usecase) {
            return $http.post('/api/usecases/create', usecase).then(handleSuccess, handleError);
        }

        function Update(usecase) {
            return $http.put('/api/usecases/' + usecase._id, usecase).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/usecases/' + _id).then(handleSuccess, handleError);
        }

        function DeleteAll(user) {
          //no ID needed, cldnt figure out how to do it else right now. Redo later
            return $http.delete('/api/usecases/deleteall/' + user._id).then(handleSuccess, handleError);
        }

        function GetConnectedSpezifications(usecaseId)
        {
          return $http.get('/api/usecases/FunctionSpezifications/' + usecaseId).then(handleSuccess, handleError);
        }


        function Duplicate(usecaseId) {
            return $http.get('/api/usecases/duplicate/' + usecaseId).then(handleSuccess, handleError);
        }


        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
