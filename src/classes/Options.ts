export interface TitleBarOptions {
  _dev?: boolean;
  backdrop?: boolean;
  // blur 발생시 메뉴 창 닫기
  useBlurClose?: boolean;
  // 새로 열릴때 hook 함수 지정할 수있음 (메뉴 내용 갱신하기 위해 사용)
  // index: 열릴 menu index
  onOpenMenuHook?: (index: number) => boolean;
  
  backgroundColor?: string;
  title?: string;
  icon?: string | null;
  condensed?: boolean;
  menu?: Record<string, any> | null;
  overflow?: string;
  drag?: boolean;
  titleHorizontalAlignment?: string;
  unfocusEffect?: boolean;
  backgroundUnfocusEffect?: boolean;
  platform?: string;
  hideMenuOnDarwin?: boolean;
  hideControlsOnDarwin?: boolean;
  browserWindow?: any;
  height?: number;
  windowControlsOverlay?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closeable?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: () => boolean;
  menuItemClickHandler?: (commandId: number) => void;
}

export const Options = {
  values: {
    _dev: false,
    backdrop: true,
    useBlurClose: true,
    onOpenMenuHook: undefined,

    backgroundColor: '#fff',
    title: undefined,
    icon: undefined,
    condensed: false,
    menu: undefined,
    overflow: 'auto',
    drag: true,
    titleHorizontalAlignment: 'center',
    unfocusEffect: true,
    backgroundUnfocusEffect: true,
    platform: 'win',
    hideMenuOnDarwin: true,
    hideControlsOnDarwin: false,
    browserWindow: undefined,
    onMinimize: undefined,
    onMaximize: undefined,
    onClose: undefined,
    isMaximized: undefined,
    menuItemClickHandler: undefined,
    height: undefined,
    windowControlsOverlay: false,
    minimizable: true,
    maximizable: true,
    closeable: true,
  } as TitleBarOptions,

  update(_options: TitleBarOptions): void {
    this.values = Object.assign({}, this.values, _options);
  },

  getPlatform(): 'win' | 'darwin' {
    switch (this.values.platform) {
      case 'darwin':
      case 'macos':
        return 'darwin';
      default:
        return 'win';
    }
  },
};
