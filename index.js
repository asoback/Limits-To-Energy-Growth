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
const sCarryCap = document.getElementById("sCarryCap");
const sPopPeakYear = document.getElementById("sPopPeakYear");

window.addEventListener('scroll', function triggerSideBar() {
    if(utils.isElementInView(myPredictionChart)) {
        document.getElementById('sidebarStats-pop').style.display = 'block';
        window.removeEventListener('scroll', triggerSideBar);
    }
});

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

const setPopulationCapacity = (cap, num_years) => {
    modelVariables.pop.carryingCapacityBil = cap * utils.BILLION();
    
    // Calculate predicted populations
    const less_years = 2018 - 1980; // No predictions for data we'll see.
    const starting_pop = utils.last(modelVariables.pop.history); // Latest data
    // Latest year growth rate
    const starting_rate =  modelVariables.pop.lastRate;
    // Actual population data
    const predicted_pop_data = popuation_calc.modeling_population_growth(num_years - less_years, starting_pop, modelVariables.pop.carryingCapacityBil, starting_rate);
    modelVariables.pop.prediction = predicted_pop_data;

    // Stable pop
    for (let i = 0; i < modelVariables.pop.prediction.length; ++i) {
        if (modelVariables.pop.prediction[i] >= modelVariables.pop.carryingCapacityBil * 0.99) {
            modelVariables.pop.stablePopYear =  i + 2016;
            sCarryCap.textContent = "Population peaks at " + modelVariables.pop.carryingCapacityBil / utils.BILLION() + " Billion";
            sPopPeakYear.textContent = 'Stable population in year ' + modelVariables.pop.stablePopYear;
            break;
        }
    }
};


// TODO: Going to look for when demand is > 5% of supply, and when supply gets close to demand again, withing given time frame, and add to sidebar.
const recalculateCollapseAndRecovery = () => {

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
    setPopulationCapacity(carrying_cap, num_years);
    document.getElementById('stable_pop').textContent = modelVariables.pop.stablePopYear;

    const data = {};
    data.labels = utils.get_years_array(num_years, modelVariables.startYear);
    // make years
    const pop_data = modelVariables.pop.history;
    const whole_pop_data = pop_data.concat(modelVariables.pop.prediction);
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

    
};

// Initial Chart (10 Billion prediction)
generatePopulationChart(modelVariables.endYear - modelVariables.startYear,  pop_carrying_cap_input.value);

// Bind buttons
const recalculate_pop_predictions = () => {
    const num_years = pop_num_years_input.value;
    const carrying_cap = pop_carrying_cap_input.value;
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
    modelVariables.renewables.rateOfIncrease = renewables_rate_2.value * 0.01;
    modelVariables.demand.rateOfIncrease = demand_rate.value * 0.01;

    const lookAhead = 150;
    modelVariables.endYear =  modelVariables.startYear + modelVariables.historicalYears + lookAhead;

    if (modelVariables.oil.peakIndex > 0) {
        modelVariables.oil.peakIndex = utils.last(modelVariables.oil.history) * 1.3;
    }

    modelVariables.oil.prediction  = energy_calc.peakThenDecline(utils.last(modelVariables.oil.history),
        modelVariables.oil.reserveValue,
        modelVariables.oil.peakIndex,
        modelVariables.oil.rateOfIncrease, lookAhead);

    if (modelVariables.coal.peakIndex > 0) {
        modelVariables.coal.peakIndex = utils.last(modelVariables.coal.history) * 1.3;
    }

    modelVariables.coal.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.coal.history),
        modelVariables.coal.reserveValue,
        modelVariables.coal.peakIndex,
        modelVariables.coal.rateOfIncrease, lookAhead);
    
    if (modelVariables.natural_gas.peakIndex > 0) {
        modelVariables.natural_gas.peakIndex = utils.last(modelVariables.natural_gas.history) * 1.3;
    }

    modelVariables.natural_gas.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.natural_gas.history),
        modelVariables.natural_gas.reserveValue,
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
};

generateMyPredictionChart();

demand_rate_input.onchange = () => {
    generateMyPredictionChart();
};

renewables_rate_input_2.onchange = () => {
    generateMyPredictionChart();
};



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
    const final_pop = popuation_calc.simple_interest_function(
            compoundStartPop.value,
            compoundYear.value,
            compoundYearsToGrow.value,
            compoundRate.value
    );

    compoundOutput.textContent = utils.number_with_commas(final_pop);
    compoundDescription.textContent = 'Or roughly ' + utils.int_to_string(final_pop);
};

//
// Demand by pop
//
//

const perCapDemand = document.getElementById("per_cap_demand");

const generateDemandPerCapitaChart = () => {
    let peakDemand = 
        (utils.last(modelVariables.demand.history)/utils.last(modelVariables.pop.history) *
        perCapDemand.value) *
        (modelVariables.pop.carryingCapacityBil);

    const lookAhead = 150;

    modelVariables.demand.prediction = popuation_calc.modeling_population_growth(
            lookAhead,
            utils.last(modelVariables.demand.history),
            peakDemand,
            modelVariables.demand.rateOfIncrease);


    modelVariables.endYear =  modelVariables.startYear + modelVariables.historicalYears + lookAhead;

    if (modelVariables.oil.peakIndex > 0) {
        modelVariables.oil.peakIndex = utils.last(modelVariables.oil.history) * 1.3;
    }

    modelVariables.oil.prediction  = energy_calc.peakThenDecline(utils.last(modelVariables.oil.history),
        modelVariables.oil.reserveValue,
        modelVariables.oil.peakIndex,
        modelVariables.oil.rateOfIncrease, lookAhead);

    if (modelVariables.coal.peakIndex > 0) {
        modelVariables.coal.peakIndex = utils.last(modelVariables.coal.history) * 1.3;
    }

    modelVariables.coal.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.coal.history),
        modelVariables.coal.reserveValue,
        modelVariables.coal.peakIndex,
        modelVariables.coal.rateOfIncrease, lookAhead);
    
    if (modelVariables.natural_gas.peakIndex > 0) {
        modelVariables.natural_gas.peakIndex = utils.last(modelVariables.natural_gas.history) * 1.3;
    }

    modelVariables.natural_gas.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.natural_gas.history),
        modelVariables.natural_gas.reserveValue,
        modelVariables.natural_gas.peakIndex,
        modelVariables.natural_gas.rateOfIncrease, lookAhead);

    modelVariables.renewables.prediction =
        energy_calc.steadyIncreaseConsumption(
            utils.last(modelVariables.renewables.history),
            modelVariables.renewables.rateOfIncrease,
            modelVariables.endYear - (modelVariables.startYear + modelVariables.historicalYears));

    generateEnergyChart(peakDemandChart, true, true, true, true, true, 400);
};

generateDemandPerCapitaChart();

perCapDemand.onchange = () => {
    generateDemandPerCapitaChart();
};


//
// Undiscovered Resources
//

const undiscoveredChart = document.getElementById('undiscoveredChart');
const undiscoveredResources = document.getElementById('undiscovered');
const yearsUntilTurnAround = document.getElementById('yearsUntilTurnAround');

const generateUndiscoveredChart = () => {
    const undiscoveredPercent = 1 + (undiscoveredResources.value / 100);

    let peakDemand = 
        (utils.last(modelVariables.demand.history)/utils.last(modelVariables.pop.history) *
        perCapDemand.value) *
        (modelVariables.pop.carryingCapacityBil);

    const lookAhead = 150;

    modelVariables.demand.prediction = popuation_calc.modeling_population_growth(
            lookAhead,
            utils.last(modelVariables.demand.history),
            peakDemand,
            modelVariables.demand.rateOfIncrease);

    modelVariables.endYear =  modelVariables.startYear + modelVariables.historicalYears + lookAhead;

    const getPeakIndex = (elem) => {
        return popuation_calc.simple_interest_function(
            utils.last(modelVariables[elem].history),
            -1,
            yearsUntilTurnAround.value,
            modelVariables[elem].rateOfIncrease
        );
    };

    if (modelVariables.oil.peakIndex > 0) {
        modelVariables.oil.peakIndex = getPeakIndex("oil");
    }

    modelVariables.oil.prediction  = energy_calc.peakThenDecline(utils.last(modelVariables.oil.history),
        modelVariables.oil.reserveValue * undiscoveredPercent,
        modelVariables.oil.peakIndex,
        modelVariables.oil.rateOfIncrease, lookAhead);

    if (modelVariables.coal.peakIndex > 0) {
        modelVariables.coal.peakIndex = getPeakIndex("coal");
    }

    modelVariables.coal.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.coal.history),
        modelVariables.coal.reserveValue * undiscoveredPercent,
        modelVariables.coal.peakIndex,
        modelVariables.coal.rateOfIncrease, lookAhead);
    
    if (modelVariables.natural_gas.peakIndex > 0) {
        modelVariables.natural_gas.peakIndex = getPeakIndex("natural_gas");
    }

    modelVariables.natural_gas.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.natural_gas.history),
        modelVariables.natural_gas.reserveValue * undiscoveredPercent,
        modelVariables.natural_gas.peakIndex,
        modelVariables.natural_gas.rateOfIncrease, lookAhead);

    modelVariables.renewables.prediction =
        energy_calc.steadyIncreaseConsumption(
            utils.last(modelVariables.renewables.history),
            modelVariables.renewables.rateOfIncrease,
            modelVariables.endYear - (modelVariables.startYear + modelVariables.historicalYears));

    generateEnergyChart(undiscoveredChart, true, true, true, true, true, 400);
};

generateUndiscoveredChart();

undiscoveredResources.onchange = () => {
    generateUndiscoveredChart();
};

yearsUntilTurnAround.onchange = () => {
    generateUndiscoveredChart();
};


//
// Full Chart
//

const fullChart = document.getElementById('fullChart');
const fundiscoveredResources = document.getElementById('undiscoveredFinal');
const fyearsUntilTurnAround = document.getElementById('yearsUntilTurnAroundFinal');
const fperCapDemand = document.getElementById("per_cap_demandFinal");
const fCarryingCap = document.getElementById("max_popFinal");
const fdemand_rate = document.getElementById("demand_rate_final");
const frenewables_rate = document.getElementById("renewables_rate_final");

const generateFullChart = () => {
    const lookAhead = 150;
    const num_years = lookAhead + (2018-1980);
    const undiscoveredPercent = 1 + (fundiscoveredResources.value / 100);

    setPopulationCapacity(fCarryingCap.value, num_years);
    modelVariables.demand.rateOfIncrease = fdemand_rate.value * 0.01;
    modelVariables.renewables.rateOfIncrease = frenewables_rate.value * 0.01;

    // Demand
    let peakDemand = 
        (utils.last(modelVariables.demand.history)/utils.last(modelVariables.pop.history) *
        fperCapDemand.value) *
        (modelVariables.pop.carryingCapacityBil);

    modelVariables.demand.prediction = popuation_calc.modeling_population_growth(
            lookAhead,
            utils.last(modelVariables.demand.history),
            peakDemand,
            modelVariables.demand.rateOfIncrease);

    modelVariables.endYear =  modelVariables.startYear + modelVariables.historicalYears + lookAhead;

    const getPeakIndex = (elem) => {
        return popuation_calc.simple_interest_function(
            utils.last(modelVariables[elem].history),
            -1,
            fyearsUntilTurnAround.value,
            modelVariables[elem].rateOfIncrease
        );
    };

    if (modelVariables.oil.peakIndex > 0) {
        modelVariables.oil.peakIndex = getPeakIndex("oil");
    }

    modelVariables.oil.prediction  = energy_calc.peakThenDecline(utils.last(modelVariables.oil.history),
        modelVariables.oil.reserveValue * undiscoveredPercent,
        modelVariables.oil.peakIndex,
        modelVariables.oil.rateOfIncrease, lookAhead);

    if (modelVariables.coal.peakIndex > 0) {
        modelVariables.coal.peakIndex = getPeakIndex("coal");
    }

    modelVariables.coal.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.coal.history),
        modelVariables.coal.reserveValue * undiscoveredPercent,
        modelVariables.coal.peakIndex,
        modelVariables.coal.rateOfIncrease, lookAhead);
    
    if (modelVariables.natural_gas.peakIndex > 0) {
        modelVariables.natural_gas.peakIndex = getPeakIndex("natural_gas");
    }

    modelVariables.natural_gas.prediction = energy_calc.peakThenDecline(utils.last(modelVariables.natural_gas.history),
        modelVariables.natural_gas.reserveValue * undiscoveredPercent,
        modelVariables.natural_gas.peakIndex,
        modelVariables.natural_gas.rateOfIncrease, lookAhead);

    modelVariables.renewables.prediction =
        energy_calc.steadyIncreaseConsumption(
            utils.last(modelVariables.renewables.history),
            modelVariables.renewables.rateOfIncrease,
            modelVariables.endYear - (modelVariables.startYear + modelVariables.historicalYears));

    generateEnergyChart(fullChart, true, true, true, true, true, 400);
};

generateFullChart();

fundiscoveredResources.onchange = () => {
    generateFullChart();
};

fyearsUntilTurnAround.onchange = () => {
    generateFullChart();
};

fperCapDemand.onchange = () => {
    generateFullChart();
};

fCarryingCap.onchange = () => {
    generateFullChart();
};

fdemand_rate.onchange = () => {
    generateFullChart();
};

frenewables_rate.onchange = () => {
    generateFullChart();
};
