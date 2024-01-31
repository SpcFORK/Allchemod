const SYM_ = Symbol.for('allchemod');

const tempIcoScheme = {
  "item": {
    "id": "fire",
    "name": "Fire",
    "emoji": "🔥",
    "description": "A burning flame.",
    "number": 3
  },
  "discovered": {
    "at": 1700082038002,
    "by": {
      "id": "ea59a1bf-a3e7-405b-b600-2bd827966dae",
      "username": "Meta",
      "created": 1700086289146,
      "lastOnline": 1702848802714
    }
  },
  "ownerCount": 0
}

const MAGIC = window[SYM_] = {
  'allchemod': {
    'version': '0.0.1',
  },

  'userStore': async () => Object.assign({
    inventory: '',
    itemCache: '',
    user: '',
    errorInventory: '',
    errorUser: '',
    pendingInventory: '',
    pendingUser: '',
    addToInventory: '',
    clearInventory: '',
    refreshInventory: '',
    addToItemCache: '',
    refreshUser: '',
    setEnergy: ''
  }, (await import('https://allchemy.io/_nuxt/userStore.7jTb610c.js')).u()) || {},

  'pagesIndexStore': async () => Object.assign({
    canvas: '',
    isAdPlaying: '',
    quests: '',
    errorQuests: '',
    search: '',
    sortOptions: '',
    tab: '',
    tabsContainerSize: '',
    refreshQuests: '',
    addToCanvas: '',
    addToCanvasCenter: '',
    bringToFrontOfCanvas: '',
    removeFromCanvas: '',
    playAd: async () => { }
  }, (await import('https://allchemy.io/_nuxt/pagesIndexStore.V1BUQ23X.js')).u()) || {},

  'useApi': async () => Object.assign({
    dismissed: '',
    toasts: '',
    tooltip: '',
    screen: '',
    inventoryBounds: '',
    dismiss: '',
    showToast: '',
    hideToast: '',
    setTooltip: '',
    unsetTooltip: '',
    setInventoryBounds: ''
  }, (await import('https://allchemy.io/_nuxt/useApi.BtCB_Lhu.js')).u()) || {},
}

// ----

const LS = window.localStorage;

// ----

const NostrictJSON = (ob) => JSON.stringify(ob, null, 2);

const headerGunk = {
  "headers": {
    "accept": "application/json",
    "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
    "content-type": "application/json",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://allchemy.io/",
  "referrerPolicy": "strict-origin-when-cross-origin",
}

class FolderAPI {
  static ep = 'https://allchemy.io/api/users/me/folders'

  static async req(meth = '', path = '', body) {
    let req = await fetch(FolderAPI.ep + path, {
      ...headerGunk,
      method: meth,
      body: body ? NostrictJSON(body) : null,
    })

    return {
      raw: req,
      json: async (addReq) => !!addReq
        ? { req, res: { ...await req.json(), req: addReq } }
        : await req.json()
    }
  }

  async getFolders(UUID) {
    let req = await FolderAPI.req('GET', UUID ? '/' + UUID : '')
    return await req.json(true)
  }

  async sendItem(folderUUID, itemName) {
    // /{FOLDERUUID}/items/{ITEM}
    let req = await FolderAPI.req('PUT', `/${folderUUID}/items/${itemName}`)
    return await req.json(true)
  }

  async sendItems(folderUUID, ...items) {
    return await Promise.all(
      items.map(async (item) => await this.sendItem(folderUUID, item))
    )
  }

  async removeItem(folderUUID, itemName) {
    return (await FolderAPI.req('DELETE', `/${folderUUID}/items/${itemName}`)).raw
  }

  async createFolder(name, color) {
    let req = await FolderAPI.req('PUT', '', {
      name
    })

    let json = await req.json(true)

    if (color) {
      await this.updateFolder(json.res.metadata.id, name, color)
    }

    return json.res;
  }

  async updateFolder(folderUUID, name, color) {
    let req = await FolderAPI.req('PATCH', `/${folderUUID}`, {
      name,
      color: parseInt(color)
    })
  }

  async subFolder(folderUUID1, folderUUID2) {
    return (await FolderAPI.req('PUT', `/${folderUUID1}/subfolders/${folderUUID2}`)).raw
  }

  async deleteSubFolder(folderUUID1, folderUUID2) {
    return (await FolderAPI.req('DELETE', `/${folderUUID1}/subfolders/${folderUUID2}`)).raw
  }

  async deleteFolder(folderUUID) {
    return (await FolderAPI.req('DELETE', `/${folderUUID}`)).raw
  }

  async createSubFolder(folderUUID, name) {
    let req1 = await this.createFolder(name)
    let headerRedirURL = req1.req.headers.get('location')
    let req2 = await this.subFolder(folderUUID, headerRedirURL.split('/').pop())

    return req2
  }
}

class MagicSpectAPI {
  // We leverage Folders to preserve data.
  // We can only change names and color.

  FAPI = new FolderAPI()
  CurrentPromise;

  async obToFolders(ob = {}) {
    if (!ob && !(ob instanceof Object)) return null;
    await MagicSpectAPI.CurrentPromise;

    let folders = [];

    for (let [key, value] of Object.entries(ob)) {

      if (value instanceof Object) {
        folders.push(await this.obToFolders(value))
      }

      else {
        await MagicSpectAPI.CurrentPromise;

        let v_ = value + '';

        let isColor = v_.startsWith('color:')
        let isFolder = v_.startsWith('folder:')
        let isArr = v_.startsWith('arr:') || Array.isArray(value)

        if (isColor) {
          let col = v_.split(':')[1]
          let res = this.CurrentPromise = await this.FAPI.createFolder(
            key,
            col
          )

          folders.push(res)

          continue;
        }

        else if (isFolder) {
          let folder = v_.split(':')[1]
          let res = this.CurrentPromise = await this.FAPI.createFolder(folder)
          folders.push(res)
          continue;
        }

        else {
          let res = this.CurrentPromise = await this.FAPI.createFolder(key)
          
          if (isArr) {
            for (let i = 0; i < value.length; i++) {
              let it = value[i]
              let item = this.CurrentPromise = await this.FAPI.sendItem(res.id, it)
              folders.push(item)
            }
          }

          else {
            let item = this.CurrentPromise = await this.FAPI.createSubFolder(res.id, key)
            folders.push(item)
          }
          
          folders.push(item)
          continue;
        }
      }
    }

    return folders
  }
}

// ----

function findElementWithContent(text = '', basicFilter = '*') {
  return [...document.querySelectorAll(basicFilter)].find(el => el.textContent == text);
}

function findHowls() {
  // Assuming Howler has been included in your project
  if (!Howler._howls) {
    console.error('Howler._howls array not found. Make sure Howler is included and at least one Howl instance is created.');
    return [];
  }

  return Howler._howls
}

function findHowlBySrcSubstring(substring) {
  // Assuming Howler has been included in your project
  if (!Howler._howls) {
    console.error('Howler._howls array not found. Make sure Howler is included and at least one Howl instance is created.');
    return null;
  }

  var foundHowl = Howler._howls.find(function(howl) {
    return howl._src.includes(substring);
  });

  return foundHowl;
}

function clickUp() {
  return findHowlBySrcSubstring('clickup');
}

function clickDown() {
  return findHowlBySrcSubstring('clickdown');
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadCss(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  })
}

function emulateClick(element) {
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: false
  });

  element.dispatchEvent(clickEvent);
}

function emulateDblClick(element) {
  const clickEvent = new MouseEvent('dblclick', {
    view: window,
    bubbles: true,
    cancelable: false
  });

  element.dispatchEvent(clickEvent);
}

function clickPos(pos) {

  if (pos.x < 0 || pos.y < 0) {
    throw new Error('Invalid click position');
  }

  let element = document.elementFromPoint(pos.x, pos.y);
  if (element) {
    emulateClick(element);
  } else {
    let event = new MouseEvent(
      'mousedown',
      {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: pos.x,
        clientY: pos.y
      }
    );

    document.dispatchEvent(event);
  }
}

function emulateMouseDown(element, config = {}) {
  const clickEvent = new MouseEvent('mousedown', {
    view: window,
    bubbles: true,
    cancelable: false,
    ...config
  });

  element.dispatchEvent(clickEvent);
}

function emulateMouseUp(element, config = {}) {
  const clickEvent = new MouseEvent('mouseup', {
    view: window,
    bubbles: true,
    cancelable: false,
    ...config
  });

  element.dispatchEvent(clickEvent);
}

function emulateMouseMove(x, y) {
  const event = new MouseEvent('mousemove', {
    view: window,
    bubbles: true,
    cancelable: false,
    clientX: x,
    clientY: y
  });

  document.dispatchEvent(event);
}

function emulateMouseMoveElement(element, x, y) {
  const event = new MouseEvent('mousemove', {
    view: window,
    bubbles: true,
    cancelable: false,
    clientX: x,
    clientY: y
  });

  element.dispatchEvent(event);
}

function emulateDrag(start, end) {
  const event = new CustomEvent('drag', {
    detail: {
      start: start,
      end: end
    },
    bubbles: true,
    cancelable: true
  });

  document.dispatchEvent(event);
}

function emulatePointerDown(element, config = {}) {
  const clickEvent = new PointerEvent('pointerdown', {
    view: window,
    bubbles: true,
    cancelable: false,
    ...config
  });

  element.dispatchEvent(clickEvent);
}

function emulatePointerUp(element, config = {}) {
  const clickEvent = new PointerEvent('pointerup', {
    view: window,
    bubbles: true,
    cancelable: false,
    ...config
  });

  element.dispatchEvent(clickEvent);
}

function emulatePointerMove(x, y) {
  const event = new PointerEvent('pointermove', {
    view: window,
    bubbles: true,
    cancelable: false,
    clientX: x,
    clientY: y
  });

  document.dispatchEvent(event);
}

function emulatePointerMoveElement(element, x, y) {
  const event = new PointerEvent('pointermove', {
    view: window,
    bubbles: true,
    cancelable: false,
    clientX: x,
    clientY: y
  });

  element.dispatchEvent(event);
}

async function fakeDrag(start, end, sp = 1) {
  if (!start.x || !start.y || !end.x || !end.y) return;

  const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const steps = distance / sp;
  const xStep = (end.x - start.x) / steps;
  const yStep = (end.y - start.y) / steps;

  let currentX = start.x;
  let currentY = start.y;

  const element = document.elementFromPoint(currentX, currentY);
  if (!element) return;

  emulateMouseDown(element);
  emulatePointerDown(element);

  for (let i = 0; i < steps; i++) {
    currentX += xStep;
    currentY += yStep;
    emulateMouseMoveElement(element, currentX, currentY);
    emulatePointerMoveElement(element, currentX, currentY);
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  emulateMouseUp(element);
  emulatePointerUp(element);
}

window.ANNOYMOUSE = false;
window.addEventListener('mousemove', (e) => {
  window.ANNOYMOUSE && console.log(e.clientX, e.clientY);
})

// ---

class FavouriteCache {
  constructor() {
    this.cache = new Map();

    this.load();
  }

  load() {
    // Check Local Storage
    if (localStorage.getItem('allmod:favourite')) {
      this.cache = new Map(
        JSON.parse(localStorage.getItem('allmod:favourite'))
      );
    }

    else {
      // Create Local Storage
      localStorage.setItem('allmod:favourite', JSON.stringify({}));
    }

    return this;
  }

  save() {
    localStorage.setItem('allmod:favourite', JSON.stringify(this.cache));
    return this;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
    this.save();
    return this;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.save();
    return this;
  }
}

var
  MAIN_ = document.querySelector('main'),
  WRAPPER_ = document.querySelector('div.wrapper'),
  NAV_ = document.querySelector('nav'),
  CANVAS_ = document.querySelector('div.canvas')

setInterval(() => {
  MAIN_ = document.querySelector('main'),
    WRAPPER_ = document.querySelector('div.wrapper'),
    NAV_ = document.querySelector('nav'),
    CANVAS_ = document.querySelector('div.canvas')
}, 1000)

const
  getImgs = () => document.querySelectorAll('.size-75'),

  makeText = (text) => div(text).class$('text'),

  makeTitle = (text) => div(makeText(text)).class$('title'),

  createBar = (value) => (
    div(
      makeTitle(value),
    ).class$('title-bar')
  ),

  attachClicker = (el) => {
    return el
      .on$('mousedown', () => {
        clickDown().play();
      })
      .on$('mouseup', () => {
        clickUp().play();
      })
  },

  createButton = () => attachClicker(
    button()
      .class$('absolute', 'px-3', 'py-1', 'bg-white')
      .on$('mousedown', () => {
        clickDown().play();
      })
      .on$('mouseup', () => {
        clickUp().play();
      })
  ),

  createMenu = (title = '', content = '') => div(
    createBar(title),
    content
  ).class$(
    'window', 'flex', 'flex-col',
    'bg-white', 'border', 'border-black',
    'overflow-hidden', 'flex-1', 'hidden',
    'sm_block', 'vsm_hidden', 'sm_flex-none',
    'vsm_flex-1', 'sm_mt-2', 'vsm_mt-0'
  ),

  // A button that drops down a menu
  Spcu = (...cont) => function __(col = 'bg-black') {
    return attachClicker(
      div(
        this.l = button(
          (window[SYM_].btncache = 1 + ((window[SYM_].btncache) ?? -1))
        )
          .id$('spcuBtn' + window[SYM_].btncache)
          .class$('absolute', col, 'text-white', 'text-center')

          .style$({
            'width': '1.5rem',
            'height': '1.5rem',
            'top': '2px',
            'right': '2px',
            'font-size': '0.8em',
            'z-index': '100',
            'text-align': 'center',
            'line-height': '1.5rem',
            'cursor': 'pointer',
            'box-shadow': 'none',
          })

          .text$('⋮')
        ,

        this.r = div(
          ...cont
        )
          .id$('spcuCont')
          .class$(
            'absolute',
            'px-3',
            'py-1',
            col,
            'border',
            'border-white',
            'overflow-hidden',
            'flex-1',
            'sm_block',
            'sm_flex-none',
            'vsm_flex-1',
            'sm_mt-2',
            'vsm_mt-0',
            'text-white'
          )

          .style$({
            right: '8px',
            top: this.l.get$().getBoundingClientRect().bottom - (this.l.get$().getBoundingClientRect().height / 2) + 'px',
            display: 'none',
          })
      )
    )
  },

  centerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },

  centerContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

// ---

async function sendCraft(...combos) {

  let craft = {
    recipe: combos
  }

  let res1 = await fetch("https://allchemy.io/api/items", {
    ...headerGunk,
    "method": "POST",
    "mode": "cors",
    "credentials": "include",
    "body": JSON.stringify(craft)
  });

  let location_ = res1.url

  return await fetch(location_, {
    ...headerGunk,
    "method": "GET",
    "mode": "cors",
    "credentials": "include",
  });
}

async function getItem(id) {
  return await fetch(`https://allchemy.io/api/items/${id}`, {
    ...headerGunk,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  });
}

// https://allchemy.io/api/users/me/items?after=career&count=5096
async function getItems(params = {}) {
  let toSearchParams = new URLSearchParams(params);
  return await fetch("https://allchemy.io/api/items" + (params.length > 0 ? '?' : '') + toSearchParams.toString(), {
    ...headerGunk,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  });
}

// ----

async function autoCraft_simple_BNF(speed = 15, dev = 50, start = { x: 1635, y: 100 }, end = { x: 400, y: 111 }) {

  if (window?.STOPCRAFTING) return;

  const safeZone = { x: 105, y: 32 }
  await sleep(0.5);
  clickPos(safeZone);

  await fakeDrag(start, {
    ...end,
    y: end.y + (Math.random() * dev)
  }, speed);

  await sleep(0.5);

  clickPos(safeZone);

  await autoCraft_simple_BNF(
    speed,
    dev,
    start,
    end
  );
}

async function autoCraft_simple_centered(speed = 15, dev = 50, end = { x: 400, y: 111 }) {
  let canvasBounds = CANVAS_.getBoundingClientRect();

  let diff = 75

  let center = [canvasBounds.width / 2, canvasBounds.height / 2];

  return await autoCraft_simple_BNF(speed, dev, { x: center[0] + diff, y: center[1] + diff }, end);
}

async function autoCraft_simple_corner(speed = 15, dev = 50, end = { x: 400, y: 111 }) {
  let bar = findElementWithContent(undefined, '[placeholder="Search"]');
  if (!bar) return;

  let barBounds = bar.getBoundingClientRect();
  let diff = 75 / 2;

  let center = [barBounds.left + diff, ((barBounds.y + barBounds.height) + 8) + diff];

  return await autoCraft_simple_BNF(speed, dev, {
    x: center[0], y: center[1]
  }, end);
}

// ----

{
  // Hold items
  var controlButtonFlag = false;
  var shiftButtonFlag = false;
  var timerResetCombo = 0;
  var controlItemStack = [];
  var regardStack = [];

  document.addEventListener('keydown', (e) => {
    let ee = (i, cb) => (i.toLowerCase() === e.key.toLowerCase()) && cb();

    ee('Control', () => controlButtonFlag = true)

    ee('Enter', () => {
      let searchBar = findElementWithContent(undefined, '[placeholder="Search"]');
      if (searchBar && !searchBar.value) {
        let bounds = searchBar.getBoundingClientRect();
        clickPos({
          x: bounds.x,
          y: ((bounds.y + bounds.height) + 8) + (62 / 2)
        });
      }
    })

    ee('Alt', () => {
      let clearButton = findElementWithContent('Clear', 'button');
      console.log(clearButton);
      if (clearButton) {
        emulateClick(clearButton);
      }
    });

    ee('Shift', () => {
      shiftButtonFlag = true;
    });


    ee(' ', () => {
      if (shiftButtonFlag) {
        if (timerResetCombo > 1) {
          timerResetCombo = 0;
          emulateClick(document.querySelector('#timerButton'))
          return;
        }

        emulateClick(document.querySelector('#timerButton'))
        timerResetCombo++
      }
    })

    if (controlButtonFlag) {
      ee('Shift', () => {
        // Move regard Stack into control stack
        controlItemStack = Array(...regardStack)
      })
    }
  })

  document.addEventListener('mouseup', async (e) => {
    if (controlButtonFlag) {
      let element = document.elementFromPoint(e.clientX, e.clientY);

      if (element) {
        await sleep(0.2)

        emulateMouseDown(element, {
          clientX: e.clientX,
          clientY: e.clientY
        });

        for (let i of controlItemStack) {
          emulateMouseDown(i, {
            clientX: e.clientX,
            clientY: e.clientY - 20
          });
        }

        controlItemStack.push(element);
      }
    }
  })

  document.addEventListener('keyup', (e) => {
    let ee = (i, cb) => (i.toLowerCase() === e.key.toLowerCase()) && cb();

    ee('Control', () => {
      controlButtonFlag = false;
      regardStack = Array(...controlItemStack)

      for (let i of controlItemStack) {
        // Drop item
        emulateMouseUp(i, {
          client: e.clientX,
          clientY: e.clientY
        });

        controlItemStack.splice(controlItemStack.indexOf(i), 1);
      }
    })

    ee('Shift', () => {
      shiftButtonFlag = false;
    })
  })
}

// ----

class AllItem {
  id = 0;
  created = 0;
  data = AllItem.createItemShell();

  pos = { x: 0, y: 0 };

  static createItemShell(item = this.createItem()) {
    return {
      type: 'item',
      item: item
    }
  }

  static createItem(id = 0, name = '', emoji = '', description = '', number = 0) {
    return {
      id,
      name,
      emoji,
      description,
      number
    }
  }

  static create(item, id, created, pos) {
    return new AllItem({
      data: item,
      id,
      created,
      pos
    });
  }

  create = AllItem.create;

  constructor(data) {
    return Object.assign(this, data);
  }
}

function getLSCanvas() {
  return JSON.parse(LS.getItem('pages/index/canvas/v1'))
}

function downloadLSCanvas(name = '') {
  let blob = new Blob([JSON.stringify(getLSCanvas())], { type: 'application/json' });

  // This is stupid   V    V
  let file = new File([blob], name + '.json');

  const a_ = a(), A = a_.get$();
  A.href = URL.createObjectURL(file);
  A.download = name + '.allcanv';
  A.click();
  A.remove()

  return a_;
}

function loadLSCanvas(e) {
  let fr = new FileReader();

  fr.readAsText(e.files[0]);
  return new Promise((resolve, reject) => {
    fr.onload = async (e) => {
      let data = JSON.parse(e.target.result);
      LS.setItem('pages/index/canvas/v1', JSON.stringify(data));

      let module = await MAGIC['pagesIndexStore']()

      for (let i of module.canvas) {
        module.removeFromCanvas(i.id);
      }

      resolve(data);
    }

    fr.onerror = fr.onabort = (e) => {
      reject(e);
    }
  })
}

async function forceGenItem(id = '', itemName = '', itemEmoji = '', itemDescription = '', itemNumber = 0) {
  let item = AllItem.createItem(id, itemName, itemEmoji, itemDescription, itemNumber);
  let shell = {
    data: item,
    id: 0,
    created: 0,
    pos: {
      x: 0,
      y: 0
    }
  }

  let m = await MAGIC['pagesIndexStore']();
  let m2 = await MAGIC['userStore']();
  m2.addToItemCache(shell);
  m2.addToInventory(shell);

  m.addToCanvas(shell);
}

// ----

class AllcanvasUI {

  // Trying to make items appear on the canvas so I can attach events to them, and use them like a button, because the main dev, Pit is adding item folders.

  static items = [];

  static itemSize = 75

  constructor(opts) {
    this.x = opts.x |= 0;
    this.y = opts.y |= 0;

    this.m = this.loader();
  }

  async loader() {
    return await MAGIC['pagesIndexStore']()
  }

  async addItems(...items) {
    let m = await this.m;

    for (let i of items) {
      m.addCanvasItem(i);
    }
  }

  async removeItems(...items) {
    let m = await this.m;

    for (let i of items) {
      m.removeFromCanvas(i.id);
    }
  }

  async sButton(opts) {
    let m = await this.m;

    return [m.addCanvasItem(tempIcoScheme), tempIcoScheme]
  }
}

class RecipeMenu {
  static point = (a = 'fire', opts = {}) => `https://allchemy.io/api/items/${a}/recipes`

  constructor() {
    this.loader();
  }

  async loader() {

  }
}

// ----

class ModMenu {

  pos = {
    x: visualViewport.width / 2, y: visualViewport.height / 2
  }

  modMenuTasks = []

  sliceFirst = (n = 1) => this.modMenuTasks.slice(0, n);

  canvasBox = CANVAS_.getBoundingClientRect();

  exitButton = button()
    .text$('❌')
    .class$('absolute', 'bg-black', 'text-white')
    .style$({
      'width': '1.5rem',
      'height': '1.5rem',
      'top': '3px',
      'right': '5px',
      'font-size': '0.8em',
      'z-index': '100',
      'text-align': 'center',
      'cursor': 'pointer',
      border: '1px solid white',
      'box-shadow': '2px 2px 0 white',
    })

    .on$('click', this.clicked)

  section1 = section(this.exitButton.get$())
    .class$('flex', 'flex-col', 'w-full', 'h-full')
    .style$({
      'border': '1px solid white',
      outline: '2px solid black',
      'background-color': 'black',
      'z-index': '9999',
      'overflow-y': 'auto',
      'overflow-x': 'hidden',
      'padding': '0.5rem',
      display: 'flex',
      position: 'absolute',
      width: this.canvasBox.width - 25 + 'px',
      height: this.canvasBox.height - 75 + 'px',
      ...centerStyle,
      ...centerContentStyle
    })

  // ---

  setVis(vis = false) {
    this.section1.style$({
      display: vis ? 'flex' : 'none'
    })
  }

  show() {
    this.setVis(true);
  }

  hide() {
    this.setVis(false);
  }

  toggle() {
    this.setVis(this.section1.get$().style.display === 'flex' ? false : true);
  }

  clicked(event = new MouseEvent()) {
    let el = event.target;

    el.modMenuTasks > 0
      && el.modMenuTasks.forEach(i => (i |= () => { })(el.MAGIC, event));

    el.MAGIC.hide()
  }

  // ---

  constructor() {

    this.exitButton.get$().MAGIC = this;

    MAIN_
      .append(this.section1.get$())

    document.addEventListener('resize', (e) => {
      this.section1.style$({
        width: this.canvasBox.width - 25 + 'px',
        height: this.canvasBox.height - 75 + 'px',
      })
    })

    this.hide()
  }
}

// ----

var

  styleBG = (MAIN) => MAIN
    .style$({
      'background-color': '#444',
    }),

  styleNav = (NAV) => {
    NAV
      .style$({
        'background-color': '#666',
        'color': 'bisque',
        padding: '0.5rem',
      })

    const aStyles1 = tag('style')
      .html$(`
    nav a {
      transition: all 0.2s ease-in-out;
    }

    nav a:hover {
      transform: scale(1.1);
      transition: all 0.3s ease-in-out;
    }
  `)

    return NAV.append$(aStyles1.get$())
  }

// ----

let
  lPath = location.pathname,
  oldHref = lPath,
  bodyList = document.querySelector("body"),

  PAGEloader = () => { // @ PAGE loader
    let
      battleFlag = (oldHref.includes('/battle')),
      itemFlag = (oldHref.includes('/item')),
      profileFlag = (oldHref.includes('/@')),
      recipesFlag = (oldHref.includes('/recipes')),
      guideFlag = (oldHref.includes('/guides'))
      ;

    {
      (
        (battleFlag && (battleMod(), true))

        || (
          (itemFlag && itemMod())
          || (profileFlag && profileMod())
          || (recipesFlag && recipesMod())
          || (guideFlag && guideMod())
          ,

          (
            (CANVAS_ ?? (window[SYM_].loadedMod = false))
            && !window[SYM_]?.loadedMod
            && (window[SYM_].loadedMod = true)
            && mainMod()
          ),

          CANVAS_
        )
      ) || errorPage()
    }
  };

function PageTransitioner(sen = true) {
  bodyList = document.querySelector("body")
  var observer = new MutationObserver(_ => {
    if (oldHref != location.pathname) {
      oldHref = location.pathname;
      PAGEloader()
    }
  });

  sen && PAGEloader()

  var config = {
    childList: true,
    subtree: true
  };

  observer.observe(bodyList, config);
}

void async function() {

  await loadScript('https://sushajs.replit.app/grecha-susha.js');

  // ---

  PageTransitioner()

  // ---

  {
    console.log([
      'Allchemod',
      ,
      'Version:',
      window[SYM_].allchemod.version,
      ,
      'Loaded'
    ].join('\n'));
  }

}()

// ---

const elFN_ = (MM = new ModMenu()) => ({
  CANVAS: CANVAS_ ? new SushaWrapper(CANVAS_) : false,
  MAIN: MAIN_ ? new SushaWrapper(MAIN_) : false,
  NAV: NAV_ ? new SushaWrapper(NAV_) : false,
  WRAPPER: WRAPPER_ ? new SushaWrapper(WRAPPER_) : false,
  MM
});

// ---

async function mainMod() {
  console.log('Home Mod')

  const { MAIN, WRAPPER, NAV, CANVAS, MM } = elFN_();

  // -0-

  {
    styleBG(MAIN)

    CANVAS
      .style$({
        'z-index': '2',
      })

    styleNav(NAV)
  }

  {
    // Cool bg thing that is just white
    const bg = div().class$('bg')

    bg.style$({
      position: 'absolute',
      top: '0',
      left: '0',
      background: 'white',
      width: '225px',
      height: '125px',
      zIndex: '-1',
    })

    CANVAS.append$(bg.get$())
  }

  {

    let RandomButton = createButton()
      .html$('Random')
      .style$({
        'left': '3px',
        'bottom': '5px',
      })

    CANVAS_
      .append$(RandomButton.get$())

    RandomButton.on$('click', async () => {
      let items = await getItems();
      if (!items.ok) return;
      items = (await items.json())?.itemInfos;

      // console.log(items);

      // Select two random items
      let item1 = items[Math.floor(Math.random() * items.length)]?.item
      let item2 = items[Math.floor(Math.random() * items.length)]?.item

      console.log(item1, item2);

      // Send Craft
      let craft = await sendCraft(item1.id, item2.id);

      if (!craft.ok) console.warn('Failed to craft');

      const json_ = await craft.json()

      console.log('Crafted: ', json_);

      const name = json_.item.id;
      Object.assign(__NUXT__.data['user/item-cache'][name], json_.item);
    })

    window.SET_SECRET_ITEM_ITERV = (i) => setInterval(async () => RandomButton.element.click(), i);
    window.SET_SECRET_MAGIC_ITERV = () => window.SET_SECRET_ITEM_ITERV(2000 + (500 * Math.random()))
  }

  {
    {
      let saveButton = createButton()
        .html$('Save Canvas')
        .style$({
          'left': '3px',
          'bottom': (26 * 2) + 15 + 'px',
          'background-color': '#ff80ff'
        })

      CANVAS_
        .append$(saveButton.get$())

      // --- //

      saveButton.on$('click', () => {
        let promptForName = prompt('What would you like to call this canvas?');
        if (promptForName) {
          downloadLSCanvas(promptForName);
        }

        else {
          downloadLSCanvas('Rob');
        }
      })
    }

    {
      let importButton = createButton()
        .html$('Load Canvas')
        .style$({
          'left': '3px',
          'bottom': 26 + 10 + 'px',
          'background-color': '#ffff00'
        })

      CANVAS_
        .append$(importButton.get$())

      // --- /

      let hiddenInput = input().type$('file')
        .style$({
          display: 'none',
        })

      hiddenInput.on$('change', async (e) => {
        let file = await loadLSCanvas(e.target)
        if (file) {
          console.log('Loaded: ', file);
          location.reload()
        }
      })

      importButton.on$('click', () => hiddenInput.get$().click());

      CANVAS_
        .append$(hiddenInput.get$())

    }
  }

  // ---

  {
    // Speedrun Timer
    window.speedrunTimer = {
      state: false,
      warningClicks: 2,
    }

    let
      timeElement = div("00:00:00.000")
        .id$('timer')
        .style$({
          'position': 'absolute',
          'top': '0.5rem',
          'left': '5px',
          'color': 'bisque',
          'font-size': '1.5rem',
          'font-weight': 'bold',
          'text-align': 'left',
          'text-stroke': '1px black',
          'z-index': '1',
          height: '1.5rem',
          color: '#facc15',
          textShadow: '2px 2px 0px black, 0px 1px 0px black, 1px 1px 0px black, 1px 0px 0px black, 0px 0px 0px black, -1px -1px 0px black, -1px 0px 0px black, 0px -1px 0px black',
        }),

      timerButton = createButton()
        .html$('Start Timer')
        .id$('timerButton')
        .style$({
          'left': '3px',
          'top': '2rem'
        }),

      resetTimerButton = createButton()
        .html$('Reset Timer')
        .id$('resetTimerButton')
        .style$({
          'left': '3px',
          'top': '4rem'
        })

    // ---

    function formatTime(time) {
      const pad = (num, size) => num.toString().padStart(size, '0');
      let ms = time % 1000;
      let s = Math.floor(time / 1000) % 60;
      let m = Math.floor(time / (1000 * 60)) % 60;
      let h = Math.floor(time / (1000 * 60 * 60));
      return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`;
    }

    // This guy is very important
    const AMM = (1000 / 10) // s/fps

    timerButton.on$('click', () => {
      if (window.speedrunTimer.state) {
        window.speedrunTimer.state = false;
        window.speedrunTimer.warningClicks = 2;

        timerButton.text$('Start Timer')

        clearInterval(window.speedrunTimer.interval);
        timeElement.text$(formatTime(Date.now() - window.speedrunTimer.startTime));
      }

      else {
        window.speedrunTimer.state = true;
        timerButton.text$('Stop Timer')
        window.speedrunTimer.startTime = Date.now();

        window.speedrunTimer.interval = setInterval(() => {
          let elapsedTime = Date.now() - window.speedrunTimer.startTime;

          requestAnimationFrame(() => {
            timeElement.text$(formatTime(elapsedTime));
          })
        }, AMM);
      }
    })

    function resetSpeedrunTimer() {
      if (window.speedrunTimer.state) timerButton.get$().click();
      window.speedrunTimer.startTime = Date.now();
      window.speedrunTimer.warningClicks = 2;
      timerButton.text$('Start Timer')

      window.speedrunTimer.interval && clearInterval(window.speedrunTimer.interval);
      timeElement.text$(formatTime(Date.now() - window.speedrunTimer.startTime));
    }

    resetTimerButton.on$('click', () => {
      if (window.speedrunTimer.state) {
        let shouldReset = (window.speedrunTimer.warningClicks <= 0)

        if (shouldReset) {
          resetSpeedrunTimer()
          timerButton.text$(`Reset the Timer!!`);
          sleep(2.5).then(() => {
            !window.speedrunTimer.state
              && timerButton.text$('Start Timer')
          })
        }

        else {
          window.speedrunTimer.warningClicks--;
          timerButton.text$(`Reset Timer (${window.speedrunTimer.warningClicks} clicks left)`);
          sleep(2.5).then(() => {
            window.speedrunTimer.state
              && timerButton.text$('Stop Timer')
          })
        }
      }

      else {
        window.speedrunTimer.warningClicks = 2;
        timerButton.text$('Start Timer')
        resetSpeedrunTimer()
      }
    })

    // ---

    CANVAS
      .appendChildren$(
        timeElement.get$(),
        timerButton.get$(),
        resetTimerButton.get$()
      )
  }

  // ---

  {

    let lia = (text, link) => li(a().html$(text).att$('href', link))
      .style$({
        'list-style-type': 'square'
      })

    let spc2 = Spcu()('bg-red-400')

    let btn2 = spc2.get$().children[0]
    btn2.on$('click', () => MM.toggle())

    let spc = Spcu(
      lia('Allchemy', 'https://allchemy.io'),
      lia('Allchemod', 'https://allchemodweb.replit.app'),
      lia('Allchemod Discord', 'https://discord.gg/'),
      lia('Allchemod GitHub', 'https://github.com/SpcFORK/allchemod')
    )()

    spc.get$().children[0].style$({
      top: '1.8rem',
    })

    spc.get$().children[1].style$({
      top: 1.2 + (1.5 / 2) + `rem`,
    })

    let button = spc.get$().children[0]
    let body_ = spc.get$().children[1]
    button.on$('click', () => {

      {
        body_.get$().style.display != 'none'
          && body_.style$({
            'display': 'none'
          })

          || body_.style$({
            'display': 'block'
          })
      }



    })

    CANVAS
      .appendChildren$(
        spc,
        spc2
      )
  }
}

async function battleMod() {
  console.log('Battle Mod')

  const { MAIN, WRAPPER, NAV, CANVAS, MM } = elFN_(false);

  {
    styleBG(MAIN)
    styleNav(NAV)
  }
}

async function itemMod() {
  console.log('Item Mod')

}

async function profileMod() {
  console.log('Profile Mod')

}

async function recipesMod() {
  console.log('Recipes Mod')

}

async function guideMod() {
  console.log('Guide Mod')

}

async function errorPage() {
  console.log('Error Mod')

  const { MAIN, WRAPPER, NAV, CANVAS, MM } = elFN_(CANVAS_);
  const CL = document.querySelector('.close.right-1')

  if (!CL) return;

  const closeButton = new SushaWrapper(CL)

  {
    styleBG(MAIN)
    styleNav(NAV)
  }

  closeButton.on$('click', async () => {
    // await sleep(1)
    await When(() => CANVAS_, async () => {
      await sleep(1)
      PAGEloader()
    })
  })
}
