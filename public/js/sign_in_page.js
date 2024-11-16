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

function sign_in() {
    let name = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let u = {};
    u.username = name;
    u.password = password;

    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("Login success!");
            window.location.href = '/';                    
        } else if (this.readyState == 4 && this.status == 300) {
            alert("Invalid login! You have already logged into the website");
            window.location.href = '/';    
        } else if (this.readyState == 4 && this.status == 401) {
            alert("Invalid username or password");  
        }
    };

    req.open('POST', `/login`, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(JSON.stringify(u));
}
