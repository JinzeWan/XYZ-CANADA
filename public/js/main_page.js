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

function upload() {
    let textAreaValue = document.querySelector('textarea').value;
    let emailValue = document.querySelector('input[type="email"]').value;
    let fileInput = document.querySelector('input[type="file"]');
    let file = fileInput.files[0];

    if (!emailValue) {
        alert("Please enter your email.");
        return;
    }

    let formData = new FormData();
    formData.append("requirements", textAreaValue);
    formData.append("email", emailValue);
    formData.append("file", file);

    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("We have received your request! " + "The case number is " + JSON.parse(this.response).caseNumber);
            location.reload();
        }
        if (this.readyState == 4 && this.status == 400) {
            alert("Missing Email.");
        }
        if (this.readyState == 4 && this.status == 500) {
            alert("Sorry! There may be a problem with the server.");
        }
    };

    req.open('POST', `/submit`, true);
    req.send(formData);
}

function toggleDropdown() {
    var dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Optional: Close the dropdown if clicked outside
window.onclick = function(event) {
    if (!event.target.matches('.user-icon button') && !event.target.matches('.user-icon img')) {
        var dropdown = document.getElementById("dropdown-menu");
        if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    // 监听服务器端发送的聊天消息
    socket.on('chat message', (msg) => {
        const messages = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.textContent = msg;
        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight;
    });

    // 发送聊天消息
    window.sendMessage = function() {
        const input = document.getElementById('message-input');
        if (input.value.trim()) {
            socket.emit('chat message', input.value);
            input.value = '';
        }
    };

    // 切换聊天窗口的显示/隐藏
    window.toggleChat = function() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
            chatContainer.style.display = 'block';
        } else {
            chatContainer.style.display = 'none';
        }
    };
});