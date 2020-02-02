import { energy_data, population_data, non_renewable_reserves, discoveries_data } from './data.js';
import { globalPrimaryConsumption, globalOilConsumption, globalCoalConsumption, globalNaturalGasConsumption, globalNuclearAndRenewableConsumption} from './GlobalConsumption.js';

import { population } from './data/population.js';
import { indexed_energy_data } from './data/indexedData.js';

const QUAD = 1000000000000000;
const TRILLION = 1000000000000;
const BILLION = 1000000000;
const MILLION = 1000000;

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
        carryingCapacityBil: 0,
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
    gas: {
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

const convertMillionBarrelsDayToQBTU = (data) => {
    const a = [];
    for (let i = 0; i < data.length; i++) {
        // 1 million barrel oil = .00555136 quad btu
        a.push(Math.round(data[i] * 365 * 0.00000555));
    }
    return a;
};

const convertMillionShortTonsToQBTU = (data) => {
    const a = [];
    for (let i = 0; i < data.length; i++) {
        //TODO check if ton is same as short ton.
        // 1 million ton coal = .02778 quad btu
        a.push(Math.round(data[i] * 0.00002778));
    }
    return a;
};

const convertBcfToQBTU = (data) => {
    const a = [];
    for (let i = 0; i < data.length; i++) {
        // Billion cubicfeet gas = .001027 quad btu
        a.push(Math.round(data[i] * 0.001027));
    }
    return a;
};

/**
    populate the model energy data.
 */
const populateModelData = () => {
    // Get total btu from startyear
    indexTotal = 0;
    
    let oilIdx = 0;
    while (globalOilConsumption.years[oilIdx] < modelVariables.startYear){++oilIdx;}
    startValueOil = convertMillionBarrelsDayToQBTU(globalOilConsumption.data[oilIdx]);
    indexTotal += startValueOil;

    let coalIdx = 0;
    while (globalCoalConsumption.years[coalIdx] < modelVariables.startYear){++coalIdx;}
    startValueCoal = convertMillionShortTonsToQBTU(globalCoalConsumption.data[coalIdx]);
    indexTotal += startValueCoal;

    let gasIdx = 0;
    while (globalNaturalGasConsumption.years[gasIdx] < modelVariables.startYear){++gasIdx;}
    startValueGas = convertBcfToQBTU(globalNaturalGasConsumption.data[gasIdx]);
    indexTotal += startValueGas;

    let renewIdx = 0;
    while (globalNuclearAndRenewableConsumption.years[renewIdx] < modelVariables.startYear){++renewIdx;}
    startValueRenew = globalNuclearAndRenewableConsumption.data[renewIdx];
    indexTotal += startValueRenew;

    startPercentOil = startValueOil/indexTotal * 100;
    startPercentCoal = startValueCoal/indexTotal * 100;
    startPercentGas = startValueGas/indexTotal * 100;
    startPercentRenew = startValueRenew/indexTotal * 100;

    modelVariables.oil.history.append(startPercentOil);
    modelVariables.coal.history.append(startPercentCoal);
    modelVariables.gas.history.append(startPercentGas);
    modelVariables.renewables.history.append(startPercentRenew);
    modelVariables.demand.history.append(100);

    // Get historical energy use indices
    for (let i = 1; i > modelVariables.historicalYears; i++){
        modelVariables.oil.history.append(convertMillionBarrelsDayToQBTU((globalOilConsumption.data[oilIdx + i] / startValueOil)* startPercentOil));
        modelVariables.coal.history.append(convertMillionShortTonsToQBTU((globalCoalConsumption.data[coalIdx + i] / startValueCoal)* startPercentCoal));
        modelVariables.gas.history.append(convertBcfToQBTU((globalNaturalGasConsumption.data[gasIdx + i] / startValueGas)* startPercentGas));
        modelVariables.renewables.history.append((globalNuclearAndRenewableConsumption.data[renewIdx + i] / startValueRenew)* startPercentRenew);

        const demand = ( modelVariables.oil.history[i] +
        modelVariables.coal.history[i] +
        modelVariables.gas.history[i] +
        modelVariables.renewables.history[i] );
        modelVariables.demand.history.append(demand);
    }

    // TODO
    // Future predictions index

};


// Utilities
const get_years_array = (size, start_year) => {
    let years = [];
    for (let i = 0; i < size; i++) {
        const x = i + start_year;
        years.push(x.toString());
    }
    return years;
};

const array_of_years_start_to_end = (start, end) => {
    const size = end - start + 1;
    return get_years_array(size, start);
};

const generateChart = (chartDiv, data, type = 'line', options = {}) => {
    let ctx = chartDiv.getContext('2d');
    let chart = new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });	
};

const getEnergyData = (startYear, endYear, data) => {
    let i = 0;
    const calculatedData = [];
    while (i < data.history.length()) {
        calculatedData.append(data.history[i]);
        ++i;
    }
    let currentYear = startYear + i;

    let lastValue = data.history[i - 1];
    amountRemaning = lastValue * data.yearsRemaining;
    while (currentYear <= endYear) {
        if (lastValue >= data.peakIndex * 0.95){
            // fall
            const lessValue = lastValue * data.rateOfIncrease * (1 - ((data.peakIndex - lastValue) / (data.peakIndex - data.floorIndex)));
            lastValue = lastValue + lessValue;
        } else {
            // rise or stay flat
            const growthValue = lastValue * data.rateOfIncrease * (1 - ((lastValue - data.history[0]) / (data.peakIndex - data.history[0])));
            lastValue = lastValue + growthValue;
        }
        calculatedData.append(Math.min(lastValue, amountRemaining));
        amountRemaining = amountRemaining - lastValue;
        ++currentYear;
    }
    return calculatedData;
};

const buildEnergyChart = (chartElem, oilBool, coalBool, gasBool, renewBool, demandBool) => {
    const type = 'line';
    const data = {};
    data.labels = array_of_years_start_to_end(modelVariables.startYear, modelVariables.endYear);
    data.datasets = [];

    if (oilBool){
         data.datasets.append({
            label: 'Total Oil Consumption',
            backgroundColor: 'rgba(64, 37, 29, 0.5)',
            borderColor: 'rgb(64, 37, 29)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear,  modelVariables.oil),
        });
    }

    if (coalBool){
        data.datasets.append({
            label: 'Total Coal Consumption',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgb(0, 0, 0)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear, modelVariables.coal),
        });
    }

    if (gasBool){
         data.datasets.append({
            label: 'Total Gas Consumption',
            backgroundColor: 'rgba(196, 170, 0, 0.5)',
            borderColor: 'rgb(196, 170, 0)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear,  modelVariables.oil),
        });
    }

    if (renewBool){
        data.datasets.append({
            label: 'Total Nuclear and Renewable Energy Consumption',
            backgroundColor: 'rgba(0, 181, 30, 0.5)',
            borderColor: 'rgb(0, 181, 30)',
            data: getEnergyData(modelVariables.startYear, modelVariables.endYear, modelVariables.coal),
        });
    }

    if (demandBool){
        data.datasets.append({
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



const getData = (start_year, end_year, dataset) => {
    const start_idx = dataset.years.indexOf(start_year);
    const end_idx = dataset.years.indexOf(end_year);
    if (start_idx == -1 || end_idx == -1) {
        console.log("out of range", dataset.type);
        return [];
    }

    if (dataset.unit == 'quad Btu') {
        return dataset.data.slice(start_idx, end_idx+1);
    } else if (dataset.unit == 'Mb/d') {
        return convertMillionBarrelsDayToQBTU(dataset.data.slice(start_idx, end_idx+1));
    } else if (dataset.unit == 'Mst') {
        return convertMillionShortTonsToQBTU(dataset.data.slice(start_idx, end_idx+1));
    } else if (dataset.unit == 'bcf') {
        return convertBcfToQBTU(dataset.data.slice(start_idx, end_idx+1));
    } else {
        console.log('Unknown unit type', dataset.unit, dataset.type);
        return [];
    }
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

// Flat Consumption
const getFlatConsumptionArray = (amount, rate) => {
    const useArray = [];
    let amountRemaining = amount;
    while (amountRemaining > 0) {
        const annualUse = Math.min(rate, amountRemaining);
        amountRemaining -= annualUse;
        useArray.push(annualUse);
    }
    return useArray;
};

const zeroFillArrayBack = (array, length) => {
    const zerosArray = [];
    if (array.length >= length) {
        return array;
    } else {
        for (let i = 0; i < length - array.length; i++) {
            zerosArray.push(0);
        }
    }
    const newArray = array.concat(zerosArray);
    return newArray;
};

const steadyIncreaseConsumption = (startingAmount, rate, years) => {
    const array = [];
    let previousAmount = startingAmount;
    for (let i = 0; i < years; i++) {
        previousAmount = previousAmount * (1 + rate);
        array.push(previousAmount);
    }
    return array;
};

const expandDataWithSteadyIncreaseConsumption = (data, yearsToGrow, rate = 0) => {
    const startingAmount = data[data.length - 1];
    if (data.length < 2) {
        return data;
    }
    const predictionArray = steadyIncreaseConsumption(startingAmount, rate, yearsToGrow);
    return data.concat(predictionArray);
};

// 1 barrel of oil is approx 5.7 Million BTUs
const convert_barrels_oil_to_quad_btu = (barrels) => {
    // The units of barrels are in billions, the return value is in quadrillions
    // A million billion is a quadrillion.
    return (barrels * 5.8);
};

const convert_natural_gas_to_btu = (cubic_feet) => {
    // 1015 btus in a cubic foot of natural gas
    // data is in a trillion cubic feet
    // return value is in Quadrillion Btus
    return cubic_feet * 1.015;
};

const convert_coal_to_btu = (short_tons) => {
    return (20.15 * Math.pow(10, 6) *  Math.pow(10, 6) * short_tons) / Math.pow(10, 15); 
};

const yearsPlusMoreYears = (yearsArray, extraYears) => {
    let newYearsArray = yearsArray;
    let yearAsNumber = Number(yearsArray[yearsArray.length - 1]);
    for (let i = 0; i < extraYears; i++) {
        yearAsNumber += 1;
        newYearsArray.push(yearAsNumber.toString(10));
    }
    return newYearsArray;
};

const addWithNonRenewables = (primary, secondary) => {
    const a = [];
    for (let i = 0; i < primary.length; i++) {
        a.push(Math.round(primary[i] + (secondary[i] || 0)));
    }
    return a;
};

const roundArray = (a) => {
    const b = [];
    for (let i = 0; i < a.length; i++) {
        b.push(Math.round(a[i]));
    }
    return b;
};

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

// My Prediction
const getDecliningConsumptionArray = (remaining, starting_amount, starting_growth_rate) => {
    const a = [];
    let last_amount = starting_amount;
    let last_remaining = remaining;
    console.log("TODO fix this section");
    while (last_remaining >= 10) {
        last_amount = last_amount + (last_amount * starting_growth_rate * last_remaining/remaining);
        a.push(last_amount);
        last_remaining = last_remaining - last_amount;
    }
    return a;
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


//
// Population
//

const modeling_population_growth = (num_years, starting_pop, carrying_cap, rate) => {
    // See https://en.wikipedia.org/wiki/Logistic_function
    let pops = [];
    // const e = 2.71828;
    let last_pop = starting_pop;
    console.log("starting ", starting_pop);
    let cap_reached = false;
    for (let i = 0; i < num_years; i+= 1) {
        const pop_growth = last_pop*rate*(1-((last_pop-starting_pop)/(carrying_cap - starting_pop)));
        pops.push(Math.round(last_pop + pop_growth));
        last_pop = pops[i];
        if (last_pop >= carrying_cap * 0.99 && cap_reached == false) {
            document.getElementById('stable_pop').textContent = i + 2016;
            cap_reached = true;
        }
    }
    return pops;
};

// avg pop growth yearly
const calculate_avg_yearly_pop_growth = (start_year = population_data.years[0]) => {
    let idx = population_data.years.indexOf(start_year);
    if (idx < 0) {
        // not found, use starting index
        idx = 0;
    }
    let pop_change_percent_array = [];
    let last_seen_data_point = population_data.world_population_total[idx];
    idx += 1;
    while (idx < population_data.years.length) {
        const data_point = population_data.world_population_total[idx];
        const this_percent = (data_point/last_seen_data_point ) - 1;
        pop_change_percent_array.push(this_percent);
        last_seen_data_point = data_point;
        idx += 1;
    }
    if (pop_change_percent_array.length === 0) {
        return 0;
    }
    let total_percent = 0;
    pop_change_percent_array.forEach(function(percent_point) {
        total_percent += percent_point;
    });
    return (total_percent/(pop_change_percent_array.length)) * 100;
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

const simple_interest_function = (startPop,
        startYear,
        yearsToGrow,
        compoundRate) => {
        console.log('In the function');
        console.log(Number(yearsToGrow));
        const power = Number(yearsToGrow);
        const fullCompoundRate = 1 + Number(compoundRate);
        const rateToPower = Math.pow(fullCompoundRate, power);
        const finalAmount = Number(startPop) * rateToPower;
        return Math.round(finalAmount);
    };

const int_to_string = (num) => {
    if (num > QUAD) {
        const reduce = Math.round(num/QUAD);
        return reduce + ' Quadrillion';
    } else if (num > TRILLION) {
        const reduce = Math.round(num/TRILLION);
        return reduce + ' Trillion';
    } else if (num > BILLION) {
        const reduce = Math.round(num/BILLION);
        return reduce + ' Billion';
    } else {
        const reduce = Math.round(num/MILLION);
        return reduce + ' Million';
    }
};

const number_with_commas = (num) => {
    let x = num.toString();
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
};

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


//
// Per Capita Energy Consumption
//

const calculate_avg_energy_consumpter_per_person =
        (start_year = population_data.years[population_data.years.length -1 ]) => {
    const pop_idx = population_data.years.indexOf(start_year);
    if (pop_idx < 0) {
        // If we don't have this data, return something negative
        return -1;
    }
    const energy_idx = globalPrimaryConsumption.years.indexOf(Number(start_year));
    if (energy_idx < 0) {
        // If we don't have this data, return something negative
        return -1;
    }
    const total_energy_2018 = globalPrimaryConsumption.data[energy_idx];
    const total_renewable_2018 = globalNuclearAndRenewableConsumption.data[energy_idx];
    const total = (total_energy_2018 + total_renewable_2018) * QUAD;
    const total_pop_2018 = population_data.world_population_total[
            pop_idx];
    const retval = Math.round((total/total_pop_2018) * 10 )/10;
    return retval;
};

// avg growth energy per person yearly
const calculate_energy_per_person_growth = 
    (start_year = population_data.years[0]) => {
    let pop_idx = population_data.years.indexOf(start_year);
    if (pop_idx < 0) {
        pop_idx = 0;
    }
    if (pop_idx == population_data.years.length - 1){
        // Cant measure growth of the last year
        return 0;
    }
    const yearly_energy_per_person_growth = [];

    let last_seen = calculate_avg_energy_consumpter_per_person(population_data.years[pop_idx]);
    pop_idx += 1;
    while (pop_idx < population_data.years.length) {
        const new_data = calculate_avg_energy_consumpter_per_person(population_data.years[pop_idx]);
        const accurate_percent = (((new_data/last_seen) - 1) * 100);

        yearly_energy_per_person_growth.push(Math.round(accurate_percent * 100)/100);
        pop_idx += 1;
    }
    // tally up
    let total = 0;
    yearly_energy_per_person_growth.forEach(function(each) {
        total += each;
    });
    const return_val = Math.round((total/yearly_energy_per_person_growth.length) * 100)/100;
    return return_val;
};

function last(array) {
    return array[array.length - 1];
}

const generateDemandPerCapitaChart = (perCapita, populationMax, totalSupplyArray, maxRate, numYears) => {
    const peakDemand = perCapita * populationMax;
    const mostRecentYear = last(globalPrimaryConsumption.years);
    const mostRecentDemand = Math.round(last(globalPrimaryConsumption.data) + last(globalNuclearAndRenewableConsumption.data));
    //Generate yearly rate that caps out at some max
        // Look at desired demand per person * pop
    // Reuse the same population fn?

console.log(totalSupplyArray.length - 36, numYears);
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
