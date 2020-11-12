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

let d = new Date();
const day = d.getDate();
const month = d.getMonth() + 1; //Starts from 0... js things
const year = d.getFullYear();
const date = `${day}-${month}-${year}`;
console.log(date)