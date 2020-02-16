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
        return totalChange/(array.length - 1);
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

    steadyIncreaseConsumption: function(startingAmount, rate, years) {
        const array = [];
        let previousAmount = startingAmount;
        for (let i = 0; i < years; i++) {
            previousAmount = previousAmount * (1 + rate);
            array.push(previousAmount);
        }
        return array;
    },
    
    sumArrays: function(array1, array2, array3 = null, array4 = null) {
        const returnArray = [];
        let longestArrayLen = Math.max(array1.length, array2.length);
        if (array3) {
            longestArrayLen = Math.max(array3.length, longestArrayLen);
        }
        if (array4) {
            longestArrayLen = Math.max(array4.length,longestArrayLen);
        }
        for (let i = 0; i < longestArrayLen; i++) {
            let total = 0;
            if (array1.length > i) {
                total += array1[i];
            }
            if (array2.length > i) {
                total += array2[i];
            }
            if (array3 & array3.length > i) {
                total += array3[i];
            }
            if (array4 & array4.length > i) {
                total += array4[i];
            }
            returnArray.push(total);
        }

        return returnArray;
    },


        // // My Prediction
    peakThenDecline: function(starting_consumption_amount, remaining_amount, peak_consumption_amount, starting_growth_rate, look_ahead) {
        const a = [];
        let last_amount = starting_consumption_amount;
        let last_remaining = remaining_amount;
        let sumUsed = 0;

        // Grow
        while (last_remaining >= 10 && last_amount < peak_consumption_amount * 0.95 && look_ahead > 0) {
            last_amount += last_amount * starting_growth_rate * (1 - (last_amount - starting_consumption_amount) / (peak_consumption_amount - starting_consumption_amount)); 
            a.push(last_amount);
            sumUsed += last_amount;
            last_remaining = last_remaining - last_amount;
            --look_ahead;
        }

        // Decline
        let last_rate = 0.001;
        const max_rate = 0.025;
        while (last_remaining >= 10 && look_ahead > 0) {
            // TODO: Fix this
            last_rate += max_rate * (1 - (remaining_amount - sumUsed)/remaining_amount);
            last_amount -= Math.max(Math.round(last_amount * last_rate), 0);
            a.push(last_amount);
            sumUsed += last_amount;
            last_remaining = last_remaining - last_amount;
            --look_ahead;
        } 
        console.log(last_remaining);
        // Drip
        while (last_remaining > 0 && look_ahead > 0) {
            last_rate -= last_rate * last_remaining/remaining_amount;
            last_amount += last_amount * last_rate;
            a.push(last_amount);
            last_remaining = last_remaining - last_amount;
            --look_ahead;
        }

        // zero fill
        while (look_ahead > 0){
            a.push(0);
            --look_ahead;
        }

        return a;
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












