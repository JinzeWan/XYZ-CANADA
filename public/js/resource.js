function toggleDropdown() {
    var dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
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

            // 动态加载资源内容
            loadResources(data.subscriptionStatus || "none");
        }
    };

    req.open('GET', '/session-data', true);
    req.send();
}

function logout() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            window.location.href = '/';
        }
    };

    req.open('POST', '/logout', true);
    req.send();
}

function loadResources(subscriptionStatus) {
    const guidesGrid = document.getElementById("guides-grid");
    const subscriptionMessage = document.getElementById("subscription-message");

    const sections = {
        "Introductory guides": [
        { title: "What is 3D printing?", link: "/resource/1" },
        { title: "What is FDM 3D printing?", link: "/resource/2" },
        { title: "What is SLA 3D printing?", link: "/resource/3" },
        { title: "What is SLS 3D printing?", link: "/resource/4" }
    ],
    "Material guides": [
        { title: "PLA vs ABS: What's the difference?", link: "/resource/5" },
        { title: "FDM 3D printing materials compared", link: "/resource/6" },
        { title: "SLA 3D printing materials compared", link: "/resource/7" },
        { title: "3D printed injection molds: Materials compared", link: "/resource/8" }
    ],
    "Design guides": [
        { title: "Key design considerations for 3D printing", link: "/resource/9" },
        { title: "How to design parts for FDM 3D printing?", link: "/resource/10" },
        { title: "Enclosure design for 3D printing", link: "/resource/11" },
        { title: "How to design snap-fit joints for 3D printing?", link: "/resource/12" }
    ],
    "Applications": [
        { title: "3D printing low-run injection molds", link: "/resource/13" },
        { title: "Aerospace 3D printing applications", link: "/resource/14" },
        { title: "Medical 3D printing applications", link: "/resource/15" },
    ],
    "CAD & file preparation": [
        { title: "3D modeling CAD software", link: "/resource/16" },
        { title: "Simulations in 3D printing", link: "/resource/17" },
        { title: "Understand and fix common STL file errors", link: "/resource/18" },
        { title: "3D printing STL files: A step-by-step guide", link: "/resource/19" }
    ],
    "Post processing & finishing": [
        { title: "Post processing for FDM printed parts", link: "/resource/20" },
        { title: "Post processing for SLA printed parts", link: "/resource/21" },
        { title: "Post processing for SLS & MJF printed parts", link: "/resource/22" }
    ]
    };

    createGuideSection("Introductory guides", sections["Introductory guides"]);

    if (subscriptionStatus === "none") {
        subscriptionMessage.style.display = "block";
    } else {
        subscriptionMessage.style.display = "none";
        Object.keys(sections).forEach(section => {
            if (section !== "Introductory guides") {
                createGuideSection(section, sections[section]);
            }
        });
    }
}

function createGuideSection(title, items) {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "guide-section";

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = title;
    sectionDiv.appendChild(sectionTitle);

    const list = document.createElement("ul");
    items.forEach(item => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${item.link}">${item.title}</a>`;
        list.appendChild(listItem);
    });
    sectionDiv.appendChild(list);

    const guidesGrid = document.getElementById("guides-grid");
    guidesGrid.appendChild(sectionDiv);
}