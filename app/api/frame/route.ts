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
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/home.webp`,
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
      src: `${NEXT_PUBLIC_URL}/road.webp`,
      aspectRatio: '1:1',
    },
    state: { frame: 'road' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'start',
  2: 'shack',
  3: 'desert-road',
});

addHyperFrame('woods-bear', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'You see a bear, go back.',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/bear.webp`,
      aspectRatio: '1:1',
    },
      state: { frame: 'woods-bear' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'start',
});

addHyperFrame('cave-1', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'Go Back',
      },
      {
        label: 'Continue',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/cave1.webp`,
      aspectRatio: '1:1',
    },
      state: { frame: 'cave-1' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'start',
  2: 'cave-2',
});

addHyperFrame('cave-2', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'Captured by the monster, start over.',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/cave2.webp`,
      aspectRatio: '1:1',
    },
      state: { frame: 'cave-2' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'start',
});

addHyperFrame('desert-road', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'Too hot here, go back.',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/desertroad.webp`,
      aspectRatio: '1:1',
    },
      state: { frame: 'desert-road' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'road',
});

addHyperFrame('shack', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'Go Back',
      },
      {
        label: 'Door',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/shack.webp`,
      aspectRatio: '1:1',
    },
    input: {
      text: 'What is the password?',
    },
    state: { frame: 'shack' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'road',
  2: (text: string) => {
    return text === 'all your base are belong to you' ? 'key' : 'shack-bad-password';
  },
});

addHyperFrame('shack-bad-password', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'Go Back',
      },
      {
        label: 'Door',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/shack.webp`,
      aspectRatio: '1:1',
    },
    input: {
      text: 'Try again. What is the password?',
    },
    state: { frame: 'shack-bad-password' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'road',
  2: (text: string) => {
    return text === 'All your Base are belong to you' ? 'key' : 'shack-bad-password';
  },
});

addHyperFrame('key', {
  frame: getFrameHtmlResponse({
    buttons: [
      {
        label: 'You unlocked the door. Restart.',
      },
    ],
    image: {
      src: `${NEXT_PUBLIC_URL}/key.webp`,
      aspectRatio: '1:1',
    },
    state: { frame: 'key' },
    postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
  }),
  1: 'start',
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
