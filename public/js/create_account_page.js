function toggleDropdown() {
    var dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Close the dropdown if clicked outside
window.onclick = function(event) {
    if (!event.target.closest('.user-icon')) {
        var dropdown = document.getElementById("dropdown-menu");
        if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
        }
    }
};


function submit() {
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirm-password').value;
    if(!username || !email || !password|| !confirmPassword){
        alert("Please fill in all necessary information.");
        return;
    }
    if(password != confirmPassword){
        alert("Input password is inconsistent!");
        return;
    }

    let data = {
        username: username,
        email: email,
        password: password,
    };

    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("Successfully create an account!");
            window.location.href = '/';    
        }
        if (this.readyState == 4 && this.status == 300) {
            alert("Account name or email address has been used!");
        }
        if (this.readyState == 4 && this.status == 500) {
            alert("Sorry! There may be a problem with the server.");
        }
    };

    req.open('POST', `/create_account`, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(data));
}