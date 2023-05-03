'use strict';

let available_airports = [];
let ownedAirports = [];
let playerMoney = 1000000;
document.getElementById('money').innerHTML = playerMoney + '€';
// Timer
let seconds = 365;
let timer = setInterval(function() {
    document.getElementById('timer').innerHTML = seconds;
    seconds--;
    if (seconds < 0) {
        clearInterval(timer);
        alert("Time's up!");
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
  console.log(1)
  const airportNames = JSON.parse(sessionStorage.getItem('airportNames'));
  const randomAirportName = airportNames[Math.floor(Math.random() * airportNames.length)];
  console.log(randomAirportName)
  return fetch(`http://127.0.0.1:3000/new_airport/${randomAirportName}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    });
}

// Function to create and position an element based on the airport data's latitude and longitude
function createAirportElement(data) {
  const element = document.createElement('div');
  element.className = 'airport';
  element.style.top = `${(data.latitude + 90) / 180 * 100}%`; // Convert latitude to percentage
  element.style.left = `${(data.longitude + 180) / 360 * 100}%`; // Convert longitude to percentage
  element.innerText = data.name;
  document.body.appendChild(element);

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
//currency controls
function LoanPrompt() {
  const loanAmount = prompt("Enter loan amount:");
  // Add code to update the money and debt values here
  const currentMoney = parseInt(document.getElementById("money").innerText);
  const newMoney = currentMoney + parseInt(loanAmount);
  document.getElementById("money").innerText = newMoney;

  const currentDebt = parseInt(document.getElementById("debt").innerText);
  const newDebt = currentDebt + parseInt(loanAmount);
  document.getElementById("debt").innerText = newDebt;
}

function DebtPrompt() {
  const debtAmount = prompt("Enter debt amount:");
  // Add code to update the money and debt values here
  const currentMoney = parseInt(document.getElementById("money").innerText);
  const newMoney = currentMoney - parseInt(debtAmount);
  document.getElementById("money").innerText = newMoney;

  const currentDebt = parseInt(document.getElementById("debt").innerText);
  const newDebt = currentDebt - parseInt(debtAmount);
  document.getElementById("debt").innerText = newDebt;
}

//Buying airports

let airportData;

async function loadAirportData() {
  const response = await fetch('airport_data.json');
  airportData = await response.json();
}

loadAirportData();


async function buyAirport(code) {
  const airportPrice = airportData[code].price;
  if (playerMoney >= airportPrice) {
    playerMoney -= airportPrice;
    document.getElementById('money').innerHTML = playerMoney;
    const response = await fetch(`http://127.0.0.1:3000/buy_airport/${code}`);
    const data = await response.json();
    setInterval(function() {
      playerMoney += airportData[code].revenue;
      document.getElementById('money').innerHTML = playerMoney;
    }, 1000);
  } else {
    alert('Not enough money!');
  }
}



// Call the function to start placing random airports

storeAirportNamesInSession();

placeRandomAirport();