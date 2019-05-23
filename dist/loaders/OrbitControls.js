import { EventDispatcher } from "three-full/sources/core/EventDispatcher";
import { Vector3 } from "three-full/sources/math/Vector3";
import { Spherical } from "three-full/sources/math/Spherical";
import { Vector2 } from "three-full/sources/math/Vector2";
import { MOUSE } from "three-full/sources/constants";
import { Quaternion } from "three-full/sources/math/Quaternion";
const STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_DOLLY: 4,
    TOUCH_PAN: 5
};
const CHANGE_EVENT = { type: 'change' };
const START_EVENT = { type: 'start' };
const END_EVENT = { type: 'end' };
const EPS = 0.000001;
export class OrbitControls extends EventDispatcher {
    constructor(object, domElement, domWindow) {
        super();
        this.object = object;
        this.domElement = (domElement !== undefined) ? domElement : document;
        this.window = (domWindow !== undefined) ? domWindow : window;
        this.enabled = true;
        this.target = new Vector3();
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.minZoom = 0;
        this.maxZoom = Infinity;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        this.enableDamping = false;
        this.dampingFactor = 0.25;
        this.enableZoom = true;
        this.zoomSpeed = 1.0;
        this.enableRotate = true;
        this.rotateSpeed = 1.0;
        this.enablePan = true;
        this.keyPanSpeed = 7.0;
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0;
        this.enableKeys = true;
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
        this.mouseButtons = { ORBIT: MOUSE.LEFT, ZOOM: MOUSE.MIDDLE, PAN: MOUSE.RIGHT };
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
        this.updateOffset = new Vector3();
        this.updateQuat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
        this.updateQuatInverse = this.updateQuat.clone().inverse();
        this.updateLastPosition = new Vector3();
        this.updateLastQuaternion = new Quaternion();
        this.state = STATE.NONE;
        this.scale = 1;
        this.spherical = new Spherical();
        this.sphericalDelta = new Spherical();
        this.panOffset = new Vector3();
        this.zoomChanged = false;
        this.rotateStart = new Vector2();
        this.rotateEnd = new Vector2();
        this.rotateDelta = new Vector2();
        this.panStart = new Vector2();
        this.panEnd = new Vector2();
        this.panDelta = new Vector2();
        this.dollyStart = new Vector2();
        this.dollyEnd = new Vector2();
        this.dollyDelta = new Vector2();
        this.panLeftV = new Vector3();
        this.panUpV = new Vector3();
        this.panInternalOffset = new Vector3();
        this.onMouseDown = (event) => {
            if (this.enabled === false)
                return;
            event.preventDefault();
            if (event.button === this.mouseButtons.ORBIT) {
                if (this.enableRotate === false)
                    return;
                this.rotateStart.set(event.clientX, event.clientY);
                this.state = STATE.ROTATE;
            }
            else if (event.button === this.mouseButtons.ZOOM) {
                if (this.enableZoom === false)
                    return;
                this.dollyStart.set(event.clientX, event.clientY);
                this.state = STATE.DOLLY;
            }
            else if (event.button === this.mouseButtons.PAN) {
                if (this.enablePan === false)
                    return;
                this.panStart.set(event.clientX, event.clientY);
                this.state = STATE.PAN;
            }
            if (this.state !== STATE.NONE) {
                document.addEventListener('mousemove', this.onMouseMove, false);
                document.addEventListener('mouseup', this.onMouseUp, false);
                this.dispatchEvent(START_EVENT);
            }
        };
        this.onMouseMove = (event) => {
            if (this.enabled === false)
                return;
            event.preventDefault();
            if (this.state === STATE.ROTATE) {
                if (this.enableRotate === false)
                    return;
                this.rotateEnd.set(event.clientX, event.clientY);
                this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
                const element = this.domElement === document ? this.domElement.body : this.domElement;
                this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);
                this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);
                this.rotateStart.copy(this.rotateEnd);
                this.update();
            }
            else if (this.state === STATE.DOLLY) {
                if (this.enableZoom === false)
                    return;
                this.dollyEnd.set(event.clientX, event.clientY);
                this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
                if (this.dollyDelta.y > 0) {
                    this.dollyIn(this.getZoomScale());
                }
                else if (this.dollyDelta.y < 0) {
                    this.dollyOut(this.getZoomScale());
                }
                this.dollyStart.copy(this.dollyEnd);
                this.update();
            }
            else if (this.state === STATE.PAN) {
                if (this.enablePan === false)
                    return;
                this.panEnd.set(event.clientX, event.clientY);
                this.panDelta.subVectors(this.panEnd, this.panStart);
                this.pan(this.panDelta.x, this.panDelta.y);
                this.panStart.copy(this.panEnd);
                this.update();
            }
        };
        this.onMouseUp = (event) => {
            if (this.enabled === false)
                return;
            document.removeEventListener('mousemove', this.onMouseMove, false);
            document.removeEventListener('mouseup', this.onMouseUp, false);
            this.dispatchEvent(END_EVENT);
            this.state = STATE.NONE;
        };
        this.onMouseWheel = (event) => {
            if (this.enabled === false || this.enableZoom === false || (this.state !== STATE.NONE && this.state !== STATE.ROTATE))
                return;
            event.preventDefault();
            event.stopPropagation();
            if (event.deltaY < 0) {
                this.dollyOut(this.getZoomScale());
            }
            else if (event.deltaY > 0) {
                this.dollyIn(this.getZoomScale());
            }
            this.update();
            this.dispatchEvent(START_EVENT);
            this.dispatchEvent(END_EVENT);
        };
        this.onKeyDown = (event) => {
            if (this.enabled === false || this.enableKeys === false || this.enablePan === false)
                return;
            switch (event.keyCode) {
                case this.keys.UP:
                    {
                        this.pan(0, this.keyPanSpeed);
                        this.update();
                    }
                    break;
                case this.keys.BOTTOM:
                    {
                        this.pan(0, -this.keyPanSpeed);
                        this.update();
                    }
                    break;
                case this.keys.LEFT:
                    {
                        this.pan(this.keyPanSpeed, 0);
                        this.update();
                    }
                    break;
                case this.keys.RIGHT:
                    {
                        this.pan(-this.keyPanSpeed, 0);
                        this.update();
                    }
                    break;
            }
        };
        this.onTouchStart = (event) => {
            if (this.enabled === false)
                return;
            switch (event.touches.length) {
                case 1:
                    {
                        if (this.enableRotate === false)
                            return;
                        this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                        this.state = STATE.TOUCH_ROTATE;
                    }
                    break;
                case 2:
                    {
                        if (this.enableZoom === false)
                            return;
                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        this.dollyStart.set(0, distance);
                        this.state = STATE.TOUCH_DOLLY;
                    }
                    break;
                case 3:
                    {
                        if (this.enablePan === false)
                            return;
                        this.panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                        this.state = STATE.TOUCH_PAN;
                    }
                    break;
                default: {
                    this.state = STATE.NONE;
                }
            }
            if (this.state !== STATE.NONE) {
                this.dispatchEvent(START_EVENT);
            }
        };
        this.onTouchMove = (event) => {
            if (this.enabled === false)
                return;
            event.preventDefault();
            event.stopPropagation();
            switch (event.touches.length) {
                case 1:
                    {
                        if (this.enableRotate === false)
                            return;
                        if (this.state !== STATE.TOUCH_ROTATE)
                            return;
                        this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
                        var element = this.domElement === document ? this.domElement.body : this.domElement;
                        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);
                        this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);
                        this.rotateStart.copy(this.rotateEnd);
                        this.update();
                    }
                    break;
                case 2:
                    {
                        if (this.enableZoom === false)
                            return;
                        if (this.state !== STATE.TOUCH_DOLLY)
                            return;
                        var dx = event.touches[0].pageX - event.touches[1].pageX;
                        var dy = event.touches[0].pageY - event.touches[1].pageY;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        this.dollyEnd.set(0, distance);
                        this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
                        if (this.dollyDelta.y > 0) {
                            this.dollyOut(this.getZoomScale());
                        }
                        else if (this.dollyDelta.y < 0) {
                            this.dollyIn(this.getZoomScale());
                        }
                        this.dollyStart.copy(this.dollyEnd);
                        this.update();
                    }
                    break;
                case 3:
                    {
                        if (this.enablePan === false)
                            return;
                        if (this.state !== STATE.TOUCH_PAN)
                            return;
                        this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                        this.panDelta.subVectors(this.panEnd, this.panStart);
                        this.pan(this.panDelta.x, this.panDelta.y);
                        this.panStart.copy(this.panEnd);
                        this.update();
                    }
                    break;
                default: {
                    this.state = STATE.NONE;
                }
            }
        };
        this.onTouchEnd = (event) => {
            if (this.enabled === false)
                return;
            this.dispatchEvent(END_EVENT);
            this.state = STATE.NONE;
        };
        this.onContextMenu = (event) => {
            event.preventDefault();
        };
        this.domElement.addEventListener('contextmenu', this.onContextMenu, false);
        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
        this.domElement.addEventListener('wheel', this.onMouseWheel, false);
        this.domElement.addEventListener('touchstart', this.onTouchStart, false);
        this.domElement.addEventListener('touchend', this.onTouchEnd, false);
        this.domElement.addEventListener('touchmove', this.onTouchMove, false);
        this.window.addEventListener('keydown', this.onKeyDown, false);
        this.update();
    }
    update() {
        const position = this.object.position;
        this.updateOffset.copy(position).sub(this.target);
        this.updateOffset.applyQuaternion(this.updateQuat);
        this.spherical.setFromVector3(this.updateOffset);
        if (this.autoRotate && this.state === STATE.NONE) {
            this.rotateLeft(this.getAutoRotationAngle());
        }
        this.spherical.theta += this.sphericalDelta.theta;
        this.spherical.phi += this.sphericalDelta.phi;
        this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
        this.spherical.makeSafe();
        this.spherical.radius *= this.scale;
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
        this.target.add(this.panOffset);
        this.updateOffset.setFromSpherical(this.spherical);
        this.updateOffset.applyQuaternion(this.updateQuatInverse);
        position.copy(this.target).add(this.updateOffset);
        this.object.lookAt(this.target);
        if (this.enableDamping === true) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor);
            this.sphericalDelta.phi *= (1 - this.dampingFactor);
        }
        else {
            this.sphericalDelta.set(0, 0, 0);
        }
        this.scale = 1;
        this.panOffset.set(0, 0, 0);
        if (this.zoomChanged ||
            this.updateLastPosition.distanceToSquared(this.object.position) > EPS ||
            8 * (1 - this.updateLastQuaternion.dot(this.object.quaternion)) > EPS) {
            this.dispatchEvent(CHANGE_EVENT);
            this.updateLastPosition.copy(this.object.position);
            this.updateLastQuaternion.copy(this.object.quaternion);
            this.zoomChanged = false;
            return true;
        }
        return false;
    }
    panLeft(distance, objectMatrix) {
        this.panLeftV.setFromMatrixColumn(objectMatrix, 0);
        this.panLeftV.multiplyScalar(-distance);
        this.panOffset.add(this.panLeftV);
    }
    panUp(distance, objectMatrix) {
        this.panUpV.setFromMatrixColumn(objectMatrix, 1);
        this.panUpV.multiplyScalar(distance);
        this.panOffset.add(this.panUpV);
    }
    pan(deltaX, deltaY) {
        const element = this.domElement === document ? this.domElement.body : this.domElement;
        if (this._checkPerspectiveCamera(this.object)) {
            const position = this.object.position;
            this.panInternalOffset.copy(position).sub(this.target);
            var targetDistance = this.panInternalOffset.length();
            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
            this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
            this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);
        }
        else if (this._checkOrthographicCamera(this.object)) {
            this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
            this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
        }
        else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            this.enablePan = false;
        }
    }
    dollyIn(dollyScale) {
        if (this._checkPerspectiveCamera(this.object)) {
            this.scale /= dollyScale;
        }
        else if (this._checkOrthographicCamera(this.object)) {
            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;
        }
        else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;
        }
    }
    dollyOut(dollyScale) {
        if (this._checkPerspectiveCamera(this.object)) {
            this.scale *= dollyScale;
        }
        else if (this._checkOrthographicCamera(this.object)) {
            this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;
        }
        else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            this.enableZoom = false;
        }
    }
    getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    }
    getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed);
    }
    rotateLeft(angle) {
        this.sphericalDelta.theta -= angle;
    }
    rotateUp(angle) {
        this.sphericalDelta.phi -= angle;
    }
    getPolarAngle() {
        return this.spherical.phi;
    }
    getAzimuthalAngle() {
        return this.spherical.theta;
    }
    dispose() {
        this.domElement.removeEventListener('contextmenu', this.onContextMenu, false);
        this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
        this.domElement.removeEventListener('wheel', this.onMouseWheel, false);
        this.domElement.removeEventListener('touchstart', this.onTouchStart, false);
        this.domElement.removeEventListener('touchend', this.onTouchEnd, false);
        this.domElement.removeEventListener('touchmove', this.onTouchMove, false);
        document.removeEventListener('mousemove', this.onMouseMove, false);
        document.removeEventListener('mouseup', this.onMouseUp, false);
        this.window.removeEventListener('keydown', this.onKeyDown, false);
    }
    reset() {
        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;
        this.object.updateProjectionMatrix();
        this.dispatchEvent(CHANGE_EVENT);
        this.update();
        this.state = STATE.NONE;
    }
    saveState() {
        this.target0.copy(this.target);
        this.position0.copy(this.object.position);
        if (this._checkOrthographicCamera(this.object) || this._checkPerspectiveCamera(this.object)) {
            this.zoom0 = this.object.zoom;
        }
    }
    get center() {
        console.warn('OrbitControls: .center has been renamed to .target');
        return this.target;
    }
    get noZoom() {
        console.warn('OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
        return !this.enableZoom;
    }
    set noZoom(value) {
        console.warn('OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
        this.enableZoom = !value;
    }
    _checkPerspectiveCamera(camera) {
        return camera.isPerspectiveCamera;
    }
    _checkOrthographicCamera(camera) {
        return camera.isOrthographicCamera;
    }
}
//# sourceMappingURL=OrbitControls.js.map