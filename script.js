let csvData = [];
let filteredData = [];

// Function to load CSV file
function loadCSV(filePath, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                complete: callback
            });
        });
}

// Function to display data in the table
function displayData(data) {
    const header = data.meta.fields;
    const rows = data.data;

    // Clear existing table data
    document.getElementById('csv-header').innerHTML = '';
    document.getElementById('csv-body').innerHTML = '';

    // Append headers
    header.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field;
        document.getElementById('csv-header').appendChild(th);
    });

    // Append rows
    rows.forEach(row => {
        const tr = document.createElement('tr');
        header.forEach(field => {
            const td = document.createElement('td');
            td.textContent = row[field];
            tr.appendChild(td);
        });
        document.getElementById('csv-body').appendChild(tr);
    });

    // Show the table if it has rows
    document.getElementById('csv-table').style.display = rows.length ? 'table' : 'none';
}

// Function to filter and display suggestions
function displaySuggestions(data, query) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';

    if (!query) {
        document.getElementById('csv-table').style.display = 'none';
        filteredData = [];
        return;
    }

    const keywords = query.toLowerCase().split(/\s+/); // Split the query into keywords

    const matches = data.filter(item => {
        return keywords.every(keyword => {
            return Object.values(item).some(value => 
                value && value.toString().toLowerCase().includes(keyword)
            );
        });
    });

    filteredData = matches;

    matches.forEach(match => {
        const div = document.createElement('div');
        div.className = 'list-group-item suggestion-item';
        div.textContent = Object.values(match).join(' | ');
        div.addEventListener('click', () => {
            displayData({ meta: { fields: Object.keys(match) }, data: [match] });
            document.getElementById('search').value = '';
            suggestionsDiv.innerHTML = '';
        });
        suggestionsDiv.appendChild(div);
    });

    // Hide the table if no matches
    document.getElementById('csv-table').style.display = matches.length ? 'table' : 'none';
}

// Load CSV and initialize event listeners
loadCSV('corrugado.csv', function(results) {
    csvData = results.data;

    // Event listener for search input
    document.getElementById('search').addEventListener('input', function() {
        const query = this.value;
        displaySuggestions(filteredData.length ? filteredData : csvData, query);
    });
});

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(() => {
        console.log('Service Worker Registered');
    });
}
