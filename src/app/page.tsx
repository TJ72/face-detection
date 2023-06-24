"use client";
import { useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FaceLandmarkerOptions,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import { Color, Euler, Matrix4 } from "three";
import { Canvas, useFrame, useGraph } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

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

let faceLandmarker: FaceLandmarker;
let lastVideoTime = -1;
let blendshapes: any[] = [];
let rotation: Euler;
let headMesh: any;

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const initializeFaceDetector = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, options);
  };

  const renderLoop = async () => {
    let nowInMs = Date.now();
    if (lastVideoTime !== videoRef.current!.currentTime) {
      lastVideoTime = videoRef.current!.currentTime;
      const faceLandmarkerResult = faceLandmarker.detectForVideo(
        videoRef.current!,
        nowInMs
      );

      if (
        faceLandmarkerResult.faceBlendshapes &&
        faceLandmarkerResult.faceBlendshapes.length > 0 &&
        faceLandmarkerResult.faceBlendshapes[0].categories
      ) {
        blendshapes = faceLandmarkerResult.faceBlendshapes[0].categories;

        const matrix = new Matrix4().fromArray(
          faceLandmarkerResult.facialTransformationMatrixes![0].data
        );
        rotation = new Euler().setFromRotationMatrix(matrix);
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
          <Avatar />
        </Canvas>
      </div>
    </main>
  );
}

function Avatar() {
  const avatar = useGLTF(
    "https://models.readyplayer.me/649408117e9186ff7e412163.glb?morphTarget=ARKit&textureAtlas=1024"
  );
  const { nodes } = useGraph(avatar.scene);

  useEffect(() => {
    headMesh = nodes.Wolf3D_Avatar;
  }, [nodes]);

  useFrame(() => {
    if (headMesh?.morphTargetInfluences && blendshapes.length > 0) {
      blendshapes.forEach((element) => {
        let index = headMesh.morphTargetDictionary[element.categoryName];
        if (index >= 0) {
          headMesh.morphTargetInfluences[index] = element.score;
        }
      });

      nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z);
      nodes.Neck.rotation.set(
        rotation.x / 5 + 0.3,
        rotation.y / 5,
        rotation.z / 5
      );
      nodes.Spine2.rotation.set(
        rotation.x / 10,
        rotation.y / 10,
        rotation.z / 10
      );
    }
  });

  return <primitive object={avatar.scene} position={[0, -1.65, 4]} />;
}
