import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock DOMMatrix for react-pdf/pdfjs-dist (required before any pdf.js import)
// pdf.js uses canvas which requires DOMMatrix - not available in jsdom
class DOMMatrixMock {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  m11 = 1; m12 = 0; m13 = 0; m14 = 0;
  m21 = 0; m22 = 1; m23 = 0; m24 = 0;
  m31 = 0; m32 = 0; m33 = 1; m34 = 0;
  m41 = 0; m42 = 0; m43 = 0; m44 = 1;
  is2D = true;
  isIdentity = true;

  inverse() { return new DOMMatrixMock(); }
  multiply() { return new DOMMatrixMock(); }
  translate() { return new DOMMatrixMock(); }
  scale() { return new DOMMatrixMock(); }
  rotate() { return new DOMMatrixMock(); }
  rotateFromVector() { return new DOMMatrixMock(); }
  skewX() { return new DOMMatrixMock(); }
  skewY() { return new DOMMatrixMock(); }
  flipX() { return new DOMMatrixMock(); }
  flipY() { return new DOMMatrixMock(); }
  transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
  toFloat32Array() { return new Float32Array(16); }
  toFloat64Array() { return new Float64Array(16); }
  toString() { return 'matrix(1, 0, 0, 1, 0, 0)'; }
  toJSON() { return {}; }
}

// @ts-expect-error - DOMMatrix polyfill for jsdom
globalThis.DOMMatrix = DOMMatrixMock;

// Mock pdfjs-dist FIRST to prevent canvas.js from being evaluated
// This must be mocked before react-pdf since react-pdf imports pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
  version: '0.0.0',
}));

vi.mock('pdfjs-dist/build/pdf.worker.min.mjs', () => ({}));

// Mock react-pdf to prevent canvas/worker initialization issues
vi.mock('react-pdf', () => ({
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: () => null,
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
}));

// Mock window.matchMedia for next-themes (Story 7.2)
// JSDOM doesn't implement matchMedia, so we need to mock it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Mock useAuth hook (Supabase — replaces next-auth/react useSession)
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    role: 'viewer',
    isLoading: false,
    isAuthenticated: false,
  })),
}));
