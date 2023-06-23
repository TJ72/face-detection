import { useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";

function Avatar() {
  const avatar = useGLTF(
    "https://models.readyplayer.me/649408117e9186ff7e412163.glb?morphTarget=ARKit"
  );
  const { nodes } = useGraph(avatar.scene);
  return <primitive object={avatar.scene} position={[0, -1.65, 4]} />;
}

export default Avatar;
