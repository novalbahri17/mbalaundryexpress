import { motion } from "framer-motion";

export function RealisticWasherSection() {
	return (
		<section className="relative overflow-hidden bg-slate-900 py-24 md:py-32">
			{/* Dramatic background lighting */}
			<div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[120px] mix-blend-screen" />
			<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

			<div className="container relative z-10 mx-auto px-4 text-center">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl"
				>
					Teknologi Cuci{" "}
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-brand-400">
						Paling Modern
					</span>
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className="mx-auto mb-16 max-w-2xl text-lg text-slate-400"
				>
					Mesin kami menggunakan teknologi putaran presisi tinggi untuk membersihkan noda paling membandel sekaligus
					menjaga serat pakaian Anda tetap lembut.
				</motion.p>

				{/* 3D Scene Container */}
				<div className="relative mx-auto flex w-full max-w-[800px] perspective-[1200px] items-center justify-center">
					{/* Floor Shadow */}
					<div className="absolute -bottom-8 left-1/2 h-[40px] w-[320px] -translate-x-1/2 rounded-[100%] bg-black/80 blur-xl" />

					{/* 3D Machine Body */}
					<motion.div
						initial={{ rotateY: 15, rotateX: 5 }}
						whileInView={{ rotateY: 0, rotateX: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						whileHover={{ rotateY: -5, rotateX: 2 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="relative flex aspect-[7/9] w-full max-w-[380px] flex-col rounded-[3rem] border border-white/20 bg-gradient-to-br from-[#f8f9fa] via-[#e9ecef] to-[#ced4da] p-[2%] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.1),inset_10px_10px_30px_rgba(255,255,255,0.8),0_40px_60px_-10px_rgba(0,0,0,0.6)]"
						style={{ transformStyle: "preserve-3d" }}
					>
						{/* Top panel edge reflection */}
						<div className="absolute left-0 top-0 h-[20%] w-full rounded-t-[3rem] bg-gradient-to-b from-white to-transparent opacity-80" />

						{/* Control Panel (Dark Glass) */}
						<div className="relative z-10 mx-auto mt-4 flex h-[14%] w-[90%] items-center justify-between rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 via-slate-800 to-black p-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.5)]">
							{/* Knob */}
							<div className="relative ml-2 flex aspect-square h-[90%] items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_4px_6px_rgba(0,0,0,0.6)]">
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 12, ease: "linear", repeat: Infinity }}
									className="absolute inset-0 rounded-full"
								>
									<div className="absolute left-1/2 top-1 h-2 w-1.5 -translate-x-1/2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
								</motion.div>
							</div>

							{/* Display Screen */}
							<div className="relative flex h-[80%] flex-1 mx-4 overflow-hidden rounded-lg border border-teal-900/50 bg-[#020617] px-4 shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] items-center">
								{/* Screen Glow */}
								<div className="absolute inset-0 bg-teal-500/10 blur-sm" />
								<div className="flex w-full justify-between items-center text-teal-400 font-mono text-sm tracking-widest font-bold">
									<motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
										WASHING
									</motion.span>
									<span>45:00</span>
								</div>
							</div>

							{/* Detergent Drawer */}
							<div className="h-[80%] w-16 mr-2 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] border border-white/40 flex items-center justify-center">
								<div className="w-[60%] h-1 rounded-full bg-slate-500/50" />
							</div>
						</div>

						{/* Drum / Door Area */}
						<div className="relative mt-8 flex flex-1 items-center justify-center z-10 w-full">
							{/* Outer Chrome Ring */}
							<div className="relative flex aspect-square w-[86%] items-center justify-center rounded-full border border-slate-400 bg-gradient-to-br from-slate-100 via-slate-400 to-slate-600 shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.3),inset_5px_5px_15px_rgba(255,255,255,0.9),0_15px_25px_rgba(0,0,0,0.3)]">
								{/* Inner Deep Shadow (The Drum Depth) */}
								<div className="relative flex aspect-square w-[75%] items-center justify-center rounded-full bg-[#111] shadow-[inset_0_20px_40px_rgba(0,0,0,1)] overflow-hidden">
									{/* Metallic Drum Texture */}
									<motion.div
										animate={{ rotate: 360 }}
										transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
										className="absolute inset-0 rounded-full opacity-40 mix-blend-screen"
										style={{
											backgroundImage: "repeating-conic-gradient(#333 0% 2%, #777 2% 4%, #333 4% 6%)",
										}}
									/>

									{/* Drum Hex Pattern */}
									<div
										className="absolute inset-0 rounded-full opacity-20"
										style={{
											backgroundImage: "radial-gradient(circle at center, #fff 1px, transparent 1px)",
											backgroundSize: "16px 16px",
										}}
									/>

									{/* Water Sim */}
									<motion.div
										animate={{
											y: ["2%", "-2%", "2%"],
											rotate: [-3, 3, -3],
										}}
										transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
										className="absolute bottom-[-10%] w-[120%] h-[60%] bg-gradient-to-t from-teal-600/80 to-teal-400/40 blur-sm rounded-t-[40%]"
									/>

									{/* Tumbling Clothes */}
									<motion.div
										animate={{ rotate: 360 }}
										transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
										className="absolute inset-0 flex items-center justify-center"
									>
										{/* Cloth 1 */}
										<motion.div
											animate={{ scale: [1, 1.15, 0.9, 1], borderRadius: ["40%", "50%", "30%", "40%"] }}
											transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
											className="absolute w-[45%] h-[40%] bg-brand-500/90 blur-[2px] right-[10%] top-[20%] mix-blend-screen shadow-[0_0_20px_#6366f1]"
										/>
										{/* Cloth 2 */}
										<motion.div
											animate={{ scale: [0.9, 1.1, 1, 0.9], borderRadius: ["50%", "30%", "40%", "50%"] }}
											transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
											className="absolute w-[50%] h-[35%] bg-blue-500/90 blur-[2px] left-[15%] bottom-[20%] mix-blend-screen shadow-[0_0_20px_#3b82f6]"
										/>
										{/* Cloth 3 */}
										<motion.div
											animate={{ scale: [1.1, 0.9, 1.1], borderRadius: ["30%", "40%", "50%", "30%"] }}
											transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
											className="absolute w-[40%] h-[45%] bg-teal-400/90 blur-[2px] right-[25%] bottom-[15%] mix-blend-screen shadow-[0_0_20px_#2dd4bf]"
										/>
									</motion.div>

									{/* Suds / Bubbles in foreground */}
									<div className="absolute inset-0">
										<motion.div
											animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
											transition={{ duration: 1.5, repeat: Infinity }}
											className="absolute bottom-[20%] left-[30%] w-6 h-6 bg-white/60 blur-[3px] rounded-full"
										/>
										<motion.div
											animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
											transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
											className="absolute bottom-[25%] right-[20%] w-8 h-8 bg-white/50 blur-[4px] rounded-full"
										/>
										<motion.div
											animate={{ y: [0, -15, 0], opacity: [0.6, 1, 0.6] }}
											transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
											className="absolute bottom-[10%] left-[50%] w-5 h-5 bg-white/70 blur-[2px] rounded-full"
										/>
									</div>

									{/* Front Glass Curvature Highlights */}
									<div className="pointer-events-none absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]" />

									{/* Massive curved reflection to simulate spherical glass door */}
									<div className="pointer-events-none absolute -left-[30%] -top-[30%] h-[120%] w-[120%] rotate-[-20deg] rounded-[45%] bg-gradient-to-br from-white/30 via-white/5 to-transparent blur-[1px]" />
									<div className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[60%] w-[60%] rounded-full bg-gradient-to-tl from-white/10 to-transparent blur-[2px]" />
								</div>
							</div>
						</div>

						{/* Bottom Filter Panel */}
						<div className="relative mb-4 mt-8 mx-auto flex h-[8%] w-[86%] items-center justify-between">
							<div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-40" />
							<div className="mx-4 h-full w-[25%] rounded-md border border-slate-300 bg-gradient-to-b from-slate-200 to-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center">
								<div className="w-[60%] h-1 rounded-full bg-slate-500/50" />
							</div>
							<div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-40" />
						</div>

						{/* Main body glare */}
						<div className="pointer-events-none absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-transparent via-white/40 to-transparent mix-blend-overlay" />
					</motion.div>
				</div>
			</div>
		</section>
	);
}
