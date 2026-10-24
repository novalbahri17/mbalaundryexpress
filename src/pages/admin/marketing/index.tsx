import {
	AreaChartOutlined,
	BarChartOutlined,
	ExperimentOutlined,
	FunnelPlotOutlined,
	LineChartOutlined,
	PieChartOutlined,
	RiseOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Statistic, Table, Tabs, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import {
	type ABTestResult,
	type CampaignTracking,
	getABTestResults,
	getCampaignTracking,
	getLeadFunnel,
	getMarketingMetrics,
	getPromoEffectiveness,
	type LeadFunnelData,
	type PromoEffectiveness,
} from "@/api/marketing.api";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { useThemeStore } from "@/store/themeStore";
import { formatCurrency, formatDate } from "@/utils/format";

export default function MarketingDashboardPage() {
	const { mode } = useThemeStore();
	const [dateRange] = useState<"7days" | "30days" | "90days">("30days");
	const [campaignPlatform] = useState<string>("all");

	const isDark = mode === "dark";

	const { data: metrics = [] } = useQuery({
		queryKey: ["marketing-metrics", dateRange],
		queryFn: () => getMarketingMetrics("2024-03-01", "2024-03-30"),
	});

	const { data: promoEffectiveness = [], isLoading: promoLoading } = useQuery({
		queryKey: ["promo-effectiveness"],
		queryFn: getPromoEffectiveness,
	});

	const { data: campaignTracking = [], isLoading: campaignLoading } = useQuery({
		queryKey: ["campaign-tracking"],
		queryFn: getCampaignTracking,
	});

	const { data: leadFunnel = [], isLoading: funnelLoading } = useQuery({
		queryKey: ["lead-funnel"],
		queryFn: getLeadFunnel,
	});

	const { data: abTests = [], isLoading: abTestsLoading } = useQuery({
		queryKey: ["ab-tests"],
		queryFn: getABTestResults,
	});

	const filteredCampaigns = useMemo(() => {
		if (campaignPlatform === "all") return campaignTracking;
		return campaignTracking.filter((campaign) => campaign.platform === campaignPlatform);
	}, [campaignTracking, campaignPlatform]);

	const totalStats = useMemo(() => {
		if (metrics.length === 0) return null;

		return {
			visitors: metrics.reduce((sum, m) => sum + m.visitors, 0),
			whatsappClicks: metrics.reduce((sum, m) => sum + m.whatsapp_clicks, 0),
			branchVisits: metrics.reduce((sum, m) => sum + m.branch_visits, 0),
			conversions: metrics.reduce((sum, m) => sum + m.conversions, 0),
			conversionRate:
				(metrics.reduce((sum, m) => sum + m.conversions, 0) / metrics.reduce((sum, m) => sum + m.visitors, 0)) * 100 ||
				0,
		};
	}, [metrics]);

	const promoColumns: ColumnsType<PromoEffectiveness> = [
		{
			title: "Promo",
			dataIndex: "promo_title",
			key: "promo_title",
			render: (text, record) => (
				<div>
					<div className="font-semibold">{text}</div>
					<div className="text-xs text-gray-500">
						{formatDate(record.start_date)} - {record.end_date ? formatDate(record.end_date) : "Tanpa tenggat"}
					</div>
				</div>
			),
		},
		{
			title: "Impressions",
			dataIndex: "impressions",
			key: "impressions",
			render: (value) => value.toLocaleString("id-ID"),
		},
		{
			title: "Conversions",
			dataIndex: "conversions",
			key: "conversions",
		},
		{
			title: "Conversion Rate",
			dataIndex: "conversion_rate",
			key: "conversion_rate",
			render: (value) => <Tag color={value > 5 ? "green" : value > 2 ? "blue" : "orange"}>{value.toFixed(2)}%</Tag>,
		},
		{
			title: "ROI",
			dataIndex: "roi_percentage",
			key: "roi_percentage",
			render: (value) => (
				<div className={value > 100 ? "font-bold text-green-600" : value > 0 ? "text-blue-600" : "text-red-600"}>
					{value > 0 ? "+" : ""}
					{value.toFixed(1)}%
				</div>
			),
		},
		{
			title: "Revenue",
			dataIndex: "estimated_revenue",
			key: "estimated_revenue",
			render: (value) => formatCurrency(value),
		},
	];

	const campaignColumns: ColumnsType<CampaignTracking> = [
		{
			title: "Campaign",
			dataIndex: "campaign_name",
			key: "campaign_name",
			render: (text, record) => (
				<div>
					<div className="font-semibold">{text}</div>
					<div className="text-xs text-gray-500">{record.platform}</div>
				</div>
			),
		},
		{
			title: "Impressions",
			dataIndex: "impressions",
			key: "impressions",
			render: (value) => value.toLocaleString("id-ID"),
		},
		{ title: "Clicks", dataIndex: "clicks", key: "clicks" },
		{ title: "Conversions", dataIndex: "conversions", key: "conversions" },
		{ title: "CTR", dataIndex: "ctr", key: "ctr", render: (value) => `${value}%` },
		{ title: "CPC", dataIndex: "cpc", key: "cpc", render: (value) => formatCurrency(value) },
		{
			title: "ROI",
			dataIndex: "roi",
			key: "roi",
			render: (value) => <Tag color={value > 200 ? "green" : value > 100 ? "blue" : "orange"}>{value}%</Tag>,
		},
	];

	const funnelColumns: ColumnsType<LeadFunnelData> = [
		{ title: "Stage", dataIndex: "stage", key: "stage" },
		{ title: "Count", dataIndex: "count", key: "count" },
		{
			title: "Percentage",
			dataIndex: "percentage",
			key: "percentage",
			render: (value) => `${value.toFixed(1)}%`,
		},
		{ title: "Avg Duration", dataIndex: "avg_duration", key: "avg_duration" },
		{
			title: "Drop-off Rate",
			dataIndex: "dropoff_rate",
			key: "dropoff_rate",
			render: (value) => (
				<div style={{ color: value > 50 ? (isDark ? "#f87171" : "#dc2626") : isDark ? "#94a3b8" : "#4b5563" }}>
					{value.toFixed(1)}%
				</div>
			),
		},
	];

	const abTestColumns: ColumnsType<ABTestResult> = [
		{ title: "Test", dataIndex: "test_name", key: "test_name" },
		{
			title: "Variant A",
			key: "variant_a",
			render: (_, record) => (
				<div>
					<div className="font-medium">{record.variant_a.name}</div>
					<div className="text-xs">Rate: {record.variant_a.conversion_rate.toFixed(2)}%</div>
				</div>
			),
		},
		{
			title: "Variant B",
			key: "variant_b",
			render: (_, record) => (
				<div>
					<div className="font-medium">{record.variant_b.name}</div>
					<div className="text-xs">Rate: {record.variant_b.conversion_rate.toFixed(2)}%</div>
				</div>
			),
		},
		{
			title: "Winner",
			dataIndex: "winner",
			key: "winner",
			render: (value, record) => {
				const isA = value === "a";
				const isB = value === "b";
				const variant = isA ? record.variant_a : isB ? record.variant_b : null;
				return (
					<Tag color={value === "a" ? "green" : value === "b" ? "blue" : "gray"}>
						{value === "tie" ? "Tie" : `${variant?.name} (+${record.improvement_percentage.toFixed(1)}%)`}
					</Tag>
				);
			},
		},
		{
			title: "Confidence",
			dataIndex: "confidence_level",
			key: "confidence_level",
			render: (value) => <Tag color={value > 95 ? "green" : value > 90 ? "blue" : "orange"}>{value.toFixed(1)}%</Tag>,
		},
	];

	return (
		<MetronicPage
			title="Marketing Performance"
			subtitle="Track and analyze marketing campaign performance, conversions, and ROI"
		>
			{/* Summary Stats */}
			<Row gutter={[16, 16]} className="mb-4">
				<Col xs={24} sm={12} lg={6}>
					<Card className="stat-card">
						<Statistic
							title="Total Visitors"
							value={totalStats?.visitors || 0}
							prefix={<BarChartOutlined />}
							valueStyle={{ color: isDark ? "#60a5fa" : "#3f51b5" }}
							suffix="orang"
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card className="stat-card">
						<Statistic
							title="WhatsApp Clicks"
							value={totalStats?.whatsappClicks || 0}
							prefix={<RiseOutlined />}
							valueStyle={{ color: isDark ? "#4ade80" : "#4caf50" }}
							suffix="klik"
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card className="stat-card">
						<Statistic
							title="Branch Visits"
							value={totalStats?.branchVisits || 0}
							prefix={<AreaChartOutlined />}
							valueStyle={{ color: isDark ? "#facc15" : "#ff9800" }}
							suffix="kunjungan"
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card className="stat-card">
						<Statistic
							title="Conversion Rate"
							value={totalStats?.conversionRate || 0}
							precision={2}
							prefix={<LineChartOutlined />}
							valueStyle={{ color: isDark ? "#f87171" : "#f44336" }}
							suffix="%"
						/>
					</Card>
				</Col>
			</Row>

			{/* Tabs for different sections */}
			<Tabs
				className="admin-responsive-tabs"
				defaultActiveKey="1"
				items={[
					{
						key: "1",
						label: (
							<span>
								<FunnelPlotOutlined />
								Lead Funnel
							</span>
						),
						children: (
							<Card title="Lead Funnel Analysis" className="card">
								<Table
									columns={funnelColumns}
									dataSource={leadFunnel}
									loading={funnelLoading}
									pagination={false}
									rowKey="stage"
								/>
							</Card>
						),
					},
					{
						key: "2",
						label: (
							<span>
								<PieChartOutlined />
								Promo Effectiveness
							</span>
						),
						children: (
							<Card title="Promo Performance & ROI Analysis" className="card">
								<Table
									columns={promoColumns}
									dataSource={promoEffectiveness}
									loading={promoLoading}
									pagination={{ pageSize: 5 }}
									rowKey="promo_id"
								/>
							</Card>
						),
					},
					{
						key: "3",
						label: (
							<span>
								<BarChartOutlined />
								Campaign Tracking
							</span>
						),
						children: (
							<Card title="Social Media & Campaign Performance" className="card">
								<Table
									columns={campaignColumns}
									dataSource={filteredCampaigns}
									loading={campaignLoading}
									pagination={{ pageSize: 5 }}
									rowKey="campaign_id"
								/>
							</Card>
						),
					},
					{
						key: "4",
						label: (
							<span>
								<ExperimentOutlined />
								A/B Testing
							</span>
						),
						children: (
							<Card title="A/B Testing Dashboard" className="card">
								<Table
									columns={abTestColumns}
									dataSource={abTests}
									loading={abTestsLoading}
									pagination={false}
									rowKey="test_id"
								/>
							</Card>
						),
					},
				]}
			/>
		</MetronicPage>
	);
}
