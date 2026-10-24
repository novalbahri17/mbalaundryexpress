import type { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useThemeStore } from "@/store/themeStore";

interface ChartWrapperProps {
	type: "line" | "area" | "bar" | "pie" | "donut" | "radialBar" | "scatter" | "bubble" | "heatmap" | "candlestick";
	series: ApexAxisChartSeries | ApexNonAxisChartSeries;
	options?: ApexOptions;
	height?: number | string;
	width?: number | string;
	title?: string;
	subtitle?: string;
}

function ChartWrapper({
	type,
	series,
	options: customOptions,
	height = 350,
	width = "100%",
	title,
	subtitle,
}: ChartWrapperProps) {
	const { mode } = useThemeStore();
	const isDark = mode === "dark";

	const chartOptions = useMemo<ApexOptions>(() => {
		const textColor = isDark ? "#e2e8f0" : "#374151";
		const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
		const backgroundColor = isDark ? "#1a1d27" : "#ffffff";

		const baseOptions: ApexOptions = {
			chart: {
				type,
				height,
				width,
				foreColor: textColor,
				background: backgroundColor,
				toolbar: {
					show: true,
					tools: {
						download: true,
						selection: true,
						zoom: true,
						zoomin: true,
						zoomout: true,
						pan: true,
						reset: true,
					},
				},
				animations: {
					enabled: true,
					speed: 800,
					animateGradually: {
						enabled: true,
						delay: 150,
					},
					dynamicAnimation: {
						enabled: true,
						speed: 350,
					},
				},
			},
			theme: {
				mode: isDark ? "dark" : "light",
				palette: "palette1",
			},
			colors: [
				"#C62828", // Ruby
				"#1565C0", // Sapphire
				"#00897B", // Teal
				"#FF9800", // Amber
				"#7B1FA2", // Purple
				"#4CAF50", // Green
				"#F44336", // Red
				"#2196F3", // Blue
				"#FF5722", // Deep Orange
				"#9C27B0", // Deep Purple
			],
			stroke: {
				curve: "smooth",
				width: 2,
				lineCap: "round",
			},
			grid: {
				borderColor: gridColor,
				strokeDashArray: 4,
				xaxis: {
					lines: {
						show: true,
					},
				},
				yaxis: {
					lines: {
						show: true,
					},
				},
			},
			xaxis: {
				axisBorder: {
					show: true,
					color: gridColor,
				},
				axisTicks: {
					show: true,
					color: gridColor,
				},
				labels: {
					style: {
						colors: textColor,
						fontSize: "12px",
						fontFamily: "Inter, sans-serif",
					},
				},
			},
			yaxis: {
				labels: {
					style: {
						colors: textColor,
						fontSize: "12px",
						fontFamily: "Inter, sans-serif",
					},
					formatter: (value) => {
						if (value >= 1000) {
							return `${(value / 1000).toFixed(1)}k`;
						}
						return value.toString();
					},
				},
			},
			tooltip: {
				theme: isDark ? "dark" : "light",
				shared: true,
				intersect: false,
				style: {
					fontSize: "12px",
					fontFamily: "Inter, sans-serif",
				},
				x: {
					format: "dd MMM yyyy",
				},
				y: {
					formatter: (value) => {
						return new Intl.NumberFormat("id-ID").format(value);
					},
				},
			},
			legend: {
				position: "bottom",
				horizontalAlign: "center",
				labels: {
					colors: textColor,
					useSeriesColors: false,
				},
				fontSize: "13px",
				fontFamily: "Inter, sans-serif",
				fontWeight: 500,
			},
			dataLabels: {
				enabled: false,
				style: {
					fontSize: "12px",
					fontFamily: "Inter, sans-serif",
				},
			},
			plotOptions: {
				bar: {
					borderRadius: 4,
					borderRadiusApplication: "end",
					columnWidth: "70%",
				},
				pie: {
					donut: {
						labels: {
							show: true,
							name: {
								show: true,
								fontSize: "16px",
								fontFamily: "Inter, sans-serif",
								color: textColor,
							},
							value: {
								show: true,
								fontSize: "24px",
								fontFamily: "Inter, sans-serif",
								fontWeight: 700,
								color: textColor,
							},
							total: {
								show: true,
								label: "Total",
								color: textColor,
								fontFamily: "Inter, sans-serif",
								fontSize: "16px",
							},
						},
					},
				},
				radialBar: {
					hollow: {
						size: "60%",
					},
					track: {
						background: gridColor,
					},
					dataLabels: {
						name: {
							color: textColor,
							fontSize: "16px",
						},
						value: {
							color: textColor,
							fontSize: "24px",
							fontWeight: 700,
						},
					},
				},
			},
			fill: {
				type: "gradient",
				gradient: {
					shade: isDark ? "dark" : "light",
					type: "vertical",
					shadeIntensity: 0.3,
					gradientToColors: undefined,
					inverseColors: false,
					opacityFrom: 0.7,
					opacityTo: 0.2,
					stops: [0, 90, 100],
				},
			},
			markers: {
				size: 5,
				strokeColors: backgroundColor,
				strokeWidth: 2,
				hover: {
					size: 7,
				},
			},
			responsive: [
				{
					breakpoint: 640,
					options: {
						chart: {
							height: 250,
						},
						legend: {
							position: "bottom",
							horizontalAlign: "center",
						},
					},
				},
			],
		};

		if (title || subtitle) {
			baseOptions.title = {
				text: title,
				align: "left",
				style: {
					fontSize: "18px",
					fontWeight: "bold",
					fontFamily: "Inter, sans-serif",
					color: textColor,
				},
			};

			if (subtitle) {
				baseOptions.subtitle = {
					text: subtitle,
					align: "left",
					style: {
						fontSize: "14px",
						fontFamily: "Inter, sans-serif",
						color: isDark ? "#9ca3af" : "#6b7280",
					},
				};
			}
		}

		return {
			...baseOptions,
			...customOptions,
		};
	}, [type, height, width, mode, customOptions, title, subtitle]);

	return (
		<div
			className="rounded-xl border p-4 shadow-sm"
			style={{
				backgroundColor: "var(--bg-card)",
				borderColor: "var(--border)",
			}}
		>
			<ReactApexChart options={chartOptions} series={series} type={type} height={height} width={width} />
		</div>
	);
}

export default ChartWrapper;

// Contoh penggunaan komponen
export function LineChartExample() {
	const series = [
		{
			name: "Website Visitors",
			data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
		},
		{
			name: "WhatsApp Clicks",
			data: [15, 25, 20, 35, 32, 45, 55, 70, 95],
		},
	];

	const options: ApexOptions = {
		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
		},
	};

	return <ChartWrapper type="line" series={series} options={options} title="Traffic Overview" />;
}

export function BarChartExample() {
	const series = [
		{
			name: "Conversions",
			data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
		},
		{
			name: "Revenue",
			data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
		},
	];

	const options: ApexOptions = {
		xaxis: {
			categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
		},
		yaxis: {
			title: {
				text: "Jumlah",
				style: {
					color: "#6b7280",
				},
			},
		},
	};

	return <ChartWrapper type="bar" series={series} options={options} title="Monthly Performance" />;
}

export function PieChartExample() {
	const series = [44, 55, 13, 43, 22];
	const options: ApexOptions = {
		labels: ["Instagram", "Facebook", "Google Ads", "TikTok", "Organic"],
		plotOptions: {
			pie: {
				expandOnClick: true,
			},
		},
	};

	return <ChartWrapper type="pie" series={series} options={options} title="Traffic Sources" />;
}

export function AreaChartExample() {
	const series = [
		{
			name: "Promo A",
			data: [31, 40, 28, 51, 42, 109, 100],
		},
		{
			name: "Promo B",
			data: [11, 32, 45, 32, 34, 52, 41],
		},
	];

	const options: ApexOptions = {
		xaxis: {
			categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
		},
	};

	return <ChartWrapper type="area" series={series} options={options} title="Promo Performance" />;
}
