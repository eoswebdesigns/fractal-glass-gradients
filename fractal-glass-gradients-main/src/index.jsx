import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import Experience from "./Experience.jsx";

function App() {
    const { showOverlay } = useControls({
        showOverlay: true,
    });

    return (
        <>
            <Leva collapsed />
            <Canvas
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 200,
                    position: [0, 0, 0],
                }}
                style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}
            >
                <Experience />
            </Canvas>

            {showOverlay && (
                <div className="overlay">
                    {/* 👇 NAVBAR REMOVED - ONLY HERO TEXT REMAINS */}
                    <div className="grid-container bottom-content">
                        <h1 className="col-span-2">
                            Fractal
                            <br />
                            Glass
                        </h1>
                        <p className="col-span-2 subtitle">
                            Experience the beauty of generative, dynamic
                            gradients blending seamlessly into glass-like
                            fractal flutes.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(<App />);
