var HorizontalBarController = function ($scope) {

    var vm = this;
    vm.data1 = [
        //{ name: 'A', value: -15 },
        //{ name: 'B', value: -20 },
        //{ name: 'C', value: -22 },
        //{ name: 'D', value: -18 },
        { name: 'E', value: 2 },
        { name: 'F', value: 6 },
        { name: 'G', value: 26 },
        { name: 'H', value: 10 },
        { name: 'I', value: 6 },
        { name: 'J', value: 18 }
    ]

    vm.data2 = [
        { categoryName: "Common equality tier1 capital", '2014-Q4': '-200', '2015-Q1': '500', '2015-Q2': '400', '2015-Q3': '50', '2015-Q4': '160', '2016-Q1': '210' },
        { categoryName: "Additional tier1 capital", '2014-Q4': '200', '2015-Q1': '500', '2015-Q2': '400', '2015-Q3': '50', '2015-Q4': '160', '2016-Q1': '700' },
        { categoryName: "Additional tier2 capital", '2014-Q4': '200', '2015-Q1': '500', '2015-Q2': '400', '2015-Q3': '50', '2015-Q4': '160', '2016-Q1': '700' },
        { categoryName: "Additional tier3 capital", '2014-Q4': '200', '2015-Q1': '500', '2015-Q2': '400', '2015-Q3': '50', '2015-Q4': '160', '2016-Q1': '700' }
    ]

    vm.colors = ["rgb(214, 39, 40)", "rgb(148, 103, 189)", "rgb(140, 86, 75)", "rgb(227,119, 194)", "rgb(127, 127, 127)", "rgb(188, 189, 34)"]

    vm.groupTitle = "categoryName"

    $scope.message = "message"
}