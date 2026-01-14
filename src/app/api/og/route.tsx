// OGP Image Generation API
// Generates dynamic Open Graph images for sharing

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Voice type data (subset for OGP)
const typeData: Record<string, { name: string; icon: string; color: string }> = {
    'HFEC': { name: 'The Pop Star', icon: '🎤', color: '#FF00CC' },
    'HFED': { name: 'The Hype Man', icon: '📢', color: '#FF00CC' },
    'HSEC': { name: 'The Golden Retriever', icon: '🐶', color: '#FF00CC' },
    'HSED': { name: 'The Influencer', icon: '🤳', color: '#FF00CC' },
    'HFCC': { name: 'The Bored Robot', icon: '🤖', color: '#00F0FF' },
    'HFCD': { name: 'The Tech Lead', icon: '🤓', color: '#00F0FF' },
    'HSCC': { name: 'The ASMR Artist', icon: '👂', color: '#00F0FF' },
    'HSCD': { name: 'The Royal', icon: '👑', color: '#00F0FF' },
    'LFEC': { name: 'The Commander', icon: '🫡', color: '#FF3C00' },
    'LFED': { name: 'The Opera Star', icon: '🎭', color: '#FF3C00' },
    'LSEC': { name: 'The Movie Trailer', icon: '🎬', color: '#FF3C00' },
    'LSED': { name: 'The Late Night DJ', icon: '🍸', color: '#FF3C00' },
    'LFCC': { name: 'The News Anchor', icon: '📺', color: '#00FF66' },
    'LFCD': { name: 'The Sage', icon: '🧙‍♂️', color: '#00FF66' },
    'LSCC': { name: 'The Loyal Butler', icon: '🤵', color: '#00FF66' },
    'LSCD': { name: 'The Deep Whale', icon: '🐋', color: '#00FF66' },
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'HFEC';
    const id = searchParams.get('id') || '';

    const data = typeData[type] || typeData['HFEC'];

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000000',
                    backgroundImage: `radial-gradient(circle at 30% 30%, ${data.color}22 0%, transparent 50%), radial-gradient(circle at 70% 70%, #FF00FF22 0%, transparent 50%)`,
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 32,
                        fontWeight: 800,
                        marginBottom: 20,
                    }}
                >
                    <span style={{ color: '#00F0FF' }}>ETCH</span>
                    <span style={{ color: '#FF00FF' }}>VOX</span>
                </div>

                {/* Icon */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 120,
                        marginBottom: 20,
                    }}
                >
                    {data.icon}
                </div>

                {/* Type Name */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 56,
                        fontWeight: 800,
                        color: data.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    {data.name}
                </div>

                {/* Type Code */}
                <div
                    style={{
                        display: 'flex',
                        fontSize: 24,
                        color: '#666666',
                        marginTop: 10,
                    }}
                >
                    Type: {type}
                </div>

                {/* Result ID */}
                {id && (
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 18,
                            color: '#444444',
                            marginTop: 20,
                        }}
                    >
                        ID: {id}
                    </div>
                )}

                {/* Tagline */}
                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        bottom: 40,
                        fontSize: 20,
                        color: '#666666',
                    }}
                >
                    What is YOUR voice type? etchvox.ai
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
