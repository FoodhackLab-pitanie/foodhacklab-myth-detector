export const MAX_PER_STAGE = 10;
export const PASS_SCORE = 80;
export const ERROR_COST = 2;
export const COURSE_VERSION = 1;

export const stages = [
  {
    id: 'briefing', title: 'Начало смены', icon: 'briefing', kind: 'choices', slides: '4–5',
    prompt: 'Что нужно сделать до контакта с чистой посудой и текстилем?',
    instruction: 'Выберите все необходимые действия.',
    options: [
      ['booking', 'Уточнить брони, формат и свою зону'],
      ['dishes', 'Вынести посуду, а затем подготовить форму'],
      ['uniform', 'Проверить чистоту формы и обуви'],
      ['hands', 'Вымыть и высушить руки'],
    ],
    answer: ['booking', 'uniform', 'hands'],
    theory: 'Уточните задание, брони и зону. Проверьте форму и обувь, вымойте и высушите руки до контакта с чистой посудой и текстилем.',
  },
  {
    id: 'air', title: 'Проветривание', icon: 'air', kind: 'air', slides: '8–10',
    prompt: 'Сейчас до сервировки. По графику смены окна можно открыть. Подготовьте зал к проветриванию.',
    instruction: 'Настройте вентиляцию, окна и интервал. Игровой таймер ускорен.',
    options: [
      ['vent', 'Включить штатную вентиляцию'],
      ['window', 'Открыть окна'],
      ['short', '2–3 минуты'],
      ['shift', '10–15 минут'],
      ['long', '45–60 минут'],
    ],
    answer: ['vent', 'window', 'shift'],
    theory: 'Включите штатную вентиляцию и, если это разрешено, откройте окна до сервировки. В этой смене 10–15 минут — пример по внутреннему графику. После проветривания проверьте отсутствие духоты, запахов и сквозняков.',
  },
  {
    id: 'clean', title: 'Уборка и осмотр', icon: 'clean', kind: 'order', slides: '8, 11–13',
    prompt: 'На столах остались следы, пол ещё предстоит вымыть. В каком порядке подготовить зону?',
    instruction: 'Нажимайте на действия по порядку. Повторное нажатие убирает действие из списка.',
    options: [
      ['dry', 'Дождаться высыхания пола'],
      ['surfaces', 'Убрать мусор и очистить поверхности'],
      ['inspect', 'Проверить вход, проходы, санузлы и свет'],
      ['floor', 'Вымыть пол промаркированным инвентарём'],
    ],
    answer: ['surfaces', 'floor', 'dry', 'inspect'],
    theory: 'Сначала очищают поверхности, затем моют пол отдельным инвентарём. После высыхания повторно проверяют гостевые зоны, освещение и свободные выходы. Только затем выносят чистую посуду.',
  },
  {
    id: 'furniture', title: 'Расстановка мебели', icon: 'furniture', kind: 'place', scene: 'floor', slides: '14–17, 26',
    prompt: 'Расставьте два устойчивых стола по плану. Центральный путь к выходу должен оставаться свободным.',
    instruction: 'Перетащите столы или сначала нажмите на стол, затем на зону.',
    items: [['small', 'Стол на 2', 'table-small'], ['large', 'Стол на 4', 'table-large']],
    zones: [['window', 'У окна', 22, 34], ['main', 'Основная зона', 77, 53], ['aisle', 'Главный проход', 50, 70]],
    answer: { small: 'window', large: 'main' },
    theory: 'По этому плану двухместный стол ставят у окна, четырёхместный — в основной зоне. Проход оценивают с учётом стульев и занятых мест, а маршрут к выходу оставляют свободным.',
  },
  {
    id: 'supplies', title: 'Получение оснащения', icon: 'supplies', kind: 'single', slides: '27–28',
    prompt: 'У вас 6 столов по 4 места. По плану нужна одна тарелка на гостя и резерв 25%. Сколько чистых тарелок подготовить?',
    instruction: 'Выберите один вариант.',
    options: [
      ['twentyfour', '24 тарелки'],
      ['thirtysix', '36 тарелок'],
      ['thirty', '30 тарелок'],
      ['twelve', '12 тарелок'],
    ],
    answer: ['thirty'],
    theory: '6 × 4 = 24 места. Резерв 25% добавляет 6 тарелок, итого 30. При получении проверьте чистоту и отсутствие повреждений, затем перенесите посуду на чистом подносе.',
  },
  {
    id: 'polish', title: 'Полировка посуды', icon: 'polish', kind: 'choices', slides: '33–36',
    prompt: 'Один чистый бокал целый, на другом есть скол. Какие действия правильные?',
    instruction: 'Выберите все правильные действия.',
    options: [
      ['stemhold', 'Держать бокал за ножку при полировке чаши'],
      ['reject', 'Убрать бокал со сколом из комплекта'],
      ['bowl', 'Поддержать чашу через чистую салфетку'],
      ['separate', 'Отдельно отполировать ножку и основание, проверить бокал на свет'],
    ],
    answer: ['reject', 'bowl', 'separate'],
    theory: 'Повреждённую посуду отбраковывают. При полировке поддерживают чашу через чистую салфетку, затем отдельно обрабатывают ножку и основание. В конце бокал проверяют на свет.',
  },
  {
    id: 'station', title: 'Сервисная станция', icon: 'station', kind: 'match', slides: '37–39',
    prompt: 'Разложите инвентарь так, чтобы официанту было удобно пополнять сервировку.',
    instruction: 'Для каждого предмета выберите его место.',
    items: [['trays', 'Подносы и меню'], ['cutlery', 'Вилки и ножи'], ['glass', 'Чистые бокалы'], ['linen', 'Запас скатертей и салфеток']],
    zones: [['shelf', 'Полка для посуды'], ['linen-zone', 'Отделение для белья'], ['top', 'Верхняя зона'], ['sections', 'Секции для приборов']],
    answer: { trays: 'top', cutlery: 'sections', glass: 'shelf', linen: 'linen-zone' },
    theory: 'Верхнюю зону отводят под подносы и меню. Приборы сортируют по секциям, тарелки и стекло ставят на полки. Чистое сменное бельё держат в своём отделении.',
  },
  {
    id: 'linen', title: 'Накрытие стола', icon: 'linen', kind: 'order', slides: '45–47', scene: 'linen',
    prompt: 'Стол нужно накрыть обычной скатертью с мулетоном. В каком порядке выполнить работу?',
    instruction: 'Соберите последовательность. Повторное нажатие убирает действие из списка.',
    options: [
      ['edge', 'Выровнять спуск скатерти и углы'],
      ['cover', 'Раскрыть скатерть и совместить складку с осью'],
      ['base', 'Проверить чистоту, сухость и устойчивость стола'],
      ['pad', 'Расправить и закрепить мулетон'],
    ],
    answer: ['base', 'pad', 'cover', 'edge'],
    theory: 'Осмотрите столешницу, расправьте мулетон и накройте стол скатертью по оси. Не касайтесь полотном пола. Сравните спуск и углы с противоположных сторон.',
  },
  {
    id: 'setting', title: 'Сервировка', icon: 'setting', kind: 'place', scene: 'setting', slides: '61–62, 70',
    prompt: 'Сервируйте одно место на обед. Представьте, что гость сидит у нижней кромки стола.',
    instruction: 'Перетащите предметы или выберите предмет и нажмите на место.',
    items: [['plate', 'Тарелка', 'plate'], ['fork', 'Вилка', 'fork'], ['knife', 'Нож', 'knife'], ['water', 'Бокал воды', 'glass']],
    zones: [['center', 'По оси стула', 50, 63], ['left', 'Слева', 23, 64], ['right', 'Справа', 77, 64], ['top-right', 'Справа сверху', 77, 25]],
    answer: { plate: 'center', fork: 'left', knife: 'right', water: 'top-right' },
    theory: 'Тарелка располагается по оси стула с отступом 2 см от края по учебной схеме. Вилка — слева, нож — справа, бокал воды — над правым прибором. Комплект приборов сверяют с меню.',
  },
  {
    id: 'final', title: 'Приёмка зала', icon: 'final', kind: 'choices', slides: '6–7, 70–74',
    prompt: 'На финальном обходе подносная тележка перегородила выход, QR-меню не открывается, а высокий декор закрывает обзор. Что сделать до открытия?',
    instruction: 'Выберите все необходимые действия.',
    options: [
      ['decor', 'Заменить высокий декор на низкий'],
      ['ignore', 'Открыть зал и устранить замечания позднее'],
      ['aisle', 'Убрать тележку с пути к выходу'],
      ['menu', 'Сообщить о сбое QR-меню и проверить исправление'],
      ['approve', 'После исправлений передать зал администратору на приёмку'],
    ],
    answer: ['decor', 'aisle', 'menu', 'approve'],
    theory: 'Освободите проходы, проверьте меню и технику, исправьте сервировку и декор. Администратор принимает зал после устранения критических замечаний и разрешает открытие.',
  },
];

export const newRun = () => ({ version: COURSE_VERSION, stages: [], index: 0, finished: false });
export const scoreFor = errors => Math.max(0, MAX_PER_STAGE - errors * ERROR_COST);
export const totalFor = run => run.stages.reduce((total, row) => total + (row.passed ? scoreFor(row.errors) : 0), 0);

export function applyMove(run, move) {
  const stage = stages[run.index];
  if (run.finished || !stage) return run;
  const row = run.stages[run.index] ?? { errors: 0, passed: false, marks: {} };
  if (move.type === 'advance') {
    if (!row.passed) throw new Error('Сначала выполните задание этапа.');
    const index = run.index + 1;
    return { ...run, index, finished: index === stages.length };
  }
  if (move.type !== 'check') throw new Error('Неизвестное действие.');
  if (row.passed) return run;
  const selection = move.selection;
  let wrong;
  if (stage.items) {
    const zones = stage.zones.map(([id]) => id);
    if (!selection || Array.isArray(selection) || typeof selection !== 'object' ||
      Object.keys(selection).length !== stage.items.length ||
      stage.items.some(([id]) => !zones.includes(selection[id]))) throw new Error('Укажите место для каждого предмета.');
    wrong = stage.items.filter(([id]) => selection[id] !== stage.answer[id]).map(([id]) => id);
  } else {
    const ids = stage.options.map(([id]) => id);
    if (!Array.isArray(selection) || selection.some(id => !ids.includes(id)) ||
      new Set(selection).size !== selection.length || !selection.length) throw new Error('Выберите ответ.');
    if (stage.kind === 'single' && selection.length !== 1) throw new Error('Выберите один ответ.');
    if (stage.kind === 'order' && selection.length !== ids.length) throw new Error('Добавьте все действия.');
    if (stage.kind === 'air' && selection.filter(id => ['shift', 'short', 'long'].includes(id)).length !== 1)
      throw new Error('Выберите длительность.');
    wrong = stage.kind === 'order'
      ? selection.filter((id, index) => id !== stage.answer[index])
      : ids.filter(id => selection.includes(id) !== stage.answer.includes(id));
  }
  const passed = wrong.length === 0;
  const errors = row.errors + Number(!passed);
  const marks = { ...row.marks };
  for (const id of wrong) marks[id] = (marks[id] ?? 0) + 1;
  const updated = [...run.stages];
  updated[run.index] = { errors, passed, marks, lastWrong: wrong };
  return { ...run, stages: updated };
}

const normalize = value => value.normalize('NFC').trim().replace(/\s+/gu, ' ');
const groupKey = value => value.toLocaleLowerCase('ru').replaceAll('ё', 'е')
  .replace(/[‐‑‒–—−]/gu, '-').replace(/\s/gu, '');
const groupPattern = /^(?=.*\p{N})[\p{L}\p{N} ._/‐‑‒–—-]+$/u;

export function participantIdentity(data) {
  if (!data || Object.keys(data).length !== 2 ||
      typeof data.number !== 'string' || !/^\d{1,6}$/u.test(data.number) || Number(data.number) === 0)
    throw new Error('Введите номер участника от 1 до 999999.');
  if (typeof data.group !== 'string' || data.group.length > 32)
    throw new Error('Введите номер учебной группы.');
  const group = normalize(data.group);
  if (!groupPattern.test(group)) throw new Error('Проверьте номер группы. Например, 23-ПО.');
  return { number: Number(data.number), group, groupKey: groupKey(group) };
}
