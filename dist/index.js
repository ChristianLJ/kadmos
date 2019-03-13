"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require('three');
const STLLoader = require('three-stl-loader')(THREE);
const OrbitControls = require('three-orbitcontrols');
class Kadmos {
    constructor() {
    }
    static initAll(selector) {
        this.selector = selector;
        this.addPopupTemplateHtmlToDom();
        this.handleEvents();
    }
    static addPopupTemplateHtmlToDom() {
        document.body.innerHTML +=
            '<div id="stlBackdrop">' +
                '  <div id="stlContent">' +
                '    <div id="stlClose">' +
                '      <i class="fas fa-times"></i>' +
                '    </div>' +
                '    <div id="stlModel">' +
                '    </div>' +
                '  </div>' +
                '</div>';
    }
    static handleModel(filePath, color, width, height) {
        this.initScene();
        this.initCamera(width, height);
        this.scene.add(this.camera);
        const grid = new THREE.GridHelper(10, 50, 0x96CBDE, 0xA6DBEF);
        grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), 90 * (Math.PI / 180));
        this.scene.add(grid);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xFAFAFA);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        document.getElementById("stlModel").appendChild(this.renderer.domElement);
        const loader = new STLLoader();
        // Binary files
        const material = new THREE.MeshPhongMaterial({ color: color, specular: 0x0, shininess: 50 });
        const parent = this;
        loader.load(filePath, function (geometry) {
            parent.scene.add(parent.getMesh(geometry, material));
            parent.render();
        });
        this.initControls();
        window.addEventListener('resize', this.onWindowResize, false);
    }
    static getMesh(geometry, material) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(.1, .1, .1);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }
    static initCamera(width, height) {
        this.camera = new THREE.PerspectiveCamera(35, width / height, 1, 500);
        // Z is up for objects intended to be 3D printed.
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, -9, 6);
        this.camera.add(new THREE.PointLight(0xffffff, 0.8));
    }
    static initScene() {
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0x999999));
    }
    static initControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.addEventListener('change', () => {
            this.render();
        });
        controls.target.set(0, 0, 0);
        controls.update();
    }
    static onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
    }
    static render() {
        this.renderer.render(this.scene, this.camera);
    }
    static handleEvents() {
        const backdrop = $("#stlBackdrop");
        const model = $("#stlModel");
        const closeBtn = $("#stlClose");
        const viewStlFileBtn = $(this.selector);
        const parent = this;
        viewStlFileBtn.on("click", function () {
            model.html("");
            const filePath = $(this).data("file");
            const color = $(this).data("color");
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
        closeBtn.on("click", function (e) {
            backdrop.fadeOut(function () {
                model.html("");
            });
        });
        backdrop.on("click", function (e) {
            if (e.target !== this)
                return;
            $(this).fadeOut(function () {
                model.html("");
            });
        });
    }
}
exports.default = Kadmos;
//# sourceMappingURL=index.js.map