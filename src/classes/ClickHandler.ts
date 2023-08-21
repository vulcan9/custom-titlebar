import {TitleBarOptions} from './Options';

export const ClickHandler = {
    click(menuItem: Record<string, any>, options: TitleBarOptions, accelerator = false): void {

        if (options.menuItemClickHandler && menuItem.commandId) {
            // Use user-defined handler
            options.menuItemClickHandler(menuItem.commandId);

        } else if (menuItem.click) {

            // Use default handler
            const keyboardEvent = {
                triggeredByAccelerator: accelerator,
            };

            if (menuItem.click.toString().indexOf('ipcRenderer') > 0) {
                // Invoke electron click method
                menuItem.click(
                    keyboardEvent, // KeyboardEvent
                    options.browserWindow ? options.browserWindow : null, // BrowserWindow
                    options.browserWindow ? options.browserWindow.webContents : null, // WebContents
                );
            } else {
                // Invoke custom template click method
                menuItem.click(
                    menuItem, // MenuItem
                    null, // BrowserWindow
                    keyboardEvent, // KeyboardEvent
                );
            }

        }
    },
};
