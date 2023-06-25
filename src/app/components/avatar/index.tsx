import { useEffect, useState } from "react";
import { Euler, SkinnedMesh } from "three";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Category } from "@mediapipe/tasks-vision";

interface AvatarProps {
  blendshapes: Category[];
  rotation: Euler;
}

function Avatar({ blendshapes, rotation }: AvatarProps) {
  const [headMesh, setHeadMesh] = useState<SkinnedMesh | null>(null);
  const avatar = useGLTF(
    "https://models.readyplayer.me/649408117e9186ff7e412163.glb?morphTargets=ARKit&textureAtlas=1024"
  );
  const { nodes } = useGraph(avatar.scene);

  useEffect(() => {
    setHeadMesh(nodes.Wolf3D_Avatar as SkinnedMesh);
  }, [nodes]);

  useFrame(() => {
    if (headMesh && headMesh.morphTargetInfluences && blendshapes.length > 0) {
      blendshapes.forEach((element) => {
        const index = headMesh.morphTargetDictionary![element.categoryName];
        if (index >= 0) {
          headMesh.morphTargetInfluences![index] = element.score;
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

export default Avatar;
