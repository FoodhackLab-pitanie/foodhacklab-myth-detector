import { API_ORIGIN } from './config.mjs?v=3';
import { stages, totalFor, scoreFor, PASS_SCORE, ERROR_COST, MAX_PER_STAGE } from './course.mjs';

import { $, main, icon, esc, setMain, flash, labelFor } from './common.mjs';

const storageKey = 'hall-training:attempt:v2';
const MAX_SCORE = stages.length * MAX_PER_STAGE;
let attempt = null;
let participant = null;
let pending = false;
let selection;
let grabbed;
let feedback = '';
let airTimer;
let suppressClick = false;
function storeAttempt() {
  try {
    if (attempt) sessionStorage.setItem(storageKey, JSON.stringify({ ...attempt, participant }));
    else sessionStorage.removeItem(storageKey);
  } catch { /* The active tab can still finish the attempt. */ }
}

function restore() {
  try {
    sessionStorage.removeItem('hall-training:attempt:v1');
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (!saved?.id || !saved?.key || !saved?.participant?.number || !saved?.run) return;
    participant = saved.participant;
    delete saved.participant;
    attempt = saved;
  } catch { /* A new attempt can still be opened. */ }
}

async function request(path, { data, key }) {
  const headers = new Headers();
  if (data) headers.set('Content-Type', 'application/json');
  if (key) headers.set('Authorization', `Bearer ${key}`);
  let response;
  try {
    response = await fetch(`${API_ORIGIN}/api/${path}`, {
      method: data ? 'POST' : 'GET', headers, body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new Error('Сервер игры не ответил. Проверьте подключение и повторите действие.');
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('Сервер игры недоступен. Попробуйте ещё раз.'); }
  if (!response.ok && !result.run) throw Object.assign(new Error(result.error || 'Попробуйте ещё раз.'), { status: response.status });
  return result;
}

const randomHex = bytes => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
const stepNo = index => String(index + 1).padStart(2, '0');

function welcome(focus) {
  setMain(`
    <div class="welcome-grid">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-content">
          <p class="hero-kicker"><span></span> Практическая смена</p>
          <h1 id="hero-title"><span>Подготовка</span><span>зала</span></h1>
          <p class="hero-copy">Проведите подготовку ресторана к открытию и сдайте зал администратору.</p>
          <div class="hero-rules">
            <div>${icon('steps')}<span><strong>10 этапов</strong><small>Чек-лист смены</small></span></div>
            <div>${icon('award')}<span><strong>80 из 100</strong><small>Баллов для зачёта</small></span></div>
          </div>
        </div>
      </section>
      <section class="registration" aria-labelledby="reg-title">
        <span class="reg-icon">${icon('user')}</span>
        <h2 id="reg-title">Перед началом</h2>
        <p class="reg-copy">Укажите номер, который выдал преподаватель, и свою учебную группу.</p>
        <form id="registration">
          <div class="fields">
            <label>Номер участника
              <input name="number" inputmode="numeric" pattern="[0-9]{1,6}" maxlength="6" autocomplete="off" placeholder="Например, 7" value="${esc(participant?.number)}" required>
            </label>
            <label>Номер группы
              <input name="group" maxlength="32" autocomplete="off" placeholder="Например, 23-ПО" value="${esc(participant?.group)}" required>
            </label>
          </div>
          <p class="field-note">Для повторной попытки используйте те же номера.</p>
          <p class="form-error" id="error" role="alert"></p>
          <button class="primary start" type="submit">Начать смену</button>
        </form>
      </section>
    </div>
    <section class="route" aria-labelledby="route-title">
      <div class="route-title"><h2 id="route-title">Чек-лист смены</h2><p>До 10 баллов за этап <span>·</span> −${ERROR_COST} за ошибку</p></div>
      <ol class="route-grid">${stages.map((stage, index) => `<li><span class="tile-icon">${icon(stage.icon)}</span><span class="tile-name">${stage.title}</span><span class="tile-no">${stepNo(index)}</span></li>`).join('')}</ol>
    </section>`, focus);
  let ticket;
  let submittedIdentity;
  $('#registration').addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    const values = Object.fromEntries(new FormData(event.target));
    participant = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
    const identityKey = JSON.stringify(participant);
    if (submittedIdentity !== identityKey) {
      ticket = { id: randomHex(16), key: randomHex(32) };
      submittedIdentity = identityKey;
    }
    pending = true;
    const button = $('.start');
    button.disabled = true;
    button.textContent = 'Открываем смену…';
    flash('');
    try {
      const data = await request('attempts', { data: { id: ticket.id, participant }, key: ticket.key });
      const { participant: savedParticipant, ...savedAttempt } = data;
      participant = savedParticipant;
      attempt = { ...ticket, ...savedAttempt };
      storeAttempt();
      clearSelection();
      play(true);
    } catch (failure) {
      flash(failure.message || 'Не удалось начать игру.');
    } finally {
      pending = false;
      button.disabled = false;
      button.textContent = 'Начать смену';
    }
  });
}

function clearSelection() {
  const stage = stages[attempt?.run.index];
  selection = stage?.items ? {} : [];
  grabbed = null;
  feedback = '';
  clearTimeout(airTimer);
  airTimer = undefined;
}


function validSelection(stage) {
  if (stage.items) return Object.keys(selection).length === stage.items.length;
  if (stage.kind === 'order') return selection.length === stage.options.length;
  if (stage.kind === 'air') return selection.some(id => ['short', 'shift', 'long'].includes(id));
  return selection.length > 0;
}

function choice(stage, [id, label], index, locked) {
  const checked = selection.includes(id);
  const single = stage.kind === 'single' || stage.kind === 'air' && index > 1;
  const prefix = stage.kind === 'order' && checked ? selection.indexOf(id) + 1 : checked ? icon('check') : '';
  const dotClass = single ? ' radio' : '';
  return `<button class="answer${checked ? ' selected' : ''}" data-choice="${id}" data-focus="choice-${id}" aria-pressed="${checked}" type="button"${locked ? ' disabled' : ''}><span class="choose${dotClass}">${prefix}</span><span>${label}</span></button>`;
}

function airScene(stage, locked) {
  return `<div class="air-layout"><div class="window-scene${selection.includes('window') || locked ? ' open' : ''}${airTimer || !locked && selection.includes('vent') ? ' flowing' : ''}">
    <div class="window-panes"><i></i><i></i></div><div class="air-lines"><i></i><i></i><i></i></div>
    <span class="scene-label">${icon('air')} ${airTimer ? 'Идёт проветривание' : locked ? 'Зал проветрен' : selection.includes('window') ? 'Окна открыты' : 'Окна закрыты'}</span></div>
    <div class="air-options"><div class="answers">${stage.options.slice(0, 2).map((option, index) => choice(stage, option, index, locked)).join('')}</div>
    <div class="time-option"><strong>${icon('clock')} Интервал</strong><div class="answers">${stage.options.slice(2).map((option, index) => choice(stage, option, index + 2, locked)).join('')}</div></div></div></div>`;
}

const pieceMarkup = kind => `<i class="piece ${kind}" aria-hidden="true"><i></i></i>`;
function placement(stage, locked) {
  return `<div class="placement">
     <div class="diagram ${stage.scene}">
       ${stage.scene === 'floor' ? '<div class="floor-windows"></div><span class="floor-title">Окна</span><div class="floor-path"></div><span class="exit">Выход</span>' : '<div class="table-edge"></div><span class="guest">Место гостя</span>'}
       ${stage.zones.map(([id, label, x, y]) => {
         const item = stage.items.find(([itemId]) => selection[itemId] === id);
         const display = item ? pieceMarkup(item[2]) : '<span class="zone-plus" aria-hidden="true">+</span>';
         return `<button class="zone${item ? ' occupied' : ''}${grabbed && item?.[0] === grabbed ? ' grabbed' : ''}${id === 'aisle' ? ' aisle' : ''}" type="button" style="--x:${x}%;--y:${y}%" data-zone="${id}" data-focus="zone-${id}" ${item ? `data-object="${item[0]}"` : ''} aria-label="${label}${item ? ', ' + item[1] : ''}"${locked ? ' disabled' : ''}>${display}<span>${label}</span></button>`;
       }).join('')}
     </div>
     <div class="tray" aria-label="Предметы для расстановки">${stage.items.map(([id, label, kind]) => `<button class="tray-item${grabbed === id ? ' grabbed' : ''}${selection[id] ? ' placed' : ''}" type="button" data-object="${id}" data-focus="piece-${id}" aria-pressed="${grabbed === id}"${locked ? ' disabled' : ''}>${pieceMarkup(kind)}<span>${label}</span>${selection[id] ? icon('check', 'placed-mark') : ''}</button>`).join('')}</div>
    </div>`;
}

function stageActivity(stage, locked) {
  if (stage.kind === 'place') return placement(stage, locked);
  if (stage.kind === 'air') return airScene(stage, locked);
  if (stage.kind === 'match') {
    return `<div class="matches">${stage.items.map(([id, label]) => `<label><span>${label}</span><select data-item="${id}" data-focus="match-${id}" aria-label="Место для «${label}»"${locked ? ' disabled' : ''}><option value="">Выберите место</option>${stage.zones.map(([zone, description]) => `<option value="${zone}"${selection[id] === zone ? ' selected' : ''}>${description}</option>`).join('')}</select></label>`).join('')}</div>`;
  }
  return `
    ${stage.scene === 'linen' ? `<div class="linen-scene${locked ? ' dressed' : ''}"><div class="linen-table"><i></i><b></b></div><span class="scene-label">${locked ? 'Спуск выровнен' : 'Стол к накрытию'}</span></div>` : ''}
    <div class="answers${stage.kind === 'single' ? ' answers-grid' : ''}">${stage.options.map((option, index) => choice(stage, option, index, locked)).join('')}</div>`;
}

function play(focus = false, restoreFocus = false) {
  if (!attempt) return welcome(focus);
  const { run } = attempt;
  if (run.finished) return finish(focus);
  const stage = stages[run.index];
  const row = run.stages[run.index];
  const locked = !!row?.passed;
  const focusId = restoreFocus ? document.activeElement?.dataset?.focus : null;
  if (!selection && locked) selection = stage.answer;
  if (!selection) clearSelection();
  const done = run.index;
  const stageScore = scoreFor(row?.errors ?? 0);
  setMain(`<div class="game-heading">
      <div><p class="section-kicker">Практическая смена</p><h1>Подготовка зала</h1></div>
      <div class="participant-chip">${icon('user')} <span><strong>Участник №${esc(participant.number)}</strong><small>Группа ${esc(participant.group)}</small></span></div>
    </div>
    <div class="game-layout">
      <aside class="checklist" aria-label="Чек-лист смены">
        <div class="checklist-heading"><h2>Чек-лист</h2><span>${done} из ${stages.length}</span></div>
        <progress max="${stages.length}" value="${done}" aria-label="Отмечено этапов"></progress>
        <ol>${stages.map((step, index) => `<li class="${index < done ? 'done' : index === done ? 'current' : 'upcoming'}" ${index === done ? 'aria-current="step"' : ''}><span class="check-cell">${index < done ? icon('check') : stepNo(index)}</span>${step.title}${index < done ? `<span class="step-score">${scoreFor(run.stages[index].errors)}</span>` : ''}</li>`).join('')}</ol>
        <div class="total">${icon('award')}<span>Набрано</span><strong>${totalFor(run)} <small>/ ${MAX_SCORE}</small></strong></div>
      </aside>
      <section class="activity" aria-labelledby="stage-title">
        <div class="activity-meta"><span>Этап ${stepNo(run.index)} из 10</span><span class="score-chip">${stageScore} / 10 баллов</span></div>
        <h2 id="stage-title">${stage.title}</h2>
        <p class="task">${stage.prompt}</p>
        <p class="instruction">${stage.instruction}</p>
        ${stageActivity(stage, locked)}
        <div id="feedback" aria-live="polite">${locked || feedback ? `<div class="feedback ${locked ? 'good' : 'wrong'}"><strong>${locked ? 'Верно. Этап выполнен.' : feedback}</strong><p>${stage.theory} <span class="slides">Слайды ${stage.slides}.</span></p></div>` : ''}</div>
        <p class="form-error" id="error" role="alert"></p>
        <div class="activity-footer">${locked ? `<button class="primary" type="button" data-next data-focus="next"${airTimer ? ' disabled' : ''}>${airTimer ? 'Идёт проветривание…' : done + 1 === stages.length ? 'Отметить и узнать результат' : 'Отметить и продолжить'}</button>` : `<button class="primary" type="button" data-check data-focus="check"${validSelection(stage) ? '' : ' disabled'}>Проверить</button><span>Ошибок на этапе: ${row?.errors || 0}</span>`}</div>
      </section>
    </div>`, focus);
  if (restoreFocus && focusId) main.querySelector(`[data-focus="${focusId}"]`)?.focus({ preventScroll: true });
}

function placeItem(stage, item, zone) {
  const old = selection[item];
  const occupying = stage.items.find(([id]) => id !== item && selection[id] === zone)?.[0];
  if (occupying && old) selection[occupying] = old;
  else if (occupying) delete selection[occupying];
  selection[item] = zone;
  grabbed = null;
  play(false, true);
}

function pick(stage, id) {
  const index = stage.options.findIndex(option => option[0] === id);
  if (stage.kind === 'single') selection = [id];
  else if (stage.kind === 'air' && index > 1) {
    selection = [...selection.filter(item => item === 'vent' || item === 'window'), id];
  } else if (selection.includes(id)) selection = selection.filter(item => item !== id);
  else selection = [...selection, id];
  play(false, true);
}

async function makeMove(type) {
  if (pending) return;
  pending = true;
  const current = attempt.run.index;
  const oldScore = scoreFor(attempt.run.stages[current]?.errors ?? 0);
  const currentButton = $(type === 'check' ? '[data-check]' : '[data-next]');
  currentButton.disabled = true;
  flash('');
  try {
    const result = await request(`attempts/${attempt.id}`, {
      key: attempt.key, data: { revision: attempt.revision, move: { type, selection } },
    });
    attempt = { ...attempt, ...result };
    storeAttempt();
    if (attempt.run.index !== current) clearSelection();
    else if (type === 'check') {
      const row = attempt.run.stages[current];
      if (row?.passed && stages[current].kind === 'air') {
        airTimer = setTimeout(() => {
          airTimer = undefined;
          if (attempt?.run.index === current) play();
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 170 : 2400);
      }
      const penalty = oldScore - scoreFor(row?.errors ?? 0);
      feedback = row?.passed ? '' : penalty ? `Пока неверно. −${penalty} балла.` : 'Пока неверно. Прочитайте подсказку и попробуйте снова.';
    }
    play(type === 'advance');
    if (type === 'check') {
      const target = $('[data-next]:enabled') || $('#feedback strong');
      target?.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
    }
  } catch (failure) {
    flash(failure.message || 'Сервер недоступен. Повторите действие.');
    currentButton.disabled = false;
  } finally {
    pending = false;
  }
}

function finish(focus) {
  const run = attempt.run;
  const score = totalFor(run);
  const passed = score >= PASS_SCORE;
  setMain(`<div class="results-layout">
    <section class="result-card ${passed ? 'passed' : 'retry'}"><p class="hero-kicker"><span></span> Смена завершена</p>
      <h1>${passed ? 'Зачёт получен' : 'Нужна новая попытка'}</h1>
      <div class="result-value">${score}<small> / ${MAX_SCORE}</small></div>
      <p>Для зачёта нужно набрать минимум ${PASS_SCORE} баллов. ${passed ? 'Зал готов к открытию.' : 'Разберите ошибки и пройдите чек-лист заново.'}</p>
      <p class="save-note">${icon('check')} Результат сохранён</p>
      <button class="primary" type="button" data-restart>${passed ? 'Пройти ещё раз' : 'Повторить попытку'}</button>
    </section>
    <section class="result-details"><h2>Результаты по этапам</h2><p class="muted">Участник №${esc(participant.number)} · группа ${esc(participant.group)}</p>
      <ol>${stages.map((stage, index) => {
        const row = run.stages[index];
        return `<li><div class="result-line"><span>${icon(stage.icon)}${stage.title}</span><strong>${scoreFor(row.errors)} / 10</strong></div>
          ${row.errors ? `<details><summary>Разобрать ошибки (${row.errors})</summary><p>${stage.theory} Слайды ${stage.slides}.</p></details>` : ''}</li>`;
      }).join('')}</ol>
    </section>
  </div>`, focus);
}

main.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || pending || button.disabled) return;
  if (suppressClick && (button.dataset.object || button.dataset.zone)) return;
  if ('restart' in button.dataset) {
    attempt = null;
    storeAttempt();
    clearSelection();
    welcome(true);
    return;
  }
  if (!attempt || attempt.run.finished) return;
  const stage = stages[attempt.run.index];
  if (button.dataset.choice) pick(stage, button.dataset.choice);
  if (button.dataset.zone && grabbed) placeItem(stage, grabbed, button.dataset.zone);
  else if (button.dataset.object) {
    grabbed = grabbed === button.dataset.object ? null : button.dataset.object;
    play(false, true);
  }
  if ('check' in button.dataset) void makeMove('check');
  if ('next' in button.dataset) void makeMove('advance');
});

main.addEventListener('change', event => {
  const id = event.target.dataset.item;
  if (!id) return;
  if (event.target.value) selection[id] = event.target.value;
  else delete selection[id];
  $('[data-check]').disabled = !validSelection(stages[attempt.run.index]);
});

main.addEventListener('pointerdown', start => {
  const button = start.target.closest('[data-object]');
  if (!button || button.disabled || pending || start.button !== 0 || !attempt) return;
  const stage = stages[attempt.run.index];
  const id = button.dataset.object;
  let ghost;
  const move = event => {
    if (event.pointerId !== start.pointerId) return;
    if (!ghost && Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) < 8) return;
    if (!ghost) {
      ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      const [, label, kind] = stage.items.find(item => item[0] === id);
      ghost.innerHTML = pieceMarkup(kind) + esc(label);
      document.body.append(ghost);
    }
    ghost.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -70%)`;
    $('.zone.over')?.classList.remove('over');
    document.elementFromPoint(event.clientX, event.clientY)?.closest('.zone')?.classList.add('over');
  };
  const stop = event => {
    if (event.pointerId !== start.pointerId) return;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
    if (!ghost) return;
    ghost.remove();
    $('.zone.over')?.classList.remove('over');
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 180);
    if (event.type === 'pointerup') {
      const zone = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-zone]');
      if (zone) placeItem(stage, id, zone.dataset.zone);
    }
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
});

restore();
if (attempt) play();
else welcome();
