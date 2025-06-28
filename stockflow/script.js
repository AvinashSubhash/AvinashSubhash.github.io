document.getElementById('stockForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const stockId = document.getElementById('stockId').value;
    const analysisType = document.getElementById('analysisType').value;
    const interval = document.getElementById('interval').value;
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('messages').innerHTML = '';
    
    try {
        let url = `https://tekpeek.duckdns.org/${stockId}`;
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
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <strong>${key}:</strong> ${formatValue(value, key)}
                        </div>
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
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <strong>${key}:</strong> ${formatValue(value, key)}
                        </div>
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
    let html = '<div class="row">';
    
    for (const [objKey, objValue] of Object.entries(data)) {
        html += `
            <div class="col-md-6 mb-2">
                <div class="d-flex justify-content-between align-items-center p-2 border rounded">
                    <span class="fw-bold">${objKey}:</span>
                    <span>${formatValue(objValue, objKey)}</span>
                </div>
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
                '<span class="badge bg-success"><i class="bi bi-check-circle"></i> BUY</span>' : 
                '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> SELL</span>';
        } else {
            return boolValue ? 
                '<span class="badge bg-success">True</span>' : 
                '<span class="badge bg-danger">False</span>';
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