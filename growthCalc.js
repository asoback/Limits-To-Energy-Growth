import { utils } from './utils.js';

// Utilities

const array_of_years_start_to_end = (start, end) => {
    const size = end - start + 1;
    return get_years_array(size, start);
};

//
// Population
//
export const popuation_calc = {
    modeling_population_growth: function(num_years, starting_pop, carrying_cap, rate) {
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
    },

    // avg pop growth yearly
    calculate_avg_yearly_pop_growth: function(start_year = population_data.years[0]) {
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
    },

    simple_interest_function: function(startPop,
        startYear,
        yearsToGrow,
        compoundRate) {
        const power = Number(yearsToGrow);
        const fullCompoundRate = 1 + Number(compoundRate);
        const rateToPower = Math.pow(fullCompoundRate, power);
        const finalAmount = Number(startPop) * rateToPower;
        return Math.round(finalAmount);
    }
};


//
// Energy
//

export const energy_calc = {

    calcAvgGrowth: function(array) {
        let totalChange = 0;
        let lastItem = -1;
        array.forEach((item, index) => {
            if (lastItem == -1) {
                lastItem = item;
            } else {
                totalChange += item/lastItem  - 1;
                lastItem = item;
            }
        });
    },

    getEnergyData: function(startYear, endYear, data) {
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
    },

        // Flat Consumption
    getFlatConsumptionArray: function(amount, rate) {
        const useArray = [];
        let amountRemaining = amount;
        while (amountRemaining > 0) {
            const annualUse = Math.min(rate, amountRemaining);
            amountRemaining -= annualUse;
            useArray.push(annualUse);
        }
        return useArray;
    },

    //
    // Per Capita Energy Consumption
    //

    // const calculate_avg_energy_consumpter_per_person =
    //         (start_year = population_data.years[population_data.years.length -1 ]) => {
    //     const pop_idx = population_data.years.indexOf(start_year);
    //     if (pop_idx < 0) {
    //         // If we don't have this data, return something negative
    //         return -1;
    //     }
    //     const energy_idx = globalPrimaryConsumption.years.indexOf(Number(start_year));
    //     if (energy_idx < 0) {
    //         // If we don't have this data, return something negative
    //         return -1;
    //     }
    //     const total_energy_2018 = globalPrimaryConsumption.data[energy_idx];
    //     const total_renewable_2018 = globalNuclearAndRenewableConsumption.data[energy_idx];
    //     const total = (total_energy_2018 + total_renewable_2018) * QUAD;
    //     const total_pop_2018 = population_data.world_population_total[
    //             pop_idx];
    //     const retval = Math.round((total/total_pop_2018) * 10 )/10;
    //     return retval;
    // };

    // // avg growth energy per person yearly
    // const calculate_energy_per_person_growth = 
    //     (start_year = population_data.years[0]) => {
    //     let pop_idx = population_data.years.indexOf(start_year);
    //     if (pop_idx < 0) {
    //         pop_idx = 0;
    //     }
    //     if (pop_idx == population_data.years.length - 1){
    //         // Cant measure growth of the last year
    //         return 0;
    //     }
    //     const yearly_energy_per_person_growth = [];

    //     let last_seen = calculate_avg_energy_consumpter_per_person(population_data.years[pop_idx]);
    //     pop_idx += 1;
    //     while (pop_idx < population_data.years.length) {
    //         const new_data = calculate_avg_energy_consumpter_per_person(population_data.years[pop_idx]);
    //         const accurate_percent = (((new_data/last_seen) - 1) * 100);

    //         yearly_energy_per_person_growth.push(Math.round(accurate_percent * 100)/100);
    //         pop_idx += 1;
    //     }
    //     // tally up
    //     let total = 0;
    //     yearly_energy_per_person_growth.forEach(function(each) {
    //         total += each;
    //     });
    //     const return_val = Math.round((total/yearly_energy_per_person_growth.length) * 100)/100;
    //     return return_val;
    // };




    // const convertMillionBarrelsDayToQBTU = (data) => {
    //     const a = [];
    //     for (let i = 0; i < data.length; i++) {
    //         // 1 million barrel oil = .00555136 quad btu
    //         a.push(Math.round(data[i] * 365 * 0.00000555));
    //     }
    //     return a;
    // };

    // const convertMillionShortTonsToQBTU = (data) => {
    //     const a = [];
    //     for (let i = 0; i < data.length; i++) {
    //         //TODO check if ton is same as short ton.
    //         // 1 million ton coal = .02778 quad btu
    //         a.push(Math.round(data[i] * 0.00002778));
    //     }
    //     return a;
    // };

    // const convertBcfToQBTU = (data) => {
    //     const a = [];
    //     for (let i = 0; i < data.length; i++) {
    //         // Billion cubicfeet gas = .001027 quad btu
    //         a.push(Math.round(data[i] * 0.001027));
    //     }
    //     return a;
    // };



    // const getData = (start_year, end_year, dataset) => {
    //     const start_idx = dataset.years.indexOf(start_year);
    //     const end_idx = dataset.years.indexOf(end_year);
    //     if (start_idx == -1 || end_idx == -1) {
    //         console.log("out of range", dataset.type);
    //         return [];
    //     }

    //     if (dataset.unit == 'quad Btu') {
    //         return dataset.data.slice(start_idx, end_idx+1);
    //     } else if (dataset.unit == 'Mb/d') {
    //         return convertMillionBarrelsDayToQBTU(dataset.data.slice(start_idx, end_idx+1));
    //     } else if (dataset.unit == 'Mst') {
    //         return convertMillionShortTonsToQBTU(dataset.data.slice(start_idx, end_idx+1));
    //     } else if (dataset.unit == 'bcf') {
    //         return convertBcfToQBTU(dataset.data.slice(start_idx, end_idx+1));
    //     } else {
    //         console.log('Unknown unit type', dataset.unit, dataset.type);
    //         return [];
    //     }
    // };


    // const steadyIncreaseConsumption = (startingAmount, rate, years) => {
    //     const array = [];
    //     let previousAmount = startingAmount;
    //     for (let i = 0; i < years; i++) {
    //         previousAmount = previousAmount * (1 + rate);
    //         array.push(previousAmount);
    //     }
    //     return array;
    // };

    // const expandDataWithSteadyIncreaseConsumption = (data, yearsToGrow, rate = 0) => {
    //     const startingAmount = data[data.length - 1];
    //     if (data.length < 2) {
    //         return data;
    //     }
    //     const predictionArray = steadyIncreaseConsumption(startingAmount, rate, yearsToGrow);
    //     return data.concat(predictionArray);
    // };

    // // 1 barrel of oil is approx 5.7 Million BTUs
    // const convert_barrels_oil_to_quad_btu = (barrels) => {
    //     // The units of barrels are in billions, the return value is in quadrillions
    //     // A million billion is a quadrillion.
    //     return (barrels * 5.8);
    // };

    // const convert_natural_gas_to_btu = (cubic_feet) => {
    //     // 1015 btus in a cubic foot of natural gas
    //     // data is in a trillion cubic feet
    //     // return value is in Quadrillion Btus
    //     return cubic_feet * 1.015;
    // };

    // const convert_coal_to_btu = (short_tons) => {
    //     return (20.15 * Math.pow(10, 6) *  Math.pow(10, 6) * short_tons) / Math.pow(10, 15); 
    // };

    // const yearsPlusMoreYears = (yearsArray, extraYears) => {
    //     let newYearsArray = yearsArray;
    //     let yearAsNumber = Number(yearsArray[yearsArray.length - 1]);
    //     for (let i = 0; i < extraYears; i++) {
    //         yearAsNumber += 1;
    //         newYearsArray.push(yearAsNumber.toString(10));
    //     }
    //     return newYearsArray;
    // };

    // const addWithNonRenewables = (primary, secondary) => {
    //     const a = [];
    //     for (let i = 0; i < primary.length; i++) {
    //         a.push(Math.round(primary[i] + (secondary[i] || 0)));
    //     }
    //     return a;
    // };


    // // My Prediction
    // const getDecliningConsumptionArray = (remaining, starting_amount, starting_growth_rate) => {
    //     const a = [];
    //     let last_amount = starting_amount;
    //     let last_remaining = remaining;
    //     console.log("TODO fix this section");
    //     while (last_remaining >= 10) {
    //         last_amount = last_amount + (last_amount * starting_growth_rate * last_remaining/remaining);
    //         a.push(last_amount);
    //         last_remaining = last_remaining - last_amount;
    //     }
    //     return a;
    // };
};












