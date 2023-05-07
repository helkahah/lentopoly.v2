'use strict';

let availableAirports = [];
let ownedAirports = [];
let playerMoney = 10000000;
let playerDebt = 0;
document.getElementById('debt').innerHTML = playerDebt;
document.getElementById('money').innerHTML = playerMoney;
// Timer
let seconds = 60;
let timer = setInterval(function() {
    document.getElementById('timer').innerHTML = seconds;
    seconds--;
    if (seconds < 0) {
        clearInterval(timer);
        alert("Time's up!");
        window.location.replace(`endscreen.html?revenue=${totalRevenue}&debt=${playerDebt}`);
    }
}, 1000);

// Function to retrieve all airport names from the Python script using Flask
async function getAllAirportNames() {
  const response = await fetch('http://127.0.0.1:3000/get_all');
  const data = await response.json();
  return data;
}

// Store the airport names in the session
async function storeAirportNamesInSession() {
  const airportNames = await getAllAirportNames();
  sessionStorage.setItem('airportNames', JSON.stringify(airportNames));
}

// Function to call a random airport using the previously loaded name list
function getRandomAirport() {
  const airportNames = JSON.parse(sessionStorage.getItem('airportNames'));
  const randomAirportName = airportNames[Math.floor(Math.random() * airportNames.length)];

  return fetch(`http://127.0.0.1:3000/new_airport/${randomAirportName}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.log('Error:', error.message);
      return getRandomAirport(); // retry the function
    });
}
let airportInfo = null;
// Function to create and position an element based on the airport data's latitude and longitude

function createAirportElement(data) {
  const element = document.createElement('div');
  element.className = 'airport';
  const invertLatitude = data.latitude * -1;
  element.style.top = `${(invertLatitude + 90) / 180 * 100}%`; // Convert latitude to percentage
  element.style.left = `${(data.longitude + 180) / 360 * 100}%`; // Convert longitude to percentage

  // Create the text element and hide it initially
  const textElement = document.createElement('div');
  textElement.className = 'airport-text';
  textElement.innerText = data.name;
  textElement.style.display = 'none';
  element.appendChild(textElement);

  // Add event listeners to show/hide the text element
  element.addEventListener('mouseenter', () => {
    textElement.style.display = 'block';
  });
  element.addEventListener('mouseleave', () => {
    textElement.style.display = 'none';
  });

  const timer = setTimeout(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
      const index = availableAirports.findIndex((airport) => airport.name === data.name);
      availableAirports.splice(index, 1);
    }
  }, 30000);

  // Airport information and purchase
  element.addEventListener('click', () => {
    clearTimeout(timer);
    if (airportInfo !== null) {
      alert("Close the previous one first.")
      return;
    }
    airportInfo = document.createElement('div');
    airportInfo.className = 'airport-info';
    airportInfo.innerHTML = `
    <h2 id="airport-name">${data.name}</h2>
    <p id="variables">Price: ${data.price}</p>
    <p id="variables">Revenue: ${data.revenue}</p>
    <p id="variables">Type: ${data.type}</p>
    <button id="buy-button">Buy Airport</button>
    <button id="close-button">Close</button>
  `;
    document.body.appendChild(airportInfo);

    const buyButton = document.getElementById('buy-button');
    buyButton.addEventListener('click', () => {
      const buy = confirm('Do you want to buy this airport?');
      if (buy) {
        const currentMoney = parseInt(
            document.getElementById("money").innerText);
        // Check if player has enough money to buy the airport
        if (currentMoney < data.price) {
          confirm("You don't have enough money to buy this airport.");
        } else {
          const newMoney = currentMoney - data.price;
          document.getElementById("money").innerText = newMoney;
          element.style.backgroundImage = "url('images/bluebutton.png')";
          airportInfo.remove();// Remove the airport-info element after buying
          airportInfo = null;
          clearTimeout(timer);
          // Move the bought airport from the availableAirports array to the ownedAirports array
          const index = availableAirports.findIndex((airport) => airport.name === data.name);
          const boughtAirport = availableAirports.splice(index, 1)[0];
          ownedAirports.push(boughtAirport);
        }
      } else {
        return;
      }
    });

    const closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', () => {
      airportInfo.remove(); // Remove the airport-info element when the close button is clicked
      airportInfo = null;
    });
  });

  document.body.appendChild(element);
  // Add the newly created airport to the availableAirports array
  availableAirports.push(data);
}

// Function to get a random airport and create an element for it every second
async function placeRandomAirport() {
  let airportNames = JSON.parse(sessionStorage.getItem('airportNames'));
  if (!airportNames || airportNames.length === 0) {
    console.log('Waiting for airport names to be loaded...');
    setTimeout(placeRandomAirport, 1000);

    return;
  }

  const data = await getRandomAirport();
  createAirportElement(data);
  setTimeout(placeRandomAirport, 1000);
}

// Loan, Debt, Interest and Revenue functions

function LoanPrompt() {

  let loanAmount = prompt("Enter loan amount:");
  if (loanAmount === null) {
    return
  }
  //check if the value is a number
  while (isNaN(loanAmount)) {
    loanAmount = prompt("Only numbers are accepted. Enter loan amount:");
    if (loanAmount === null) {
    return
  }
  }
  // Add code to update the money and debt values here
  const currentMoney = parseInt(document.getElementById("money").innerText);
  const newMoney = currentMoney + parseInt(loanAmount);
  document.getElementById("money").innerText = newMoney;

  const currentDebt = parseInt(document.getElementById("debt").innerText);
  const newDebt = currentDebt + parseInt(loanAmount);
  document.getElementById("debt").innerText = newDebt;
}

function DebtPrompt() {
  let debtAmount = prompt("How much of your debt do you want to pay:");
  if (debtAmount === null) {
    return
  }
  // Check if the given value is a number
    while (isNaN(debtAmount)) {
    debtAmount = prompt("Only numbers are accepted. Enter debt amount you want to pay:");
    if (debtAmount === null) {
    return
  }
  }
  // Add code to update the money and debt values here
  const currentMoney = parseInt(document.getElementById("money").innerText)
  // Check if the player has enough money to pay the debt
    while (debtAmount > currentMoney) {
      debtAmount = prompt("You don't have enough money to pay this much debt. Enter an amount you can afford:")
      if (debtAmount === null) {
      return
  }
    }
  const newMoney = currentMoney - parseInt(debtAmount);
  document.getElementById("money").innerText = newMoney;

  const currentDebt = parseInt(document.getElementById("debt").innerText);
  // Check if the player has the given value of debt to pay
    while (currentDebt < debtAmount) {
      debtAmount = prompt("You don't have this much debt to pay. Enter a new debt amount:")
      if (debtAmount === null) {
      return
  }
    }
  const newDebt = currentDebt - parseInt(debtAmount);
  document.getElementById("debt").innerText = newDebt;
  playerDebt = newDebt;
}

function increaseDebt() {
  const currentDebt = document.getElementById('debt').innerText;
  const interestRate = 1.05;

  let newDebt;
  if (currentDebt === '') {
    newDebt = loanAmount;
  } else {
    newDebt = parseFloat(currentDebt);
  }

  // Calculate new debt with interest
  newDebt *= interestRate;

  // Update debt element with new debt amount
  document.getElementById('debt').innerText = newDebt.toFixed(0);
  playerDebt = newDebt;
}


let totalRevenue = 0;

// Function to add revenue to player's money
function addRevenue() {
  // Loop through ownedAirports array and add revenue to player's money
  ownedAirports.forEach((airport) => {
    const revenue = airport.revenue;
    const currentMoney = parseInt(document.getElementById("money").innerText);
    const newMoney = currentMoney + revenue;
    totalRevenue += revenue;
    document.getElementById("money").innerText = newMoney;
  });
}

// Start the revenue interval
setInterval(addRevenue, 5000);
setInterval(increaseDebt, 10000);


let airportData;

async function loadAirportData() {
  const response = await fetch('airport_data.json');
  airportData = await response.json();
}

loadAirportData();

// Call the function to start placing random airports

storeAirportNamesInSession();

placeRandomAirport();