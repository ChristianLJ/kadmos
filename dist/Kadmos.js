import './assets/styles.scss';
import { GridHelper, HemisphereLight, Mesh, MeshPhongMaterial, PerspectiveCamera, PointLight, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
export class Kadmos {
    constructor() {
    }
    static getSpinner() {
        const element = document.querySelector("#kadmos-spinner");
        if (element) {
            return element;
        }
        else {
            throw Error("Kadmos Spinner not defined");
        }
    }
    static getErrorWrapper() {
        const element = document.querySelector("#kadmos-error-wrapper");
        if (element) {
            return element;
        }
        else {
            throw Error("Kadmos Error Wrapper not defined");
        }
    }
    static getError() {
        const element = document.querySelector("#kadmos-error");
        if (element) {
            return element;
        }
        else {
            throw Error("Kadmos Error Container not defined");
        }
    }
    static getContentWrapper() {
        const element = document.querySelector("#kadmos-content");
        if (element) {
            return element;
        }
        else {
            throw Error("Kadmos Error Container not defined");
        }
    }
    static getStlWrapper() {
        const element = document.querySelector("#stlBackdrop");
        if (element) {
            return element;
        }
        else {
            throw Error("Kadmos STL Wrapper not defined");
        }
    }
    static initFromUrl() {
        this.addPopupTemplateHtmlToDom();
        const backdrop = document.getElementById("stlBackdrop");
        const model = document.getElementById("stlModel");
        document.addEventListener("DOMContentLoaded", () => {
            model.innerHTML = "";
            const urlParams = new URLSearchParams(window.location.search);
            const fileUrl = urlParams.get('fileUrl');
            const color = urlParams.get('color') || "0x626262";
            if (!fileUrl || !color) {
                this.getSpinner().classList.add("kadmos-spinner--hidden");
                this.getErrorWrapper().classList.add("kadmos-error-wrapper--visible");
                this.getError().innerHTML = "<p>Please specify fileUrl.</p>";
                return;
            }
            this.handleModel(fileUrl, color, window.innerWidth, window.innerHeight);
            window.addEventListener("resize", () => {
                if (this.renderer) {
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                }
            });
            backdrop.classList.add("backdrop--fade-in");
        });
    }
    static initAll(selector) {
        this.selector = selector;
        this.addPopupTemplateHtmlToDom();
        this.handleEvents();
    }
    static addPopupTemplateHtmlToDom() {
        const backdrop = '<div id="stlBackdrop">' +
            '  <div id="stlContent">' +
            '    <div id="stlClose">' +
            '      <i class="fas fa-times"></i>' +
            '    </div>' +
            '    <div id="stlModel">' +
            '    </div>' +
            '  </div>' +
            '</div>';
        const backdropNode = document.createRange().createContextualFragment(backdrop);
        this.getContentWrapper().appendChild(backdropNode);
    }
    static handleCenter(geometry) {
        geometry.computeBoundingBox();
        geometry.center();
        const boundingBox = geometry.boundingBox;
        const max = boundingBox.max.z;
        const min = boundingBox.min.z;
        const height = max - min;
        geometry.translate(0, 0, height / 2);
    }
    static handleModel(filePath, color, width, height) {
        this.initScene();
        this.initCamera(width, height);
        this.scene.add(this.camera);
        const grid = new GridHelper(20, 50, 0x8d8d8d, 0xbdbdbd);
        grid.rotateOnAxis(new Vector3(1, 0, 0), 90 * (Math.PI / 180));
        this.scene.add(grid);
        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xFAFAFA);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        const stlModelElement = document.getElementById("stlModel");
        if (stlModelElement) {
            stlModelElement.appendChild(this.renderer.domElement);
        }
        const loader = new STLLoader();
        const material = new MeshPhongMaterial({ color: Number(color), specular: 0x0, shininess: 0 });
        loader.load(filePath, (geometry) => {
            this.handleCenter(geometry);
            this.scene.add(this.getMesh(geometry, material));
            this.render();
        });
        this.initControls();
    }
    static getMesh(geometry, material) {
        const mesh = new Mesh(geometry, material);
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(.1, .1, .1);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }
    static initCamera(width, height) {
        this.camera = new PerspectiveCamera(35, width / height, 1, 500);
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, -9, 6);
        this.camera.add(new PointLight(0xffffff, 0.8));
    }
    static initScene() {
        this.scene = new Scene();
        this.scene.add(new HemisphereLight(0xffffff, 0x000000, 1));
    }
    static initControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.addEventListener('change', () => {
            this.render();
        });
        controls.target.set(0, 0, 0);
        controls.update();
    }
    static render() {
        this.renderer.render(this.scene, this.camera);
        setTimeout(() => {
            this.getSpinner().classList.add("kadmos-spinner--hidden");
            setTimeout(() => {
                this.getStlWrapper().classList.add("stlBackdrop--visible");
            }, 250);
        }, 100);
    }
    static hideBackdrop() {
        const backdrop = document.getElementById("stlBackdrop");
        const model = document.getElementById("stlModel");
        backdrop.classList.remove("backdrop--fade-out");
        setTimeout(() => {
            model.innerHTML = "";
        }, 250);
    }
    static handleEvents() {
        const backdrop = document.getElementById("stlBackdrop");
        const model = document.getElementById("stlModel");
        const closeBtn = document.getElementById("stlClose");
        const viewStlFileBtn = document.getElementsByClassName(this.selector)[0];
        const parent = this;
        viewStlFileBtn.addEventListener("click", (event) => {
            model.innerHTML = "";
            const filePath = event.target.dataset.file;
            const color = event.target.dataset.color;
            parent.handleModel(filePath, color, 800, 600);
            backdrop.classList.add("backdrop--fade-in");
        });
        document.addEventListener("keyup", (event) => {
            if (event.key === "Escape") {
                this.hideBackdrop();
            }
        });
        closeBtn.addEventListener("click", () => {
            this.hideBackdrop();
        });
        backdrop.addEventListener("click", (event) => {
            if (event.target !== this)
                return;
            this.hideBackdrop();
        });
    }
}
//# sourceMappingURL=Kadmos.js.map