const formSubmit = document.querySelector("#submit");
const inputSubmit = document.querySelector(".submit-input");
const containerError = document.querySelector(".container-error");
const containerResults = document.querySelector(".container-results")

const url = `https://api.weatherbit.io/v2.0/current?lang=pt&city=`;
const date = `http://api.timezonedb.com/v2.1/get-time-zone?key=T74IZDS0A1GO&format=json&by=position&lat=`;


const localStorageInfoCards = JSON.parse(localStorage
  .getItem('cards'))
let cardsInfo = localStorage
.getItem('cards') !== null ? localStorageInfoCards : []

const updateCardsLocalStorage = () => {
  localStorage.setItem('cards', JSON.stringify(cardsInfo))
}

const removeCard = ID => {
  cardsInfo = cardsInfo
  .filter(card => card.id !== ID)
  init()
}
const cleaningOfUnwanted = (input) => {
  const removeCaractes = /[`~!@#$%&*()_|+\-=?;:'"¨\s,.<>\{\}\[\]\\\/]/gi;
  const clearInput = input.trim().replace(removeCaractes, "");
  return clearInput;
};

const msgError = (msg) => {
  containerError.innerHTML = `<p class="msg-error">${msg}</p>`
};

const idGenerate = () => {
  return Math.round(Math.random() * 1000)
}

const templateInit = () => {
  containerResults.innerHTML = `
  <div>
  <p class="msgInit">Realize uma pesquisa</p>
  </div>
  `
}
const createTemplate = ( item ) =>{
  const descriptionWeather = item.weather.description
  const classResult = `
  results-cards ${cleaningOfUnwanted(descriptionWeather).toLowerCase()}
  `
  console.log(classResult)
  const div = document.createElement('div')
  div.setAttribute('class',classResult)
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
  `
  containerResults.appendChild(div)
}

const init = () => {
  containerResults.innerHTML = ''
  cardsInfo.forEach(createTemplate)
  if(cardsInfo.length === 0){
    templateInit()
  }
  updateCardsLocalStorage ()
}
const fetchDate = async (objectsWithin) => {
  const receiveDate = await fetch(
    `${date}${objectsWithin.lat}&lng=${objectsWithin.lon}`
  );
  const dateJson = await receiveDate.json();
  const dateFormatted = dateJson.formatted
  const {city_name,temp,app_temp,weather} = objectsWithin
  let id = idGenerate()
  cardsInfo.push({
    city_name,
    temp,
    app_temp,
    weather, 
    dateFormatted,
    id
  })
  init()
  
};

init()

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
    console.log(data[0])
    
    const objectsWithin = data[0];
    fetchDate(objectsWithin);
  } catch (msg) {
    msgError(msg);
  }
};

const handleEventSubmit = (e) => {
  e.preventDefault();
  const receiveImputClean = cleaningOfUnwanted(inputSubmit.value);
 
  if (!receiveImputClean) {
    msgError("Digite um termo válido");
    return;
  }console.log(receiveImputClean)
  fetchWeather(receiveImputClean);
  
};

formSubmit.addEventListener("submit", handleEventSubmit);
