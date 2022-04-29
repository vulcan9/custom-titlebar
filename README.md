# custom-titlebar

Poorly coded titlebar for [Electron](https://www.electronjs.org/), [NW.js](https://nwjs.io/) and [PWAs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps).

![NPM](https://img.shields.io/npm/l/@6c65726f79/custom-titlebar) ![npm](https://img.shields.io/npm/v/@6c65726f79/custom-titlebar) ![npm bundle size](https://img.shields.io/bundlephobia/min/@6c65726f79/custom-titlebar) ![npm](https://img.shields.io/npm/dm/@6c65726f79/custom-titlebar) [![](https://data.jsdelivr.com/v1/package/npm/@6c65726f79/custom-titlebar/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@6c65726f79/custom-titlebar)


![Preview 1](screenshots/capture-1.png)

> Light/Dark skin

![Preview 3](screenshots/capture-3.png)

> Control button styles

<details>
<summary>Show me more</summary>

![Preview 2](screenshots/capture-2.png)

> Condensed menu

![Preview 4](https://raw.githubusercontent.com/6c65726f79/custom-titlebar/main/screenshots/capture-4.gif)

> Progressive web app

</details>

# About

**It's a library for Electron, NW.js and PWAs, it can be used on a basic website but it's useless ¯\\_(ツ)_/¯**

## Main features

* Compatible with any version of Electron 🎉
* Works with Electron, NW.js and probably others 🤷‍♂️
* Fully compatible with Progressive Web Apps and Window Controls Overlay 🔥
* Works without any dependencies, so it won't break in the next major release of Electron 👀
* Very small footprint (< 30 kB) 👣
* Options and methods very similar to [custom-electron-titlebar](https://www.npmjs.com/package/custom-electron-titlebar) 📖

## Demo

You can see a demo of this library in a PWA here: https://6c65726f79.github.io/custom-titlebar/

Notes:
* Check the list of [compatible browsers](https://developer.mozilla.org/en-US/docs/Web/Manifest/display_override#browser_compatibility).
* If the install button doesn't appear, try reloading and reopening the tab several times.
* You may need to manually enable Window Controls Overlay until Chrome 98 is released: `chrome://flags/#enable-desktop-pwas-window-controls-overlay`

## Inpiration

This package is highly inspired by [custom-electron-titlebar](https://www.npmjs.com/package/custom-electron-titlebar).

## Motivations

I needed a custom titlebar for Electron 14 to replace the unmaintained [custom-electron-titlebar](https://www.npmjs.com/package/custom-electron-titlebar), but I couldn't find any interesting ones, so I made it myself.

## Not yet implemented

* ~~MenuItem role, icon, radio~~ Done!
* ~~Icons theme~~ Done!
* Submenu scrollbar
* Keyboard controls

# Q&A

## Can I use this package without `@electron/remote`?

Absolutely! Check out the [advanced examples](https://github.com/6c65726f79/custom-titlebar/wiki/Advanced-examples#use-without-electronremote) to see how it's done.

## How to fix Content Security Policy errors?

Simply add `style-src 'unsafe-inline'` in the `Content-Security-Policy` meta tag.

## How long before this package becomes unmaintained too?

This package doesn't rely on the Electron or NW.js API so it doesn't need as much maintenance as other packages. Even if I stop maintaining it and the API change dramatically, you could modify your code to match the new API. So theoretically this package can't become obsolete.

# Install

```
npm i @6c65726f79/custom-titlebar
```

# Usage

## Node.js

### JavaScript

```javascript
const Titlebar = require('@6c65726f79/custom-titlebar');

new Titlebar({
  backgroundColor: '#000'
});
```

### TypeScript

```typescript
import Titlebar from '@6c65726f79/custom-titlebar';

new Titlebar({
  backgroundColor: '#000'
});
```

## Browser

```html
<script src="https://cdn.jsdelivr.net/npm/@6c65726f79/custom-titlebar/lib/index.js"></script>

<script>
  new Titlebar({
    backgroundColor: '#000'
  });
</script>
```

# Examples

See the Wiki for more [advanced examples](https://github.com/6c65726f79/custom-titlebar/wiki/Advanced-examples).

## Electron

### main.js

```javascript
const { initialize, enable } = require('@electron/remote/main');
const { app, BrowserWindow } = require('electron');
const path = require('path');

initialize();

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  enable(win.webContents);
  
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
})
```

### preload.js

```javascript
const { Menu, getCurrentWindow } = require('@electron/remote');
const Titlebar = require('@6c65726f79/custom-titlebar');
const { platform } = require('process');

const currentWindow = getCurrentWindow();
let titlebar;

currentWindow.webContents.once('dom-ready', () => {
  titlebar = new Titlebar({
    menu: Menu.getApplicationMenu(),
    backgroundColor: '#37474f',
    platform: platform,
    browserWindow: currentWindow, /* Only needed if you use MenuItem roles */
    onMinimize: () => currentWindow.minimize(),
    onMaximize: () => currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize(),
    onClose: () => currentWindow.close(),
    isMaximized: () => currentWindow.isMaximized()
  });
});
```

## NW.js

### package.json

```json
{
  "name": "helloworld",
  "main": "index.html",
  "window": {
    "frame": false,
    "toolbar": false
  },
  "dependencies": {
    "@6c65726f79/custom-titlebar": "latest"
  }
}
```

### index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Hello World!</title>
    <script src="./node_modules/@6c65726f79/custom-titlebar/lib/index.js"></script> 
  </head>
  <body>
    <h1>Hello World!</h1>
    <script>
      const gui = require('nw.gui');
      const { platform } = require('process');
      const win = gui.Window.get();
      let maximized = false;

      win.onMaximized.addListener(() => { maximized=true; });
      win.onRestore.addListener(() => { maximized=false; });

      const titlebar = new Titlebar({
        backgroundColor: '#37474f',
        platform: platform,
        onMinimize: () => win.minimize(),
        onMaximize: () => maximized ? win.restore() : win.maximize(),
        onClose: () => win.close(),
        isMaximized: () => maximized
      });
    </script>
  </body>
</html>
```

## Progressive Web App

### manifest.webmanifest

```json
{
  "background_color": "#2975ff",
  "description": "Progressive Web Application with a custom titlebar",
  "display": "standalone",
  "display_override": ["window-controls-overlay"],
  "icons": [],
  "name": "Progressive Web Application",
  "short_name": "custom-titlebar",
  "start_url": "./",
  "theme_color": "#2975ff"
}
```

### index.html

```html
<html>
    <head>
        <title>Titlebar</title>
        <script src="https://cdn.jsdelivr.net/npm/@6c65726f79/custom-titlebar/lib/index.js"></script>
        <link rel="manifest" href="manifest.webmanifest">
    </head>
    <body>
        <div id="app" style="padding:8px;">
            This is a web page
        </div>
        <script>
          let titlebar;
          const menu = [
            {
              label: 'File',
              submenu: [
                {
                    label: 'Checkbox',
                    type: 'checkbox',
                    id: 'checkbox'
                },
                {
                    label: 'Checked state',
                    click: () => {
                        alert(titlebar.getMenuItemById('checkbox')?.checked ? 'Checked' : 'Unchecked');
                    }
                }
              ]
            }
          ];
          
          function createTitlebar() {
            titlebar = new Titlebar({
              backgroundUnfocusEffect: false,
              windowControlsOverlay: true,
              backgroundColor:"#2975ff",
              menu
            });
          }

          window.addEventListener('load', () => {
            // Use the titlebar only in standalone mode
            if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
              createTitlebar();
            }

            window.matchMedia('(display-mode: standalone)').onchange = (e) => {
              e.matches ? createTitlebar() : titlebar.dispose();
            }
          });
        </script>
    </body>
</html>
```

# Options

All parameters are optional.

| Parameter                | Type       | Description                                                                        | Default          |
| ------------------------ | ---------- | ---------------------------------------------------------------------------------- | ---------------- |
| backgroundColor          | `string`   | The background color of the titlebar. The value must be a valid CSS color.         | `"#FFFFFF"`      |
| backgroundUnfocusEffect  | `boolean`  | Enables or disables the unfocus effect on the background of the titlebar.          | `true`           |
| browserWindow            | `object`   | The current `BrowserWindow`. **(Electron only)**                                   | undefined        |
| condensed                | `boolean`  | Force the menu bar to be condensed.                                                | `false`          |
| closeable                | `boolean`  | Enables or disables the close button.                                              | `true`           |
| drag                     | `boolean`  | Define whether or not you can drag the window.                                     | `true`           |
| hideControlsOnDarwin     | `boolean`  | Set this option to true if you're using `titleBarStyle: 'hidden'` on macOS. **(Electron only)** | `false`          |
| hideMenuOnDarwin         | `boolean`  | Hide the menu bar when the `platform` is `darwin`.                                 | `true`           |
| height                   | `number`   | The height of the titlebar.                                                        | `30`             |
| icon                     | `string`   | The icon of the titlebar.                                                          | undefined        |
| isMaximized              | `function` | A function that return `true` or `false` if the window is maximized or not.        | undefined        |
| maximizable              | `boolean`  | Enables or disables the maximize button.                                           | `true`           |
| menu                     | `object`   | List of MenuItem to show in the menu bar. ([Electron](https://www.electronjs.org/docs/api/menu-item) or [NW.js](https://docs.nwjs.io/en/latest/References/MenuItem/)) | undefined        | 
| menuItemClickHandler     | `function` | A function that takes a `commandId` as parameter to handle menu item clicks.       | undefined        |
| minimizable              | `boolean`  | Enables or disables the minimize button.                                           | `true`           |
| onClose                  | `function` | The function to call when the close button is clicked.                             | undefined        |
| onMaximize               | `function` | The function to call when the maximize/restore button is clicked.                  | undefined        |
| onMinimize               | `function` | The function to call when the minimize button is clicked.                          | undefined        |
| overflow                 | `string`   | The overflow of the container. (`auto`, `visible`, `hidden`)                       | `"auto"`         |
| platform                 | `string`   | Style of the control buttons. (`win`, `darwin`)                                    | `"win"`          |
| title                    | `string`   | Window title.                                                                      | `document.title` |
| titleHorizontalAlignment | `string`   | Set horizontal alignment of the window title. (`left`, `center`, `right`)          | `"center"`       |
| unfocusEffect            | `boolean`  | Enables or disables the unfocus effect on the text and background of the titlebar. | `true`           |
| windowControlsOverlay    | `boolean`  | Set this option to true if you're using [Window Controls Overlay](https://github.com/WICG/window-controls-overlay/blob/main/explainer.md). | `false`          |

# Methods

## getMenuItemById

Returns the MenuItem with the specified `id`.

```javascript
const titlebar = new Titlebar({
  menu: [{label: 'Item 1', id: 'item1'}]
});

const menuItem = titlebar.getMenuItemById('item1');

console.log(menuItem.label); // Item 1
```

## updateOptions

This method updates all parameters that are specified.

```javascript
titlebar.updateOptions({
  menu: Menu.getApplicationMenu(),
  condensed: 'true',
  titleHorizontalAlignment: 'left'
});
```

## updateTitle

This method update the title of the titlebar. If you change the content of the title tag, you should call this method to update the title.

```javascript
document.title = 'My new title';
titlebar.updateTitle();

// Or you can do as follows and avoid writing document.title
titlebar.updateTitle('New Title');
```

## updateMenu

> Deprecated: This method will be removed in v1.0.0, use `updateOptions` instead.

This method updates or creates the menu. You can use an array of MenuItem from [Electron](https://www.electronjs.org/docs/api/menu-item)/[NW.js](https://docs.nwjs.io/en/latest/References/MenuItem/), or directly `Menu.getApplicationMenu()` in Electron.

```javascript
// With a menu template
const menu = [
  {
    label: 'Item 1',
    submenu: [
      {
        label: 'Subitem 1',
        click: () => console.log('Clicked on subitem 1')
      },
      {
        type: 'separator'
      },
      {
        label: 'Subitem 2',
        click: () => console.log('Clicked on subitem 2')
      },
    ]
  },
  {
    label: 'Item 2',
    submenu: [
      {
        label: 'Subitem checkbox',
        type: 'checkbox',
        checked: true
      },
      {
        type: 'separator'
      },
      {
        label: 'Subitem with submenu',
        submenu: [
          {
            label: 'Submenu item 1',
            accelerator: 'Ctrl+T'
          }
        ]
      }
    ]
  }
];
titlebar.updateMenu(menu);

// Or with getApplicationMenu in Electron
titlebar.updateMenu(Menu.getApplicationMenu());

// Disable menu
titlebar.updateMenu();
```

## dispose

This method removes the titlebar completely and all recorded events.

```javascript
titlebar.dispose();
```

# CSS Classes

The following CSS classes exist and can be used to customize the titlebar.

| Class name                        | Description                                |
|-----------------------------------|--------------------------------------------|
| `custom-titlebar`                 | Style of the titlebar.                     |
| `custom-titlebar-appicon`         | Style of the icon.                         |
| `custom-titlebar-container`       | Style of the container under the titlebar. |
| `custom-titlebar-controls`        | Style of the window controls.              |
| `custom-titlebar-menu-item`       | Style of the main menu items.              |
| `custom-titlebar-separator`       | Style of the separators.                   |
| `custom-titlebar-submenu`         | Style of the submenus.                     |
| `custom-titlebar-submenu-item`    | Style of the submenu items.                |

### 추가된 CSS Class

| Class name                        | Description                                  |
|-----------------------------------|----------------------------------------------|
| `backdrop`                        | backdrop 스타일                              |
| `custom-titlebar-menu-active`     | 현재 활성화 상태의 메뉴 아이템.              |
| `custom-titlebar-group`           | label이 설정된 그룹(separator 라인) 아이템.  |
| `custom-titlebar-group-label`     | 그룹 아이템의 label 스타일.                  |
| `custom-titlebar-separator-line`  | separators 라인 스타일.                      |
| `custom-titlebar-disabled-item`   | 비활성 항목 스타일.                          |

----

Made with love and fun from France ❤



# 추가된 기능

### 메뉴 생성 위치 (DOM) 을 지정
DOM을 지정하여 사용하면 `container`를 생성하지 않고 HTML 구조를 그대로 유지 할 수 있음(DOM 이동 없음)

```
// HTML: <div id='custom-titlebar'></div>

const dom = document.querySelector('#custom-titlebar');
const titlebar = new Titlebar({}, dom);

// dom 내부에 메뉴가 생성됨
```

### separator 라벨 지정 가능
separator 라인과 함깨 label을 표시할 수 있음 (메뉴 그룹 표시)
```
    ...
    submenu: [
        ...
        {
            type: 'separator',
            label: 'Group title',
        },
        ...
    ]
```

### open, close 이벤트
이벤트는 최상위 메뉴가 열리고 닫힐때 한번씩만 발생함.  
서브메뉴가 열리고 닫히는 것과 무관함.
```
var titlebarDOM = document.querySelector('.custom-titlebar');
titlebarDOM.addEventListener('openMenu', onOpenMenu);
titlebarDOM.addEventListener('closeMenu', onCloseMenu);

function onOpenMenu (e){
    window.console.error('onOpenMenu : ', e.detail);
}
function onCloseMenu(e){
    window.console.error('onCloseMenu : ', e.detail);
}
```

### backdrop 옵션 (Options)
메뉴가 열렸을때 메뉴 뒤쪽에 위치한 DOM에 마우스 기능을 막도록 backdrop을 생성함
```
const titlebar = new Titlebar({backdrop: true});

// CSS
.backdrop:before{
    content: '';
    background-color: #33c74824;
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
}
```

### open/close 메서드 추가
프로그램으로 메뉴를 열고 닫을수 있도록 메서드 추가함.
서브 메뉴는 지원하지 않음
```
// 수동으로 열기/닫기 (default index:0)
titlebar.open(index?:=0);
titlebar.close();
```

### 메뉴 open 될떼 내용 변경 가능하도록 hook 메서드 지정 (Options)
```
titlebar.updateOptions({
    onOpenMenuHook: onOpenMenuHook
});

// 수동으로 index 열기/닫기
// titlebar.open(index);
// titlebar.close();

function onOpenMenuHook(index){
    // 메뉴 내용 교체
    titlebar.updateOptions({
        menu: 새로운 메뉴 템플릿
    });

    // true를 return 하면 메뉴가 열리는것을 중지하므로 이후 수동으로 열어야 함
    // return true;
}
```

### 아이콘 CSS Selector 지정 가능
`icon` 옵션이 지정된 경우 `img` 태그에 css가 설정되고, 지정되지 않은 경우 `div` 태그에 지정됨
- `#이름` : id로 지정
- `.이름`, `이름` : class로 지정
- `[이름]`, `[이름=""]`, `[이름='']` : attribute으로 지정

```
titlebar.updateOptions({
    iconSelector: 'CSS Selector 지정',
    className: 'CSS Selector 지정'
});

// CSS에서 아이콘 모양 지정
```

### useBlurClose 옵션
윈도우창이 포커싱을 잃었을때 메뉴 창을 닫을지(true) 여부 (default=true)

### _dev 옵션
개발용으로 사용. true로 지정하면 blur, mouseleave 이벤트에 대해서 창을 닫지 않음 (default=false)

## 실행 명령
```
webpack watch --mode development
npm run watch
```





































