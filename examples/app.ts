import {Kadmos} from "../src";

export class App {
    constructor() {
        this.startKadmos();
    }

    startKadmos(): void {
        // Example: http://localhost:1234/?fileUrl=https://ni.leicht.io/bg_1000_handle.stl&color=0xeeeeee
        Kadmos.initFromUrl();
    }
}

new App();
