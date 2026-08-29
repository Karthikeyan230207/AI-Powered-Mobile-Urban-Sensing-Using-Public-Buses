let map, markers = [];

async function api(path, options={}) {
    const response = await fetch(path, options);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

function init() {
    map = L.map("map").setView([13.0827, 80.2707], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);
}

function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

function loadMap(items) {
    clearMarkers();
    items.forEach(i => {
        const popup =
            `<b>${i.incident_code}</b><br>` +
            `${i.incident_type}<br>Bus: ${i.bus_id}<br>` +
            `Confidence: ${(i.confidence*100).toFixed(1)}%<br>` +
            `Priority: ${i.priority_score}<br>` +
            `Verified: ${i.verification_count}<br>Status: ${i.status}`;
        markers.push(L.marker([i.latitude, i.longitude]).addTo(map).bindPopup(popup));
    });
}

function nextStatus(status) {
    if (status === "DETECTED") return "ASSIGNED";
    if (status === "ASSIGNED") return "IN PROGRESS";
    if (status === "IN PROGRESS") return "REPAIRED";
    return null;
}

async function changeStatus(id, status) {
    await api(`/api/incidents/${id}/status`, {
        method: "PATCH",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({status})
    });
    load();
}

function renderTable(items) {
    document.getElementById("table").innerHTML = items.map(i => {
        const next = nextStatus(i.status);
        return `<tr>
            <td>${i.incident_code}</td>
            <td>${i.bus_id}</td>
            <td>${i.incident_type}</td>
            <td>${(i.confidence*100).toFixed(1)}%</td>
            <td>${i.priority_score}</td>
            <td>✅ ${i.verification_count}</td>
            <td><span class="pill">${i.status}</span></td>
            <td>${next ? `<button onclick="changeStatus(${i.id},'${next}')">${next}</button>` : "—"}</td>
        </tr>`;
    }).join("");
}

function renderAlerts(items) {
    const critical = items.filter(
        i => i.priority_score >= 80 && i.status !== "REPAIRED"
    ).slice(0, 6);

    document.getElementById("alerts").innerHTML = critical.length
        ? critical.map(i =>
            `<div class="alert"><b>🚨 ${i.incident_type.toUpperCase()}</b><br>
            ${i.incident_code} — Priority ${i.priority_score}<br>
            Verified by ${i.verification_count} bus(es)</div>`
          ).join("")
        : "<p>No critical active alerts.</p>";
}

async function load() {
    const [items, stats] = await Promise.all([
        api("/api/incidents"),
        api("/api/stats")
    ]);
    document.getElementById("potholes").textContent = stats.potholes;
    document.getElementById("total").textContent = stats.total;
    document.getElementById("critical").textContent = stats.critical;
    document.getElementById("repaired").textContent = stats.repaired;
    loadMap(items);
    renderTable(items);
    renderAlerts(items);
}

async function seedDemo() {
    await api("/api/demo/seed", {method:"POST"});
    load();
}

window.addEventListener("load", () => {
    init();
    load();
});
