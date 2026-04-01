// Loading Screen
window.addEventListener("load", () => {
    const loader = document.querySelector(".loading-screen");
    setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";
        setTimeout(() => { loader.style.display = "none"; }, 4500);
    }, 4500);
});

const container = document.getElementById("portrait");


// SVG Lines 
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.style.position = "fixed";
svg.style.top = "1px";
svg.style.left = "0";
svg.style.width = "100vw";
svg.style.height = "100vh";
svg.style.pointerEvents = "none";
svg.style.zIndex = "-1";
document.body.appendChild(svg);

// Draw lines between twins
function drawAllLines(twinMap) {
    svg.innerHTML = "";

    Object.values(twinMap).forEach(pair => {
        if (pair.length < 2) return;

        const rectA = pair[0].getBoundingClientRect();
        const rectB = pair[1].getBoundingClientRect();

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", rectA.right);
        line.setAttribute("y1", rectA.top);
        line.setAttribute("x2", rectB.right);
        line.setAttribute("y2", rectB.top);
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
    });
}

function convertCSVToJSON(csv) {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",").map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = parseCSVLine(lines[i]);
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j]?.trim();
        }
        result.push(obj);
    }
    return result;
}

function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}


function buildCard(p) {
    const card = document.createElement("div");
    card.classList.add("twin-card");

    const cellContent = [
        { label: "Name", key: "Name" },
        { label: "Date of Birth", key: "Date of Birth" },
        { label: "Date of Death", key: "Date of Death" },
        { label: "Lifespan", key: "Lifespan" },
        { label: "Citizenship", key: "Country of Citizenship" },
        { label: "Born in", key: "Place of Birth" },
        { label: "Died in", key: "Place of Death" },
        { label: "Description", key: "Description"},
    ];

    const img = document.createElement("img");
    img.src = p.Portrait?.replace(/"/g, "");
    img.alt = p.Person;
    card.appendChild(img);

    cellContent.forEach(({ label, key }) => {
        if (!p[key]) return;
        const row = document.createElement("p");
        row.innerHTML = `<span>${label}: </span>${p[key]}`;
        card.appendChild(row);
    });

    return card;
}

function grabData() {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRA22sPmvIB0vsf25w05sNuH5tGGtdLR7fJd82mEVV8uQVTdT75Q6djGyrwE7k9inv8E0ljhTVa1gPd/pub?gid=0&single=true&output=csv";
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            const data = convertCSVToJSON(xmlhttp.responseText);
            const twinMap = {};
            const dataMap = {}; // twin ID → array of raw data rows

            data.forEach(p => {
                const img = document.createElement("img");
                img.src = p.Portrait?.replace(/"/g, "");
                img.alt = p.Person;
                img.dataset.twin = p.Twin;

                const convertedLong = mapRange(parseFloat(p.Longitude), -180, 180, 0, window.innerWidth);
                const convertedLat  = mapRange(parseFloat(p.Latitude),  -90,  90, window.innerHeight, 0);

                img.style.top  = convertedLat  + "px";
                img.style.left = convertedLong + "px";

                container.appendChild(img);

                if (!twinMap[p.Twin]) twinMap[p.Twin] = [];
                twinMap[p.Twin].push(img);

                if (!dataMap[p.Twin]) dataMap[p.Twin] = [];
                dataMap[p.Twin].push(p);

                // Click to show info for each twin
                img.addEventListener("click", () => {
                    const pair = dataMap[p.Twin];
                    if (!pair || pair.length < 2) return;

                    const infoBox = document.getElementById("info-box");
                    const twinA = document.getElementById("twin-a");
                    const twinB = document.getElementById("twin-b");

                    twinA.innerHTML = "";
                    twinB.innerHTML = "";

                    twinA.appendChild(buildCard(pair[0]));
                    twinB.appendChild(buildCard(pair[1]));

                    infoBox.style.display = "block";
                });

                // Hover for twin (image sizes on the same time)
                    img.addEventListener("mouseenter", () => {
                        img.classList.add("self-hover");
                        twinMap[p.Twin]?.forEach(el => {
                            if (el !== img) el.classList.add("twin-hover");
                        });
                    });

                    img.addEventListener("mouseleave", () => {
                        img.classList.remove("self-hover");
                        twinMap[p.Twin]?.forEach(el => {
                            el.classList.remove("twin-hover");
                        });
                    });
            });

            requestAnimationFrame(() => drawAllLines(twinMap));
            console.table(data);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

grabData();




// close info box
document.querySelector("#info-box > div > button").addEventListener("click", () => {
    document.getElementById("info-box").style.display = "none";
});


// about box

let aboutButton = document.getElementById("about");
let aboutBox = document.getElementById("about-box");
let aboutCloseButton = document.querySelector("#about-x");

aboutButton.addEventListener("click", () => {
    aboutBox.style.display = "block";
});

aboutCloseButton.addEventListener("click", () => {
    aboutBox.style.display = "none";
});

