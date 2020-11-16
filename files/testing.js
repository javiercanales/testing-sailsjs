/**
 * Little proofs of concept
 */

// Testing JSONs and arrays
array =[{ 
            "name": "John", 
            "age": 30, 
            "car": null 
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        }]

console.log(array)
array.forEach((element, i) => {
    console.log(element.name + " - " + i)
})


let keys = Object.keys(array[0]);

// Generate headers (as a record, remember the header can be setted manually for a better report's look)
columns = [];
keys.forEach(element => {
    columns.push(element)
});

console.log(columns)
console.log("_-------------------------------_")
array.forEach((element, i) => {
    columns.forEach((column, j) => {
        console.log(`column: ${column} - ` + element[column])
    })
})

// Testing dates in JS
let d = new Date();
const day = d.getDate();
const month = d.getMonth() + 1; //Starts from 0... js things
const year = d.getFullYear();
const date = `${day}-${month}-${year}`;
console.log(date)

str = "Quién lo diria"
console.log(str.substring(0,30))

// Iterating an JSON

const data = [
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida",
        "branch": "Nissawsedrtfgyhugtfrdesw edrtfghyugtfrdesw tredws2ed4r5ftg6y7h6hgt5rfdesw r4ed3sw2ed4r5ftg6hy7u7n",
        "name2": "Johne", 
        "age2": 31, 
        "car2": "Tiidaedrtfghyunhtfr tredwsedrtfghyutfd ervtbyhunjhtfred",
        "branch2": "Nissan",
        "name3": "Johne", 
        "age3": 31, 
        "car3": "Tiida",
        "branch3": "Nissan"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida",
        "branch": "Nissan",
        "name2": "Johne", 
        "age2": 31, 
        "car2": "Tiida",
        "branch2": "Nissan",
        "name3": "Johne", 
        "age3": 31, 
        "car3": "Tiida",
        "branch3": "Nissan"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida",
        "branch": "Nissan",
        "name2": "Johne", 
        "age2": 31, 
        "car2": "Tiida",
        "branch2": "Nissan",
        "name3": "Johne", 
        "age3": 31, 
        "car3": "Tiida",
        "branch3": "Nissan"
    }
]
console.log('Value-------------------');

data.forEach(value => {
    for(key in value){
        if (typeof value[key] === 'string' || value[key] instanceof String){
            value[key] = value[key].substring(0, 20);
        }
    }
});

data.forEach(value => {
    for(key in value){
        console.log(key, ' - ', value[key]);
    };
});

let value = "This is for check {header} and {body} to work properly";

value = value.replace('{header}', 'probando123')

console.log(value)

columns = {
    name: "123", 
    car: "nissan"
}

let keys2 = Object.keys(columns)

console.log("keys2: ",keys2)

console.log("NEW ARRAY: ",data)

console.log("TEST: ",data['name'])

let result = data.map(value => {
    for(key in value) {
        if(keys2.includes(key)) {
            console.log("HERE:", key)
        }
    }
});

console.log(result);