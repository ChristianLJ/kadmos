const THREE: any = require('three');
const STLLoader: any = require('three-stl-loader')(THREE);
const OrbitControls: any = require('three-orbitcontrols');

import * as $ from "jquery";

export default class Kadmos {
    private static camera: any;
    private static scene: any;
    private static renderer: any;
    private static selector: string;

    constructor() {

    }

    public static initAll(selector: string): void {
        this.selector = selector;
        this.addPopupTemplateHtmlToDom();
        this.handleEvents();
    }

    private static addPopupTemplateHtmlToDom(): void {
        const backdrop: string =
            '<div id="stlBackdrop">' +
            '  <div id="stlContent">' +
            '    <div id="stlClose">' +
            '      <i class="fas fa-times"></i>' +
            '    </div>' +
            '    <div id="stlModel">' +
            '    </div>' +
            '  </div>' +
            '</div>';

        $(backdrop).appendTo("body");
    }

    public static handleModel(filePath: string, color: number, width: number, height: number): void {
        this.initScene();
        this.initCamera(width, height);

        this.scene.add(this.camera);

        const grid: any = new THREE.GridHelper(10, 50, 0x96CBDE, 0xA6DBEF);
        grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), 90 * (Math.PI / 180));
        this.scene.add(grid);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(0xFAFAFA);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        document.getElementById("stlModel").appendChild(this.renderer.domElement);

        const loader: any = new STLLoader();

        // Binary files
        const material: any = new THREE.MeshPhongMaterial({color: color, specular: 0x0, shininess: 50});
        const parent: any = this;
        loader.load(filePath, function (geometry: any) {
            parent.scene.add(parent.getMesh(geometry, material));
            parent.render();
        });

        this.initControls();
        window.addEventListener('resize', this.onWindowResize, false);
    }

    private static getMesh(geometry: any, material: any): any {
        const mesh: any = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(.1, .1, .1);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    private static initCamera(width: number, height: number): void {
        this.camera = new THREE.PerspectiveCamera(35, width / height, 1, 500);

        // Z is up for objects intended to be 3D printed.
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, -9, 6);

        this.camera.add(new THREE.PointLight(0xffffff, 0.8));
    }

    private static initScene(): void {
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0x999999));
    }

    private static initControls(): void {
        const controls: any = new OrbitControls(this.camera, this.renderer.domElement);
        controls.addEventListener('change', () => {
            this.render();
        });
        controls.target.set(0, 0, 0);
        controls.update();
    }

    private static onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.render();
    }

    private static render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    private static handleEvents(): void {
        const backdrop: any = $("#stlBackdrop");
        const model: any = $("#stlModel");
        const closeBtn: any = $("#stlClose");
        const viewStlFileBtn: any = $(this.selector);
        const parent: any = this;

        viewStlFileBtn.on("click", function () {
            model.html("");
            const filePath: string = $(this).data("file");
            const color: string = $(this).data("color");

            parent.handleModel(filePath, Number(color), 800, 600);
            backdrop.fadeIn();
        });

        $(document).on('keyup', function (e) {
            if (e.keyCode === 27) { // escape key maps to keycode `27`
                backdrop.fadeOut(function () {
                    model.html("");
                });
            }
        });

        closeBtn.on("click", function (e: any) {
            backdrop.fadeOut(function () {
                model.html("");
            });
        });

        backdrop.on("click", function (e: any) {
            if (e.target !== this)
                return;

            $(this).fadeOut(function () {
                model.html("");
            });
        });
    }
}
