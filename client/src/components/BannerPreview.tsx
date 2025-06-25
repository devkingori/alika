import { useEffect, useRef } from "react";

interface BannerPreviewProps {
  campaign: {
    id: string;
    title: string;
    templateUrl: string;
    placeholderConfig?: any;
  };
  userName: string;
  userPhoto: string | null;
}

export default function BannerPreview({ campaign, userName, userPhoto }: BannerPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#007bff";
    ctx.fillRect(0, 0, canvas.width, 200);

    // Draw title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Inter";
    ctx.textAlign = "center";
    ctx.fillText(campaign.title, canvas.width / 2, 100);

    // Draw white background for content area
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 200, canvas.width, 200);

    // Draw user photo if provided
    if (userPhoto) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const photoSize = 80;
        const photoX = 50;
        const photoY = 220;

        // Save context for clipping
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
        ctx.restore();
      };
      img.src = userPhoto;
    } else {
      // Draw placeholder circle
      const photoSize = 80;
      const photoX = 50;
      const photoY = 220;

      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Draw plus icon
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 24px Inter";
      ctx.textAlign = "center";
      ctx.fillText("+", photoX + photoSize / 2, photoY + photoSize / 2 + 8);
    }

    // Draw user name
    if (userName) {
      ctx.fillStyle = "#000000";
      ctx.font = "24px Inter";
      ctx.textAlign = "left";
      ctx.fillText(userName, 160, 270);
    } else {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "italic 20px Inter";
      ctx.textAlign = "left";
      ctx.fillText("Your name will appear here", 160, 270);
    }

    // Draw campaign branding
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px Inter";
    ctx.textAlign = "right";
    ctx.fillText("Created with GetDP", canvas.width - 20, canvas.height - 20);

  }, [campaign, userName, userPhoto]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Banner Preview
      </label>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-w-full border border-gray-200 rounded bg-white"
          style={{ aspectRatio: "2/1" }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        This is a live preview of your banner. Changes to your name and photo will appear instantly.
      </p>
    </div>
  );
}
