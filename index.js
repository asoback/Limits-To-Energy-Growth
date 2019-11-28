import { energy_data, population_data, non_renewable_reserves, discoveries_data } from './data.js';

// Utilities
const get_years_array = (size, start_year) => {
    let years = [];
    for (let i = 0; i < size; i++) {
        const x = i + start_year;
        years.push(x.toString());
    }
    return years;
};


const historicalChart = document.getElementById('historicalChart');
const flatConsumptionChart = document.getElementById('flatConsumptionChart');
const myPredictionChart = document.getElementById('myPredictionChart');
const PopulationChart = document.getElementById('PopulationChart');
const pop_num_years_input = document.getElementById("num_years");
const pop_carrying_cap_input = document.getElementById("max_pop");

const generateChart = (chartDiv, data, type = 'line', options = {}) => {
    let ctx = chartDiv.getContext('2d');
    let chart = new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });	
};


// Historical
const generateHistoricalChart = () => {
    const data = {};
    data.labels = energy_data.years;
    data.datasets = [
        {
            label: 'Total Nuclear Energy Consumption',
            backgroundColor: 'rgba(132, 99, 255, 0.5)',
            borderColor: 'rgb(132, 99, 255)',
            data: energy_data.Nuclear_Electric_Power_Consumption,
        },
        { 
            label: 'Total Renewable Energy Consumption',
            backgroundColor: 'rgba(99, 255, 132, 0.5)',
            borderColor: 'rgb(99, 255, 132)',
            data: energy_data.total_renewables_consumption,
        },
        {
            label: 'Total Fossil Fuel Consumption',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            data: energy_data.Total_Fossil_Fuels_Consumption,
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
        previousAmount = previousAmount * rate;
        array.push(previousAmount);
    }
    return array;
};

const expandDataWithSteadyIncreaseConsumption = (data, yearsToGrow) => {
    const startingAmount = data[data.length - 1];
    if (data.length < 2) {
        return data;
    }
    const lastRate = (data[data.length - 1] - data[data.length - 2])/data[data.length - 2];
    const predictionArray = steadyIncreaseConsumption(startingAmount, lastRate, yearsToGrow);
    return data.concat(predictionArray);
};

// 1 barrel of oil is approx 5.8 Million BTUs
const convert_barrels_oil_to_quad_btu = (barrels) => {
    // The units of barrels are in billions, the return value is in quadrillions
    // A million billion is a quadrillion.
    console.log(barrels);
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

const generateFlatConsumtionChart = () => {
    // Divide up data by type
    let years = energy_data.years;
    let coal = energy_data.Coal_Consumption;
    let oil = energy_data.Petroleum_Consumption;
    let natural_gas = energy_data.Natural_Gas_Consumption;
    let renewables = energy_data.total_renewables_consumption;
    let nuclear = energy_data.Nuclear_Electric_Power_Consumption;
    // Add data at flat rate or less until 0d
    // oil
    const btuRemainingOil = convert_barrels_oil_to_quad_btu(non_renewable_reserves.oil.proven);
    const lastOilRate = oil[oil.length - 1];
    let flatConsumptionOil = getFlatConsumptionArray(btuRemainingOil, lastOilRate);
    console.log(btuRemainingOil, lastOilRate);
    let longestLen = flatConsumptionOil.length;
    // coal
    const btuRemainingCoal = convert_coal_to_btu(non_renewable_reserves.coal.proven);
    const lastCoalRate = coal[coal.length - 1];
    let flatConsumptionCoal = getFlatConsumptionArray(btuRemainingCoal, lastCoalRate);
    longestLen = Math.max(longestLen, flatConsumptionCoal.length);
    // gas
    const btuRemainingNaturalGas = convert_natural_gas_to_btu(non_renewable_reserves.natural_gas.proven);
    const lastNaturalGasRate = natural_gas[natural_gas.length - 1];
    let flatConsumptionGas = getFlatConsumptionArray(btuRemainingNaturalGas, lastNaturalGasRate);
    longestLen = Math.max(longestLen, flatConsumptionGas.length);

    // Additional chart space
    const extraYears = 10;
    longestLen = longestLen + extraYears;

    // zero fill
    flatConsumptionOil = zeroFillArrayBack(flatConsumptionOil, longestLen);
    flatConsumptionCoal = zeroFillArrayBack(flatConsumptionCoal, longestLen);
    flatConsumptionGas = zeroFillArrayBack(flatConsumptionGas, longestLen);
    // increase steadily renewables and nuclear
    renewables = expandDataWithSteadyIncreaseConsumption(renewables, longestLen);
    nuclear = expandDataWithSteadyIncreaseConsumption(nuclear, longestLen);
    // get years
    const fullYearsArray = yearsPlusMoreYears(years, longestLen);

    // chart
    const data = {};
    data.labels = fullYearsArray;
    data.datasets = [
        {
            label: "Oil Consumption",
            backgroundColor: 'rgba(82, 50, 29, 0.5)',
            borderColor: 'rgb(82, 50, 29)',
            data: flatConsumptionOil
        },
        {
            label: "Natural Gas Consumption",
            backgroundColor: 'rgba(148, 118, 0, 0.5)',
            borderColor: 'rgb(148, 118, 0)',
            data: flatConsumptionGas
        },
        {
            label: "Coal Consumption",
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgb(0, 0, 0)',
            data: flatConsumptionCoal
        },
        {
            label: "Nuclear Consumption",
            backgroundColor: 'rgba(0, 43, 161, 0.5)',
            borderColor: 'rgb(0, 43, 161)',
            data: nuclear
        },
        {
            label: "Renewables Consumption",
            backgroundColor: 'rgba(0, 161, 5, 0.5)',
            borderColor: 'rgb(0, 161, 5)',
            data: renewables
        },
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

generateFlatConsumtionChart();

// My Prediction


//
// Population
//

const modeling_population_growth = (num_years, starting_pop, carrying_cap, rate) => {
    // See https://en.wikipedia.org/wiki/Logistic_function
    let pops = [];
    // const e = 2.71828;
    let last_pop = starting_pop;
    for (let i = 0; i < num_years; i+= 1) {
        const pop_growth = last_pop*rate*(1-((last_pop-starting_pop)/(carrying_cap - starting_pop)));
        pops.push(Math.round(last_pop + pop_growth));
        last_pop = pops[i];
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


//
// Prev
//


// Generate Chart
const generateChart2 = () => {
    var ctx = document.getElementById('historicalChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: energy_data.years,
            datasets: [
                {
                label: 'Total Primary Energy Consumption',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgb(255, 99, 132)',
                data: energy_data.total_primary_energy_consumption,
                },
                { label: 'Total Renewable Energy Consumption',
                backgroundColor: 'rgba(99, 255, 132, 0.5)',
                borderColor: 'rgb(99, 255, 132)',
                data: energy_data.total_renewables_consumption,
                },
            ]
        },
        // Configuration options go here
        options: {}
    });	
};


// Calculating percents of things

// avg total growth yearly
const calculate_total_energy_growth_percent = (start_year = energy_data.years[0]) => {
    let idx = energy_data.years.indexOf(start_year);
    if (idx < 0) {
        // not found, use starting index
        idx = 0;
    }

    let total_percent_array = [];
    let last_seen_data_point = 0;
    energy_data.total_primary_energy_consumption.forEach(function(data_point) {
        if (last_seen_data_point == 0) {
            last_seen_data_point = data_point;
        } else {
            const this_percent = (data_point/last_seen_data_point ) - 1;
            total_percent_array.push(this_percent);
            last_seen_data_point = data_point;
        }
    });

    let total_percent = 0;
    total_percent_array.forEach(function(percent_point) {
        total_percent += percent_point;
    });
    return (total_percent/(total_percent_array.length)) * 100;
      
};
// const avg_total_growth_percent = calculate_total_energy_growth_percent();
// console.log('Total Energy Growth Avg Percent: ', avg_total_growth_percent, '%');


// const avg_pop_growth_percent = calculate_avg_yearly_pop_growth();
// console.log('Avg Pop Growth: ', avg_pop_growth_percent, '%');

// console.log('And in 2017-2018: (1.10% according to web) ', calculate_avg_yearly_pop_growth("2017"));

// avg renewable growth yearly
const calculate_avg_renewables_growth_yearly = (start_year = energy_data.years[0]) => {
    let idx = energy_data.years.indexOf(start_year);
    if (idx < 0) {
        // not found, use starting index
        idx = 0;
    }

    let total_renewable_percent_array = [];
    let last_seen_data_point = 0;
    energy_data.total_renewables_consumption.forEach(function(data_point) {
        if (last_seen_data_point <= 0) {
            last_seen_data_point = data_point;
        } else {
            const this_percent = (data_point/last_seen_data_point ) - 1;
            total_renewable_percent_array.push(this_percent);
            last_seen_data_point = data_point;
        }
    });
    let total_percent = 0;
    total_renewable_percent_array.forEach(function(percent_point) {
        total_percent += percent_point;
    });
    return (total_percent/(total_renewable_percent_array.length)) * 100;
};

// const avg_renewable_growth_percent = calculate_avg_renewables_growth_yearly();
// console.log('Total Renwable Energy Growth Avg Percent: ',
        // avg_renewable_growth_percent, '%');

// avg energy per person 2018
const calculate_avg_energy_consumpter_per_person =
        (start_year = population_data.years[population_data.years.length -1 ]) => {
    const pop_idx = population_data.years.indexOf(start_year);
    if (pop_idx < 0) {
        // If we don't have this data, return something negative
        return -1;
    }
    const energy_idx = energy_data.years.indexOf(start_year);

    const total_energy_2018 = energy_data.total_primary_energy_consumption[
            energy_idx];
    const total_pop_2018 = population_data.world_population_total[
            pop_idx];
    return total_energy_2018/total_pop_2018;
};

// const avg_energy_per_person_2018 = calculate_avg_energy_consumpter_per_person() * 1000000000;
// console.log("Energy per person 2018: ", avg_energy_per_person_2018, "Million BTUs");

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

// const avg_energy_in_2018 = calculate_energy_per_person_growth("2017");
// console.log("avg yearly energy consumption growth since 2017: ", avg_energy_in_2018);

// const avg_since_1960 = calculate_energy_per_person_growth("1960");
// console.log("avg yearly energy consumption growth since 1960: ", avg_since_1960);


// const remaining_oil_btus = convert_barrels_oil_to_quad_btu(non_renewable_reserves.oil.proven);

// console.log("There are ", remaining_oil_btus, 'Quadrillion BTUs remaining oil'); 

// console.log("There are ", convert_natural_gas_to_btu(non_renewable_reserves.natural_gas.proven), "Quadrillion BTUs remaining gas");

// In 2018, the annual average heat content of coal produced in the United States was about 
// 20.15 million British thermal units (Btu) per short ton (2,000 pounds)
// Data ub million short tons



// console.log("There are ", convert_coal_to_btu(non_renewable_reserves.coal.proven), " quadrillion BTUS remain coal");

const get_remaining_btus = () => {
    return convert_coal_to_btu(non_renewable_reserves.coal.proven) +
        convert_natural_gas_to_btu(non_renewable_reserves.natural_gas.proven) +
        convert_barrels_oil_to_quad_btu(non_renewable_reserves.oil.proven);
};

const remaining_total = get_remaining_btus();
const last_year_total = energy_data.total_primary_energy_consumption[ energy_data.total_primary_energy_consumption.length -1];
// console.log("last year spent ", last_year_total);
// console.log("Total: ", remaining_total, " Quadrillion BTUs remain");
// console.log("Thats ", remaining_total/last_year_total, " years left");

const chart_discoveries = () => {
    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: discoveries_data.years,
            datasets: [
                { label: 'Oil New Discoveries',
                backgroundColor: 'rgb(99, 255, 132)',
                borderColor: 'rgb(99, 255, 132)',
                data: discoveries_data.oil_new_discoveries,
                },
                {
                label: 'Natural Gas Discoveries',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: discoveries_data.natural_gas_discoveries,
            }
            ]
        },
        // Configuration options go here
        options: {}
    });	
};

// chart_discoveries();