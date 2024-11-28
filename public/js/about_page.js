function toggleDropdown() {
    var dropdown = document.getElementById("dropdown-menu");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}

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
