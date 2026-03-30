import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
	CheckCircleOutlined, 
	RightOutlined, 
	LeftOutlined,
	TrophyOutlined,
	StarOutlined,
	FireOutlined,
	GiftOutlined,
	PhoneOutlined,
	ClockCircleOutlined,
	WalletOutlined,
	MedicineBoxOutlined
} from "@ant-design/icons";
import { Button, Progress, Modal } from "antd";

interface OnboardingStep {
	id: number;
	title: string;
	description: string;
	icon: React.ReactNode;
	action: string;
	points: number;
	miniGame?: boolean;
}

const steps: OnboardingStep[] = [
	{
		id: 1,
		title: "Selamat Datang!",
		description: "Yuk kenalan dengan MBA Laundry Express. Selesaikan tutorial ini untuk mendapatkan 100 poin pertama!",
		icon: <StarOutlined className="text-4xl text-yellow-500" />,
		action: "Mulai Tutorial",
		points: 10
	},
	{
		id: 2,
		title: "Cara Pakai Mesin",
		description: "Pelajari cara menggunakan mesin cuci self-service kami dalam 3 langkah mudah.",
		icon: <MedicineBoxOutlined className="text-4xl text-blue-500" />,
		action: "Main Mini-Game",
		points: 30,
		miniGame: true
	},
	{
		id: 3,
		title: "Lokasi Cabang",
		description: "Temukan cabang MBA Laundry terdekat dari lokasi Anda.",
		icon: <PhoneOutlined className="text-4xl text-green-500" />,
		action: "Lihat Peta",
		points: 20
	},
	{
		id: 4,
		title: "Promo & Diskon",
		description: "Jangan lewatkan promo menarik! Dapatkan notifikasi promo terbaru.",
		icon: <GiftOutlined className="text-4xl text-rose-500" />,
		action: "Aktifkan Notifikasi",
		points: 20
	},
	{
		id: 5,
		title: "Jam Operasional",
		description: "Kami buka 24 jam! Cuci kapan saja sesuai jadwal Anda.",
		icon: <ClockCircleOutlined className="text-4xl text-purple-500" />,
		action: "Paham",
		points: 20
	}
];

// Mini Game Component - Washing Machine Simulator
function WashingGame({ onComplete }: { onComplete: () => void }) {
	const [step, setStep] = useState(0);
	const [showSuccess, setShowSuccess] = useState(false);

	const gameSteps = [
		{ text: "Masukkan pakaian ke mesin", icon: "👕" },
		{ text: "Tambahkan deterjen", icon: "🧴" },
		{ text: "Pilih program cuci", icon: "🎛️" },
		{ text: "Masukkan koin/token", icon: "🪙" },
		{ text: "Tekan tombol START", icon: "▶️" }
	];

	const handleStep = () => {
		if (step < gameSteps.length - 1) {
			setStep(step + 1);
		} else {
			setShowSuccess(true);
			setTimeout(onComplete, 1500);
		}
	};

	return (
		<div className="text-center py-8">
			{!showSuccess ? (
				<>
					<motion.div 
						key={step}
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="mb-8"
					>
						<div className="text-8xl mb-4">{gameSteps[step].icon}</div>
						<h3 className="text-xl font-bold text-neutral-800 dark:text-white">
							Langkah {step + 1}: {gameSteps[step].text}
						</h3>
					</motion.div>
					
					<div className="flex justify-center gap-2 mb-6">
						{gameSteps.map((_, idx) => (
							<div 
								key={idx}
								className={`w-3 h-3 rounded-full transition-colors ${
									idx <= step ? 'bg-blue-500' : 'bg-neutral-300'
								}`}
							/>
						))}
					</div>

					<Button 
						type="primary" 
						size="large"
						onClick={handleStep}
						className="bg-blue-500 hover:bg-blue-600"
					>
						{step === gameSteps.length - 1 ? "Selesai!" : "Lanjut"}
					</Button>
				</>
			) : (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className="text-center"
				>
					<div className="text-8xl mb-4">🎉</div>
					<h3 className="text-2xl font-bold text-green-600 mb-2">Berhasil!</h3>
					<p className="text-neutral-600">Kamu sudah menguasai cara pakai mesin!</p>
				</motion.div>
			)}
		</div>
	);
}

export default function GamifiedOnboarding() {
	const [isOpen, setIsOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [totalPoints, setTotalPoints] = useState(0);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [showMiniGame, setShowMiniGame] = useState(false);
	const [isFinished, setIsFinished] = useState(false);

	useEffect(() => {
		// Check if user has seen onboarding
		const hasSeenOnboarding = localStorage.getItem("mba-onboarding-complete");
		if (!hasSeenOnboarding) {
			const timer = setTimeout(() => setIsOpen(true), 1000);
			return () => clearTimeout(timer);
		}
	}, []);

	const handleNext = () => {
		const step = steps[currentStep];
		
		// Add points
		if (!completedSteps.includes(step.id)) {
			setTotalPoints(prev => prev + step.points);
			setCompletedSteps(prev => [...prev, step.id]);
		}

		// Check if mini game
		if (step.miniGame) {
			setShowMiniGame(true);
			return;
		}

		// Move to next step
		if (currentStep < steps.length - 1) {
			setCurrentStep(prev => prev + 1);
		} else {
			finishOnboarding();
		}
	};

	const handlePrev = () => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const handleMiniGameComplete = () => {
		setShowMiniGame(false);
		if (currentStep < steps.length - 1) {
			setCurrentStep(prev => prev + 1);
		} else {
			finishOnboarding();
		}
	};

	const finishOnboarding = () => {
		setIsFinished(true);
		localStorage.setItem("mba-onboarding-complete", "true");
		localStorage.setItem("mba-user-points", totalPoints.toString());
		
		// Close after showing completion
		setTimeout(() => {
			setIsOpen(false);
		}, 3000);
	};

	const handleSkip = () => {
		localStorage.setItem("mba-onboarding-complete", "true");
		setIsOpen(false);
	};

	const currentStepData = steps[currentStep];
	const progress = ((currentStep + 1) / steps.length) * 100;

	return (
		<Modal
			open={isOpen}
			footer={null}
			closable={false}
			width={600}
			className="onboarding-modal"
			styles={{
				body: { padding: 0, borderRadius: "16px", overflow: "hidden" }
			}}
		>
			<div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1">
				<div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-4 flex justify-between items-center">
						<div className="flex items-center gap-2">
							<TrophyOutlined className="text-yellow-500 text-xl" />
							<span className="font-bold text-neutral-800 dark:text-white">
								{totalPoints} Poin
							</span>
						</div>
						<button 
							onClick={handleSkip}
							className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
						>
							Lewati
						</button>
					</div>

					{/* Progress */}
					<div className="px-6 pt-4">
						<Progress 
							percent={progress} 
							showInfo={false}
							strokeColor={{ from: '#3b82f6', to: '#8b5cf6' }}
							className="m-0"
						/>
						<div className="text-center text-xs text-neutral-500 mt-1">
							Langkah {currentStep + 1} dari {steps.length}
						</div>
					</div>

					{/* Content */}
					<div className="p-6 min-h-[300px]">
						<AnimatePresence mode="wait">
							{isFinished ? (
								<motion.div
									key="finished"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									className="text-center py-8"
								>
									<motion.div
										animate={{ rotate: [0, 360] }}
										transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
										className="inline-block text-8xl mb-4"
									>
										🎊
									</motion.div>
									<h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
										Selamat!
									</h2>
									<p className="text-neutral-600 dark:text-neutral-400 mb-4">
										Kamu telah menyelesaikan tutorial dan mendapatkan
									</p>
									<div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
										{totalPoints} POIN
									</div>
									<p className="text-sm text-neutral-500 mt-4">
										Poin dapat ditukar dengan diskon di cabang kami!
									</p>
								</motion.div>
							) : showMiniGame ? (
								<motion.div
									key="minigame"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									<WashingGame onComplete={handleMiniGameComplete} />
								</motion.div>
							) : (
								<motion.div
									key={currentStep}
									initial={{ opacity: 0, x: 50 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -50 }}
									transition={{ duration: 0.3 }}
									className="text-center"
								>
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.1, type: "spring" }}
										className="mb-6"
									>
										{currentStepData.icon}
									</motion.div>
									
									<h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-3">
										{currentStepData.title}
									</h2>
									<p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
										{currentStepData.description}
									</p>

									{currentStepData.points > 0 && !completedSteps.includes(currentStepData.id) && (
										<div className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold mb-4">
											<FireOutlined />
											+{currentStepData.points} poin
										</div>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Footer Navigation */}
					{!isFinished && !showMiniGame && (
						<div className="p-6 pt-0 flex justify-between">
							<Button
								onClick={handlePrev}
								disabled={currentStep === 0}
								icon={<LeftOutlined />}
							>
								Sebelumnya
							</Button>
							<Button
								type="primary"
								onClick={handleNext}
								className="bg-gradient-to-r from-blue-500 to-purple-500 border-0"
								icon={<RightOutlined />}
							>
								{currentStep === steps.length - 1 ? "Selesai" : currentStepData.action}
							</Button>
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
}

// Floating Points Badge
export function PointsBadge() {
	const [points, setPoints] = useState(0);
	const [showOnboarding, setShowOnboarding] = useState(false);

	useEffect(() => {
		const savedPoints = localStorage.getItem("mba-user-points") || "0";
		setPoints(parseInt(savedPoints));
	}, []);

	return (
		<>
			<motion.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={() => setShowOnboarding(true)}
				className="fixed bottom-24 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold"
			>
				<TrophyOutlined />
				{points} Poin
			</motion.button>
			
			{showOnboarding && (
				<GamifiedOnboarding />
			)}
		</>
	);
}
