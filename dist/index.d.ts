export default class Kadmos {
    private camera;
    private scene;
    private renderer;
    private selector;
    constructor(selector: string);
    private addPopupTemplateHtmlToDom;
    init(filePath: string, color: number, width: number, height: number): void;
    private getMesh;
    private initCamera;
    private initScene;
    private initControls;
    private onWindowResize;
    private render;
    private handleEvents;
}
