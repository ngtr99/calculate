
// This script handles the dynamic addition and removal of cost items in a table format.
// It allows users to add new cost items with their respective prices and quantities,
document.getElementById('add-cost').addEventListener('click', function() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <tr>
            <td><input type="text" id="cost-item" placeholder="Cost Item"></td>
            <td><input type="text" id="cost-total" placeholder="Total"></td>
            <td><button class="remove-cost"><span class="material-icons">delete</span></button></td>
        </tr>
    `;
    document.querySelector('.cost-container').appendChild(row);
});

// It allows to delete a cost item from the list.
document.querySelector('.cost-container').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-cost')) {
        e.target.closest('tr').remove();
    }
});


// This script handles the dynamic addition and removal of income items in a table format.
// It allows users to add new income items with their respective amounts and descriptions,
document.getElementById('add-income').addEventListener('click', function() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <tr>
            <td><input type="text" id="income-item" placeholder="Income Item"></td>
            <td><input type="text" id="income-amount" placeholder="Amount"></td>
            <td><button class="remove-income"><span class="material-icons">delete</span></button></td>
        </tr>
    `;
    document.querySelector('.income-container').appendChild(row);
});

// It allows to delete an income item from the list.
document.querySelector('.income-container').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-income')) {
        e.target.closest('tr').remove();
    }
});

// This script handles the calculation of total costs and income.
function calculateTotals() {
    // Calculate total cost
    const totalCost = Array.from(document.querySelectorAll('.cost-container input[id="cost-total"]'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    document.getElementById('total-cost').textContent = `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Calculate total income
    const totalIncome = Array.from(document.querySelectorAll('.income-container input[id="income-amount"]'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    document.getElementById('total-income').textContent = `$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    document.getElementById('profit-loss').textContent = `$${(totalIncome - totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Listen for input changes in cost and income containers
document.querySelector('.cost-container').addEventListener('input', function(e) {
    if (e.target.id === 'cost-total') {
        calculateTotals();
    }
});
document.querySelector('.income-container').addEventListener('input', function(e) {
    if (e.target.id === 'income-amount') {
        calculateTotals();
    }
});

// Initial calculation
calculateTotals();



// This script exports the cost and income data to a CSV file.
document.getElementById('export').addEventListener('click', function() {
    const costRows = document.querySelectorAll('.cost-container tr');
    const incomeRows = document.querySelectorAll('.income-container tr');
    
    let csvContent = "data:text/csv;charset=utf-8,Cost Item,Total\n";
    costRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length > 0) {
            csvContent += `${inputs[0].value},${inputs[1].value}\n`;
        }
    });
    
    csvContent += "\nIncome Item,Amount\n";
    incomeRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length > 0) {
            csvContent += `${inputs[0].value},${inputs[1].value}\n`;
        }
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_data.csv");
    document.body.appendChild(link);
    link.click();
});

// This script handles the display of the profit or loss based on the total income and total costs.


document.getElementById('calculate').addEventListener('click', function() {
    const costItems = Array.from(document.querySelectorAll('.cost-container tr'))
        .map(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length === 2) {
                return {
                    label: inputs[0].value || 'Unnamed',
                    value: parseFloat(inputs[1].value) || 0
                };
            }
            return null;
        })
        .filter(item => item && item.value > 0);

    const incomeItems = Array.from(document.querySelectorAll('.income-container tr'))
        .map(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length === 2) {
                return {
                    label: inputs[0].value || 'Unnamed',
                    value: parseFloat(inputs[1].value) || 0
                };
            }
            return null;
        })
        .filter(item => item && item.value > 0);

    // Remove old chart if exists
    const oldCanvas = document.getElementById('financeChart');
    if (oldCanvas) oldCanvas.remove();

    // Create canvas for chart
    const chartContainer = document.getElementById('chart-container') || document.body;
    const canvas = document.createElement('canvas');
    canvas.id = 'financeChart';
    canvas.width = 600;
    canvas.height = 400;
    chartContainer.appendChild(canvas);

    // Prepare data for stacked bar chart
    const labels = ['Total'];
    const costData = [costItems.reduce((sum, item) => sum + item.value, 0)];
    const incomeData = [incomeItems.reduce((sum, item) => sum + item.value, 0)];

    function renderChart() {
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Cost',
                        data: costData,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)'
                    },
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)'
                    }
                ]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Cost vs Income' }
                },
                scales: {
                    x: { stacked: true },
                    y: { beginAtZero: true, stacked: true }
                }
            }
        });
    }

    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = renderChart;
        document.head.appendChild(script);
    } else {
        renderChart();
    }

        document.getElementById('significant-cost').textContent = 
            `1. The most significant cost item is ${costItems.length > 0 ? costItems[0].label : 'not specified'}, with a total of $${costData[0].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.\n`
        document.getElementById('significant-income').textContent =
            `2. The most significant income item is ${incomeItems.length > 0 ? incomeItems[0].label : 'not specified'}, with a total of $${incomeData[0].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.\n`
        document.getElementById('worst-cost').textContent =
            `3. The worst cost item is ${costItems.length > 0 ? costItems[costItems.length - 1].label : 'not specified'}, with a total of $${costData[costData.length - 1].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.\n`
        document.getElementById('worst-income').textContent =
            `4. The worst income item is ${incomeItems.length > 0 ? incomeItems[incomeItems.length - 1].label : 'not specified'}, with a total of $${incomeData[incomeData.length - 1].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
});

// This script handles delete all cost items and income items at once.
document.getElementById('reset').addEventListener('click', function() {
    document.querySelector('.cost-container').innerHTML = `
        <tr>
            <td><input type="text" id="cost-item" placeholder="Cost Item"></td>
            <td><input type="text" id="cost-total" placeholder="Total"></td>
        </tr>`;
    document.querySelector('.income-container').innerHTML = `
        <tr>
            <td><input type="text" id="income-item" placeholder="Income Item"></td>
            <td><input type="text" id="income-amount" placeholder="Amount"></td>
        </tr>`;
    document.getElementById('total-cost').textContent = '$0.00';
    document.getElementById('total-income').textContent = '$0.00';
    document.getElementById('profit-loss').textContent = '$0.00';
    document.getElementById('significant-cost').textContent = '';
    document.getElementById('significant-income').textContent = '';
    document.getElementById('worst-cost').textContent = '';
    document.getElementById('worst-income').textContent = '';
    const oldCanvas = document.getElementById('financeChart');
    if (oldCanvas) oldCanvas.remove();
    document.getElementById('chart-container').innerHTML = '';
    document.querySelector('.cost-container').querySelector('input').focus();
    calculateTotals();
}
);