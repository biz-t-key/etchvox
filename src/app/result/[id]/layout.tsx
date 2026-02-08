import type { Metadata } from 'next';
import { voiceTypes, TypeCode } from '@/lib/types';

// Generate dynamic metadata for OGP
export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params;

    // We can't access localStorage on server, so we use a generic title
    // The actual OG image will be generated dynamically via API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://etchvox.com';

    return {
        title: `My Voice Type | Etchvox`,
        description: "Discover your voice personality type. Are you The Bored Robot or The Deep Whale?",
        openGraph: {
            title: `I discovered my voice type!`,
            description: "What's YOUR voice type? Take the 30-second voice analysis test!",
            type: 'website',
            url: `${baseUrl}/result/${id}`,
            images: [
                {
                    url: `${baseUrl}/api/og?id=${id}`,
                    width: 1200,
                    height: 630,
                    alt: 'Etchvox Result',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `I discovered my voice type!`,
            description: "What's YOUR voice type? Take the 30-second voice analysis test!",
            images: [`${baseUrl}/api/og?id=${id}`],
        },
    };
}

export default function ResultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
