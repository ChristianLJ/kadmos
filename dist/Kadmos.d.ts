export declare class Kadmos {
    private static camera;
    private static scene;
    private static renderer;
    private static selector;
    constructor();
    static initAll(selector: string): void;
    private static addPopupTemplateHtmlToDom;
    static handleModel(filePath: string, color: number, width: number, height: number): void;
    private static getMesh;
    private static initCamera;
    private static initScene;
    private static initControls;
    private static onWindowResize;
    private static render;
    private static hideBackdrop;
    private static handleEvents;
}
