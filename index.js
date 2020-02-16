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
        prediction: [],
        stablePopYear: 0,
        lastRate: 0
    },
    energyPerPerson: {
        peakIndex: 0,
        history: [],
        prediction: [],
        rateOfIncrease: 0
    },
    renewables: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        reserveValue: 0,
        history: [],
        prediction: [],
        rateOfIncrease: 0
    },
    coal: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        reserveValue: 0,
        history: [],
        prediction: [],
        rateOfIncrease: 0
    },
    oil: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        reserveValue: 0,
        history: [],
        prediction: [],
        rateOfIncrease: 0
    },
    natural_gas: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        reserveValue: 0,
        history: [],
        prediction: [],
        rateOfIncrease: 0
    },
    demand: {
        floorIndex: 0,
        peakIndex: 0,
        yearsRemaining: 0,
        history: [],
        prediction: [],
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
        modelVariables.pop.history[modelVariables.pop.history.length - 1] / 
        modelVariables.pop.history[modelVariables.pop.history.length - 2] ) - 1 ;

    // handle energy data
    indexed_energy_data.forEach((item, index) => {
        if (item.data) {
            const energySource = item.type;
            modelVariables[energySource].history = item.data;
            modelVariables[energySource].peakIndex = utils.last(modelVariables[energySource].history);
            modelVariables[energySource].rateOfIncrease = energy_calc.calcAvgGrowth(modelVariables[energySource].history);
            modelVariables[energySource].reserveValue = item.reserve_value;
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


const generateChart = (chartDiv, data, type = 'line', options = {}) => {
    let ctx = chartDiv.getContext('2d');
    let chart = new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });	
};


//
// Population
//

// Generate Chart
const generatePopulationChart = (num_years, carrying_cap) => {
    modelVariables.pop.carryingCapacityBil = carrying_cap;

    const data = {};
    // make years
    data.labels = utils.get_years_array(num_years, modelVariables.startYear);
    
    // Calculate predicted populations
    const less_years = 2018 - 1980; // No predictions for data we'll see.
    const starting_pop = utils.last(modelVariables.pop.history); // Latest data
    // Latest year growth rate
    const starting_rate =  modelVariables.pop.lastRate;
    // Actual population data
    const predicted_pop_data = popuation_calc.modeling_population_growth(num_years - less_years, starting_pop, carrying_cap, starting_rate);
    modelVariables.pop.prediction = predicted_pop_data;
    const pop_data = modelVariables.pop.history;
    const whole_pop_data = pop_data.concat(predicted_pop_data);
    data.datasets = [
        {
            label: 'Real Population',
            borderColor: 'rgb(99, 255, 132)',
            data: modelVariables.pop.history
        },
        {
            label: 'Projected Population',
            borderColor: 'rgb(255, 99, 132)',
            data: whole_pop_data
        }
    ];

    generateChart(PopulationChart, data);

    // Stable pop
    for (let i = 0; i < modelVariables.pop.prediction.length; ++i) {
        if (modelVariables.pop.prediction[i] >= carrying_cap * 0.99) {
            document.getElementById('stable_pop').textContent = i + 2016;
            modelVariables.pop.stablePopYear =  i + 2016;
            break;
        }
    }
};

// Initial Chart (10 Billion prediction)

generatePopulationChart(modelVariables.endYear - modelVariables.startYear, modelVariables.pop.carryingCapacityBil * utils.BILLION());
pop_carrying_cap_input.vaue = modelVariables.endYear - modelVariables.startYear;

// Bind buttons
const recalculate_pop_predictions = () => {
    const num_years = pop_num_years_input.value;
    const carrying_cap = pop_carrying_cap_input.value * 1000000000;
    generatePopulationChart(num_years, carrying_cap);
};

pop_num_years_input.onchange = recalculate_pop_predictions;
pop_carrying_cap_input.onchange = recalculate_pop_predictions;


// Generic energy graphing function
// params: each data product: coal, oil, gas, renewables, total, demand
// everything else gets handled by the variables? yes set in the functions before calling, set back when done?
// all bools

const generateEnergyChart = (chart, coal = false, oil = false, gas = false, renewables = false, demand = false, max_ticks = 0) => {
    const type = 'line';
    const data = {};
    // make years
    const num_years = modelVariables.endYear - modelVariables.startYear;
    data.labels = utils.get_years_array(num_years, modelVariables.startYear);
    data.datasets = [];
    if (coal){
        data.datasets.push({
            label: 'Total Coal Consumption',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgb(0, 0, 0)',
            data: modelVariables.coal.history.concat(modelVariables.coal.prediction)
        });
    }
    if (oil){
        data.datasets.push({
            label: 'Total Oil Consumption',
            backgroundColor: 'rgba(64, 37, 29, 0.5)',
            borderColor: 'rgb(64, 37, 29)',
            data: modelVariables.oil.history.concat(modelVariables.oil.prediction),
        });
    }
    if (gas){
         data.datasets.push({
            label: 'Total Gas Consumption',
            backgroundColor: 'rgba(196, 170, 0, 0.5)',
            borderColor: 'rgb(196, 170, 0)',
            data: modelVariables.natural_gas.history.concat(modelVariables.natural_gas.prediction),
        });
    }
    if (renewables){
        data.datasets.push({
            label: 'Total Nuclear and Renewable Energy Consumption',
            backgroundColor: 'rgba(0, 181, 30, 0.5)',
            borderColor: 'rgb(0, 181, 30)',
            data: modelVariables.renewables.history.concat(modelVariables.renewables.prediction),
        });
    }

    if (demand){
        data.datasets.push({
            label: "Demand",
            yAxisID: 'unstacked_line',
            backgroundColor: 'rgba(255, 120, 250, 0.2)',
            borderColor: 'rgb(255, 120, 250)',
            data: modelVariables.demand.history.concat(modelVariables.demand.prediction),
        });
    }
    
    if (max_ticks < 200) {
        let n = Math.max(utils.last(modelVariables.oil.history),
            utils.last(modelVariables.coal.history),
            utils.last(modelVariables.natural_gas.history),
            utils.last(modelVariables.renewables.history),
            utils.last(modelVariables.demand.history));

        if (oil && modelVariables.oil.prediction.length > 1) {
            n = Math.max(n, utils.last(modelVariables.oil.prediction));
        }

        if (coal && modelVariables.coal.prediction.length > 1) {
            n = Math.max(n, utils.last(modelVariables.coal.prediction));
        }

        if (gas && modelVariables.natural_gas.prediction.length > 1) {
            n = Math.max(n, utils.last(modelVariables.natural_gas.prediction));
        }

        if (renewables && modelVariables.renewables.prediction.length > 1) {
            n = Math.max(n, utils.last(modelVariables.renewables.prediction));
        }

        if (demand && modelVariables.demand.prediction.length > 1) {
            n = Math.max(n, utils.last(modelVariables.demand.prediction));
        }

        max_ticks = Math.ceil((n)/50)*50;
    }
    
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
                id: 'unstacked_line',
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
    generateChart(chart, data, type, options);
};

// Historical
const generateHistoricalChart = () => {
    // How many years to look forward
    const lookAhead = 10;
    modelVariables.endYear =  modelVariables.startYear + modelVariables.historicalYears + lookAhead;
    modelVariables.oil.prediction = [];
    modelVariables.coal.prediction = [];
    modelVariables.natural_gas.prediction = [];
    modelVariables.renewables.prediction = [];
    modelVariables.demand.prediction = [];
    generateEnergyChart(historicalChart, true, true, true, true, false);
};

generateHistoricalChart();



//
//
// Flat
//


const generateFlatConsumtionChart = (renewables_rate_change) => {
    const lookAhead = 150;
    modelVariables.endYear =  modelVariables.startYear + modelVariables.historicalYears + lookAhead;

    // oil
    const lastOilRate = utils.last(modelVariables.oil.history);
    modelVariables.oil.prediction = 
        energy_calc.getFlatConsumptionArray(modelVariables.oil.reserveValue, lastOilRate);
    let longestLen = modelVariables.oil.prediction.length;

    // coal
    const lastCoalRate = utils.last(modelVariables.coal.history);
    modelVariables.coal.prediction = 
        energy_calc.getFlatConsumptionArray(modelVariables.coal.reserveValue, lastCoalRate);
    longestLen = Math.max(longestLen, modelVariables.coal.prediction.length);

    // gas
    const lastGasRate = utils.last(modelVariables.natural_gas.history);
    modelVariables.natural_gas.prediction =
        energy_calc.getFlatConsumptionArray(modelVariables.natural_gas.reserveValue, lastGasRate);
    longestLen = Math.max(longestLen, modelVariables.natural_gas.prediction.length);

    // Additional chart space
    const extraYears = 10;
    longestLen = longestLen + extraYears;

    // zero fill
    modelVariables.oil.prediction = utils.zeroFillArrayBack(modelVariables.oil.prediction, longestLen+ 10);
    modelVariables.coal.prediction = utils.zeroFillArrayBack(modelVariables.coal.prediction, longestLen + 10);
    modelVariables.natural_gas.prediction = utils.zeroFillArrayBack(modelVariables.natural_gas.prediction, longestLen + 10);
 
    // increase steadily renewables and nuclear
    modelVariables.renewables.prediction =
        energy_calc.steadyIncreaseConsumption(
            utils.last(modelVariables.renewables.history),
            modelVariables.renewables.rateOfIncrease,
            modelVariables.endYear - (modelVariables.startYear + modelVariables.historicalYears));

    modelVariables.demand.prediction = energy_calc.sumArrays(
        modelVariables.oil.prediction, 
        modelVariables.coal.prediction, 
        modelVariables.natural_gas.prediction,
        modelVariables.renewables.prediction);

    generateEnergyChart(flatConsumptionChart, true, true, true, true, false, 500);
};

generateFlatConsumtionChart(renewables_rate_input.value * 0.01);

renewables_rate_input.onchange = () => {
    generateFlatConsumtionChart(renewables_rate_input.value * 0.01);
    renewables_rate_input_2.value = renewables_rate_input.value;
};


//
// Base Prediction
//

const generateMyPredictionChart = () => {
    const renewables_rate_change = renewables_rate_2.value * 0.01;
    const demand_rate_change = demand_rate.value * 0.01;

    const lookAhead = 150;
    modelVariables.endYear =  modelVariables.startYear + modelVariables.historicalYears + lookAhead;


// floorIndex: 0,
//         peakIndex: 0,
//         yearsRemaining: 0,
//         reserveValue: 0,
//         history: [],
//         prediction: [],
//         rateOfIncrease: 0

    if (modelVariables.oil.peakIndex > 0) {
        modelVariables.oil.peakIndex = utils.last(modelVariables.oil.history) * 1.3;
    }

    modelVariables.oil.prediction  = energy_calc.peakThenDecline(utils.last(modelVariables.oil.history),
        modelVariables.oil.yearsRemaining,
        modelVariables.oil.peakIndex,
        modelVariables.oil.rateOfIncrease, lookAhead);

    if (modelVariables.coal.peakIndex > 0) {
        modelVariables.coal.peakIndex = utils.last(modelVariables.coal.history) * 1.3;
    }

    modelVariables.coal.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.coal.history),
        modelVariables.coal.yearsRemaining,
        modelVariables.coal.peakIndex,
        modelVariables.coal.rateOfIncrease, lookAhead);
    
    if (modelVariables.natural_gas.peakIndex > 0) {
        modelVariables.natural_gas.peakIndex = utils.last(modelVariables.natural_gas.history) * 1.3;
    }

    modelVariables.natural_gas.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.natural_gas.history),
        modelVariables.natural_gas.yearsRemaining,
        modelVariables.natural_gas.peakIndex,
        modelVariables.natural_gas.rateOfIncrease, lookAhead);

    // increase steadily renewables and nuclear

    modelVariables.renewables.prediction =
        energy_calc.steadyIncreaseConsumption(
            utils.last(modelVariables.renewables.history),
            modelVariables.renewables.rateOfIncrease,
            modelVariables.endYear - (modelVariables.startYear + modelVariables.historicalYears));


    modelVariables.demand.prediction =
        energy_calc.steadyIncreaseConsumption(
            utils.last(modelVariables.demand.history),
            modelVariables.demand.rateOfIncrease,
            modelVariables.endYear - (modelVariables.startYear + modelVariables.historicalYears));
    

    generateEnergyChart(myPredictionChart, true, true, true, true, true, 500);

    // const totalSupply = [];
    // for (let i = 0; i < fullYearsArray.length; i++) {
    //     totalSupply.push(Math.round(decliningConsumptionCoal[i] + decliningConsumptionGas[i] + decliningConsumptionOil[i] + renewables[i]));
    // }
};

generateMyPredictionChart();

demand_rate_input.onchange = () => {
    generateMyPredictionChart();
};

renewables_rate_input_2.onchange = () => {
    generateMyPredictionChart();
};




/*







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