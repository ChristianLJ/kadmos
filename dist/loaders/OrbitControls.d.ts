import { EventDispatcher } from "three-full/sources/core/EventDispatcher";
import { Camera } from "three-full/sources/cameras/Camera";
import { Vector3 } from "three-full/sources/math/Vector3";
import { MOUSE } from "three-full/sources/constants";
export declare class OrbitControls extends EventDispatcher {
    object: Camera;
    domElement: HTMLElement | HTMLDocument;
    window: Window;
    enabled: boolean;
    target: Vector3;
    enableZoom: boolean;
    zoomSpeed: number;
    minDistance: number;
    maxDistance: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableKeys: boolean;
    keys: {
        LEFT: number;
        UP: number;
        RIGHT: number;
        BOTTOM: number;
    };
    mouseButtons: {
        ORBIT: MOUSE;
        ZOOM: MOUSE;
        PAN: MOUSE;
    };
    enableDamping: boolean;
    dampingFactor: number;
    private spherical;
    private sphericalDelta;
    private scale;
    private target0;
    private position0;
    private zoom0;
    private state;
    private panOffset;
    private zoomChanged;
    private rotateStart;
    private rotateEnd;
    private rotateDelta;
    private panStart;
    private panEnd;
    private panDelta;
    private dollyStart;
    private dollyEnd;
    private dollyDelta;
    private updateLastPosition;
    private updateOffset;
    private updateQuat;
    private updateLastQuaternion;
    private updateQuatInverse;
    private panLeftV;
    private panUpV;
    private panInternalOffset;
    private onContextMenu;
    private onMouseUp;
    private onMouseDown;
    private onMouseMove;
    private onMouseWheel;
    private onTouchStart;
    private onTouchEnd;
    private onTouchMove;
    private onKeyDown;
    constructor(object: Camera, domElement?: HTMLElement, domWindow?: Window);
    update(): boolean;
    panLeft(distance: number, objectMatrix: any): void;
    panUp(distance: number, objectMatrix: any): void;
    pan(deltaX: number, deltaY: number): void;
    dollyIn(dollyScale: any): void;
    dollyOut(dollyScale: any): void;
    getAutoRotationAngle(): number;
    getZoomScale(): number;
    rotateLeft(angle: number): void;
    rotateUp(angle: number): void;
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    dispose(): void;
    reset(): void;
    saveState(): void;
    readonly center: Vector3;
    noZoom: boolean;
    private _checkPerspectiveCamera;
    private _checkOrthographicCamera;
}