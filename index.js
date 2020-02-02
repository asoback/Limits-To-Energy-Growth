import { population_data } from './data/population.js';
import { indexed_energy_data } from './data/indexedData.js';

import { utils } from './utils.js';
import { popuation_calc, energy_calc } from './growthCalc.js';

const historicalChart = document.getElementById('historicalChart');
const flatConsumptionChart = document.getElementById('flatConsumptionChart');
const myPredictionChart = document.getElementById('myPredictionChart');
const PopulationChart = document.getElementById('PopulationChart');
const peakDemandChart = document.getElementById('PeakDemandChart');
const pop_num_years_input = document.getElementById("num_years");
const pop_carrying_cap_input = document.getElementById("max_pop");
const renewables_rate_input = document.getElementById("renewables_rate");
const renewables_rate_input_2 = document.getElementById("renewables_rate_2");
const demand_rate_input =  document.getElementById("demand_rate");

const modelVariables = {
    startYear : 1980,
    historicalYears: 36,
    endYear: 2170,
    maxChartHeight: 1000,
    pop: {
        carryingCapacityBil: 10,
        peakPopulationBil: 10,
        history: [],
        lastRate: 0
    },
    energyPerPerson: {
        peakIndex: 0,
        history: [],
        rateOfIncrease: 0
    },
    renewables: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        history: [],
        rateOfIncrease: 0
    },
    coal: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        history: [],
        rateOfIncrease: 0
    },
    oil: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        history: [],
        rateOfIncrease: 0
    },
    natural_gas: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        history: [],
        rateOfIncrease: 0
    },
    demand: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        history: [],
        rateOfIncrease: 0
    }
    
};

/**
    populate the model energy data.
 */
const populateModelData = () => {
    // Handle pop data
    let popIndex = 0;
    while (population_data.years[popIndex] < modelVariables.startYear ) {
        ++popIndex;
    }

    while (popIndex < population_data.years.length) {
        modelVariables.pop.history.push(population_data.world_population_total[popIndex]);
        ++popIndex;
    }

    modelVariables.pop.lastRate = ( 
        modelVariables.pop.history[popIndex -1] / 
        modelVariables.pop.history[popIndex - 2] ) - 1 ;

    // handle energy data
    indexed_energy_data.forEach((item, index) => {
        if (item.data) {
            const energySource = item.type;
            modelVariables[energySource].history = item.data;
            modelVariables[energySource].peakIndex = utils.last(modelVariables[energySource].history);
            modelVariables[energySource].rateOfIncrease = energy_calc.calcAvgGrowth(modelVariables[energySource].history);
        }
    });

    // Demand history

    for (let i = 0; i < modelVariables.oil.history.length; i++) {
        let thisDemand = modelVariables.oil.history[i];
        thisDemand += modelVariables.coal.history[i];
        thisDemand += modelVariables.natural_gas.history[i];
        thisDemand += modelVariables.renewables.history[i];
        modelVariables.demand.history.push(thisDemand);
        modelVariables.energyPerPerson.history.push(Math.round((thisDemand * utils.TRILLION())/modelVariables.pop.history[i], 0));
    }

    modelVariables.demand.peakIndex = utils.last(modelVariables.demand.history);
    modelVariables.demand.rateOfIncrease = energy_calc.calcAvgGrowth(modelVariables.demand.history);

    modelVariables.energyPerPerson.peakIndex = utils.last(modelVariables.energyPerPerson.history);
    modelVariables.energyPerPerson.rateOfIncrease = energy_calc.calcAvgGrowth(modelVariables.energyPerPerson.history);
};

populateModelData();

console.log(modelVariables);

const generateChart = (chartDiv, data, type = 'line', options = {}) => {
    let ctx = chartDiv.getContext('2d');
    let chart = new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });	
};

/*
const buildEnergyChart = (chartElem, oilBool, coalBool, gasBool, renewBool, demandBool) => {
    const type = 'line';
    const data = {};
    data.labels = array_of_years_start_to_end(modelVariables.startYear, modelVariables.endYear);
    data.datasets = [];

    if (oilBool){
         data.datasets.push({
            label: 'Total Oil Consumption',
            backgroundColor: 'rgba(64, 37, 29, 0.5)',
            borderColor: 'rgb(64, 37, 29)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear,  modelVariables.oil),
        });
    }

    if (coalBool){
        data.datasets.push({
            label: 'Total Coal Consumption',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgb(0, 0, 0)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear, modelVariables.coal),
        });
    }

    if (gasBool){
         data.datasets.push({
            label: 'Total Gas Consumption',
            backgroundColor: 'rgba(196, 170, 0, 0.5)',
            borderColor: 'rgb(196, 170, 0)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear,  modelVariables.oil),
        });
    }

    if (renewBool){
        data.datasets.push({
            label: 'Total Nuclear and Renewable Energy Consumption',
            backgroundColor: 'rgba(0, 181, 30, 0.5)',
            borderColor: 'rgb(0, 181, 30)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear, modelVariables.coal),
        });
    }

    if (demandBool){
        data.datasets.push({
            label: "Demand",
            yAxisID: 'demand_line',
            backgroundColor: 'rgba(255, 120, 250, 0.2)',
            borderColor: 'rgb(255, 120, 250)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear, modelVariables.coal),
        });
    }

    const options = {
        scales: {
            yAxes: [{
                stacked: true
            }]
        }
    };

    generateChart(chartElem, data, type, options);
};

// Historical
const generateHistoricalChart = () => {
    const data = {};
    data.labels = array_of_years_start_to_end(1980, 2016);
    data.datasets = [
        {
            label: 'Total Nuclear and Renewable Energy Consumption',
            backgroundColor: 'rgba(0, 181, 30, 0.5)',
            borderColor: 'rgb(0, 181, 30)',
            data: getData(1980, 2016, globalNuclearAndRenewableConsumption),
        },
        { 
            label: 'Total Coal Consumption',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgb(0, 0, 0)',
            data: getData(1980, 2016, globalCoalConsumption),
        },
        {
            label: 'Total Gas Consumption',
            backgroundColor: 'rgba(196, 170, 0, 0.5)',
            borderColor: 'rgb(196, 170, 0)',
            data: getData(1980, 2016, globalNaturalGasConsumption),
        },
        {
            label: 'Total Oil Consumption',
            backgroundColor: 'rgba(64, 37, 29, 0.5)',
            borderColor: 'rgb(64, 37, 29)',
            data: getData(1980, 2016, globalOilConsumption),
        },
    ];
    const options = {
        scales: {
            yAxes: [{
                stacked: true
            }]
        }
    };
    generateChart(historicalChart, data, 'line', options);
};

generateHistoricalChart();

const generateFlatConsumtionChart = (renewables_rate_change) => {
    // Divide up data by type
    let years = array_of_years_start_to_end(1980, 2016);
    let coal = getData(1980, 2016, globalCoalConsumption);
    let oil = getData(1980, 2016, globalOilConsumption);
    let natural_gas = getData(1980, 2016, globalNaturalGasConsumption);
    let renewables =  getData(1980, 2016, globalNuclearAndRenewableConsumption);
    renewables = roundArray(renewables);
    // Add data at flat rate or less until 0d
    // oil
    const btuRemainingOil = convert_barrels_oil_to_quad_btu(non_renewable_reserves.oil.proven);
    const lastOilRate = oil[oil.length - 1];
    let flatConsumptionOil = oil.concat(getFlatConsumptionArray(btuRemainingOil, lastOilRate));
    let longestLen = flatConsumptionOil.length;

    // coal
    const btuRemainingCoal = convert_coal_to_btu(non_renewable_reserves.coal.proven);
    const lastCoalRate = coal[coal.length - 1];
    let flatConsumptionCoal = coal.concat(getFlatConsumptionArray(btuRemainingCoal, lastCoalRate));
    longestLen = Math.max(longestLen, flatConsumptionCoal.length);
    // gas
    const btuRemainingNaturalGas = convert_natural_gas_to_btu(non_renewable_reserves.natural_gas.proven);
    const lastNaturalGasRate = natural_gas[natural_gas.length - 1];
    let flatConsumptionGas = natural_gas.concat(getFlatConsumptionArray(btuRemainingNaturalGas, lastNaturalGasRate));
    longestLen = Math.max(longestLen, flatConsumptionGas.length);

    // Additional chart space
    const extraYears = 10;
    longestLen = longestLen + extraYears;

    // zero fill
    flatConsumptionOil = zeroFillArrayBack(flatConsumptionOil, longestLen+ 10);
    flatConsumptionCoal = zeroFillArrayBack(flatConsumptionCoal, longestLen + 10);
    flatConsumptionGas = zeroFillArrayBack(flatConsumptionGas, longestLen + 10);
    // increase steadily renewables and nuclear
    const primary_energy =  addWithNonRenewables(getData(1980, 2016, globalPrimaryConsumption), renewables);
    renewables = expandDataWithSteadyIncreaseConsumption(renewables, longestLen - years.length, renewables_rate_change);
    // get years
    const fullYearsArray = yearsPlusMoreYears(years, longestLen - years.length);
    
    // chart
    const data = {};
    data.labels = fullYearsArray;
    data.datasets = [
        {
            label: "Coal Consumption",
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgb(0, 0, 0)',
            data: flatConsumptionCoal
        },
        {
            label: "Natural Gas Consumption",
            backgroundColor: 'rgba(148, 118, 0, 0.5)',
            borderColor: 'rgb(148, 118, 0)',
            data: flatConsumptionGas
        },
        {
            label: "Oil Consumption",
            backgroundColor: 'rgba(82, 50, 29, 0.5)',
            borderColor: 'rgb(82, 50, 29)',
            data: flatConsumptionOil
        },
        {
            label: "Renewables Consumption",
            backgroundColor: 'rgba(0, 161, 5, 0.5)',
            borderColor: 'rgb(0, 161, 5)',
            data: renewables
        }
    ];
    const options = {
        scales: {
            yAxes: [{
                stacked: true
            }]
        }
    };
    generateChart(flatConsumptionChart, data, 'line', options);
};

generateFlatConsumtionChart(renewables_rate_input.value * 0.01);

renewables_rate_input.onchange = () => {
    generateFlatConsumtionChart(renewables_rate_input.value * 0.01);
    renewables_rate_input_2.value = renewables_rate_input.value;
};


const generateMyPredictionChart = (renewables_rate_change) => {
    // Divide up data by type
    let years = array_of_years_start_to_end(1980, 2016);
    let coal = getData(1980, 2016, globalCoalConsumption);
    let oil = getData(1980, 2016, globalOilConsumption);
    let natural_gas = getData(1980, 2016, globalNaturalGasConsumption);
    let renewables =  getData(1980, 2016, globalNuclearAndRenewableConsumption);
    renewables = roundArray(renewables);
    // Add data at declining rate or less until 0d
    // oil
    const btuRemainingOil = convert_barrels_oil_to_quad_btu(non_renewable_reserves.oil.proven);
    const lastOilRate = oil[oil.length - 1];
    let decliningConsumptionOil = oil.concat(getDecliningConsumptionArray(btuRemainingOil, lastOilRate, renewables_rate_input.value * 0.01));
    let longestLen = decliningConsumptionOil.length;

    // coal
    const btuRemainingCoal = convert_coal_to_btu(non_renewable_reserves.coal.proven);
    const lastCoalRate = coal[coal.length - 1];
    let decliningConsumptionCoal = coal.concat(getDecliningConsumptionArray(btuRemainingCoal, lastCoalRate, renewables_rate_input.value * 0.01));
    longestLen = Math.max(longestLen, decliningConsumptionCoal.length);
    // gas
    const btuRemainingNaturalGas = convert_natural_gas_to_btu(non_renewable_reserves.natural_gas.proven);
    const lastNaturalGasRate = natural_gas[natural_gas.length - 1];
    let decliningConsumptionGas = natural_gas.concat(getDecliningConsumptionArray(btuRemainingNaturalGas, lastNaturalGasRate, renewables_rate_input.value * 0.01));
    longestLen = Math.max(longestLen, decliningConsumptionGas.length);

    // Additional chart space
    const extraYears = 10;
    longestLen = longestLen + extraYears;

    // zero fill
    decliningConsumptionOil = zeroFillArrayBack(decliningConsumptionOil, longestLen);
    decliningConsumptionCoal = zeroFillArrayBack(decliningConsumptionCoal, longestLen);
    decliningConsumptionGas = zeroFillArrayBack(decliningConsumptionGas, longestLen);
    // increase steadily renewables and nuclear
    const primary_energy =  addWithNonRenewables(getData(1980, 2016, globalPrimaryConsumption), renewables);
    renewables = expandDataWithSteadyIncreaseConsumption(renewables, longestLen - years.length, renewables_rate_change);
    // get years
    const fullYearsArray = yearsPlusMoreYears(years, longestLen - years.length);


    // Calculate Demand
    
    const demand = expandDataWithSteadyIncreaseConsumption(
        primary_energy,
        years.length - 10,
        demand_rate_input.value * 0.01
    );

    const n = Math.max(renewables[renewables.length -1], demand[demand.length - 1]);
    const max_ticks = Math.ceil((n)/100)*100;
    
    // chart
    const data = {};
    data.labels = fullYearsArray;
    data.datasets = [
        {
            label: "Coal Consumption",
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgb(0, 0, 0)',
            data: decliningConsumptionCoal
        },
        {
            label: "Natural Gas Consumption",
            backgroundColor: 'rgba(148, 118, 0, 0.5)',
            borderColor: 'rgb(148, 118, 0)',
            data: decliningConsumptionGas
        },
        {
            label: "Oil Consumption",
            backgroundColor: 'rgba(82, 50, 29, 0.5)',
            borderColor: 'rgb(82, 50, 29)',
            data: decliningConsumptionOil
        },
        {
            label: "Renewables Consumption",
            backgroundColor: 'rgba(0, 161, 5, 0.5)',
            borderColor: 'rgb(0, 161, 5)',
            data: renewables
        },
        {
            label: "Demand",
            yAxisID: 'demand_line',
            backgroundColor: 'rgba(255, 120, 250, 0.2)',
            borderColor: 'rgb(255, 120, 250)',
            data: demand
        }
    ];
    const options = {
        scales: {
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: max_ticks
                },
            },{
                id: 'demand_line',
                stacked: false,
                display: false, // ticks on y axis
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: max_ticks
                },
            }]
        }
    };
    generateChart(myPredictionChart, data, 'line', options);

    const totalSupply = [];
    for (let i = 0; i < fullYearsArray.length; i++) {
        totalSupply.push(Math.round(decliningConsumptionCoal[i] + decliningConsumptionGas[i] + decliningConsumptionOil[i] + renewables[i]));
    }
    return totalSupply;
};

let totalSupply = generateMyPredictionChart(renewables_rate_input_2.value * 0.01);

demand_rate_input.onchange = () => {
    totalSupply = generateMyPredictionChart(renewables_rate_input_2.value * 0.01);
};

renewables_rate_input_2.onchange = () => {
    totalSupply = generateMyPredictionChart(renewables_rate_input_2.value * 0.01);
};




// Generate Chart
const generatePopulationChart = (num_years, carrying_cap) => {
    const data = {};
    // make years
    data.labels = get_years_array(num_years, 1960);
    
    // Calculate predicted populations
    const less_years = 2018 - 1960; // No predictions for data we'll see.
    const starting_pop = 7594270356; // Latest data
    // Latest year growth rate
    const starting_rate =  calculate_avg_yearly_pop_growth('2017');
    // Actual population data
    const predicted_pop_data = modeling_population_growth(num_years - less_years, starting_pop, carrying_cap, starting_rate * 0.01);
    const pop_data = population_data.world_population_total;
    const whole_pop_data = pop_data.concat(predicted_pop_data);
    data.datasets = [
        {
            label: 'Real Population',
            borderColor: 'rgb(99, 255, 132)',
            data: population_data.world_population_total
        },
        {
            label: 'Projected Population',
            borderColor: 'rgb(255, 99, 132)',
            data: whole_pop_data
        }
    ];
    generateChart(PopulationChart, data);
};

// Initial Chart (10 Billion prediction)
generatePopulationChart(250, 10000000000);

// Bind buttons
const recalculate_pop_predictions = () => {
    const num_years = pop_num_years_input.value;
    const carrying_cap = pop_carrying_cap_input.value * 1000000000;
    generatePopulationChart(num_years, carrying_cap);
};

pop_num_years_input.onchange = recalculate_pop_predictions;
pop_carrying_cap_input.onchange = recalculate_pop_predictions;


// Compount interest
// Bind Elements
    const compoundStartPop = document.getElementById("compoundStartPop");
    const compoundYear = document.getElementById("compoundYear");
    const compoundYearsToGrow = document.getElementById("compoundYearsToGrow");
    const compoundRate = document.getElementById("compoundRate");
    const compountSubmit = document.getElementById("compoundSubmit");
    const compoundOutput = document.getElementById("compoundOutput");
    const compoundDescription = document.getElementById("compoundDescription");



compoundSubmit.onclick = () => {
    const final_pop = simple_interest_function(
            compoundStartPop.value,
            compoundYear.value,
            compoundYearsToGrow.value,
            compoundRate.value
    );

    compoundOutput.textContent = number_with_commas(final_pop);
    compoundDescription.textContent = 'Or roughly ' + int_to_string(final_pop);
};



const generateDemandPerCapitaChart = (perCapita, populationMax, totalSupplyArray, maxRate, numYears) => {
    const peakDemand = perCapita * populationMax;
    const mostRecentYear = last(globalPrimaryConsumption.years);
    const mostRecentDemand = Math.round(last(globalPrimaryConsumption.data) + last(globalNuclearAndRenewableConsumption.data));
    //Generate yearly rate that caps out at some max
        // Look at desired demand per person * pop
    // Reuse the same population fn?

    const futureDemand = modeling_population_growth(totalSupplyArray.length - 36, mostRecentDemand, peakDemand/QUAD, maxRate);
    let demand = [];
    for ( let i = 0; i < 36; i++){
        demand.push(totalSupplyArray[i]);
    }
    demand = demand.concat(futureDemand);

    // Compare to the possible supply per year
    const years = yearsPlusMoreYears(globalPrimaryConsumption.years, numYears); 
   
    // Generate chart
    const data = {};
    // make years
    data.labels = get_years_array(numYears, 1980);
    data.datasets = [
        {
            label: 'Supply',
            borderColor: 'rgb(99, 255, 132)',
            data: totalSupplyArray
        },
        {
            label: 'Demand',
            borderColor: 'rgb(255, 99, 132)',
            data: demand
        }
    ];
    generateChart(peakDemandChart, data);
};

//TODO make these inputs
const maxRate = 0.02;
const perCapita = 99* MILLION;
const populationMax =pop_carrying_cap_input.value * 1000000000;
const numYears = totalSupply.length;

generateDemandPerCapitaChart(perCapita, populationMax, totalSupply, maxRate, numYears);


//
// Undiscovered Resources
//

const undiscoveredPlusDiscovered = (known, extraPercent) => {
    return known * (1 + extraPercent);
};

const btuRemainingOil = convert_barrels_oil_to_quad_btu(non_renewable_reserves.oil.proven);
const btuRemainingCoal = convert_coal_to_btu(non_renewable_reserves.coal.proven);
const btuRemainingNaturalGas = convert_natural_gas_to_btu(non_renewable_reserves.natural_gas.proven);

const undiscoveredChart = document.getElementById('undiscoveredChart');
const undiscoveredResources = document.getElementById('undiscovered');
const yearsUntilTurnAround = document.getElementById('yearsUntilTurnAround');

const growthAndDeclineCurves = (remainingBTU, startingRate, startingGrowthRate, yearsToNegative) => {
    const valueArray = [];
    let lastSeen = startingRate;
    let remainingResouce = remainingBTU;
    let yearsPast = 0;
    // Declining growth curve
    while (remainingResource > 0 && yearsPast < yearsToNegative) {
        yearsPast++;
        lastSeen = lastSeen + lastSeen * (startingGrowthRate * ((yearsToNegative - yearsPast)/yearsToNegative));
        valueArray.push(lastSeen);
    }
    // Declining consumption curve
    while (remainingResource > 0) {

    }

};

const generateUndiscoveredChart = (perCapita, populationMax, maxRate) => {
    const undiscoveredPercent = (undiscoveredResources.value / 100);
    const yearsTillNegativeGrowth = yearsUntilTurnAround.value;

    const predictedBtuOil = undiscoveredPlusDiscovered(btuRemainingOil, undiscoveredPercent);
    const predictedBtuCoal = undiscoveredPlusDiscovered(btuRemainingCoal, undiscoveredPercent);
    const predictedBtuGas = undiscoveredPlusDiscovered(btuRemainingNaturalGas, undiscoveredPercent);



};



generateUndiscoveredChart(perCapita, populationMax, totalSupply, maxRate);


*/