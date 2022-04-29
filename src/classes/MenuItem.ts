import style from '../style/style.scss';
import svg from '../style/svg.json';
import Menu from './Menu';
import { Accelerator } from './Accelerator';
import { ClickHandler } from './ClickHandler';
import { Options } from './Options';

export default class MenuItem {
  element: HTMLDivElement;
  item: Record<string, any>;
  index: number;
  parent: Menu;

  constructor(menuItem: Record<string, any>, index: number, parent: Menu) {
    this.item = menuItem;
    this.index = index;
    this.parent = parent;

    // Create item
    this.element = document.createElement('div');
    this.element.classList.add(style.locals.button);

    /*
    this.element.classList.add(
      menuItem.type == 'separator'
        ? 'custom-titlebar-separator'
        : parent.isSubMenu
        ? 'custom-titlebar-submenu-item'
        : 'custom-titlebar-menu-item',
    );
    /*/
    const isSeparator = (menuItem.type == 'separator');
    const isGroupSeparator = (isSeparator && menuItem.label);

    if(isSeparator){
      // this.element.classList.add('custom-titlebar-separator');
      // if(menuItem.label) this.element.classList.add(style.locals['group-separator']);
      this.element.classList.add(
        isGroupSeparator ? 'custom-titlebar-group' : 'custom-titlebar-separator'
      );
    }else{
      this.element.classList.add(
        parent.isSubMenu ? 'custom-titlebar-submenu-item' : 'custom-titlebar-menu-item'
      );
    }
    //*/

    if (menuItem.role == 'mainMenu') {
      // Add main menu svg
      this.element.innerHTML = svg.mainMenu;
    }

    let line;
    if (menuItem.label) {
      if(isGroupSeparator) {
        line = document.createElement('div');
        this.element.append(line);
        setLine(line);
      }

      // Add label
      const label = document.createElement('div');
      label.classList.add(style.locals.title);
      label.innerText = menuItem.label;
      this.element.append(label);

      if(isGroupSeparator) {
        label.classList.add('custom-titlebar-group-label');
      }
    }

    if(isSeparator){
      if(isGroupSeparator) {
        line = document.createElement('div');
        this.element.append(line);
      }else{
        line = this.element;
      }

      setLine(line);
    }

    function setLine(line: HTMLDivElement): void{
      const hr = document.createElement('div');
      hr.classList.add(style.locals.hr);
      hr.classList.add('custom-titlebar-separator-line');
      line.append(hr);

      if(isGroupSeparator){
        line.classList.add(style.locals.button);
        line.classList.add(style.locals.separator);
        // this.element.insertBefore(line, label);
      }
    }


    let defaultAccelerator;

    if (menuItem.role && !menuItem.accelerator) {
      // Get default accelerator
      defaultAccelerator = menuItem.getDefaultRoleAccelerator
        ? menuItem.getDefaultRoleAccelerator()
        : menuItem.defaultRoleAccelerator;
    }

    if (menuItem.accelerator || defaultAccelerator || (menuItem.key && menuItem.modifiers)) {
      // Add accelerator
      const accelerator = document.createElement('div');
      accelerator.classList.add(style.locals.accelerator);
      accelerator.innerText =
        menuItem.accelerator || defaultAccelerator
          ? Accelerator.formatElectronAccelerator(menuItem.accelerator || defaultAccelerator)
          : Accelerator.formatNWAccelerator(menuItem.modifiers, menuItem.key);
      this.element.append(accelerator);
    }

    if (menuItem.toolTip || menuItem.tooltip) {
      // Add tooltip
      this.element.title = menuItem.toolTip || menuItem.tooltip;
    }

    const isDisable = (menuItem.enabled === false);
    if (isDisable) {
      // Disable item
      this.element.classList.add(style.locals.disabled);
      this.element.classList.add('custom-titlebar-disabled-item');
    }
    if (menuItem.visible === false) {
      // Hide item
      this.element.style.display = 'none';
    }
    if (menuItem.checked) {
      // Add check mark
      this.element.innerHTML += svg.check.replace('{class}', style.locals.check);
    } else if (menuItem.icon || menuItem.iconSelector) {
      // Add icon
      let icon;
      if(menuItem.icon){
        icon = document.createElement('img');
        icon.src = menuItem.icon;
      }else{
        icon = document.createElement('div');
      }
      if(menuItem.iconSelector){
        let selector = menuItem.iconSelector;
        if(selector.indexOf('.') === 0){
          selector = selector.substring(1);
          icon.classList.add(selector);
        }else if(selector.indexOf('#') === 0) {
          selector = selector.substring(1);
          icon.id = selector;
        }else if(selector.indexOf('[') === 0){
          selector = selector.substring(1, selector.length-1);
          const ar = selector.split('=');
          icon.setAttribute(ar[0].trim(), (ar[1]||'').trim().replace(/("|')/g, ''));
        }else{
          icon.classList.add(selector);
        }
      }
      icon.setAttribute('draggable', 'false');
      icon.classList.add(style.locals.icon);
      this.element.append(icon);
    }
    if(menuItem.className){
      this.element.classList.add(menuItem.className);
    }

    switch (menuItem.type) {
      case 'normal':
      case 'checkbox':
      case 'radio':
        this.element.onclick = (e) => {
          e.stopPropagation();
          parent.closeSubMenu(true);

          // Update checked state before calling the click method
          this.checkedState();

          // Call click method
          ClickHandler.click(this.item);
        };

        this.element.onmouseenter = () => {
          parent.closeSubMenu();
        };
        break;
      case 'submenu':
        // Add right arrow
        this.element.innerHTML += svg.arrow.replace('{class}', style.locals.arrow);

        this.element.onclick = (e) => {
          e.stopPropagation();
          if (!parent.isSubMenu) {
            if (parent.isSubMenuOpened() && parent.activeMenu == index) {
              parent.closeSubMenu();
            } else {
              // 새로 열릴때 hook 함수 지정할 수있음 (메뉴 내용 변경하기 위해 사용)
              if (Options.values.onOpenMenuHook) {
                const prevent = Options.values.onOpenMenuHook(index);
                if(!prevent) Menu.mainMenu.open(index);
              }else{
                parent.openSubMenu(menuItem.submenu, index);
              }
            }
          }
        };

        this.element.onmouseenter = () => {
          if (parent.isSubMenuOpened() || parent.isSubMenu) {
            parent.openSubMenu(menuItem.submenu, index);
          }
        };

        this.element.onmouseleave = () => {
          if (parent.isSubMenuOpened() && parent.isSubMenu) {
            // 개발용으로 닫지 않음
            if(!Options.values._dev) parent.closeSubMenu();
          }
        };
        break;
      case 'separator':
        if(isGroupSeparator){
          this.element.classList.add(style.locals['group']);
        }else{
          this.element.classList.add(style.locals.separator);
        }
        break;
    }
  }

  // Checked state management for custom menu templates
  checkedState(): void {
    // Check if the click method is not from Electron
    if (!this.item.click || this.item.click.toString().indexOf('ipcRenderer') < 0) {
      if (this.item.type == 'radio') {
        this.parent.uncheckRadioGroup(this.index);
      }
      if (this.item.type == 'checkbox' || this.item.type == 'radio') {
        // Invert checked state, set 'checked' to true if undefined
        this.item.checked = this.item.checked ? false : true;
      }
    }
  }

  // Uncheck this item if it's a radio
  unckeckRadio(): void {
    if (this.item.type == 'radio') {
      this.item.checked = false;
    }
  }
}
