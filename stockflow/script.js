document.getElementById('stockForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const stockId = document.getElementById('stockId').value;
    const analysisType = document.getElementById('analysisType').value;
    const interval = document.getElementById('interval').value;
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('messages').innerHTML = '';
    
    try {
        let url = `https://tekpeek.duckdns.org/api/${stockId}`;
        const params = new URLSearchParams({
            interval: interval
        });
        
        if (analysisType !== 'full') {
            url += `/${analysisType}`;
        }
        
        url += `?${params.toString()}`;
        
        const response = await fetch(url);
        console.log(response)
        const data = await response.json();
        
        document.getElementById('loading').style.display = 'none';
        
        if (data.error) {
            showMessage(`API Error: ${data.error}`, 'error');
            return;
        }
        
        if (response.ok) {
            displayResults(data, stockId, analysisType);
        } else {
            showMessage(`API Error: ${data.error || 'An error occurred'}`, 'error');
        }
        
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        showMessage(`Network Error: Unable to connect to the API server. Please check if the server is running.`, 'error');
        console.error('Error:', error);
    }
});

function displayResults(data, stockId, analysisType) {
    const resultContent = document.getElementById('resultContent');
    const resultsDiv = document.getElementById('results');
    
    let html = `
        <div class="mb-3">
            <h6 class="text-primary">Stock: ${stockId}</h6>
            <h6 class="text-muted">Analysis Type: ${analysisType.toUpperCase()}</h6>
        </div>
    `;
    
    if (analysisType === 'full') {
        html += formatFullAnalysis(data);
    } else {
        html += formatIndividualAnalysis(data, analysisType);
    }
    
    resultContent.innerHTML = html;
    resultsDiv.style.display = 'block';
}

function formatFullAnalysis(data) {
    let html = '<div class="row">';
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header">
                            <strong>${key.toUpperCase()}</strong>
                        </div>
                        <div class="card-body">
                            ${formatAnalysisData(value, key)}
                        </div>
                    </div>
                </div>
            `;
        } else {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            html += `
                <div class="col-md-6 mb-3">
                    <div class="data-item">
                        <div class="data-label">${formattedKey}</div>
                        <div class="data-content">${formatValue(value, key)}</div>
                    </div>
                </div>
            `;
        }
    }
    
    html += '</div>';
    return html;
}

function formatIndividualAnalysis(data, analysisType) {
    let html = '<div class="row">';
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
            html += `
                <div class="col-12 mb-3">
                    <div class="card">
                        <div class="card-header">
                            <strong>${key}</strong>
                        </div>
                        <div class="card-body">
                            ${formatAnalysisData(value, key)}
                        </div>
                    </div>
                </div>
            `;
        } else {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            html += `
                <div class="col-md-6 mb-3">
                    <div class="data-item">
                        <div class="data-label">${formattedKey}</div>
                        <div class="data-content">${formatValue(value, key)}</div>
                    </div>
                </div>
            `;
        }
    }
    
    html += '</div>';
    return html;
}

function formatAnalysisData(data, key) {
    if (Array.isArray(data)) {
        return formatArrayData(data, key);
    } else if (typeof data === 'object') {
        return formatObjectData(data, key);
    } else {
        return formatValue(data, key);
    }
}

function formatArrayData(data, key) {
    if (data.length === 0) return '<span class="text-muted">No data available</span>';
    
    let html = '<div class="table-responsive"><table class="table table-sm table-striped">';
    
    const firstItem = data[0];
    if (typeof firstItem === 'object' && firstItem !== null) {
        html += '<thead><tr>';
        for (const header of Object.keys(firstItem)) {
            html += `<th>${header.toUpperCase()}</th>`;
        }
        html += '</tr></thead>';
        
        html += '<tbody>';
        data.forEach(item => {
            html += '<tr>';
            for (const [itemKey, itemValue] of Object.entries(item)) {
                html += `<td>${formatValue(itemValue, itemKey)}</td>`;
            }
            html += '</tr>';
        });
        html += '</tbody>';
    } else {
        html += '<tbody>';
        data.forEach((item, index) => {
            html += `<tr><td>${index + 1}</td><td>${formatValue(item, key)}</td></tr>`;
        });
        html += '</tbody>';
    }
    
    html += '</table></div>';
    return html;
}

function formatObjectData(data, key) {
    let html = '<div class="data-grid">';
    
    for (const [objKey, objValue] of Object.entries(data)) {
        const formattedKey = objKey.charAt(0).toUpperCase() + objKey.slice(1).replace(/([A-Z])/g, ' $1');
        const formattedValue = formatValue(objValue, objKey);
        
        html += `
            <div class="data-item">
                <div class="data-label">${formattedKey}</div>
                <div class="data-content">${formattedValue}</div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

function formatValue(value, key) {
    if (value === null || value === undefined) {
        return '<span class="text-muted">N/A</span>';
    }
    
    if (typeof value === 'boolean' || value === 'true' || value === 'false') {
        const boolValue = value === true || value === 'true';
        if (key.toLowerCase().includes('buy')) {
            return boolValue ? 
                '<div class="signal-badge buy"><i class="bi bi-arrow-up-circle-fill"></i> BUY SIGNAL</div>' : 
                '<div class="signal-badge sell"><i class="bi bi-arrow-down-circle-fill"></i> SELL SIGNAL</div>';
        } else if (key.toLowerCase().includes('signal')) {
            const signalValue = String(value).toLowerCase();
            if (signalValue.includes('buy')) {
                return '<div class="signal-badge buy"><i class="bi bi-arrow-up-circle-fill"></i> BUY SIGNAL</div>';
            } else if (signalValue.includes('sell')) {
                return '<div class="signal-badge sell"><i class="bi bi-arrow-down-circle-fill"></i> SELL SIGNAL</div>';
            } else if (signalValue.includes('hold') || signalValue.includes('neutral')) {
                return '<div class="signal-badge hold"><i class="bi bi-dash-circle-fill"></i> HOLD SIGNAL</div>';
            } else {
                return boolValue ? 
                    '<div class="signal-badge buy"><i class="bi bi-check-circle-fill"></i> POSITIVE</div>' : 
                    '<div class="signal-badge sell"><i class="bi bi-x-circle-fill"></i> NEGATIVE</div>';
            }
        } else {
            return boolValue ? 
                '<div class="signal-badge buy"><i class="bi bi-check-circle-fill"></i> TRUE</div>' : 
                '<div class="signal-badge sell"><i class="bi bi-x-circle-fill"></i> FALSE</div>';
        }
    }
    
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
        const numValue = parseFloat(value);
        if (key.toLowerCase().includes('price') || key.toLowerCase().includes('value')) {
            return `<span class="fw-bold text-primary">₹${numValue.toFixed(2)}</span>`;
        }
        else {
            return `<span class="fw-bold">${numValue.toFixed(2)}</span>`;
        }
    }

    if (typeof value === 'string') {
        // Check for signal-related strings
        const signalValue = value.toLowerCase();
        if (signalValue.includes('buy')) {
            return '<div class="signal-badge buy"><i class="bi bi-arrow-up-circle-fill"></i> BUY SIGNAL</div>';
        } else if (signalValue.includes('sell')) {
            return '<div class="signal-badge sell"><i class="bi bi-arrow-down-circle-fill"></i> SELL SIGNAL</div>';
        } else if (signalValue.includes('hold') || signalValue.includes('neutral')) {
            return '<div class="signal-badge hold"><i class="bi bi-dash-circle-fill"></i> HOLD SIGNAL</div>';
        }
        
        if (value.length > 50) {
            return `<span title="${value}">${value.substring(0, 50)}...</span>`;
        }
        return `<span>${value}</span>`;
    }
    
    return `<span>${String(value)}</span>`;
}

function showMessage(message, type) {
    const messagesDiv = document.getElementById('messages');
    const className = type === 'error' ? 'error-message' : 'success-message';
    const icon = type === 'error' ? '<i class="bi bi-exclamation-triangle-fill me-2"></i>' : '<i class="bi bi-check-circle-fill me-2"></i>';
    
    messagesDiv.innerHTML = `<div class="${className}">${icon}${message}</div>`;
}

document.getElementById('stockId').addEventListener('input', function(e) {
    let value = e.target.value.toUpperCase();
    e.target.value = value;
});

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeText = themeToggle.querySelector('.button-text');
const body = document.body;

const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeIcon.className = 'bi bi-sun-fill';
    themeText.textContent = 'Light Mode';
} else {
    themeText.textContent = 'Dark Mode';
}

themeToggle.addEventListener('click', function() {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeIcon.className = 'bi bi-moon-fill';
        themeText.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        themeIcon.className = 'bi bi-sun-fill';
        themeText.textContent = 'Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}); 

// === Maintenance Mode Button Logic ===
const enableBtn = document.getElementById('enableMaintenanceBtn');
const disableBtn = document.getElementById('disableMaintenanceBtn');
const maintenanceStatusText = document.getElementById('maintenanceStatusText');

let apiKey = null;

if (enableBtn && disableBtn) {
    enableBtn.addEventListener('click', function() {
        setMaintenanceMode(true);
    });
    disableBtn.addEventListener('click', function() {
        setMaintenanceMode(false);
    });
}

async function setMaintenanceMode(enable) {
    if (!apiKey) {
        apiKey = prompt('Enter your admin API key:');
        if (!apiKey) {
            showMessage('API key is required to perform this action.', 'error');
            return;
        }
    }
    const mode = enable ? 'on' : 'off';
    try {
        const res = await fetch(`https://tekpeek.duckdns.org/api/admin/maintenance/${mode}`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        if (res.ok) {
            maintenanceStatusText.textContent = enable ? 'Maintenance mode is ENABLED' : 'Maintenance mode is DISABLED';
            showMessage(`Maintenance mode ${enable ? 'enabled' : 'disabled'} successfully.`, 'success');
        } else if (res.status === 401) {
            apiKey = null; // Clear invalid key
            showMessage('Unauthorized: Invalid API key. Please try again.', 'error');
        } else {
            showMessage(data.error || 'Failed to update maintenance mode.', 'error');
        }
    } catch (err) {
        showMessage('Network error updating maintenance mode.', 'error');
    }
} 