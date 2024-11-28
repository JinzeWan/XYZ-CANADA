function toggleDropdown() {
    var dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function init() {
    const accountReq = new XMLHttpRequest();
    accountReq.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const data = JSON.parse(this.responseText);
            if (data.loggedIn && data.username) {
                document.getElementById("username-link").textContent = data.username;
                document.getElementById("username-link").href = "/account";
            }
            else{
                window.location.href = '/service';    
            }

            const subscriptionStartDate = data.subscriptionStartDate 
                ? formatDate(data.subscriptionStartDate) 
                : "N/A";
            document.getElementById("username").textContent = `Username: ${data.username || "N/A"}`;
            document.getElementById("email").textContent = `Email: ${data.email || "N/A"}`;
            document.getElementById("subscription-date").textContent = `Subscription Start Date: ${subscriptionStartDate}`;
            highlightCurrentPlan(data.subscriptionStatus || "none");
        }
    };
    accountReq.open("GET", "/session-data", true);
    accountReq.send();

    loadCases();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function loadCases() {
    const casesReq = new XMLHttpRequest();
    casesReq.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const cases = JSON.parse(this.responseText);
            const casesContainer = document.getElementById("cases-container");
            casesContainer.innerHTML = "";
            if (cases.length === 0) {
                casesContainer.innerHTML = "<p>No cases available.</p>";
            } else {
                const title = document.createElement("h2");
                title.textContent = "Your Cases";
                casesContainer.appendChild(title);

                cases.forEach(caseItem => {
                    const caseDiv = document.createElement("div");
                    caseDiv.className = "case";
                    caseDiv.innerHTML = `
                        <strong>Case Number:</strong> ${caseItem.case_number}<br>
                        <strong>Requirements:</strong> ${caseItem.requirements}<br>
                        <strong>Status:</strong> ${caseItem.status}<br>
                        <strong>Type:</strong> ${caseItem.type}
                    `;
                    casesContainer.appendChild(caseDiv);
                });
            }
        } else if (this.readyState === 4) {
            console.error("Failed to load cases. Please check the server.");
        }
    };
    casesReq.open("GET", "/user-cases", true);
    casesReq.send();
}

function highlightCurrentPlan(currentPlan) {
    const planCards = document.querySelectorAll(".plan-card");
    planCards.forEach(card => {
        const button = card.querySelector("button");
        if (
            (currentPlan.toLowerCase() === "none" && card.id === "free-plan") ||
            (card.id === currentPlan.toLowerCase() + "-plan")
        ) {
            card.classList.add("current-plan");
            button.textContent = "Current Plan";
            button.disabled = true;
        } else {
            card.classList.remove("current-plan");
            button.textContent = "Buy Now";
            button.disabled = false;
        }
    });
}

function logout() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            window.location.href = '/';
        }
    };

    req.open('POST', '/logout', true);
    req.send();
}