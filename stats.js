const statusLine = document.getElementById('status');
const reload = document.getElementById('reload');
const scoreKeys = Array.from({ length: 11 }, (_, score) => 'score-' + score);
const keys = ['plays', 'done', 'calm', 'blitz', ...scoreKeys];
const format = new Intl.NumberFormat('ru-RU');

async function load() {
  reload.disabled = true;
  const totals = {};
  try {
    for (const [index, key] of keys.entries()) {
      statusLine.textContent = 'Загружаем статистику… ' + (index + 1) + ' из ' + keys.length;
      totals[key] = await counterRequest('get', key);
      if (index < keys.length - 1) await new Promise(resolve => setTimeout(resolve, 250));
    }
    for (const key of keys.slice(0, 4)) document.getElementById(key).textContent = format.format(totals[key]);
    document.getElementById('totals').hidden = false;
    const highest = Math.max(1, ...scoreKeys.map(key => totals[key]));
    document.getElementById('scores').replaceChildren(...scoreKeys.map((key, score) => {
      const row = document.createElement('div');
      const label = document.createElement('span');
      label.textContent = score + ' из 10 · ' + format.format(totals[key]);
      const bar = document.createElement('progress');
      bar.className = 'bar';
      bar.max = highest;
      bar.value = totals[key];
      bar.setAttribute('aria-label', label.textContent);
      row.append(label, bar);
      return row;
    }));
    document.getElementById('distribution').hidden = false;
    statusLine.textContent = 'Обновлено в ' + new Date().toLocaleTimeString('ru-RU');
  } catch (error) {
    statusLine.textContent = 'Счётчик временно недоступен. Попробуйте обновить страницу.';
    console.warn(error);
  } finally {
    reload.disabled = false;
  }
}

reload.onclick = load;
load();
