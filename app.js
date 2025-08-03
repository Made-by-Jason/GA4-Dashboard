// =================================================================
// ===== 1. CONFIGURATION: REPLACE WITH YOUR CREDENTIALS =========
// =================================================================
// Find these in your Google Cloud Console project
const CLIENT_ID = '949266732717-f2gotirajs32tiljralg7vtmcv5oajvb.apps.googleusercontent.com'; 
// Find this in your Google Analytics Admin > Property Settings
const GA4_PROPERTY_ID = '429032834'; 

// Scopes required for the Google Analytics Data API
const SCOPES = 'https://www.googleapis.com/auth/analytics.readonly';


// =================================================================
// ===== 2. GOOGLE AUTHENTICATION & API SETUP ======================
// =================================================================
let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        // NOTE: No API key is needed for the Data API, auth is handled by OAuth
        discoveryDocs: ['https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta'],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

document.getElementById('authorize_button').onclick = handleAuthClick;
document.getElementById('signout_button').onclick = handleSignoutClick;

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').innerText = 'Refresh Connection';
        
        // Load all data from the API
        fetchAllData();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('signout_button').style.visibility = 'hidden';
        document.getElementById('authorize_button').innerText = 'Connect Google Analytics';
        // You might want to clear the dashboard data here as well
    }
}


// =================================================================
// ===== 3. DATA FETCHING (API CALLS) ==============================
// =================================================================

async function fetchAllData() {
    try {
        // For now, we use mock data. Uncomment the API calls to use real data.
        console.log("Fetching data from API...");
        
        // --- KPI Cards Data ---
        // const kpiResponse = await fetchKpiDataFromApi();
        // renderKpiCards(kpiResponse);
        renderKpiCards(mockKpiData);

        // --- Main Chart Data ---
        // const trendResponse = await fetchTrendDataFromApi();
        // renderMainChart(trendResponse);
        renderMainChart(mockTrendData);
        
        // --- Performance Table Data ---
        // const tableResponse = await fetchTableDataFromApi();
        // renderPerformanceTable(tableResponse);
        renderPerformanceTable(mockTableData);

        console.log("Dashboard updated successfully.");

    } catch (error) {
        console.error("Error fetching or rendering data:", error);
        alert("An error occurred. Check the console for details.");
    }
}

// ---- MOCK DATA (for display without API connection) ----
const mockKpiData = {
    sessions: 14700, users: 30100, transactions: 232, revenue: 35180,
    sparklines: {
        sessions: [120, 150, 110, 180, 160, 200, 140],
        users: [280, 300, 250, 350, 320, 400, 290],
        transactions: [20, 25, 18, 30, 28, 35, 22],
        revenue: [3000, 3500, 2800, 4000, 3800, 4500, 3200]
    }
};

const mockTrendData = {
    labels: ['21 Jun', '23 Jun', '25 Jun', '27 Jun', '29 Jun', '1 Jul', '3 Jul', '5 Jul', '7 Jul', '9 Jul', '11 Jul', '13 Jul', '15 Jul', '17 Jul', '19 Jul'],
    data: [1600, 1200, 1100, 1700, 1400, 1200, 1500, 1300, 1250, 1450, 1300, 1100, 1700, 4200, 1500]
};

const mockTableData = [
    { campaign: '(not set)', sessions: '4,825', users: '28,068', bounce: '90.98%', duration: '00:04:22', transactions: '39', revenue: '$3,014.76' },
    { campaign: '[Evergreen] Merch Store US and CA | Search', sessions: '3,272', users: '2,628', bounce: '24.57%', duration: '00:04:13', transactions: '43', revenue: '$4,627.24' },
    { campaign: '(referral)', sessions: '3,086', users: '1,997', bounce: '38.53%', duration: '00:03:18', transactions: '65', revenue: '$8,132.6' },
    { campaign: '[Evergreen] Merch Store US and CA | Performance Max', sessions: '1,261', users: '989', bounce: '24.9%', duration: '00:05:41', transactions: '17', revenue: '$1,173.99' },
    { campaign: '(cross-network)', sessions: '699', users: '685', bounce: '14.88%', duration: '00:07:21', transactions: '29', revenue: '$3,740.3' },
];

// ---- REAL API CALLS (Example functions) ----
async function fetchKpiDataFromApi() {
    const response = await gapi.client.analyticsdata.properties.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        requestBody: {
            dateRanges: [{ "startDate": "28daysAgo", "endDate": "today" }],
            metrics: [
                { "name": "sessions" }, { "name": "totalUsers" },
                { "name": "transactions" }, { "name": "itemRevenue" }
            ],
            // Add dimensions for sparklines
            dimensions: [{ "name": "date" }]
        }
    });
    // You would need to parse this response to extract the KPI values and sparkline data
    console.log("KPI Response:", response.result);
    // return parsedData; 
    return {}; // Return parsed object
}

// Add similar functions `fetchTrendDataFromApi` and `fetchTableDataFromApi`


// =================================================================
// ===== 4. DATA RENDERING (Updating the UI) =======================
// =================================================================

function renderKpiCards(data) {
    document.getElementById('kpi-sessions').textContent = (data.sessions / 1000).toFixed(1) + 'K';
    document.getElementById('kpi-users').textContent = (data.users / 1000).toFixed(1) + 'K';
    document.getElementById('kpi-transactions').textContent = data.transactions.toFixed(1);
    document.getElementById('kpi-revenue').textContent = '$' + (data.revenue / 1000).toFixed(2) + 'K';

    // Render sparklines
    createSparkline('sparkline-sessions', data.sparklines.sessions);
    createSparkline('sparkline-users', data.sparklines.users);
    createSparkline('sparkline-transactions', data.sparklines.transactions);
    createSparkline('sparkline-revenue', data.sparklines.revenue);
}

function renderMainChart(data) {
    const ctx = document.getElementById('main-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Sessions',
                data: data.data,
                borderColor: '#38bdf8', // brand-blue
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#38bdf8',
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#9ca3af' } // text-gray-400
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' } // text-gray-400
                }
            }
        }
    });
}

function renderPerformanceTable(data) {
    const tableBody = document.getElementById('performance-table-body');
    tableBody.innerHTML = ''; // Clear existing placeholder data

    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = `border-b border-gray-700 ${index % 2 !== 0 ? 'bg-gray-700/50' : ''}`;
        tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-white">${row.campaign}</td>
            <td class="px-6 py-4">${row.sessions}</td>
            <td class="px-6 py-4">${row.users}</td>
            <td class="px-6 py-4">${row.bounce}</td>
            <td class="px-6 py-4">${row.duration}</td>
            <td class="px-6 py-4">${row.transactions}</td>
            <td class="px-6 py-4">${row.revenue}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function createSparkline(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(() => ''), // No labels
            datasets: [{
                data: data,
                borderColor: '#f59e0b', // brand-gold
                borderWidth: 2,
                pointRadius: 0, // No dots
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                y: { display: false },
                x: { display: false }
            }
        }
    });
}

// Initial render with mock data on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
});
