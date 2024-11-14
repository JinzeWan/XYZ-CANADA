function init(){

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
            alert("Sorry! There may be a problem with the server");
        }
    };

    req.open('POST', `/submit`, true);
    req.send(formData);
}
