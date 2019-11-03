import { energy_data, population_data } from './data.js';


// Generate Chart
const generateChart = () => {
    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: energy_data.years,
            datasets: [
                { label: 'Total Renewable Energy Consumption',
                backgroundColor: 'rgb(99, 255, 132)',
                borderColor: 'rgb(99, 255, 132)',
                data: energy_data.total_renewables_consumption.data,
                },
                {
                label: 'Total Primary Energy Consumption',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: energy_data.total_primary_energy_consumption.data,
            }
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
    energy_data.total_primary_energy_consumption.data.forEach(function(data_point) {
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
const avg_total_growth_percent = calculate_total_energy_growth_percent();
console.log('Total Energy Growth Avg Percent: ', avg_total_growth_percent, '%');

// avg pop growth yearly
const calculate_avg_yearly_pop_growth = (start_year = population_data.years[0]) => {
    let idx = population_data.years.indexOf(start_year);
    if (idx < 0) {
        // not found, use starting index
        idx = 0;
    }
    console.log("start year = ", population_data.years[idx]);
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
const avg_pop_growth_percent = calculate_avg_yearly_pop_growth();
console.log('Avg Pop Growth: ', avg_pop_growth_percent, '%');

console.log('And in 2017-2018: (1.10% according to web) ', calculate_avg_yearly_pop_growth("2017"));

// avg renewable growth yearly
const calculate_avg_renewables_growth_yearly = (start_year = energy_data.years[0]) => {
    let idx = energy_data.years.indexOf(start_year);
    if (idx < 0) {
        // not found, use starting index
        idx = 0;
    }

    let total_renewable_percent_array = [];
    let last_seen_data_point = 0;
    energy_data.total_renewables_consumption.data.forEach(function(data_point) {
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

const avg_renewable_growth_percent = calculate_avg_renewables_growth_yearly();
console.log('Total Renwable Energy Growth Avg Percent: ',
        avg_renewable_growth_percent, '%');

// avg energy per person 2018
const calculate_avg_energy_consumpter_per_person =
        (start_year = population_data.years[population_data.years.length -1 ]) => {
    const pop_idx = population_data.years.indexOf(start_year);
    if (pop_idx < 0) {
        // If we don't have this data, return something negative
        return -1;
    }
    const energy_idx = energy_data.years.indexOf(start_year);

    const total_energy_2018 = energy_data.total_primary_energy_consumption.data[
            energy_idx];
    const total_pop_2018 = population_data.world_population_total[
            pop_idx];
    return total_energy_2018/total_pop_2018;
};

const avg_energy_per_person_2018 = calculate_avg_energy_consumpter_per_person() * 1000000000;
console.log("Energy per person 2018: ", avg_energy_per_person_2018, "Million BTUs");

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

const avg_energy_in_2018 = calculate_energy_per_person_growth("2017");
console.log("avg yearly energy consumption growth since 2017: ", avg_energy_in_2018);

const avg_since_1960 = calculate_energy_per_person_growth("1960");
console.log("avg yearly energy consumption growth since 1960: ", avg_since_1960);

const get_years_array = (size, start_year) => {
    let years = [];
    for (let i = 0; i < size; i++) {
        const x = i + start_year;
        years.push(x.toString());
    }
    return years;
};

const modeling_population_growth = (num_years, starting_pop, carrying_cap, rate) => {
    // See https://en.wikipedia.org/wiki/Logistic_function

    let pops = [];
    const e = 2.71828;
    let last_pop = starting_pop;
    for (let i = 0; i < num_years; i+= 1) {
        const pop_growth = last_pop*rate*(1-((last_pop-starting_pop)/(carrying_cap - starting_pop)));
        pops.push(Math.round(last_pop + pop_growth));
        last_pop = pops[i];
    }
    return pops;
};

// Generate Chart
const experimentalChart = () => {
    // make years
    const num_years = 250;
    const years = get_years_array(num_years, 1960);
    const less_years = 2018 - 1960;
    // make pop values
    const starting_pop = 7594270356;
    const carrying_cap = 25000000000;
    const starting_rate =  calculate_avg_yearly_pop_growth('2017');
    console.log("starting at ", starting_rate);
    const predicted_pop_data = modeling_population_growth(num_years - less_years, starting_pop, carrying_cap, starting_rate * 0.01);
    const pop_data = population_data.world_population_total;
    const whole_pop_data = pop_data.concat(predicted_pop_data);
    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Real Populations',
                    borderColor: 'rgb(99, 255, 132)',
                    data: population_data.world_population_total
                    
                },
                {
                    label: 'Projected Population',
                    borderColor: 'rgb(255, 99, 132)',
                    data: whole_pop_data
                }
            ]
        },
        // Configuration options go here
        options: {}
    });	
};

experimentalChart();