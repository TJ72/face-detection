"use client";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";
import Avatar from "./components/avatar";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center">
      <video ref={videoRef} className="h-[400px]" autoPlay />
      <div className="w-[533.33px] h-[400px] bg-black">
        <Canvas camera={{ fov: 25 }}>
          <ambientLight intensity={0.5} />
          <pointLight
            position={[1, 1, 1]}
            color={new Color(1, 0, 0)}
            intensity={0.5}
          />
          <pointLight
            position={[-1, 0, 1]}
            color={new Color(0, 1, 0)}
            intensity={0.5}
          />
          <Avatar />
        </Canvas>
      </div>
    </main>
  );
}
