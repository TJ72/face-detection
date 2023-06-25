"use client";
import { useEffect, useState, useRef } from "react";
import {
  Category,
  FaceLandmarker,
  FaceLandmarkerOptions,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import { Color, Euler, Matrix4 } from "three";
import { Canvas } from "@react-three/fiber";
import Avatar from "./components/avatar";

const options: FaceLandmarkerOptions = {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
    delegate: "GPU",
  },
  numFaces: 1,
  runningMode: "VIDEO",
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
};

export default function Home() {
  const [blendshapes, setBlendshape] = useState<Category[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceLandmarker = useRef<FaceLandmarker | null>(null);
  const lastVideoTime = useRef<number>(-1);
  const [rotation, setRotation] = useState<Euler>(new Euler());

  const initializeFaceDetector = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    faceLandmarker.current = await FaceLandmarker.createFromOptions(
      vision,
      options
    );
  };

  const renderLoop = async () => {
    const nowInMs = Date.now();
    if (lastVideoTime.current !== videoRef.current!.currentTime) {
      lastVideoTime.current = videoRef.current!.currentTime;
      const faceLandmarkerResult = faceLandmarker.current!.detectForVideo(
        videoRef.current!,
        nowInMs
      );

      if (
        faceLandmarkerResult.faceBlendshapes &&
        faceLandmarkerResult.faceBlendshapes.length > 0 &&
        faceLandmarkerResult.faceBlendshapes[0].categories
      ) {
        setBlendshape(faceLandmarkerResult.faceBlendshapes[0].categories);

        const matrix = new Matrix4().fromArray(
          faceLandmarkerResult.facialTransformationMatrixes![0].data
        );
        setRotation(new Euler().setFromRotationMatrix(matrix));
      }
    }

    window.requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    initializeFaceDetector();
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          videoRef.current!.addEventListener("loadeddata", renderLoop);
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
          <Avatar blendshapes={blendshapes} rotation={rotation} />
        </Canvas>
      </div>
    </main>
  );
}
