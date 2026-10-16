import { NextResponse } from 'next/server';
import { collectKeywordSuggestions } from '@/server/keyword-research';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      topic,
      platform = 'google',
      language = 'en',
      country = 'us',
      maxLimit = 100,
    } = body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid topic or seed keyword to research.',
        },
        { status: 400 }
      );
    }

    const validPlatforms = ['google', 'youtube'];
    const chosenPlatform = (platform || 'google').toLowerCase();

    if (!validPlatforms.includes(chosenPlatform)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported platform "${platform}". Please choose Google Search or YouTube.`,
        },
        { status: 400 }
      );
    }

    const result = await collectKeywordSuggestions({
      topic: topic.trim(),
      platform: chosenPlatform,
      language: language || 'en',
      country: country || 'us',
      maxLimit: Math.min(Number(maxLimit) || 100, 100),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          platform: result.platform,
          total: 0,
          keywords: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      topic: result.topic,
      platform: result.platform,
      language: result.language,
      country: result.country,
      total: result.total,
      keywords: result.keywords,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/keyword-research] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while collecting keyword suggestions.',
      },
      { status: 500 }
    );
  }
}
