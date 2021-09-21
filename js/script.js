const formSubmit = document.querySelector("#submit");
const inputSubmit = document.querySelector(".submit-input");
const containerError = document.querySelector(".container-warning");
const containerResults = document.querySelector(".container-results");
const containerInformation = document.querySelector(".container-information")

const url = `https://api.weatherbit.io/v2.0/current?lang=pt&city=`;
const date = `http://api.timezonedb.com/v2.1/get-time-zone?key=T74IZDS0A1GO&format=json&by=position&lat=`;

const localStorageInfoCards = JSON.parse(localStorage.getItem("cards"));
let cardsInfo =
  localStorage.getItem("cards") !== null ? localStorageInfoCards : [];

const updateCardsLocalStorage = () => {
  localStorage.setItem("cards", JSON.stringify(cardsInfo));
};

const removeCard = (ID) => {
  cardsInfo = cardsInfo.filter((card) => card.id !== ID);
  init();
};
const cleaningOfUnwanted = (input) => {
  const removeCaractes = /[`~!@#$%&*()_|+\-=?;:'"¨\s,.<>\{\}\[\]\\\/]/gi;
  const clearInput = input.trim().replace(removeCaractes, "");
  return clearInput;
};

const MaxAndMinTemperature = (max,min) => {
  if(cardsInfo.length < 2){
    containerInformation.innerHTML = `<p>Ainda não há dados suficientes para informar`
    return
  }
  containerInformation.innerHTML = `
  <div class="maxTemp">
    <i class="fas fa-arrow-up"></i>
    <div class="wrapper-span">
    <span class="max-city">${max.city_name}</span>
    <span class="max-temp">${max.temp}°C</span>
    </div>
  </div>
  <div class="minTemp">
    <i class="fas fa-arrow-down"></i>
    <div class="wrapper-span">
    <span class="min-city">${min.city_name}</span>
    <span class="min-temp">${min.temp}°C</span>
    </div>
  </div>
  `
};

const maxTemp = () => {
  return cardsInfo.reduce((acc, item) => {
    return item.temp > acc.temp ? item : acc;
  });
};
const minTemp = () => {
  return cardsInfo.reduce((acc, item) => {
    return item.temp > acc.temp ? acc : item;
  });
};

const msgWarning = (msg) => {
  containerError.innerHTML = `<t class="msg-error">${msg}</p>`;
  setTimeout(()=>{
    containerError.innerHTML = ''
  },2000)
};

const idGenerate = () => {
  return Math.round(Math.random() * 1000);
};

const templateInit = () => {
  containerResults.innerHTML = `
  <div>
  <p class="msgInit">Realize uma pesquisa</p>
  </div>
  `;
};
const createTemplate = (item) => {
  const descriptionWeather = item.weather.description;
  const classResult = `
  results-cards ${cleaningOfUnwanted(descriptionWeather).toLowerCase()}
  `;
  const div = document.createElement("div");
  div.setAttribute("class", classResult);
  div.innerHTML = `
  <button class="btn-closed" 
  onclick="removeCard(${item.id})">X</button>
  <h1 class="results-city text--mod">${item.city_name}</h1>
  <p class="results-descri text--mod">${descriptionWeather}</p>
  <p class="results-temp text--mod">${item.temp}°C</p>
  <p class="results-senstemp text--mod">
  sensação termica ${item.app_temp}°C
  </p>
  <p class="date text--mod">${item.dateFormatted}</p>
  `;
  containerResults.appendChild(div);
  
};

const init = () => {
  containerResults.innerHTML = "";
  cardsInfo.forEach(createTemplate);
  if (cardsInfo.length === 0) {
    templateInit();
  }
  else if(cardsInfo.length >= 1){
    MaxAndMinTemperature(maxTemp(),minTemp());
  }
  updateCardsLocalStorage();
};

const fetchDate = async (objectsWithin) => {
  const receiveDate = await fetch(
    `${date}${objectsWithin.lat}&lng=${objectsWithin.lon}`
  );
  const dateJson = await receiveDate.json();
  const dateFormatted = dateJson.formatted;
  const { city_name, temp, app_temp, weather } = objectsWithin;
  let id = idGenerate();
  cardsInfo.push({
    city_name,
    temp,
    app_temp,
    weather,
    dateFormatted,
    id,
  });
  init();
};

init();

const fetchWeather = async (city) => {
  try {
    const response = await fetch(
      `${url}${city}&key=9be5562b5c1f45d0b373ffdcfda809e3`
    );
    if (response.status !== 200) {
      throw new Error("Não foi possível obter a localização");
    }
    containerError.innerHTML = "";

    const { data } = await response.json();
    const objectsWithin = data[0];
    fetchDate(objectsWithin);
  } catch (msg) {
    msgWarning(msg);
  }
};

const handleEventSubmit = (e) => {
  e.preventDefault();
  const receiveImputClean = cleaningOfUnwanted(inputSubmit.value);

  if (!receiveImputClean) {
    msgWarning("Digite um termo válido");
    return;
  } else if (cardsInfo.length > 4) {
    msgWarning("Limite máximo de busca");
    return;
  }

  fetchWeather(receiveImputClean);
};

formSubmit.addEventListener("submit", handleEventSubmit);
