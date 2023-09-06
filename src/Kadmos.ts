import './assets/styles.scss';
import {Geometry} from "three/examples/jsm/deprecated/Geometry";
import {
    GridHelper, HemisphereLight,
    Mesh,
    MeshPhongMaterial,
    PerspectiveCamera,
    PointLight,
    Scene,
    Vector3,
    WebGLRenderer
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {STLLoader} from "three/examples/jsm/loaders/STLLoader";

export class Kadmos {
    private static camera: any;
    private static scene: any;
    private static renderer: any;
    private static selector: string;

    constructor() {
    }

    private static getSpinner(): Element {
        const element: Element | null = document.querySelector("#kadmos-spinner");
        if (element) {
            return element;
        } else {
            throw Error("Kadmos Spinner not defined");
        }
    }

    private static getErrorWrapper(): Element {
        const element: Element | null = document.querySelector("#kadmos-error-wrapper");
        if (element) {
            return element;
        } else {
            throw Error("Kadmos Error Wrapper not defined");
        }
    }

    private static getError(): Element {
        const element: Element | null = document.querySelector("#kadmos-error");
        if (element) {
            return element;
        } else {
            throw Error("Kadmos Error Container not defined");
        }
    }

    private static getContentWrapper(): Element {
        const element: Element | null = document.querySelector("#kadmos-content");
        if (element) {
            return element;
        } else {
            throw Error("Kadmos Error Container not defined");
        }
    }

    private static getStlWrapper(): Element {
        const element: Element | null = document.querySelector("#stlBackdrop");
        if (element) {
            return element;
        } else {
            throw Error("Kadmos STL Wrapper not defined");
        }
    }

    public static initFromUrl(): void {
        this.addPopupTemplateHtmlToDom();

        const backdrop: any = document.getElementById("stlBackdrop");
        const model: any = document.getElementById("stlModel");

        document.addEventListener("DOMContentLoaded", () => {
            model.innerHTML = "";

            const urlParams = new URLSearchParams(window.location.search);

            const fileUrl: string | null = urlParams.get('fileUrl');
            const color: string | null = urlParams.get('color') || "0x626262";
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

        const backdropNode: Node = document.createRange().createContextualFragment(backdrop);
        this.getContentWrapper().appendChild(backdropNode);
    }

    private static handleCenter(geometry: Geometry): void {
        geometry.computeBoundingBox();

        geometry.center();

        const boundingBox: any = geometry.boundingBox;
        const max = boundingBox.max.z;
        const min = boundingBox.min.z;
        const height = max - min;

        geometry.translate(0, 0, height / 2);
    }

    public static handleModel(filePath: string, color: string, width: number, height: number): void {
        this.initScene();
        this.initCamera(width, height);
        this.scene.add(this.camera);

        const grid: any = new GridHelper(20, 50, 0x8d8d8d, 0xbdbdbd);
        grid.rotateOnAxis(new Vector3(1, 0, 0), 90 * (Math.PI / 180));
        this.scene.add(grid);

        this.renderer = new WebGLRenderer({antialias: true});
        this.renderer.setClearColor(0xFAFAFA);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);

        const stlModelElement = document.getElementById("stlModel");
        if (stlModelElement) {
            stlModelElement.appendChild(this.renderer.domElement);
        }

        const loader: any = new STLLoader();

        const material: any = new MeshPhongMaterial({color: Number(color), specular: 0x0, shininess: 0});
        loader.load(filePath, (geometry: any) => {
            this.handleCenter(geometry);
            this.scene.add(this.getMesh(geometry, material));
            this.render();
        });

        this.initControls();
    }

    // @ts-ignore
    private static getMesh(geometry: any, material: any): Mesh {
        const mesh: any = new Mesh(geometry, material);
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(.1, .1, .1);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    private static initCamera(width: number, height: number): void {
        this.camera = new PerspectiveCamera(35, width / height, 1, 500);

        // Z is up for objects intended to be 3D printed.
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, -9, 6);

         this.camera.add(new PointLight(0xffffff, 0.8));
    }

    private static initScene(): void {
        this.scene = new Scene();
        this.scene.add(new HemisphereLight( 0xffffff, 0x000000, 1 ));
    }

    private static initControls(): void {
        const controls: any = new OrbitControls(this.camera, this.renderer.domElement);
        controls.addEventListener('change', () => {
            this.render();
        });
        controls.target.set(0, 0, 0);
        controls.update();
    }

    private static render(): void {
        this.renderer.render(this.scene, this.camera);
        setTimeout(() => {
            this.getSpinner().classList.add("kadmos-spinner--hidden");
            setTimeout(() => {
                this.getStlWrapper().classList.add("stlBackdrop--visible");
            }, 250);
        }, 100);
    }

    private static hideBackdrop(): void {
        const backdrop: any = document.getElementById("stlBackdrop");
        const model: any = document.getElementById("stlModel");

        backdrop.classList.remove("backdrop--fade-out");
        setTimeout(() => {
            model.innerHTML = "";
        }, 250);
    }

    private static handleEvents(): void {
        const backdrop: any = document.getElementById("stlBackdrop");
        const model: any = document.getElementById("stlModel");
        const closeBtn: any = document.getElementById("stlClose");
        const viewStlFileBtn: any = document.getElementsByClassName(this.selector)[0];
        const parent: any = this;

        viewStlFileBtn.addEventListener("click", (event) => {
            model.innerHTML = "";
            const filePath: string = event.target.dataset.file;
            const color: string = event.target.dataset.color;

            parent.handleModel(filePath, color, 800, 600);

            backdrop.classList.add("backdrop--fade-in");
        });

        document.addEventListener("keyup", (event) => {
            if (event.key === "Escape") { // escape key maps to keycode `27`
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
