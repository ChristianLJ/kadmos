export declare class STLLoader {
    private manager;
    private path;
    constructor(manager?: any);
    load(url: any, onLoad: any, onProgress: any, onError: any): void;
    setPath(value: any): this;
    private parse;
}
