import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { addHyperFrame, getHyperFrame } from '../../hyperframes';
import { NEXT_PUBLIC_URL } from '../../config';

addHyperFrame('start', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'Road',
      },
      {
        label: 'Woods',
      },
      {
        label: 'Cave',
      },
      {
        action: 'link',
        label: 'TODO',
        target: 'https://www.google.com',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/frame-1-forest.webp`,
      aspectRatio: '1:1',
    },
    state: { frame: 'start' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'road',
  2: 'woods-bear',
  3: 'cave-1',
});

addHyperFrame('road', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'Go Back',
      },
      {
        label: 'Shack',
      },
      {
        label: 'Forward',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/road.png`,
      aspectRatio: '1:1',
    },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'start',
  2: 'shack',
  3: 'desert-road',
});

async function getResponse(req: NextRequest): Promise<NextResponse> {
   let accountAddress: string | undefined = '';
  let text: string | undefined = '';

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0];
  } else {
    return new NextResponse('Message not valid', { status: 500 });
  }

  if (message?.input) {
    text = message.input;
  }

  let state = {frame: "start"};
  
  try {
    state = JSON.parse(decodeURIComponent(message.state?.serialized));
  } catch (e) {
    console.error(e);
  }

  const frame = state.frame;

  if (!frame) {
  return new NextResponse('Frame not found', { status: 404 });
}

// There should always be a button number
if (!message?.button) {
  return new NextResponse('Button not found', { status: 404 });
}

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0];
  } else {
    return new NextResponse('Message not valid', { status: 500 });
  }

  return new NextResponse(getHyperFrame(frame as string, text || '', message?.button));
  
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
