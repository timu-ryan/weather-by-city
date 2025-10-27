import { createChartRenderer } from './chart.js';

const form = document.getElementById('searchForm');
const cityInput = document.getElementById('city');
const statusEl = document.getElementById('status');
const resultSection = document.getElementById('result');
const cityNameEl = document.getElementById('cityName');
const timezoneEl = document.getElementById('timezone');
const coordinatesEl = document.getElementById('coordinates');
const sourceEl = document.getElementById('source');
const chartContainer = document.getElementById('chart');
const presetButtons = document.querySelectorAll('[data-city]');
const submitButton = form.querySelector('button');

const chartRenderer = createChartRenderer(chartContainer);
chartRenderer.reset();

async function fetchWeather(city) {
  const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    let message = 'Не удалось получить прогноз';
    try {
      const body = await response.json();
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return response.json();
}

function updateMeta(payload) {
  cityNameEl.textContent = payload.city;
  timezoneEl.textContent = payload.timezone;
  coordinatesEl.textContent = `${payload.coordinates.latitude.toFixed(2)}, ${payload.coordinates.longitude.toFixed(2)}`;
  sourceEl.textContent = payload.source === 'cache' ? 'Из кэша' : 'Получено из API';
}

function handleSubmitCity(city) {
  cityInput.value = city;
  if (typeof form.requestSubmit === 'function') {
    form.requestSubmit();
  } else {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
}

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { city } = button.dataset;
    if (!city) {
      return;
    }
    handleSubmitCity(city);
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    return;
  }

  statusEl.textContent = 'Загружаю прогноз...';
  submitButton.disabled = true;
  resultSection.hidden = true;
  chartRenderer.loading('Рисую график...');

  try {
    const payload = await fetchWeather(city);
    updateMeta(payload);
    chartRenderer.render(payload.hourly, { city: payload.city, timezone: payload.timezone });
    statusEl.textContent = `Прогноз обновлён ${new Date(payload.fetchedAt).toLocaleString('ru-RU')}`;
    resultSection.hidden = false;
  } catch (error) {
    statusEl.textContent = error instanceof Error ? error.message : 'Неожиданная ошибка';
    chartRenderer.reset('Не удалось загрузить данные.');
  } finally {
    submitButton.disabled = false;
  }
});
