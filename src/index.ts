import style from './style/style.scss';
import svg from './style/svg.json';
import Menu from './classes/Menu';
import {Options, TitleBarOptions} from './classes/Options';

/////////////////////////////////////////////////////////////////////
// Titlebar
/////////////////////////////////////////////////////////////////////

export default class Titlebar {
    container: HTMLDivElement | null;
    titlebar: HTMLDivElement;
    dragregion: HTMLDivElement;
    appicon: HTMLDivElement;
    menubar: HTMLDivElement;
    title: HTMLDivElement;
    titlecontainer: HTMLSpanElement;

    controls: HTMLDivElement;
    minimizeWindow: HTMLDivElement;
    maximizeWindow: HTMLDivElement;
    restoreWindow: HTMLDivElement;
    closeWindow: HTMLDivElement;

    menu: Menu | null = null;
    menuTemplate: Record<string, any> | null = null;
    menuSize = 0;
    menuCondensed = false;
    titlebarHeight = 30;

    listener: any;
    options: TitleBarOptions = Options.values;

    static instance: Map<string, Titlebar> = new Map();

    static getInstance(instanceID: string): Titlebar {
        return Titlebar.instance.get(instanceID) as Titlebar;
    }

    static getMenu(instanceID: string): Menu {
        const instance: Titlebar = Titlebar.getInstance(instanceID) as Titlebar;
        return instance.menu as Menu;
    }

    static getOptions(instanceID: string): TitleBarOptions {
        const instance: Titlebar = Titlebar.getInstance(instanceID) as Titlebar;
        return instance.options as TitleBarOptions;
    }

    constructor(titleBarOptions?: TitleBarOptions, dom?: HTMLDivElement) {
        // Inject style
        (style as any).use();
        if (titleBarOptions?._dev){
            window.console.log("[Custom-titlebar] style : ", style.locals);
        }

        // Create titlebar
        const titlebar = dom ? dom : document.createElement('div');
        titlebar.id = style.locals.titlebar;
        titlebar.classList.add('custom-titlebar');
        titlebar.oncontextmenu = () => false;
        titlebar.classList.add(style.locals['hide-menu']);

        // Create drag region
        const dragregion = document.createElement('div');
        dragregion.id = style.locals.dragregion;
        dragregion.classList.add('custom-titlebar-dragregion');
        titlebar.append(dragregion);

        // App icon
        const appicon = document.createElement('div');
        appicon.id = style.locals.appicon;
        appicon.classList.add('custom-titlebar-appicon');
        titlebar.append(appicon);

        // Create menubar
        const menubar = document.createElement('div');
        menubar.id = style.locals.menubar;
        menubar.classList.add('custom-titlebar-menubar');
        titlebar.append(menubar);

        // Create title
        const title = document.createElement('div');
        title.id = style.locals.title;
        title.classList.add('custom-titlebar-title');

        const titlecontainer = document.createElement('span');
        title.append(titlecontainer);
        titlebar.append(title);

        // Create controls
        const controls = document.createElement('div');
        controls.id = style.locals.controls;
        controls.classList.add('custom-titlebar-controls');

        const minimizeWindow = document.createElement('div');
        minimizeWindow.id = style.locals.minimize;
        minimizeWindow.classList.add('custom-titlebar-minimize');
        minimizeWindow.classList.add(style.locals.button);
        minimizeWindow.title = 'Minimize';
        controls.append(minimizeWindow);
        const maximizeWindow = document.createElement('div');
        maximizeWindow.id = style.locals.maximize;
        maximizeWindow.classList.add('custom-titlebar-maximize');
        maximizeWindow.classList.add(style.locals.button);
        maximizeWindow.title = 'Maximize';
        controls.append(maximizeWindow);
        const restoreWindow = document.createElement('div');
        restoreWindow.id = style.locals.restore;
        restoreWindow.classList.add('custom-titlebar-restore');
        restoreWindow.classList.add(style.locals.button);
        restoreWindow.title = 'Restore';
        controls.append(restoreWindow);
        const closeWindow = document.createElement('div');
        closeWindow.id = style.locals.close;
        closeWindow.classList.add('custom-titlebar-close');
        closeWindow.classList.add(style.locals.button);
        closeWindow.title = 'Close';
        controls.append(closeWindow);
        titlebar.append(controls);

        //------------------------------------------------------------------
        // Create container

        const container = ((): HTMLDivElement | null => {
            if (dom) return null;
            const container = document.createElement('div');
            container.id = style.locals.container;
            container.classList.add('custom-titlebar-container');

            // Move body inside a container
            while (document.body.firstChild) {
                container.append(document.body.firstChild);
            }

            // Insert container
            document.body.append(container);
            document.body.style.overflow = 'hidden';
            document.body.style.margin = '0';

            // Insert titlebar
            document.body.insertBefore(titlebar, container);
            return container;
        })();

        //------------------------------------------------------------------

        this.titlebar = titlebar;
        this.dragregion = dragregion;
        this.appicon = appicon;
        this.menubar = menubar;
        this.title = title;
        this.titlecontainer = titlecontainer;
        this.container = container;

        this.controls = controls;
        this.minimizeWindow = minimizeWindow;
        this.maximizeWindow = maximizeWindow;
        this.restoreWindow = restoreWindow;
        this.closeWindow = closeWindow;

        // Apply options
        if (titleBarOptions) {
            this.updateOptions(titleBarOptions);
        }

        // Apply theme
        this.windowControlsOverlayListener();
        this.applyTheme();

        // Event listeners
        this.listener = {
            onBlur: this.onBlur.bind(this),
            onFocus: this.onFocus.bind(this),
            onResize: this.onResize.bind(this),
            onClick: this.onClick.bind(this),

            onOpenMenu: this.onOpenMenu.bind(this),
            onCloseMenu: this.onCloseMenu.bind(this)
        }

        window.addEventListener('blur', this.listener.onBlur);
        window.addEventListener('focus', this.listener.onFocus);
        window.addEventListener('resize', this.listener.onResize);

        titlebar.addEventListener('openMenu', this.listener.onOpenMenu);
        titlebar.addEventListener('closeMenu', this.listener.onCloseMenu);
    }

    updateOptions(titleBarOptions: TitleBarOptions): void {
        this.options = Object.assign({}, this.options, titleBarOptions);
        Options.setPlatform(this.options.platform);

        // onlyCondensedButton: true 이면 버튼으로만 사용됨
        Options.checkCondensedButton(this.options);

        this.applyOptions();
    }

    /*
    updateMenu(template?: Record<string, any> | null): void {
      // Deprecated warning
      // eslint-disable-next-line no-console
      console.warn('Warning: updateMenu is deprecated and will be removed in v1.0.0, use updateOptions instead.');
      updateMenu(template);
    }
    */

    getMenuItemById(id: string, menu = this.menuTemplate): Record<string, any> | null {
        if (!menu) return null;
        let found = menu.items.find((item: Record<string, any>) => item.id === id) || null;
        for (let i = 0; !found && i < menu.items.length; i++) {
            if (menu.items[i].submenu) {
                found = this.getMenuItemById(id, menu.items[i].submenu);
            }
        }
        return found;
    }

    buildMenu(condensed = false): void {
        this.menuCondensed = condensed;
        const menubar = this.menubar;
        const menuTemplate = this.menuTemplate;

        menubar.innerHTML = '';
        if (!menuTemplate) return;

        let items = menuTemplate.items;
        if (condensed) {
            items = [{
                role: 'mainMenu', type: 'submenu', submenu: {
                    items: menuTemplate.items,
                },
            },];
        }

        // 등록 후 Menu 생성
        Titlebar.instance.set(this.options.instanceID, this);
        this.menu = new Menu(items, false, this.options.instanceID);

        // Insert menu items
        this.menu.menuItems.forEach((menuItem) => {
            menubar.append(menuItem.element);
        });

        if (!condensed) {
            this.updateMenuSize();
        }
    }

    // 수동으로 메뉴 열기
    open(index = 0): void {
        this.menu?.open(index);
    }

    close(): void {
        this.menu?.closeSubMenu();
    }

    dispose(): void {
        const titlebar = this.titlebar;
        titlebar.removeEventListener('openMenu', this.listener.onOpenMenu);
        titlebar.removeEventListener('closeMenu', this.listener.onCloseMenu);
        titlebar.remove();

        const container = this.container;
        if (container) {
            while (container.firstChild) {
                document.body.append(container.firstChild);
            }
            container.remove();
        }

        window.removeEventListener('blur', this.listener.onBlur);
        window.removeEventListener('focus', this.listener.onFocus);
        window.removeEventListener('resize', this.listener.onResize);
        window.removeEventListener('click', this.listener.onClick);
        this.listener = null;
    }

    //------------------------------------------------
    // 핸들러
    //------------------------------------------------

    onBlur(): void {
        if (this.options.unfocusEffect) {
            this.titlebar.classList.add(style.locals.inactive);
        }

        // 개발용으로 닫지 않음
        if (this.options._dev) return;

        if (!this.options.useBlurClose) return;
        this.menu?.closeSubMenu();
    }

    onFocus(): void {
        this.titlebar.classList.remove(style.locals.inactive);
    }

    onResize(): void {
        debounce(() => this.resized(), 100);
    }

    resized(): void {
        this.titlebar.classList.toggle(style.locals.maximized, (this.options.isMaximized && this.options.isMaximized()) || false,);
        this.updateMenuSize();
    }

    // onClick 이벤트 등록
    onClick(): void {
        this.menu?.closeSubMenu();
    }

    onOpenMenu(): void {
        // 다른 instance의 열린 메뉴 닫기
        // 열린 상태의 메뉴를 항상 1개만 유지
        Titlebar.instance.forEach((instance, key, map) => {
            if (key === this.options.instanceID) return;
            instance.onClick();
        });

        // console.error('open: ', this.options.instanceID);
        window.addEventListener('click', this.listener.onClick, true);

        // backdrop
        if (this.options.backdrop) {
            this.titlebar.classList.add('backdrop');
        }
    }

    onCloseMenu(): void {
        // console.error('onCloseMenu: ', this.options.instanceID);
        window.removeEventListener('click', this.listener.onClick, true);

        // backdrop
        this.titlebar.classList.remove('backdrop');
    }

    windowControlsOverlayListener(): void {
        const nav: Record<string, any> = window.navigator;
        if ('windowControlsOverlay' in nav) {
            const size = nav.windowControlsOverlay.getBoundingClientRect ? nav.windowControlsOverlay.getBoundingClientRect() : nav.windowControlsOverlay.getTitlebarAreaRect();
            this.windowControlsOverlayHandler(nav.windowControlsOverlay.visible, size);

            nav.windowControlsOverlay.addEventListener('geometrychange', debounce((e: Record<string, any>) => {
                this.windowControlsOverlayHandler(e.visible, e.boundingRect ? e.boundingRect : e.titlebarAreaRect);
            }, 10),);
        }
    }

    windowControlsOverlayHandler(visible: boolean, size: DOMRect): void {
        // Update titlebar height
        this.updateHeight(visible ? size.height : this.titlebarHeight);

        // Update controls visibility
        this.controls.style.display = visible || this.options.windowControlsOverlay ? 'flex' : 'none';
    }

    //------------------------------------------------
    // 옵션
    //------------------------------------------------

    applyOptions(): void {
        const o: TitleBarOptions = this.options;

        // 개발용 경고
        if (o._dev) {
            Object(window)._style = style;
            window.console.warn("[Custom-titlebar] 임시 개발용 (submenu, blur 안닫음) 삭제할것");
        }

        this.updateTitle();
        this.updateHorizontalAlignment();
        this.updateIcon();
        this.updateSystemButton();
        this.updateBackground();

        if (o.overflow) {
            if (this.container) this.container.style.overflow = o.overflow;
        }
        if (typeof o.drag != 'undefined') {
            this.titlebar.classList.toggle(style.locals.nodrag, !o.drag);
        }
        if (o.platform) this.applyTheme();

        if (typeof o.hideMenuOnDarwin != 'undefined') {
            this.titlebar.classList.toggle(style.locals['hide-menu'], o.hideMenuOnDarwin);
        }
        if (o.height) {
            this.titlebarHeight = o.height;
            this.updateHeight(o.height);
        }

        this.updateDragregion();
        this.updateMenu();
        this.updateMenuSize();
    }

    updateTitle(): void {
        this.titlecontainer.innerText = this.options.title || window.document.title;
        this.title.style.display = this.options.hideTitle ? 'none' : 'block';
    }

    updateHorizontalAlignment(): void {
        const position = this.options.titleHorizontalAlignment;
        if (typeof position === 'undefined') return;

        this.title.classList.toggle(style.locals.left, position == 'left');
        this.title.classList.toggle(style.locals.right, position == 'right');
    }

    updateIcon(): void {
        const icon = this.options.icon;
        if (typeof icon === 'undefined') return;

        this.appicon.style.backgroundImage = icon ? `url('${icon}')` : 'unset';
        this.appicon.style.display = icon ? 'inline-block' : 'none';
    }

    updateSystemButton(): void {
        const o = this.options;

        if (typeof o.minimizable != 'undefined') {
            this.minimizeWindow.classList.toggle(style.locals.disabled, !o.minimizable);
        }
        if (typeof o.maximizable != 'undefined') {
            this.maximizeWindow.classList.toggle(style.locals.disabled, !o.maximizable);
        }
        if (typeof o.closeable != 'undefined') {
            this.closeWindow.classList.toggle(style.locals.disabled, !o.closeable);
        }
        if (typeof o.minimizable != 'undefined' || typeof o.maximizable != 'undefined') {
            this.controls.classList.toggle(style.locals['close-only'], !o.minimizable && !o.maximizable);
        }
        if (o.onMinimize) {
            this.minimizeWindow.onclick = o.onMinimize;
        }
        if (o.onMaximize) {
            this.maximizeWindow.onclick = o.onMaximize;
            this.restoreWindow.onclick = o.onMaximize;
        }
        if (o.onClose) {
            this.closeWindow.onclick = o.onClose;
        }
        if (o.isMaximized) {
            this.titlebar.classList.toggle(style.locals.maximized, o.isMaximized());
        }

        if (typeof o.windowControlsOverlay != 'undefined') {
            this.controls.style.display = o.windowControlsOverlay ? 'flex' : 'none';
        }
        if (typeof o.hideControlsOnDarwin != 'undefined') {
            this.controls.style.visibility = o.hideControlsOnDarwin && Options.getPlatform() == 'darwin' ? 'hidden' : 'visible';
        }
    }

    updateBackground(): void {
        const color = this.options.backgroundColor;
        if (typeof color === 'undefined') return;
        if (color === 'transparent'){
            this.titlebar.classList.toggle(style.locals.dark, false);
            this.titlebar.style.backgroundColor = 'transparent';
            return;
        }

        const rgb = parseColor(color);
        const brightness = getBrightness(rgb);
        this.titlebar.classList.toggle(style.locals.dark, brightness <= 125);
        this.titlebar.style.backgroundColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    }

    updateDragregion(): void{
        const backgroundUnfocusEffect = this.options.backgroundUnfocusEffect;
        if (typeof backgroundUnfocusEffect === 'undefined') return;
        this.dragregion.style.opacity = backgroundUnfocusEffect ? '1' : '0';
    }

    updateMenu(): void {
        // Record<string, any> | null
        const template = this.options.menu;
        if (typeof template === 'undefined') return;

        this.menuTemplate = template ? parseMenuTemplate(template) : null;
        this.buildMenu(this.menuCondensed);
    }

    // Check if the menu need to be condensed
    updateMenuSize(): void {
        const condensed = this.options.condensed;
        if (typeof condensed === 'undefined') return;



        if (this.titlebar.clientWidth > 0) {
            this.menuSize = this.menubar.clientWidth;

            const w = this.menuSize + this.appicon.clientWidth + this.title.clientWidth + this.controls.clientWidth + 1;
            if (w > this.titlebarWidth() || this.options.condensed) {
                if (!this.menuCondensed) {
                    this.buildMenu(true);
                }
            } else {
                if (this.menuCondensed && !this.options.condensed) {
                    this.buildMenu(false);
                }
            }

            //*
            // .custom-titlebar CSS로 지정할것
            if(this.options.onlyCondensedButton){
                // 아이콘 크기만큼만 차지함
                this.titlebar.style.width = this.menuSize + 'px';
            }else{
                // 100%
                this.titlebar.style.width = '';
            }
            // */

        } else {
            setTimeout(() => this.updateMenuSize(), 10);
        }
    }

    updateHeight(height: number): void {
        // const height = this.options.height;
        // if (typeof height === 'undefined') return;

        this.titlebar.style.height = height + 'px';
        if (this.container) this.container.style.height = `calc(100vh - ${height}px)`;
    }

    applyTheme(): void {
        const platform = Options.getPlatform();
        const svgs = svg[platform];
        this.titlebar.classList.toggle(style.locals.win, platform == 'win');
        this.titlebar.classList.toggle(style.locals.darwin, platform == 'darwin');
        this.minimizeWindow.innerHTML = svgs.minimize;
        this.maximizeWindow.innerHTML = svgs.maximize;
        this.restoreWindow.innerHTML = svgs.restore;
        this.closeWindow.innerHTML = svgs.close;
        if (platform == 'darwin') {
            this.title.insertBefore(this.appicon, this.title.firstChild);
        } else {
            this.titlebar.insertBefore(this.appicon, this.menubar);
        }
    }

    titlebarWidth(): number {
        const computedStyle = getComputedStyle(this.titlebar);
        return this.titlebar.clientWidth - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight));
    }
}

/////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////

const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: any;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const parseMenuTemplate = (template: Record<string, any>): Record<string, any> => {
    if (typeof template.items === 'object') {
        return template;
    } else {
        const result = {items: [] as Array<any>};
        for (const itemIndex in template) {
            const item = template[itemIndex];
            if (typeof item.submenu == 'object') {
                item.submenu = parseMenuTemplate(item.submenu);
                item.type = 'submenu';
            } else if (typeof item.type == 'undefined') {
                item.type = 'normal';
            }
            result.items.push(item);
        }
        return result;
    }
};

const parseColor = (input: string): Array<number> => {
    const div = document.createElement('div');
    div.style.display = 'none';
    div.style.color = input;
    document.body.append(div);
    const m = getComputedStyle(div).color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    div.remove();
    if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]; else return [255, 255, 255];
};

const getBrightness = (rgb: Array<number>): number => {
    return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
};
