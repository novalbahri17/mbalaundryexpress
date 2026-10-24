import { listRecords } from "@/api/client";

export interface MarketingMetric {
	date: string;
	visitors: number;
	whatsapp_clicks: number;
	branch_visits: number;
	conversions: number;
	source: string;
	campaign_id?: string;
}

export interface PromoEffectiveness {
	promo_id: string;
	promo_title: string;
	impressions: number;
	clicks: number;
	conversions: number;
	conversion_rate: number;
	estimated_revenue: number;
	roi_percentage: number;
	cost: number;
	start_date: string;
	end_date: string | null;
}

export interface CampaignTracking {
	campaign_id: string;
	campaign_name: string;
	platform: "instagram" | "tiktok" | "facebook" | "google_ads" | "website";
	impressions: number;
	engagements: number;
	clicks: number;
	conversions: number;
	cost: number;
	roi: number;
	cpc: number;
	ctr: number;
	date_range: string;
}

export interface LeadFunnelData {
	stage: string;
	count: number;
	percentage: number;
	avg_duration: string;
	dropoff_rate: number;
}

export interface ABTestResult {
	test_id: string;
	test_name: string;
	variant_a: {
		name: string;
		impressions: number;
		conversions: number;
		conversion_rate: number;
	};
	variant_b: {
		name: string;
		impressions: number;
		conversions: number;
		conversion_rate: number;
	};
	winner: "a" | "b" | "tie";
	confidence_level: number;
	improvement_percentage: number;
}

// Mock data untuk development
export const getMarketingMetrics = async (_startDate: string, _endDate: string): Promise<MarketingMetric[]> => {
	// In production, this would query analytics database
	return [
		{
			date: "2024-03-01",
			visitors: 1245,
			whatsapp_clicks: 89,
			branch_visits: 45,
			conversions: 32,
			source: "organic",
		},
		{
			date: "2024-03-02",
			visitors: 1567,
			whatsapp_clicks: 112,
			branch_visits: 67,
			conversions: 48,
			source: "instagram",
			campaign_id: "ig_spring_promo",
		},
		{
			date: "2024-03-03",
			visitors: 1423,
			whatsapp_clicks: 98,
			branch_visits: 52,
			conversions: 41,
			source: "google_ads",
			campaign_id: "ga_laundry_near_me",
		},
	];
};

export const getPromoEffectiveness = async (): Promise<PromoEffectiveness[]> => {
	try {
		const promos = await listRecords("promos", {
			page: 1,
			perPage: 50,
			filter: "is_active = true",
			sort: "-priority,-created",
		});

		return promos.items.map((promo) => {
			const impressions = Math.floor(Math.random() * 5000) + 1000;
			const clicks = Math.floor(impressions * (Math.random() * 0.1 + 0.05));
			const conversions = Math.floor(clicks * (Math.random() * 0.3 + 0.1));
			const cost = Math.floor(Math.random() * 500000) + 100000;
			const estimated_revenue = conversions * 20000; // Avg transaction value

			return {
				promo_id: promo.id,
				promo_title: promo.title,
				impressions,
				clicks,
				conversions,
				conversion_rate: (conversions / clicks) * 100,
				estimated_revenue,
				roi_percentage: ((estimated_revenue - cost) / cost) * 100,
				cost,
				start_date: promo.start_date,
				end_date: promo.end_date,
			};
		});
	} catch {
		return [];
	}
};

export const getCampaignTracking = async (): Promise<CampaignTracking[]> => {
	return [
		{
			campaign_id: "ig_spring_promo",
			campaign_name: "Spring Cleaning Promo",
			platform: "instagram",
			impressions: 12500,
			engagements: 1245,
			clicks: 312,
			conversions: 89,
			cost: 750000,
			roi: 186,
			cpc: 2403,
			ctr: 2.5,
			date_range: "2024-03-01 - 2024-03-07",
		},
		{
			campaign_id: "tt_viral_challenge",
			campaign_name: "#LaundryChallenge",
			platform: "tiktok",
			impressions: 85000,
			engagements: 12500,
			clicks: 1567,
			conversions: 234,
			cost: 1200000,
			roi: 245,
			cpc: 765,
			ctr: 1.84,
			date_range: "2024-02-25 - 2024-03-10",
		},
		{
			campaign_id: "ga_local_search",
			campaign_name: "Laundry Near Me Ads",
			platform: "google_ads",
			impressions: 45000,
			engagements: 3200,
			clicks: 890,
			conversions: 156,
			cost: 450000,
			roi: 312,
			cpc: 505,
			ctr: 1.98,
			date_range: "2024-03-01 - 2024-03-15",
		},
	];
};

export const getLeadFunnel = async (): Promise<LeadFunnelData[]> => {
	const totalLeads = 1000;

	return [
		{
			stage: "Website Visitor",
			count: totalLeads,
			percentage: 100,
			avg_duration: "0s",
			dropoff_rate: 0,
		},
		{
			stage: "CTA Click",
			count: 320,
			percentage: 32,
			avg_duration: "45s",
			dropoff_rate: 68,
		},
		{
			stage: "WhatsApp Contact",
			count: 156,
			percentage: 15.6,
			avg_duration: "2m 30s",
			dropoff_rate: 51.25,
		},
		{
			stage: "Branch Visit",
			count: 89,
			percentage: 8.9,
			avg_duration: "1d 3h",
			dropoff_rate: 42.95,
		},
		{
			stage: "Transaction",
			count: 67,
			percentage: 6.7,
			avg_duration: "15m",
			dropoff_rate: 24.72,
		},
	];
};

export const getABTestResults = async (): Promise<ABTestResult[]> => {
	return [
		{
			test_id: "test_001",
			test_name: "Hero CTA Button Color",
			variant_a: {
				name: "Ruby Red",
				impressions: 12500,
				conversions: 567,
				conversion_rate: 4.54,
			},
			variant_b: {
				name: "Sapphire Blue",
				impressions: 12400,
				conversions: 489,
				conversion_rate: 3.94,
			},
			winner: "a",
			confidence_level: 95.2,
			improvement_percentage: 15.3,
		},
		{
			test_id: "test_002",
			test_name: "Promo Page Layout",
			variant_a: {
				name: "Grid Layout",
				impressions: 8900,
				conversions: 345,
				conversion_rate: 3.88,
			},
			variant_b: {
				name: "Card Slider",
				impressions: 9100,
				conversions: 412,
				conversion_rate: 4.53,
			},
			winner: "b",
			confidence_level: 92.7,
			improvement_percentage: 16.8,
		},
		{
			test_id: "test_003",
			test_name: "Pricing Display",
			variant_a: {
				name: "Table View",
				impressions: 6700,
				conversions: 234,
				conversion_rate: 3.49,
			},
			variant_b: {
				name: "Card Comparison",
				impressions: 6800,
				conversions: 289,
				conversion_rate: 4.25,
			},
			winner: "b",
			confidence_level: 97.1,
			improvement_percentage: 21.8,
		},
	];
};

// Track marketing event
export const trackMarketingEvent = async (event: {
	type: string;
	source: string;
	campaign_id?: string;
	metadata?: Record<string, unknown>;
}): Promise<void> => {
	try {
		// In production, send to analytics service
		console.log("Marketing event tracked:", event);
	} catch (error) {
		console.error("Failed to track marketing event:", error);
	}
};
