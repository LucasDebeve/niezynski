let dataBirth = {};
let day = 0;
let month = 0;
let hour = 0;
let minute = 0;
let year = 0;

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        dataBirth = data;
        // dataBirth.birthday = "15-01"
        day = parseInt(dataBirth.birthday.split('-')[0]);
        month = parseInt(dataBirth.birthday.split('-')[1]);
        hour = parseInt(dataBirth.birthHour.split(':')[0]);
        minute = parseInt(dataBirth.birthHour.split(':')[1]);

        year = dataBirth.birthYear;
        document.getElementById('birth').innerText = year;
        document.getElementById('name').innerText = dataBirth.name;

        start();
    })
    .catch(error => console.error('Error fetching birthday data:', error));

function start() {
    const ctxDays = document.getElementById('daysUntil');
    const ctxHours = document.getElementById('hoursUntil');
    const ctxMinutes = document.getElementById('minutesUntil');
    const ctxSeconds = document.getElementById('secondsUntil');

    const defaultOptions = {
        rotation: Math.PI,
        cutout: '90%',
        borderWidth: 0,
        borderRadius: 10,
        // size
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        maintainAspectRatio: true,
        // don't show the legend
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            },
        }
    };

    const daysChart = new Chart(ctxDays, {
        type: 'doughnut',
        data: {
            labels: ['Days Passed', 'Days Remaining'],
            datasets: [{
                data: [0, 365],
                backgroundColor: ['#FF6384', 'transparent']
            }]
        },
        options: defaultOptions
    });

    const hoursChart = new Chart(ctxHours, {
        type: 'doughnut',
        data: {
            labels: ['Hours Passed', 'Hours Remaining'],
            datasets: [{
                data: [0, 24],
                backgroundColor: ['#36A2EB', 'transparent']
            }]
        },
        options: defaultOptions,
    });

    const minutesChart = new Chart(ctxMinutes, {
        type: 'doughnut',
        data: {
            labels: ['Minutes Passed', 'Minutes Remaining'],
            datasets: [{
                data: [0, 60],
                backgroundColor: ['#5200FF', 'transparent']
            }]
        },
        options: defaultOptions,
    });

    const secondsChart = new Chart(ctxSeconds, {
        type: 'doughnut',
        data: {
            labels: ['Seconds Passed', 'Seconds Remaining'],
            datasets: [{
                data: [0, 60],
                backgroundColor: ['#FF005C', 'transparent']
            }]
        },
        options: defaultOptions,
    });

    function updateCharts() {
        const now = new Date();
        const nextJan15 = new Date(now.getFullYear() + (now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() > day) ? 1 : 0), month - 1, day, hour, minute, 0, 0);
        const diff = nextJan15 - now;
        // 15 janvier 2022
        document.getElementById('date').innerText = nextJan15.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('daysUntilText').innerText = `${days} j`;
        document.getElementById('hoursUntilText').innerText = `${hours} h`;
        document.getElementById('minutesUntilText').innerText = `${minutes} min`;
        document.getElementById('secondsUntilText').innerText = `${seconds} s`;

        const agePrecis = now.getFullYear() - dataBirth.birthYear - (now.getMonth() > (month - 1) || (now.getMonth() === (month - 1) && now.getDate() >= day) ? 0 : 1);
        document.getElementById('age').innerText = agePrecis;

        daysChart.data.datasets[0].data = [365 - days, days];
        hoursChart.data.datasets[0].data = [24 - hours, hours];
        minutesChart.data.datasets[0].data = [60 - minutes, minutes];
        secondsChart.data.datasets[0].data = [60 - seconds, seconds];

        daysChart.update();
        hoursChart.update();
        minutesChart.update();
        secondsChart.update();
    }

    setInterval(updateCharts, 1000);
    updateCharts();
}

fetch('mdp.json')
    .then(response => response.json())
    .then(data => {
        const mdpInput = document.querySelector('#mdp input');
        const mdpForm = document.querySelector('#mdp > form');
        const mdpMessage = document.querySelector('#message');
        const mdpButton = document.querySelector('#mdp button[type="submit"]');

        const possibilities = data.possibilities;

        mdpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!mdpInput.value || mdpInput.value.length < 2) {
                mdpInput.classList.add('error');
                // get the duration of the animation in the css to disable the button for the same duration
                const duration = parseFloat(window.getComputedStyle(mdpInput).animationDuration) * 1000;
                // disable button for the duration of shake animation
                mdpButton.disabled = true;
                setTimeout(() => {
                    mdpButton.disabled = false;
                    mdpInput.classList.remove('error')
                }, duration);
                return;
            }
            mdpInput.classList.remove('error');

            const mdp = mdpInput.value;

            /*
                "possibilities": [
                    {
                        "keywords": ["jo", "josephine", "copine", "meuf", "la j", "le j"],
                        "response": "🦆 CANARD ! 🦆"
                    },
                    {
                        "keywords": ["mateo", "moi", "moi-même", "me"],
                        "response": "Sale égoïste !"
                    }, 
                ]   
            */

            const found = possibilities.find(possibility => possibility.keywords.some(keyword => mdp.toLowerCase().includes(keyword)));
            if (found) {
                mdpMessage.innerText = found.response;
            } else {
                mdpMessage.innerText = data.defaultReponse;
            }

            mdpInput.value = '';
        });
    })
    .catch(error => console.error('Error fetching mdp data:', error));

document.querySelector('#ia form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('#ia input');
    input.value = "Serais-je chanceux ?";

    let i = 0;
    const txt = "D'après les données à disposition, il semblerait que depuis ta naissance, tu n'aies eu que très peu de chance. Mais ne t'inquiète pas, mes calculs prédisent que cette année sera la bonne ! 🍀"; /* The text */
    const speed = 30; /* The speed/duration of the effect in milliseconds */
    const prediction = document.getElementById('prediction_txt');
    prediction.innerHTML = '';

    function typeWriter(element) {
        console.log('typing');
        if (i < txt.length) {
            element.innerHTML += txt.charAt(i);
            i++;
            setTimeout(() => typeWriter(element), speed);
        }
    }

    typeWriter(prediction);

    const graph = document.querySelector('#prediction');
    year = 2004;
    // get years from birth year to current year
    const birthYear = parseInt(year);
    const data = {
        "2004": 90,
        "2005": 30,
        "2006": 20,
        "2007": 10,
        "2008": 11.5,
        "2009": 9.5,
        "2010": 15,
        "2011": 86,
        "2012": 32,
        "2013": 12,
        "2014": 9,
        "2015": 10,
        "2016": 27,
        "2017": 31,
        "2018": 82,
        "2019": 22,
        "2020": 3,
        "2021": 0,
        "2022": 11,
        "2023": 7,
        "2024": 100,
    }

    new Chart(graph, {
        type: 'bar',
        data: {
            datasets: [
                {
                    data: data,
                    label: 'Bilan de ta chance depuis ta naissance',
                    backgroundColor: ['#FF6384']
                },
                {
                    data: {
                        "2025": 112,
                        "2026": 121,
                    },
                    label: 'Prédiction de ta chance pour les prochaines années',
                    backgroundColor: ['rgba(99, 206, 255, 0.2)'],
                    grouped: false,
                    borderWidth: 1,
                    borderColor: ['#36A2EB'],
                }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                },
                tooltip: {
                    enabled: false
                },
                title: {
                    display: true,
                    text: 'Évolution de ta chance au fil des années',
                    font: {
                        size: 20
                    }
                },
            }
        }
    });
});
