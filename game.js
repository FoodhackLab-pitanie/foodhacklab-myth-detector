const questions = [
  ['🍽','Геометрия посуды',false,
    'Если купить маленькую тарелку, человек автоматически будет накладывать меньше еды и легко похудеет.',
    'Размер тарелки сам по себе не гарантирует, что человек съест меньше. На количество еды влияют размер порции, состав блюда и возможность взять добавку.',
    'Попробуйте зонирование: половину тарелки заполните овощами, четверть белковым продуктом и четверть гарниром.'],
  ['🥕','Физика текстуры',true,
    'Плотная еда, которую нужно дольше жевать, может замедлять темп еды и уменьшать количество съеденного.',
    'Текстура влияет на скорость, с которой мы едим. В исследовании RESTRUCTURE участники ели меньше калорий на рационе, требующем более долгого жевания.',
    'Попробуйте заменить часть пюре или соков цельными овощами и фруктами.'],
  ['🧬','Биохимия гормонов',false,
    'Порядок поедания блюд на одной тарелке не влияет на гормоны: в желудке всё равно всё перемешается.',
    'В исследованиях приём овощей и белка перед углеводами менял уровень глюкозы после еды и выработку ГПП-1. Величина эффекта зависит от блюда и участника.',
    'Начните с овощей и белка, затем переходите к гарниру.'],
  ['🔪','Восприятие порции',true,
    'Один и тот же по весу кусок стейка или кекса, нарезанный на мелкие кусочки, может выглядеть как более сытная порция.',
    'Кусочки можно распределить по большей площади. Видимый объём блюда влияет на то, насколько сытным оно кажется до первого укуса.',
    'Попробуйте нарезать продукты небольшими ломтиками и свободнее разложить их на тарелке.'],
  ['🥄','Темп трапезы',true,
    'Небольшие приборы могут уменьшать размер каждого укуса и замедлять темп еды.',
    'Размер ложки или вилки влияет на то, сколько еды попадает в рот за один раз. Более медленный темп даёт время заметить, когда вы наелись.',
    'Попробуйте десертную ложку для каши или десерта и сравните темп.'],
  ['☁️','Объём без калорий',true,
    'Если взбить йогурт в пышный мусс, его объём вырастет при той же калорийности.',
    'Взбивание добавляет в порцию воздух. Больший объём при той же калорийности может усиливать кратковременное ощущение сытости.',
    'Взбейте йогурт или творожок перед подачей, сохранив тот же состав.'],
  ['📱','Внимание за столом',false,
    'Если не переесть в обед, просмотр сериала или ленты смартфона за столом никак не скажется на вечернем аппетите.',
    'Когда внимание занято экраном, детали трапезы могут запоминаться хуже. В экспериментах отвлечение за едой иногда увеличивало количество съеденного позже.',
    'Отложите телефон во время еды и обратите внимание на вкус и чувство насыщения.'],
  ['🎨','Визуальный контраст',false,
    'Яркая красная или чёрная тарелка автоматически помогает съесть меньше светлого гарнира.',
    'Цвет посуды может изменить то, как заметна порция. Направление и величина эффекта зависят от еды и условий эксперимента.',
    'Накладывайте гарнир осознанно и проверьте, с какой посудой вам легче оценить порцию.'],
  ['🍓','Сенсорное насыщение',false,
    'Чем больше разных вкусов и текстур в одном блюде, тем быстрее наступает сытость.',
    'Интерес к одному и тому же вкусу может снижаться по мере еды. Разнообразие вкусов способно продлить интерес к трапезе.',
    'Замечайте, когда берёте добавку из-за нового вкуса, а когда ещё голодны.'],
  ['🥤','Жидкие и твёрдые калории',false,
    'Фруктовый смузи на 300 ккал всегда насыщает так же долго, как цельные фрукты и ягоды той же калорийности.',
    'Цельные фрукты нужно жевать, поэтому их обычно едят дольше. Сытость после смузи также зависит от густоты, клетчатки и других ингредиентов.',
    'Если хотите сравнить сытость, попробуйте цельные фрукты и смузи при одинаковом составе.']
];

const cheat = [
  'Плотная текстура и цельные продукты помогают замедлить темп еды.',
  'Попробуйте начать трапезу с овощей и белка.',
  'Мелкие кусочки и небольшие приборы помогают замедлиться.',
  'Взбивание добавляет объём без изменения калорийности порции.',
  'Во время еды отложите смартфон и уделите внимание ощущениям.'
];

const byId = id => document.getElementById(id);
let mode = 'calm';
let round, score, correct, streak, bestStreak, answered, timer, deadline;
let sound = true;
let audio;

function playTone(frequency) {
  if (!sound) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    audio ||= new Audio();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const note = audio.createOscillator();
    const gain = audio.createGain();
    note.frequency.value = frequency;
    gain.gain.setValueAtTime(.12, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .18);
    note.connect(gain).connect(audio.destination);
    note.start();
    note.stop(audio.currentTime + .18);
  } catch {}
}

function tiles(target, entries) {
  target.replaceChildren(...entries.map(([label, value]) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const number = document.createElement('b');
    number.textContent = value;
    const text = document.createElement('small');
    text.textContent = label;
    tile.append(number, text);
    return tile;
  }));
}

function screen(active) {
  for (const id of ['start', 'game', 'result']) byId(id).hidden = id !== active;
}

function startGame() {
  playTone(420);
  round = score = correct = streak = bestStreak = 0;
  screen('game');
  byId('score').textContent = 0;
  byId('combo').hidden = true;
  byId('clock').hidden = mode !== 'blitz';
  countGameEvent('plays');
  renderQuestion();
}

function renderQuestion() {
  clearInterval(timer);
  answered = false;
  const [emoji, category, , statement] = questions[round];
  byId('round').textContent = (round + 1) + ' / ' + questions.length;
  byId('emoji').textContent = emoji;
  byId('category').textContent = emoji + ' ' + category;
  byId('question').textContent = statement;
  byId('feedback').hidden = true;
  byId('answers').hidden = false;
  byId('next').textContent = round === questions.length - 1 ? 'Посмотреть результат →' : 'Следующий вопрос →';
  if (mode === 'blitz') {
    deadline = performance.now() + 15000;
    tick();
    timer = setInterval(tick, 100);
  }
}

function tick() {
  const remaining = Math.max(0, (deadline - performance.now()) / 1000);
  byId('timeBar').value = remaining;
  byId('seconds').textContent = Math.ceil(remaining) + 'с';
  if (!remaining) answer(null);
}

function answer(choice) {
  if (answered || byId('game').hidden) return;
  answered = true;
  clearInterval(timer);
  const remaining = mode === 'blitz' ? Math.max(0, (deadline - performance.now()) / 1000) : 0;
  const timeout = choice === null || (mode === 'blitz' && remaining === 0);
  const [, , truth, , explanation, tip] = questions[round];
  const success = !timeout && choice === truth;
  let earned = 0;
  if (success) {
    correct++;
    streak++;
    bestStreak = Math.max(streak, bestStreak);
    const multiplier = streak >= 3 ? 1.5 : streak === 2 ? 1.2 : 1;
    earned = Math.round((100 + Math.round(remaining * 5)) * multiplier);
    score += earned;
  } else {
    streak = 0;
  }
  playTone(success ? 659 : 220);
  byId('score').textContent = score;
  byId('combo').hidden = streak < 2;
  byId('combo').textContent = '🔥 Серия ×' + streak;
  byId('answers').hidden = true;
  byId('feedback').hidden = false;
  byId('verdict').className = success ? 'good' : 'bad';
  byId('verdict').textContent = success ? 'Точно в цель! +' + earned + ' очков' : timeout ? 'Время вышло!' : 'Попались на уловку!';
  byId('truth').textContent = truth ? 'Это научный факт' : 'Это миф';
  byId('explanation').textContent = explanation;
  byId('tip').textContent = tip;
}

function next() {
  if (!answered || byId('game').hidden) return;
  if (++round < questions.length) renderQuestion();
  else finish();
}

function finish() {
  screen('result');
  playTone(784);
  countGameEvent('done');
  countGameEvent(mode);
  countGameEvent('score-' + correct);
  byId('rank').textContent = correct >= 9 ? '🏆 Мастер нейро-сытости' : correct >= 6 ? '🔬 Исследователь FoodHackLab' : '🥗 На пути к осознанной тарелке';
  tiles(byId('summary'), [['Точность', correct + '/10'], ['Очки', score], ['Макс. серия', bestStreak]]);
  byId('copyStatus').textContent = '';
}

function shareText() {
  return '🔬 Я прошёл(а) «Детектор мифов о сытости» от FoodHackLab: ' + correct + '/10 верных ответов (' + score + ' очков)!\n\n' + cheat.join('\n');
}

const gameUrl = new URL('./', location.href).href;
byId('telegram').onclick = () => {
  const url = 'https://t.me/share/url?' + new URLSearchParams({ url: gameUrl, text: shareText() });
  if (window.Telegram?.WebApp?.openTelegramLink) window.Telegram.WebApp.openTelegramLink(url);
  else window.open(url, '_blank', 'noopener,noreferrer');
};
byId('vk').onclick = () => window.open('https://vk.com/share.php?' + new URLSearchParams({ url: gameUrl }), '_blank', 'noopener,noreferrer');
byId('copy').onclick = async () => {
  try {
    await navigator.clipboard.writeText(shareText() + '\n\n' + gameUrl);
    byId('copyStatus').textContent = 'Результат и ссылка скопированы.';
  } catch { byId('copyStatus').textContent = 'Не удалось скопировать результат.'; }
};
byId('sound').onclick = () => {
  sound = !sound;
  byId('sound').textContent = sound ? '🔊' : '🔇';
  byId('sound').setAttribute('aria-pressed', sound);
  playTone(420);
};
document.querySelectorAll('.mode').forEach(button => {
  button.onclick = () => {
    mode = button.dataset.mode;
    document.querySelectorAll('.mode').forEach(option => option.setAttribute('aria-pressed', option === button));
  };
});
byId('begin').onclick = startGame;
byId('restart').onclick = startGame;
byId('myth').onclick = () => answer(false);
byId('fact').onclick = () => answer(true);
byId('next').onclick = next;
document.addEventListener('keydown', event => {
  if (byId('game').hidden || event.repeat) return;
  if (!answered && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    answer(event.key === 'ArrowRight');
  } else if (answered && ['Enter', ' '].includes(event.key) && !event.target.closest('button, a')) {
    event.preventDefault();
    next();
  }
});
let swipe;
byId('card').addEventListener('touchstart', event => { swipe = event.changedTouches[0].clientX; }, { passive: true });
byId('card').addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - swipe;
  if (Math.abs(distance) > 65) answer(distance > 0);
}, { passive: true });
for (const tip of cheat) {
  const item = document.createElement('li');
  item.textContent = tip;
  byId('cheat').append(item);
}
