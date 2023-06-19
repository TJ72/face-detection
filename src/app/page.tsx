"use client";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          console.log(videoRef.current!.srcObject);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-24">
      <video autoPlay ref={videoRef} />
      <Canvas>
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
      </Canvas>
    </main>
  );
}
