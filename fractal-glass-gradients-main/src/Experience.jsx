import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import noiseFragmentShader from "./shaders/noise.glsl";

// Hardcoded values (was previously in Leva controls)
const PALETTES = {
    "Neon Flux": [
        [0.02, 0.2, 0.75],
        [0.8, 0.05, 0.55],
        [0.95, 0.1, 0.15],
        [0.97, 0.48, 0.08],
        [0.2, 0.65, 0.88],
    ],
    Sunset: [
        [0.95, 0.25, 0.05],
        [0.85, 0.08, 0.35],
        [1.0, 0.6, 0.0],
        [0.55, 0.05, 0.5],
        [1.0, 0.85, 0.2],
    ],
    Aurora: [
        [0.0, 0.75, 0.45],
        [0.05, 0.45, 0.95],
        [0.55, 0.05, 0.85],
        [0.0, 0.9, 0.7],
        [0.3, 0.0, 0.65],
    ],
};

// Hardcoded values (no Leva controls)
const palette = "sunset";
const noiseScaleX = 0.35;
const noiseScaleY = 0.55;
const warpStrength = 0.4;
const grainStrength = 0.5;
// const fluteWidth = 70.0; // REMOVED – now responsive
const fluteStrength = 140.0;
const patternBrightness = 0.9;
const warpSpeed = 0.12;
const algo = "Algo2";

export default function Experience() {
    const size = useThree((state) => state.size);
    const quadRef = useRef();

    // 👇 NEW: Responsive flute width
    const getFluteWidth = () => {
        const width = window.innerWidth;
        if (width < 480) return 45;    // Phones: more flutes
        if (width < 768) return 45;    // Tablets: medium
        if (width < 1024) return 55;   // Small laptops
        return 70;                     // Desktop: original
    };

    const [fluteWidth, setFluteWidth] = useState(getFluteWidth);

    // 👇 NEW: Update on resize
    useEffect(() => {
        const handleResize = () => {
            setFluteWidth(getFluteWidth());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const noiseSceneRef = useRef(null);
    const noiseCameraRef = useRef(null);
    const noiseFBORef = useRef(null);
    const noiseUniformsRef = useRef({
        uTime: { value: 0 },
        uNoiseScaleX: { value: 1.4 },
        uNoiseScaleY: { value: 1 },
        uWarpSpeed: { value: 0.12 },
    });

    if (!noiseSceneRef.current) {
        const rt = new THREE.WebGLRenderTarget(256, 256, {
            format: THREE.RGBAFormat,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearFilter,
        });
        rt.texture.wrapS = THREE.MirroredRepeatWrapping;
        rt.texture.wrapT = THREE.MirroredRepeatWrapping;
        noiseFBORef.current = rt;

        const scene = new THREE.Scene();
        scene.add(
            new THREE.Mesh(
                new THREE.PlaneGeometry(2, 2),
                new THREE.ShaderMaterial({
                    vertexShader,
                    fragmentShader: noiseFragmentShader,
                    uniforms: noiseUniformsRef.current,
                }),
            ),
        );
        noiseSceneRef.current = scene;
        noiseCameraRef.current = new THREE.OrthographicCamera(
            -1,
            1,
            1,
            -1,
            0,
            1,
        );
    }

    const grainTexture = useLoader(
        THREE.TextureLoader,
        "./film_grain_contrasted.jpg",
    );

    useEffect(() => {
        grainTexture.wrapS = THREE.RepeatWrapping;
        grainTexture.wrapT = THREE.RepeatWrapping;
        grainTexture.needsUpdate = true;
    }, [grainTexture]);

    const uniformsRef = useRef({
        uResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uPixelRatio: {
            value: window.devicePixelRatio,
        },
        uTime: {
            value: 0,
        },
        uWarpStrength: { value: 0.3 },
        uNoiseMap: { value: noiseFBORef.current.texture },
        uGrainTexture: { value: grainTexture },
        uGrainTextureSize: {
            value: new THREE.Vector2(1920, 1260),
        },
        uGrainStrength: { value: 0.05 },
        uFluteWidth: { value: getFluteWidth() }, // 👈 Now responsive
        uFluteStrength: { value: 70.0 },
        uToneMapExposure: { value: 0.1 },
        uC1: { value: new THREE.Vector3(...PALETTES["Neon Flux"][0]) },
        uC2: { value: new THREE.Vector3(...PALETTES["Neon Flux"][1]) },
        uC3: { value: new THREE.Vector3(...PALETTES["Neon Flux"][2]) },
        uC4: { value: new THREE.Vector3(...PALETTES["Neon Flux"][3]) },
        uC5: { value: new THREE.Vector3(...PALETTES["Neon Flux"][4]) },
        uAlgo: { value: 1 },
    });

    useFrame((state, delta) => {
        noiseUniformsRef.current.uTime.value += delta;
        noiseUniformsRef.current.uNoiseScaleX.value = noiseScaleX;
        noiseUniformsRef.current.uNoiseScaleY.value = noiseScaleY;
        noiseUniformsRef.current.uWarpSpeed.value = warpSpeed;
        const { gl } = state;
        gl.setRenderTarget(noiseFBORef.current);
        gl.render(noiseSceneRef.current, noiseCameraRef.current);
        gl.setRenderTarget(null);

        uniformsRef.current.uResolution.value.set(
            state.size.width,
            state.size.height,
        );
        uniformsRef.current.uTime.value += delta;
        uniformsRef.current.uWarpStrength.value = warpStrength;
        if (grainTexture.image) {
            uniformsRef.current.uGrainTextureSize.value.set(
                grainTexture.image.width,
                grainTexture.image.height,
            );
        }
        uniformsRef.current.uGrainStrength.value = grainStrength;
        uniformsRef.current.uFluteWidth.value = fluteWidth; // 👈 Using responsive value
        uniformsRef.current.uFluteStrength.value = fluteStrength;
        uniformsRef.current.uToneMapExposure.value = patternBrightness;
        const pal = PALETTES[palette];
        uniformsRef.current.uC1.value.set(...pal[0]);
        uniformsRef.current.uC2.value.set(...pal[1]);
        uniformsRef.current.uC3.value.set(...pal[2]);
        uniformsRef.current.uC4.value.set(...pal[3]);
        uniformsRef.current.uC5.value.set(...pal[4]);
        uniformsRef.current.uAlgo.value = algo === "Algo1" ? 0 : 1;
    });

    return (
        <mesh ref={quadRef}>
            <planeGeometry args={[2, 2, 1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniformsRef.current}
            />
        </mesh>
    );
}
