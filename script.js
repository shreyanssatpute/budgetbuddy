// Transaction data
var transactions = [];
var currentBalance = 0;

// Get data from local storage if available
var storedTransactions = localStorage.getItem('transactions');
var storedBalance = localStorage.getItem('balance');

if (storedTransactions) {
  transactions = JSON.parse(storedTransactions);
  currentBalance = parseFloat(storedBalance);
  updateBalance();
  displayTransactions();
  updateChart();
}

// Update initial balance if available
var initialBalanceInput = document.getElementById('initial-balance-input');
if (storedBalance) {
  initialBalanceInput.value = storedBalance;
}

function setInitialBalance() {
  var input = document.getElementById('initial-balance-input');
  var balance = parseFloat(input.value);

  if (isNaN(balance)) {
    alert('Please enter a valid balance.');
    return;
  }

  currentBalance = balance;
  updateBalance();

  // Save data to local storage
  saveDataToLocalStorage();
}

function addTransaction() {
  var transactionType = document.getElementById('transaction-type').value;
  var transactionAmount = parseFloat(document.getElementById('transaction-amount').value);
  var transactionDescription = document.getElementById('transaction-description').value;

  if (isNaN(transactionAmount) || transactionDescription.trim() === '') {
    alert('Please enter a valid amount and description.');
    return;
  }

  var newBalance;
  if (transactionType === 'add') {
    newBalance = currentBalance + transactionAmount;
  } else if (transactionType === 'subtract') {
    if (transactionAmount > currentBalance) {
      alert('Insufficient balance for the transaction.');
      return;
    }
    newBalance = currentBalance - transactionAmount;
  }

  var transaction = {
    type: transactionType,
    amount: transactionAmount,
    description: transactionDescription
  };

  transactions.push(transaction);
  currentBalance = newBalance;

  // Clear input fields
  document.getElementById('transaction-amount').value = '';
  document.getElementById('transaction-description').value = '';

  displayTransactions();
  updateChart();

  // Save data to local storage
  saveDataToLocalStorage();
}

function displayTransactions() {
  var transactionList = document.getElementById('transaction-list');
  transactionList.innerHTML = '';

  transactions.forEach(function (transaction, index) {
    var transactionItem = document.createElement('li');
    transactionItem.innerHTML = `
      <div class="transaction-card">
        <span>${transaction.description}</span>
        <span>${transaction.type === 'add' ? '+' : '-'} $${transaction.amount.toFixed(2)}</span>
        <span class="edit-btn" onclick="editTransaction(${index})">Edit</span>
        <span class="delete-btn" onclick="deleteTransaction(${index})">Delete</span>
      </div>
    `;
    transactionList.appendChild(transactionItem);
  });

  updateBalance();
}

function updateBalance() {
  var balanceElement = document.getElementById('initial-balance-input');
  balanceElement.value = currentBalance.toFixed(2);
}

function editTransaction(index) {
  var transaction = transactions[index];

  var newAmount = prompt('Enter the new amount:', transaction.amount);
  if (newAmount === null) {
    return;
  }
  newAmount = parseFloat(newAmount);
  if (isNaN(newAmount)) {
    alert('Please enter a valid amount.');
    return;
  }

  var newDescription = prompt('Enter the new description:', transaction.description);
  if (newDescription === null) {
    return;
  }

  var difference = newAmount - transaction.amount;

  transaction.amount = newAmount;
  transaction.description = newDescription;

  if (transaction.type === 'add') {
    currentBalance += difference;
  } else if (transaction.type === 'subtract') {
    currentBalance -= difference;
  }

  displayTransactions();
  updateChart();

  // Save data to local storage
  saveDataToLocalStorage();
}

function deleteTransaction(index) {
  var deletedTransaction = transactions[index];

  transactions.splice(index, 1);

  if (deletedTransaction.type === 'add') {
    currentBalance -= deletedTransaction.amount;
  } else if (deletedTransaction.type === 'subtract') {
    currentBalance += deletedTransaction.amount;
  }

  displayTransactions();
  updateChart();

  // Save data to local storage
  saveDataToLocalStorage();
}

function updateChart() {
  var labels = transactions.map(function (transaction) {
    return transaction.description;
  });

  var amounts = transactions.map(function (transaction) {
    return transaction.amount;
  });

  var backgroundColors = transactions.map(function (transaction) {
    return transaction.type === 'add' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)';
  });

  var borderColors = transactions.map(function (transaction) {
    return transaction.type === 'add' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
  });

  var ctx = document.getElementById('chart').getContext('2d');
  if (window.transactionChart) {
    window.transactionChart.destroy();
  }
  window.transactionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Transaction Amount',
          data: amounts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      indexAxis: 'y',
      elements: {
        bar: {
          barThickness: 5, // Adjust the bar thickness as desired
          borderRadius: 5 // Adjust the bar corner radius as desired
        }
      }
    }
  });
}

function updatePieChart() {
  var goalInput = document.getElementById('goal-input');
  var goal = parseFloat(goalInput.value);

  // Store the goal value in local storage
  localStorage.setItem('goal', goal);

  if (isNaN(goal) || goal <= 0) {
    // If the goal is invalid, set it to 0
    goal = 0;
  }

  var remainingBalance = Math.max(goal - currentBalance, 0);
  var achievedBalance = Math.min(currentBalance, goal);

  var ctx = document.getElementById('pie-chart').getContext('2d');
  if (window.pieChart) {
    window.pieChart.destroy();
  }
  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Achieved Balance', 'Remaining Balance'],
      datasets: [
        {
          data: [achievedBalance, remainingBalance],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      elements: {
        arc: {
          borderWidth: 0 // Remove the border from the pie chart
        }
      },
      radius: '60%' // Adjust the radius as desired (e.g., '50%')
    }
  });
}

// Retrieve the goal value from local storage and set it in the input field
var storedGoal = localStorage.getItem('goal');
if (storedGoal) {
  document.getElementById('goal-input').value = storedGoal;
}

// Call the function to initially display the pie chart
updatePieChart();



function setGoal() {
  var goalInput = document.getElementById('goal-input');
  var goal = parseFloat(goalInput.value);

  if (isNaN(goal) || goal <= 0) {
    alert('Please enter a valid goal.');
    return;
  }

  updatePieChart();

  // Save data to local storage or perform any other desired actions
}

function saveDataToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('balance', currentBalance.toString());
}

// Run initial functions
displayTransactions();
updateChart();

// Export functions for external use
window.setInitialBalance = setInitialBalance;
window.addTransaction = addTransaction;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.setGoal = setGoal;
