function init() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let data = JSON.parse(this.responseText);
            const dropdownMenu = document.getElementById("dropdown-menu");

            // 根据登录状态动态调整菜单内容
            if (data.loggedIn && data.username) {
                dropdownMenu.innerHTML = `
                    <a href="/account">${data.username}</a>
                    <a href="javascript:void(0);" onclick="logout()">Log out</a>
                `;
            } else {
                dropdownMenu.innerHTML = `
                    <a href="/sign-in">Sign in</a>
                    <a href="/create">Create an account</a>
                `;
            }
        }
    };

    req.open('GET', `/session-data`, true);
    req.send();
}

function submit() {
    let fullName = document.getElementById('fullname').value;
    let email = document.getElementById('email').value;
    let caseNumber = document.getElementById('casenumber').value;
    let message = document.getElementById('message').value;

    let data = {
        fullname: fullName,
        email: email,
        casenumber: caseNumber,
        message: message
    };

    if (!email) {
        alert("Please enter your email.");
        return;
    } else if (!message) {
        alert("Please enter your message.");
        return;
    }

    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("We have received your request!");
            location.reload();
        }
        if (this.readyState == 4 && this.status == 400) {
            alert("Missing email or message.");
        }
    };

    req.open("POST", "/message");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(data));
}

function toggleDropdown() {
    var dropdown = document.getElementById("dropdown-menu");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}

function logout() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Logout successful, redirect to home or login page
            window.location.href = '/';
        } else if (this.readyState == 4) {
            console.error('Failed to logout:', req.responseText);
        }
    };

    req.open('POST', '/logout', true);
    req.send();
}
