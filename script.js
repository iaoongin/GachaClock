async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

function parseCountdownData(data) {
    if (!(data?.data?.contentJson?.sideModules || '')) {
        console.warn('Data structure is not as expected:', data);
        return [];
    }

    const sideModules = data.data.contentJson.sideModules;
    const countdownItems = [];

    sideModules.forEach(({ id, title, content }) => {
        // if (title === '角色唤取活动' || title === '武器活动唤取') {
        if (title === '角色唤取活动') {
            content.tabs.forEach((tab, index) => {
                const dateRange = tab.countDown?.dateRange;
                if (dateRange) {
                    const endDate = new Date(dateRange[1].replace(' ', 'T'));
                    const now = new Date();
                    const duration = Math.floor((endDate - now) / 1000);

                    const backgroundUrl = tab.imgs?.[0]?.img || '';

                    if (duration > 0) {
                        countdownItems.push({
                            id: `${id}-tab${index}`,
                            title,
                            duration,
                            backgroundUrl
                        });
                    }
                }
            });
        }
    });

    return countdownItems;
}

function createCard(elementId, title, backgroundUrl) {
    const cardContainer = document.querySelector('.card-container');
    const card = document.createElement('div');
    card.className = 'card';
    card.id = elementId;
    card.style.backgroundImage = `url(${backgroundUrl})`;
    card.style.backgroundSize = 'cover';
    card.style.color = 'white';

    const cardTitle = document.createElement('h2');
    cardTitle.textContent = title;

    const timer = document.createElement('p');
    timer.id = elementId + '-timer';
    timer.textContent = '00:00:00';

    card.appendChild(cardTitle);
    card.appendChild(timer);
    cardContainer.appendChild(card);
}

function startCountdown(elementId, duration) {
    let timer = duration, days, hours, minutes, seconds;
    setInterval(() => {
        days = Math.floor(timer / (3600 * 24));
        hours = Math.floor((timer % (3600 * 24)) / 3600);
        minutes = Math.floor((timer % 3600) / 60);
        seconds = timer % 60;

        const timerElement = document.getElementById(elementId + '-timer');
        if (timerElement) {
            timerElement.textContent = `还剩${days}天${hours}小时${minutes}分钟`;
        }

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

window.onload = async function() {
    const url = 'https://api.kurobbs.com/wiki/core/homepage/getPage';
    const options = {
        method: 'POST',
        headers: {
            'wiki_type': '9',
            'source': 'h5',
            'referer': 'https://wiki.kurobbs.com/'
        }
    };

    const data = await fetchData(url, options);
    const countdownItems = parseCountdownData(data);

    countdownItems.forEach(({ id, title, duration, backgroundUrl }) => {
        createCard(id, title, backgroundUrl);
        startCountdown(id, duration);
    });
}; 