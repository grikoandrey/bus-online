// alert("Hello my friend!")
const fetchBusData = async () => {
    try {
        const response = await fetch('/next-departure');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    // const buses = response.json();
    return response.json();
    } catch (error) {
        console.error(`Что-то пошло не так: ${error}`)
    }
};

const formatDate = (date) => date.toISOString().split('T')[0];
const formatTime = (date) => date.toTimeString().split(' ')[0].slice(0, 5);

const getTimeRemainingSeconds = (departureTime) => {
    const now = new Date();
    const timeDeference = departureTime - now;
    return Math.floor(timeDeference / 1000);
}

const renderBusData = (buses) => {
    const tableBody = document.querySelector('#bus tbody');
    tableBody.textContent = '';

    // console.log(buses);
    buses.forEach((bus) => {
        const row = document.createElement('tr');

        const nextDepartureDateTimeUTC = new Date (
            `${bus.nextDeparture.date}T${bus.nextDeparture.time}Z`,
        );

        // console.log(nextDepartureDateTimeUTC);
        const remainingSeconds = getTimeRemainingSeconds(nextDepartureDateTimeUTC);
        const remainingTimeText = remainingSeconds < 60 ? 'Отправляется' : bus.nextDeparture.remaining;

        row.innerHTML = `
            <td>${bus.busNumber}</td>
            <td>${bus.startPoint} - ${bus.endPoint}</td>
            <td>${formatDate(nextDepartureDateTimeUTC)}</td>
            <td>${formatTime(nextDepartureDateTimeUTC)}</td>
            <td>${remainingTimeText}</td>
        `;
        tableBody.append(row);
    });
};

const initWebSocket = () => {
    const ws = new WebSocket(`ws://${location.host}`);

    ws.addEventListener('open', () => {
        console.log('WebSocket connected');
    });

    ws.addEventListener('message', (event) => {
        const buses = JSON.parse(event.data);
        // console.log('buses:', buses);
        renderBusData(buses);
    });

    ws.addEventListener('error', (error) => {
        console.log(`WebSocket error: ${error}`);
    });

    ws.addEventListener('closed', () => {
        console.log(`WebSocket closed!`);
    });
};

const updateTime = () => {
    const currentTimeElement = document.getElementById('current-time');
    const now = new Date();
    currentTimeElement.textContent = now.toTimeString().split(' ')[0];

    setTimeout(updateTime, 1000);
};

const init = async () => {
    const buses = await fetchBusData();
    renderBusData(buses);

    initWebSocket();

    updateTime();
};

init();
