var DonutController = function ($timeout) {
    var vm = this;
    vm.chartColors = ["#ca0c50", "#fdcc43", "#df6aac", "#6e2878", "#499edd", "#d5d2e3", "#2aa3a0"];

    vm.dataset = [
    { label: 'Abulia', value: 37848 },
    { label: 'Betelgeuse', value: 212532 },
    { label: 'Cantaloupe', value: 655092 },
    //{ label: 'Insitutuions', value: "13,456" },
    { label: 'College', value: 103782 },
    { label: 'Bank', value: 530960 },
    { label: 'University', value: 103782 },
    { label: 'Universitys', value: 1503392 }
    ]

    vm.showLegend = false;
    vm.showPopover = true;
    vm.width = 300;
    vm.height = 150;
    vm.innerRadius = 20;

    vm.legendData = ["Red", "Orange", "Green"]
    vm.legendColors = ["#c11c49", "#f68c2e", "#43b02a"]

    $timeout(function () {
        vm.dataset = [
            { label: 'Abulia', value: "37,84" },
            { label: 'Betelgeuse', value: "212,53" },
            { label: 'Cantaloupe', value: "655,09" },
            //{ label: 'Insitutuions', value: "13,456" },
            { label: 'College', value: "103,78" },
            { label: 'Bank', value: "530,96" },
            { label: 'University', value: "103,78" },
            { label: 'Universitys', value: "1,50339" }
        ]
    }, 2000)


}

DonutController.$inject = ["$timeout"]