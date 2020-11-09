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