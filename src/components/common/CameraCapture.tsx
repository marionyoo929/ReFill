import { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
};

const CAPTURE_FLASH_DURATION_MS = 200;

export function CameraCapture({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!open) return;

    let mounted = true;

    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!mounted) return;
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (e) {
        console.error('Camera access denied or unavailable', e);
      }
    }

    void start();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        capture();
      }
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function capture() {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);
    window.setTimeout(() => setIsCapturing(false), CAPTURE_FLASH_DURATION_MS);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // 미리보기는 거울처럼 좌우반전해 보여주지만, 캡처는 원본 프레임을 그대로 사용해
    // 제품 라벨의 글자가 뒤집히지 않도록 한다.
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, 'image/jpeg');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[min(90%,720px)] rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">카메라 촬영 (Space로 촬영)</h3>
          <button type="button" onClick={onClose} className="text-sm text-gray-600">
            닫기
          </button>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${
              isCapturing ? 'opacity-80' : 'opacity-0'
            }`}
          />
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              capture();
            }}
            className={`rounded-2xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-transform duration-150 active:scale-90 ${
              isCapturing ? 'scale-90' : 'scale-100'
            }`}
          >
            촬영
          </button>
        </div>
      </div>
    </div>
  );
}

export default CameraCapture;
