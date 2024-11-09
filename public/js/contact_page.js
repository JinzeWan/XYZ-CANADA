function init() {
    //alert("test");
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
