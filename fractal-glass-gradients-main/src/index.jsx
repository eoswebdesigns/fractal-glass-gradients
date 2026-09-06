import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";

function App() {
    return (
        <>
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
            {/* 👇 REMOVED: Overlay, Leva controls, and hero text */}
        </>
    );
}

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(<App />);
