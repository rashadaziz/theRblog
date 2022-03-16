const password1 = document.getElementById("password")
const password2 = document.getElementById("password2")
const username = document.getElementById("username")
const fullName = document.getElementById("fullName")

password1.addEventListener("change", () => {
    if (password1.value.trim().length === 0) {
        document.querySelector(".my-button").disabled = true
        password1.style.border = "1px solid red" 
    } else {
        document.querySelector(".my-button").disabled = false
        password1.style.border = "" 
    }
})
username.addEventListener("change", () => {
    if (username.value.trim().length === 0) {
        document.querySelector(".my-button").disabled = true
        username.style.border = "1px solid red" 
    } else {
        document.querySelector(".my-button").disabled = false
        username.style.border = "" 
    }
})
fullName.addEventListener("change", () => {
    if (fullName.value.trim().length === 0) {
        document.querySelector(".my-button").disabled = true
        fullName.style.border = "1px solid red" 
    } else {
        document.querySelector(".my-button").disabled = false
        fullName.style.border = "" 
    }
})

password2.addEventListener("change", () => {
    if (password2.value !== password1.value) {
        document.querySelector(".my-button").disabled = true
        password1.style.border = "1px solid red" 
        password2.style.border = "1px solid red" 
    } else {
        document.querySelector(".my-button").disabled = false
        password1.style.border = "" 
        password2.style.border = ""  
    }
})