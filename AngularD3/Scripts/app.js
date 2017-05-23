/// <reference path="angular.js" />
/// <reference path="HorizonBar.controller.js" />
var app = angular.module("app", ["chart.app", "ui.router", "ngRoute"])

    .config(function ($stateProvider, $routeProvider) {


        $routeProvider.when("/barChart", {
            component: "lineChart",
            
        })

        var horizonBarChartState = {
            url: '/horizonBarChart',
            templateUrl: '/Views/HorizontalBarChart.html',
            controller: "HorizontalBarController",
            controllerAs:"$hBarCtrl"
        }

        var barChartState = {
            url: '/barChart',
            templateUrl: '/Views/barChart.view.html',
            controller: 'chartController'
        };

        var lineChartState = {
            url: '/lineChart',
            templateUrl: '/Views/LineChart.view.html',
            controller: 'chartController'
        };

        var donutChartState = {
            url: '/donutChart',
            templateUrl: '/Views/DonutChart.view.html',
            controller: 'DonutController',
            controllerAs: '$dctrl'
        }

        var moreGrpChartState = {
            url: '/moreGroupChart',
            templateUrl: 'Views/MoreGroupBarChart.view.html',
            controller: 'moreGroupBarChartController',
            controllerAs:"$mctrl"
        }

        var singleBarChartState = {
            url: '/singleBarChart',
            templateUrl: 'Views/SingleFullChart.view.html',
            controller: 'SingleFullChartController',
            controllerAs: "$sctrl"
        }

        var toolTipState = {
            url: '/tooltip',
            templateUrl: 'Views/tooltip.view.html',
            controller: "ToolTipController",
            controllerAs:'toolTipCtrl'
        }

        $stateProvider.state("lineChart", lineChartState)
                      .state("barChart", barChartState)
                      .state("donutChart", donutChartState)
                      .state('hBarChart', horizonBarChartState)
                      .state('mBarChart', moreGrpChartState)
                      .state('singleBarChart', singleBarChartState)
                      .state('tooltip', toolTipState)
    })

    .component("lineChart", {
        name:'lineChart',
        controller: function () {

            this.greeting = "Pradeep"

        },
        template: '<h1>Hello World!{{$ctrl.greeting}}</h2>'
    })

.controller("chartController", function ($scope) {
    $scope.dataset = [
        { label: 'Abulia', value: "37,848" },
        { label: 'Betelgeuse', value: "212,532" },
        { label: 'Cantaloupe', value: "655,092" },
        //{ label: 'Insitutuions', value: "13,456" },
        { label: 'College', value: "103,782" },
        { label: 'Bank', value: "530,960" },
        { label: 'University', value: "103,782" },
        { label: 'Universitys', value: "1,503392" }
    ]

    $scope.valueUnit = '€'

    $scope.chartColors = ["#ca0c50", "#fdcc43", "#df6aac", "#6e2878", "#499edd", "#d5d2e3", "#2aa3a0"];
    $scope.barColors = ["#ca0c50", "#2aa3a0", "#008dde", "#df6aac", "#fdcc43", "#6e2878", "#bab3e7"];

    $scope.lineData = [
        [{ "sale": "202", "year": "2000" }, { "sale": "215", "year": "2001" }, { "sale": "179", "year": "2002" }, {"sale": "199", "year": "2003"}, { "sale": "134", "year": "2003" }, { "sale": "176", "year": "2010" }],
        [{ "sale": "20", "year": "2000" }, { "sale": "25", "year": "2001" }, { "sale": "179", "year": "2002" }, {"sale": "197", "year": "2003"}, { "sale": "144", "year": "2003" }, { "sale": "136", "year": "2010" }]
    ];


    //$scope.sortChartFn = function (obj1, obj2) {
    //    return obj1.value - obj2.value
    //}

    //setTimeout(function () {
    //    $scope.dataset = [
    //{ label: 'Abulia', value: 20 },
    //{ label: 'Betelgeuse', value: 10 },
    //{ label: 'Cantaloupe', value: 30 },
    //{ label: 'Dijkstra', value: 50 }
    //    ]
    //    $scope.$apply();
    //}, 2000)

    //$scope.barData = [
    //     { year: "2000", Desktop: "134", Laptop: "188", Mobile: "269" },
    //     { year: "2001", Desktop: "158", Laptop: "248", Mobile: "333" },
    //     { year: "2002", Desktop: "161", Laptop: "259", Mobile: "360" },
    //     { year: "2003", Desktop: "169", Laptop: "254", Mobile: "355" },
    //     { year: "2004", Desktop: "161", Laptop: "243", Mobile: "346" },
    //     { year: "2005", Desktop: "157", Laptop: "240", Mobile: "346" },
    //];

    $scope.axisData = [
                {"percent": "150", value: "20" },
                {"percent": "100", value: "50" },
                {"percent": "75", value: "30" },
                {"percent": "50", value: "20" },
                {"percent": "35", value: "50" },
                {"percent": "20", value: "30" },
                {"percent": "0", value: "10" }
    ];

    $scope.legendData = ["Red", "Orange", "Green"]
    $scope.legendColors = ["#c11c49", "#f68c2e", "#43b02a"]




    
})

.controller("HorizontalBarController", HorizontalBarController)
.controller("moreGroupBarChartController", moreGroupBarChartController)
.controller('SingleFullChartController', SingleFullChartController)
.controller('DonutController', DonutController)