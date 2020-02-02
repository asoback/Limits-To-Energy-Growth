export const utils = {

    QUAD: function() {return 1000000000000000;},
    TRILLION: function() {return 1000000000000;},
    BILLION: function() {return 1000000000;},
    MILLION: function() {return 1000000;},

    zeroFillArrayBack: function(array, length) {
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
    },

    roundArray: function(a) {
        const b = [];
        for (let i = 0; i < a.length; i++) {
            b.push(Math.round(a[i]));
        }
        return b;
    },

    number_with_commas(num) {
        let x = num.toString();
        const pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    },

    int_to_string: function(num) {
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
    },

    last: function(array) {
        return array[array.length - 1];
    }
};
