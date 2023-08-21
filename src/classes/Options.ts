// https://github.com/6c65726f79/custom-titlebar
export interface TitleBarOptions {
    instanceID: string;
    backdrop?: boolean;
    overflow?: string;

    icon?: string | null;
    menu?: Record<string, any> | null;

    title?: string;
    hideTitle?: boolean,
    titleHorizontalAlignment?: string;

    drag?: boolean;
    height?: number;
    backgroundColor?: string;

    _dev?: boolean;
    // blur 발생시 메뉴 창 닫기
    useBlurClose?: boolean;
    unfocusEffect?: boolean;
    backgroundUnfocusEffect?: boolean;

    platform?: string;
    // when the platform is darwin
    hideMenuOnDarwin?: boolean;
    // (Electron only)
    hideControlsOnDarwin?: boolean;
    // (Electron only)
    browserWindow?: any;

    windowControlsOverlay?: boolean;
    isMaximized?: () => boolean;
    minimizable?: boolean;
    maximizable?: boolean;
    closeable?: boolean;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onClose?: () => void;

    // 새로 열릴때 hook 함수 지정할 수있음 (메뉴 내용 갱신하기 위해 사용)
    // index: 열릴 menu index
    onOpenMenuHook?: (index: number) => boolean;
    menuItemClickHandler?: (commandId: number) => void;

    condensed?: boolean;
    onlyCondensedButton?: boolean,
}

export const Options = {
    values: {
        instanceID: 'default_titlebar_ID',
        backdrop: true,
        overflow: 'auto',

        icon: undefined,
        menu: undefined,

        title: undefined,
        hideTitle: false,
        titleHorizontalAlignment: 'center',

        drag: true,
        height: undefined,
        backgroundColor: '#fff',

        _dev: false,
        useBlurClose: true,
        unfocusEffect: true,
        backgroundUnfocusEffect: true,

        hideMenuOnDarwin: true,
        hideControlsOnDarwin: false,
        browserWindow: undefined,

        windowControlsOverlay: false,
        isMaximized: undefined,
        minimizable: true,
        maximizable: true,
        closeable: true,
        onMinimize: undefined,
        onMaximize: undefined,
        onClose: undefined,

        onOpenMenuHook: undefined,
        menuItemClickHandler: undefined,

        condensed: false,
        // onlyCondensedButton: true 이면 버튼으로만 사용됨
        // title, drag, systemButton 기능등의 설정이 모두 무시됨
        onlyCondensedButton: false,

    } as TitleBarOptions,

    platform: 'win',
    getPlatform(): 'win' | 'darwin' {
        return this.platform as ('win' | 'darwin');
    },
    setPlatform(platform = ''): void {
        switch (platform) {
            case 'darwin':
            case 'macos':
                platform = 'darwin';
                break;
            default:
                platform = 'win';
                break;
        }
        this.platform = platform;
    },

    // onlyCondensedButton: true 이면 버튼으로만 사용됨
    // title, drag, systemButton 기능등의 설정이 모두 무시됨
    checkCondensedButton(o: TitleBarOptions): void {
        if(!o.onlyCondensedButton) return;

        o.condensed = true;

        o.icon = null;
        // o.menu = undefined;

        o.title = '';
        o.hideTitle = true;
        // o.titleHorizontalAlignment = 'center';

        o.drag = false;
        // o.height = undefined;
        // o.backgroundColor = '#fff';

        // o._dev = false;
        // o.useBlurClose = true;
        // o.unfocusEffect = true;
        // o.backgroundUnfocusEffect = false;

        // o.hideMenuOnDarwin = true;
        // o.hideControlsOnDarwin = false;
        // o.browserWindow = undefined;

        o.windowControlsOverlay = false;
        o.isMaximized = undefined;
        o.minimizable = false;
        o.maximizable = false;
        o.closeable = false;
        o.onMinimize = undefined;
        o.onMaximize = undefined;
        o.onClose = undefined;

        // o.onOpenMenuHook = undefined;
        // o.menuItemClickHandler = undefined;
    }
};
