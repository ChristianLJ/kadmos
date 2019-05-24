import './assets/styles.scss';
export declare class Kadmos {
    private static camera;
    private static scene;
    private static renderer;
    private static selector;
    constructor();
    private static getSpinner;
    private static getErrorWrapper;
    private static getError;
    private static getContentWrapper;
    private static getStlWrapper;
    static initFromUrl(): void;
    static initAll(selector: string): void;
    private static addPopupTemplateHtmlToDom;
    private static handleCenter;
    static handleModel(filePath: string, color: string, width: number, height: number): void;
    private static getMesh;
    private static initCamera;
    private static initScene;
    private static initControls;
    private static render;
    private static hideBackdrop;
    private static handleEvents;
}
