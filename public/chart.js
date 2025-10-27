function createSkeleton() {
  const skeleton = document.createElement('div');
  skeleton.className = 'skeleton';
  skeleton.setAttribute('aria-hidden', 'true');
  return skeleton;
}

export function createChartRenderer(container) {
  let chartInstance;
  let canvas;
  let skeleton;

  function ensureCanvas() {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'График температуры');
    }

    if (!container.contains(canvas)) {
      container.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Не удалось инициализировать canvas');
    }

    return ctx;
  }

  function showSkeleton(message) {
    if (!container) {
      return;
    }

    if (!skeleton) {
      skeleton = createSkeleton();
    }

    container.textContent = '';
    container.appendChild(skeleton);

    if (message) {
      skeleton.setAttribute('data-message', message);
    } else {
      skeleton.removeAttribute('data-message');
    }
  }

  function destroyChart() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = undefined;
    }
    if (canvas && canvas.parentElement === container) {
      container.removeChild(canvas);
    }
    if (skeleton && skeleton.parentElement === container) {
      container.removeChild(skeleton);
    }
  }

  function render(hourly, options = {}) {
    if (!container) {
      return;
    }

    destroyChart();
    if (!hourly.length) {
      container.textContent = 'Нет данных для отображения.';
      return;
    }

    if (typeof Chart === 'undefined') {
      container.textContent = 'Chart.js не найден. Проверьте подключение.';
      return;
    }

    container.textContent = '';

    let ctx;
    try {
      ctx = ensureCanvas();
    } catch (error) {
      container.textContent = error instanceof Error ? error.message : 'Ошибка инициализации графика.';
      return;
    }

    const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const labels = hourly.map((point) => timeFormatter.format(new Date(point.time)));
    const temps = hourly.map((point) => point.temperature);

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: options.city ? `${options.city}${options.timezone ? ` · ${options.timezone}` : ''}` : 'Температура',
            data: temps,
            fill: false,
            borderColor: '#2563eb',
            backgroundColor: '#2563eb',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: {
              callback: (value) => `${value}°C`,
            },
            beginAtZero: false,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y.toFixed(1)}°C`,
            },
          },
        },
      },
    });
  }

  function reset(message = 'График появится после запроса.') {
    destroyChart();
    if (message) {
      container.textContent = message;
    } else {
      showSkeleton();
    }
  }

  function loading(message = 'Строю график...') {
    destroyChart();
    showSkeleton(message);
  }

  return { render, reset, loading };
}
