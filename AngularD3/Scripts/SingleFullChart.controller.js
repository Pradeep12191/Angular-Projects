var SingleFullChartController = ["$scope", function ($scope) {
    var vm = this;
    vm.data = [
        {
            sector: '1 - Total',
            sectorValues: [
                {
                    title: 'orginal exposure pre conversion factor',
                    titleValues:[
                        {
                            rij:'300', 
                            rijValues:[{ quarter:'2014-Q4', value:'0' },{ quarter:'2014-Q1', value:'0' }, { quarter:'2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50'}, { quarter: '2015-Q4', value:'20'}, {quarter: '2014-Q6', value:'160'}]
                        },
                        {
                            rij:'320',
                            rijValues:[{ quarter:'2014-Q4', value:'100' },{ quarter:'2014-Q1', value:'105' }, { quarter:'2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-20'}, { quarter: '2015-Q4', value:'20'}, {quarter: '2014-Q6', value:'160'}]
                        }
                    ]
                },
                {
                    title: 'Value Adjustments',
                    titleValues:[
                        {
                            rij:'300', 
                            rijValues:[{ quarter:'2014-Q4', value:'-20' },{ quarter:'2014-Q1', value:'105' }, { quarter:'2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50'}, { quarter: '2015-Q4', value:'20'}, {quarter: '2014-Q6', value:'160'}]
                        },
                        {
                            rij:'320',
                            rijValues:[{ quarter:'2014-Q4', value:'-150' },{ quarter:'2014-Q1', value:'300' }, { quarter:'2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50'}, { quarter: '2015-Q4', value:'20'}, {quarter: '2014-Q6', value:'160'}]
                        }
                    ]
                }
            ],
        },
        {
            sector: '4 - Public sector entities',
            sectorValues: [
                {
                    title: 'orginal exposure pre conversion factor',
                    titleValues: [
                        {
                            rij: '300',
                            rijValues: [{ quarter: '2014-Q4', value: '100' }, { quarter: '2014-Q1', value: '105' }, { quarter: '2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50' }, { quarter: '2015-Q4', value: '20' }, { quarter: '2014-Q6', value: '160' }]
                        },
                        {
                            rij: '320',
                            rijValues: [{ quarter: '2014-Q4', value: '100' }, { quarter: '2014-Q1', value: '105' }, { quarter: '2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50' }, { quarter: '2015-Q4', value: '20' }, { quarter: '2014-Q6', value: '160' }]
                        }
                    ]
                },
                {
                    title: 'Value Adjustments',
                    titleValues: [
                        {
                            rij: '300',
                            rijValues: [{ quarter: '2014-Q4', value: '100' }, { quarter: '2014-Q1', value: '105' }, { quarter: '2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50' }, { quarter: '2015-Q4', value: '20' }, { quarter: '2014-Q6', value: '160' }]
                        },
                        {
                            rij: '320',
                            rijValues: [{ quarter: '2014-Q4', value: '100' }, { quarter: '2014-Q1', value: '105' }, { quarter: '2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50' }, { quarter: '2015-Q4', value: '20' }, { quarter: '2014-Q6', value: '160' }]
                        }
                    ]
                }
            ],
        },
        {
            sector: '7 - Insitutions',
            sectorValues: [
                {
                    title: 'orginal exposure pre conversion factor',
                    titleValues: [
                        {
                            rij: '300',
                            rijValues: [{ quarter: '2014-Q4', value: '100' }, { quarter: '2014-Q1', value: '105' }, { quarter: '2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50' }, { quarter: '2015-Q4', value: '20' }, { quarter: '2014-Q6', value: '160' }]
                        },
                        {
                            rij: '320',
                            rijValues: [{ quarter: '2014-Q4', value: '100' }, { quarter: '2014-Q1', value: '105' }, { quarter: '2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-20' }, { quarter: '2015-Q4', value: '20' }, { quarter: '2014-Q6', value: '160' }]
                        }
                    ]
                },
                {
                    title: 'Value Adjustments',
                    titleValues: [
                        {
                            rij: '300',
                            rijValues: [{ quarter: '2014-Q4', value: '-20' }, { quarter: '2014-Q1', value: '105' }, { quarter: '2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50' }, { quarter: '2015-Q4', value: '20' }, { quarter: '2014-Q6', value: '160' }]
                        },
                        {
                            rij: '320',
                            rijValues: [{ quarter: '2014-Q4', value: '-100' }, { quarter: '2014-Q1', value: '300' }, { quarter: '2015-Q2', value: '300' }, { quarter: '2015-Q3', value: '-50' }, { quarter: '2015-Q4', value: '20' }, { quarter: '2014-Q6', value: '160' }]
                        }
                    ]
                }
            ],
        }
     ],

    vm.total = vm.data[1]

    vm.colors = ["rgb(214, 39, 40)", "rgb(148, 103, 189)", "rgb(140, 86, 75)", "rgb(227,119, 194)", "rgb(127, 127, 127)", "rgb(188, 189, 34)"]

    vm.hideYAxes = false
    vm.groupTitle = 'title'
}]