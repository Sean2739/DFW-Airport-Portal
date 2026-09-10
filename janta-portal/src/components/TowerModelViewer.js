"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_PATH = "/Model/5.6k_10x4_panels/";
const MODEL_FILE = "5.6k_10x4_panels.gltf";
const SUN_PATH   = "/Model/";
const SUN_FILE = "sun.glb";

export default function TowerModelViewer({ angleDeg = 0, className = "", width = 280, height = 280, fillContainer = false, isDark = true, onError }) {
    const rootRef = useRef(null);
    const containerRef = useRef(null);
    const angleRef = useRef(angleDeg);
    const mountedRef = useRef(true);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    angleRef.current = angleDeg;

    const [loading, setLoading] = useState(true);
    const [containerSize, setContainerSize] = useState(fillContainer ? null : { width, height });

    useEffect(() => {
        if (!fillContainer || !rootRef.current) return;
        const el = rootRef.current;
        const ro = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const { width: w, height: h } = entry.contentRect;
            if (w > 0 && h > 0) setContainerSize({ width: w, height: h });
        });
        ro.observe(el);
        const { width: w, height: h } = el.getBoundingClientRect();
        if (w > 0 && h > 0) setContainerSize({ width: w, height: h });
        return () => ro.disconnect();
    }, [fillContainer]);

    const w = containerSize?.width ?? width;
    const h = containerSize?.height ?? height;

    useEffect(() => {
        if (fillContainer && !containerSize) return;
        mountedRef.current = true;
        const container = containerRef.current;
        if (!container) return;

        let scene, camera, renderer, towerModel, animationId;

        function init() {
            try {
                scene = new THREE.Scene();
                scene.background = null;

                camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
                camera.position.set(0, 14, 44);
                camera.lookAt(0, 4, 0);
                cameraRef.current = camera;

                renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setClearColor(0x000000, 0);
                renderer.setSize(w, h);
                rendererRef.current = renderer;
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.2;
                if (renderer.outputColorSpace !== undefined) {
                    renderer.outputColorSpace = THREE.SRGBColorSpace;
                }
                container.appendChild(renderer.domElement);

                // Lighting — neutral white for both modes
                scene.add(new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.8));
                scene.add(new THREE.HemisphereLight(
                    isDark ? 0x1a1a2e : 0xffffff,
                    isDark ? 0x0c0c0d : 0xd0d0d0,
                    isDark ? 0.55 : 0.9
                ));
                const fill = new THREE.PointLight(0xffffff, isDark ? 0.4 : 0.5, 60);
                fill.position.set(-10, 2, 10);
                scene.add(fill);
                const uplight = new THREE.PointLight(0xffffff, isDark ? 0.9 : 0.6, 55);
                uplight.position.set(0, -4, 22);
                scene.add(uplight);

                // Tower model
                const loader = new GLTFLoader();
                loader.setPath(MODEL_PATH);
                loader.load(
                    MODEL_FILE,
                    (gltf) => {
                        if (!mountedRef.current || !scene) return;
                        towerModel = gltf.scene;
                        const box    = new THREE.Box3().setFromObject(towerModel);
                        const center = box.getCenter(new THREE.Vector3());
                        const size_  = box.getSize(new THREE.Vector3());
                        const scale  = 18 / Math.max(size_.x, size_.y, size_.z);
                        towerModel.scale.setScalar(scale);
                        towerModel.position.x = -center.x * scale;
                        towerModel.position.y = -box.min.y * scale;
                        towerModel.position.z = -center.z * scale;
                        towerModel.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow    = true;
                                child.receiveShadow = true;
                                if (child.material && isDark) {
                                    // Only override materials in dark mode
                                    const mats = Array.isArray(child.material)
                                        ? child.material : [child.material];
                                    mats.forEach((m) => {
                                        if (
                                            m instanceof THREE.MeshStandardMaterial ||
                                            m instanceof THREE.MeshPhysicalMaterial
                                        ) {
                                            m.metalness = 0.75;
                                            m.roughness = 0.25;
                                        }
                                    });
                                }
                            }
                        });
                        scene.add(towerModel);
                        loadSun();
                        setLoading(false);
                    },
                    undefined,
                    (err) => {
                        const message = err instanceof Error ? err.message : (err?.message || "Failed to load tower model");
                        console.error("Tower model load error:", message);
                        setLoading(false);
                        onError?.();
                    }
                );

                // Sun model
                function loadSun() {
                    const sl = new GLTFLoader();
                    sl.setPath(SUN_PATH);
                    sl.load(SUN_FILE, (gltf) => {
                        if (!mountedRef.current || !scene) return;
                        const sunObj = gltf.scene;
                        const sunBox = new THREE.Box3().setFromObject(sunObj);
                        const sunSz  = sunBox.getSize(new THREE.Vector3());
                        const sunSc  = 8 / Math.max(sunSz.x, sunSz.y, sunSz.z);
                        sunObj.scale.set(sunSc, sunSc, sunSc);
                        sunObj.traverse((child) => {
                            if (child.isMesh && child.material) {
                                const ms = Array.isArray(child.material)
                                    ? child.material : [child.material];
                                ms.forEach((m) => {
                                    if (
                                        m instanceof THREE.MeshStandardMaterial ||
                                        m instanceof THREE.MeshPhysicalMaterial
                                    ) {
                                        m.emissive          = new THREE.Color(0xffaa00);
                                        m.emissiveIntensity = 2.0;
                                    }
                                });
                            }
                        });
                        const [sx, sy, sz] = [18, 22, 14];
                        sunObj.position.set(sx, sy, sz);
                        scene.add(sunObj);
                        const dl = new THREE.DirectionalLight(0xffffff, isDark ? 1.6 : 1.4);
                        dl.position.set(sx, sy, sz);
                        dl.target.position.set(0, 10, 0);
                        dl.castShadow            = true;
                        dl.shadow.mapSize.width   = 2048;
                        dl.shadow.mapSize.height  = 2048;
                        dl.shadow.camera.left     = -25;
                        dl.shadow.camera.right    = 25;
                        dl.shadow.camera.top      = 25;
                        dl.shadow.camera.bottom   = -25;
                        scene.add(dl);
                        const pl = new THREE.PointLight(0xffffff, isDark ? 0.4 : 0.3, 50);
                        pl.position.set(sx, sy, sz);
                        scene.add(pl);
                    }, undefined, (e) => console.warn("Sun load failed:", e));
                }

                // Render loop — azimuth: negate angle to match Three.js counter-clockwise convention
                // ROTATION_OFFSET = 0 (no offset needed — model default forward already aligns)
                function animate() {
                    if (!mountedRef.current) return;
                    animationId = requestAnimationFrame(animate);
                    if (towerModel) {
                        towerModel.rotation.y = (-angleRef.current * Math.PI) / 180;
                    }
                    if (renderer && scene && camera) {
                        renderer.render(scene, camera);
                    }
                }
                animate();

            } catch (e) {
                console.error("TowerModelViewer init error:", e);
                setLoading(false);
            }
        }

        init();

        return () => {
            mountedRef.current = false;
            if (animationId) cancelAnimationFrame(animationId);
            if (renderer && container &&
                renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
            renderer?.dispose();
            rendererRef.current = null;
            cameraRef.current = null;
        };
    }, [fillContainer, !fillContainer || (containerSize?.width != null && containerSize?.height != null)]);

    const ready = !fillContainer || (containerSize?.width != null && containerSize?.height != null);
    useEffect(() => {
        if (!ready || !rendererRef.current || !cameraRef.current) return;
        rendererRef.current.setSize(w, h);
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
    }, [ready, w, h]);

    return (
        <div
            ref={rootRef}
            className={className}
            style={{
                ...(fillContainer ? { width: "100%", height: "100%", minWidth: 0, minHeight: 0 } : { width, height, minWidth: width, minHeight: height }),
                position: "relative",
                background: "transparent",
            }}
        >
            <div
                ref={containerRef}
                style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            />
            {loading && (
                <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", color: "rgba(255,255,255,0.2)",
                    pointerEvents: "none",
                }}>Loading…</div>
            )}
        </div>
    );
}