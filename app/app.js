﻿(function () {
    'use strict';

    angular
        .module('app', ['ui.router', 'content-editable', 'ngTagsInput'])
        .config(config)
        .run(run);

    //angular.module('app', ["content-editable"]);

    function config($stateProvider, $urlRouterProvider) {
        // default route
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('usecases', {
                    url: '/usecases',
                    templateUrl: 'qm/usecases.html',
                    controller: 'Qm.UseCasesController',
                    controllerAs: 'vm',
                    data: { activeTab: 'usecases' }
                })
            .state('requirements', {
                    url: '/requirements',
                    templateUrl: 'qm/requirements.html',
                    controller: 'Qm.RequirementsController',
                    controllerAs: 'vm',
                    data: { activeTab: 'requirements' }
                })
            .state('settings', {
                    url: '/settings',
                    templateUrl: 'settings/settings.html',
                    controller: 'Settings.SettingsController',
                    controllerAs: 'vm',
                    data: { activeTab: 'settings' }
                })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            });
    }

    function run($http, $rootScope, $window) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });
    }

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            window.jwtToken = token;

            angular.bootstrap(document, ['app']);
        });
    });
})();
