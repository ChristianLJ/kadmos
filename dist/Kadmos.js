const THREE = require('three');
const STLLoader = require('three-stl-loader')(THREE);
const OrbitControls = require('three-orbitcontrols');
export class Kadmos {
    constructor() {
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
        document.getElementsByTagName("body")[0].appendChild(backdropNode);
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
        const stlModelElement = document.getElementById("stlModel");
        if (stlModelElement) {
            stlModelElement.appendChild(this.renderer.domElement);
        }
        const loader = new STLLoader();
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
            parent.handleModel(filePath, Number(color), 800, 600);
            backdrop.classList.add("backdrop--fade-in");
        });
        document.addEventListener("keyup", (event) => {
            if (event.keyCode === 27) {
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