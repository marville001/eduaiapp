"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { promoBannerApi } from '@/lib/api/promo-banner.api';
import { PromoBanner } from '@/types/promo-banner';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PromoBannerSidebarProps {
	placement?: string;
	className?: string;
}

export default function PromoBannerSidebar({
	placement = 'ai-tutor',
	className = ''
}: PromoBannerSidebarProps) {
	const [banners, setBanners] = useState<PromoBanner[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchBanners = async () => {
			try {
				setLoading(true);
				const data = await promoBannerApi.getActive(placement);
				setBanners(data);
			} catch (error) {
				console.error('Failed to fetch promo banners:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchBanners();
	}, [placement]);

	if (loading) {
		return (
			<div className={`space-y-4 ${className}`}>
				<div className="animate-pulse">
					<div className="h-48 bg-gray-200 rounded-lg"></div>
				</div>
			</div>
		);
	}

	if (banners.length === 0) {
		return null;
	}

	const getButtonVariant = (variant: string) => {
		switch (variant) {
			case 'secondary':
				return 'secondary';
			case 'outline':
				return 'outline';
			case 'ghost':
				return 'ghost';
			default:
				return 'default';
		}
	};

	const isExternalLink = (url: string) => {
		return url.startsWith('http://') || url.startsWith('https://');
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{banners.map((banner) => (
				<Card
					key={banner.id}
					className="overflow-hidden border-0 shadow-lg pb-0 bg-linear-to-br from-white to-gray-50"
				>
					{banner.imageUrl && (
						<div className="relative w-full h-24">
							<Image
								src={banner.imageUrl}
								alt={banner.title}
								fill
								className="object-cover"
							/>
						</div>
					)}
					<CardContent className="p-5">
						<h3 className="font-bold text-lg text-gray-900 mb-2">
							{banner.title}
						</h3>
						{banner.description && (
							<p className="text-sm text-gray-600 mb-4 line-clamp-3">
								{banner.description}
							</p>
						)}
						{isExternalLink(banner.buttonUrl) ? (
							<a
								href={banner.buttonUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="w-full block"
							>
								<Button
									variant={getButtonVariant(banner.buttonVariant)}
									className="w-full"
								>
									{banner.buttonText}
									<ExternalLink className="w-4 h-4 ml-2" />
								</Button>
							</a>
						) : (
							<Link href={banner.buttonUrl} className="w-full block">
								<Button
									variant={getButtonVariant(banner.buttonVariant)}
									className="w-full"
								>
									{banner.buttonText}
								</Button>
							</Link>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
