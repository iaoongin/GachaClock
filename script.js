window.onload = async function () {
  // yyyyMMdd
  currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  
  await load(`spider/data/${currentDate}/zzz.json`)
  await load(`spider/data/${currentDate}/sr.json`)
  await load(`spider/data/${currentDate}/ww.json`)
};

async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

function createCard(cardGroup, title, backgroundUrl) {
  const card = document.createElement("div");
  card.className = "card";
  card.id = title;
  card.style.backgroundImage = `url(${backgroundUrl})`;
  card.style.backgroundSize = "cover";
  card.style.color = "white";

  const cardFooter = document.createElement("div");
  cardFooter.className = "card-footer";

  const cardTitle = document.createElement("h2");
  cardTitle.textContent = title;

  cardFooter.appendChild(cardTitle);
  card.appendChild(cardFooter);
  cardGroup.appendChild(card);
}

function createCardGroup(elementId){
  const cardContainer = document.querySelector(".card-container");
  const cardGroup = document.createElement("div");
  cardGroup.className = "card-group";
  cardGroup.id = elementId;
  cardGroup.style.backgroundSize = "cover";
  cardGroup.style.color = "white";

  const cardGroupHeader = document.createElement("div");
  cardGroupHeader.className = "card-group-header";

  const cardTitle = document.createElement("h1");
  cardTitle.textContent = '当前卡池';

  const timer = document.createElement("h1");
  timer.id = elementId + "-timer";
  timer.textContent = "还剩0天0小时0分钟";

  cardGroupHeader.appendChild(cardTitle);
  cardGroupHeader.appendChild(timer);
  cardGroup.appendChild(cardGroupHeader);
  cardContainer.appendChild(cardGroup);
  return cardGroup;
}

function startCountdown(elementId, duration) {
  let timer = duration,
    days,
    hours,
    minutes,
    seconds;
  setInterval(() => {
    days = Math.floor(timer / (3600 * 24));
    hours = Math.floor((timer % (3600 * 24)) / 3600);
    minutes = Math.floor((timer % 3600) / 60);
    seconds = timer % 60;

    const timerElement = document.getElementById(elementId + "-timer");
    if (timerElement) {
      timerElement.textContent = `还剩${days}天${hours}小时${minutes}分钟`;
    }

    if (--timer < 0) {
      timer = duration;
    }
  }, 1000);
}

async function load(url){
  const data = await fetchData(url);

  if (!data.length) {
    return createCard(
      "none",
      "解析失败",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    );
  }

  const cardGroupId = url
  const cardGroup = createCardGroup(cardGroupId);

  data.forEach(({ title, type, timer, gachas }) => {
    gachas.forEach(({ title, img_path }) => {
      createCard(cardGroup, title, 'spider/' + img_path);
    });
    duration = new Date(timer[1]).getTime() - new Date().getTime();
  });

  
  startCountdown(cardGroupId, duration / 1000);

}


