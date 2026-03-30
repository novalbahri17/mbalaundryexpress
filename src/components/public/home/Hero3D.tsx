import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, Float, Text3D, Center, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

// Washing Machine 3D Component
function WashingMachine({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
	const meshRef = useRef<THREE.Group>(null);
	const [hovered, setHovered] = useState(false);

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1 + (rotation?.[1] || 0);
			if (hovered) {
				meshRef.current.scale.setScalar(scale * 1.05);
			} else {
				meshRef.current.scale.setScalar(scale);
			}
		}
	});

	return (
		<group 
			ref={meshRef} 
			position={position}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
		>
			{/* Main Body */}
			<mesh castShadow receiveShadow>
				<boxGeometry args={[2, 2.5, 2]} />
				<meshStandardMaterial 
					color={hovered ? "#60a5fa" : "#3b82f6"} 
					roughness={0.2} 
					metalness={0.1}
				/>
			</mesh>
			
			{/* Door/Window */}
			<mesh position={[0, 0, 1.05]} castShadow>
				<circleGeometry args={[0.7, 32]} />
				<meshStandardMaterial 
					color="#1e3a5f" 
					roughness={0.1} 
					metalness={0.8}
					transparent
					opacity={0.9}
				/>
			</mesh>
			
			{/* Door Ring */}
			<mesh position={[0, 0, 1.06]} castShadow>
				<ringGeometry args={[0.65, 0.75, 32]} />
				<meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.2} />
			</mesh>
			
			{/* Control Panel */}
			<mesh position={[0, 1, 1.05]} castShadow>
				<boxGeometry args={[1.5, 0.3, 0.1]} />
				<meshStandardMaterial color="#1f2937" />
			</mesh>
			
			{/* Knob */}
			<mesh position={[0.4, 1, 1.15]} castShadow>
				<cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
				<meshStandardMaterial color="#d1d5db" metalness={0.5} />
			</mesh>
			
			{/* Display */}
			<mesh position={[-0.3, 1, 1.12]} castShadow>
				<planeGeometry args={[0.5, 0.15]} />
				<meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
			</mesh>
		</group>
	);
}

// Floating Bubble Particles
function Bubbles() {
	const count = 20;
	const meshRef = useRef<THREE.InstancedMesh>(null);
	
	const particles = useMemo(() => {
		const temp = [];
		for (let i = 0; i < count; i++) {
			temp.push({
				x: (Math.random() - 0.5) * 10,
				y: (Math.random() - 0.5) * 10,
				z: (Math.random() - 0.5) * 5,
				speed: 0.5 + Math.random() * 1,
				size: 0.1 + Math.random() * 0.3,
			});
		}
		return temp;
	}, []);

	useFrame((state) => {
		if (!meshRef.current) return;
		const matrix = new THREE.Matrix4();
		particles.forEach((particle, i) => {
			const y = particle.y + Math.sin(state.clock.elapsedTime * particle.speed) * 0.5;
			const x = particle.x + Math.cos(state.clock.elapsedTime * particle.speed * 0.5) * 0.2;
			matrix.makeTranslation(x, y, particle.z);
			matrix.scale(new THREE.Vector3(particle.size, particle.size, particle.size));
			meshRef.current!.setMatrixAt(i, matrix);
		});
		meshRef.current.instanceMatrix.needsUpdate = true;
	});

	return (
		<instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
			<sphereGeometry args={[1, 16, 16]} />
			<meshStandardMaterial 
				color="#60a5fa" 
				transparent 
				opacity={0.4} 
				roughness={0}
				metalness={0.1}
			/>
		</instancedMesh>
	);
}

// Scene Component
function Scene() {
	return (
		<>
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1} castShadow />
			<pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
			
			<Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
				<WashingMachine position={[-2, 0, 0]} rotation={[0, 0.3, 0]} scale={1} />
			</Float>
			
			<Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3} delay={0.5}>
				<WashingMachine position={[2, -0.5, -1]} rotation={[0, -0.2, 0]} scale={0.8} />
			</Float>
			
			<Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4} delay={1}>
				<WashingMachine position={[0, 1, -2]} rotation={[0, 0, 0]} scale={0.6} />
			</Float>
			
			<Bubbles />
			
			<ContactShadows 
				position={[0, -3, 0]} 
				opacity={0.4} 
				scale={20} 
				blur={2} 
				far={4.5} 
			/>
			
			<Environment preset="city" />
		</>
	);
}

// Main Hero 3D Component
export default function Hero3D() {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsLoaded(true), 500);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="relative w-full h-[600px] lg:h-[700px]">
			{/* Loading State */}
			{!isLoaded && (
				<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
					<motion.div 
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
					/>
				</div>
			)}
			
			{/* 3D Canvas */}
			<Canvas
				camera={{ position: [0, 0, 8], fov: 45 }}
				shadows
				className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
			>
				<Scene />
			</Canvas>
			
			{/* Overlay Content */}
			<div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-8">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1, duration: 0.8 }}
					className="pointer-events-auto"
				>
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 drop-shadow-lg">
						MBA Laundry Express
					</h1>
					<p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto mb-8 backdrop-blur-sm bg-white/30 dark:bg-black/30 p-4 rounded-2xl">
						Self Service Laundry Modern dengan Teknologi Terkini
					</p>
					<div className="flex gap-4 justify-center">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-shadow"
						>
							Cari Cabang
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="px-8 py-4 bg-white dark:bg-slate-800 text-neutral-900 dark:text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-shadow border border-neutral-200 dark:border-neutral-700"
						>
							Lihat Promo
						</motion.button>
					</div>
				</motion.div>
			</div>
			
			{/* Scroll Indicator */}
			<motion.div 
				className="absolute bottom-8 left-1/2 -translate-x-1/2"
				animate={{ y: [0, 10, 0] }}
				transition={{ duration: 1.5, repeat: Infinity }}
			>
				<div className="w-6 h-10 border-2 border-neutral-400 rounded-full flex justify-center pt-2">
					<div className="w-1.5 h-3 bg-neutral-400 rounded-full" />
				</div>
			</motion.div>
		</div>
	);
}
