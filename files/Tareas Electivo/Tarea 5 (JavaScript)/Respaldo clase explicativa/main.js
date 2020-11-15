console.log("Hola Mundo!")

function clickBoton1() {
    alert("kkkkkkkkkkkkkkkkkkkkkkk")
}
function click2(event) {
    console.log(event)
    window.open("https://www.w3schools.com")
}
function click3(event){
    if (event.key === 'b') {
        event.target.value = ""
        event.preventDefault()
        return
    }
}
function calcular(){
    let i1 = document.getElementById("input1")
    let i2 = document.getElementById("input2")
    let i3 = document.getElementById("input3")

    let result = i1.value + i2.value
    i3.value = result
    console.log(result)

    let titulo = document.getElementById("id_titulo")
    titulo.innerHTML = "El resultado es: " + result
    titulo.classList.remove("titulo")
    titulo.classList.add("titulo2")

    // Para cambiar secuencias de elementos por clase CSS
    let titulo = document.getElementsByClassName("titulo")
    return 
}