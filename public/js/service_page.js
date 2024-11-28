function init() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let data = JSON.parse(this.responseText);
            const dropdownMenu = document.getElementById("dropdown-menu");

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

let selectedOption = "";

function selectOption(button) {
    // 移除其他按钮的“选中”状态
    let buttons = document.querySelectorAll('.options button');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
    });

    // 为当前点击的按钮添加“选中”状态
    button.classList.add('selected');

    // 更新选中选项的变量
    selectedOption = button.getAttribute("data-type");
}

function upload() {
    let textAreaValue = document.querySelector('textarea').value;
    let emailValue = document.querySelector('input[type="email"]').value;
    let fileInput = document.querySelector('input[type="file"]');
    let file = fileInput.files[0];

    if (!emailValue) {
        alert("Please enter your email.");
        return;
    }

    if (!selectedOption) {
        alert("Please select an option.");
        return;
    }

    let formData = new FormData();
    formData.append("requirements", textAreaValue);
    formData.append("email", emailValue);
    formData.append("file", file);
    formData.append("selectedOption", selectedOption);

    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("We have received your request! The case number is " + JSON.parse(this.response).caseNumber);
            location.reload();
        }
        if (this.readyState == 4 && this.status == 400) {
            alert("Missing Email or option.");
        }
        if (this.readyState == 4 && this.status == 500) {
            alert("Sorry! There may be a problem with the server.");
        }
    };

    req.open('POST', `/submit`, true);
    req.send(formData);
}