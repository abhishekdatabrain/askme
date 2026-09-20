/**
 * Utility to generate and download a branded Live QR Standee Card image.
 */
export const downloadBrandedQrCard = async ({
    qrUrl,
    creatorName = 'CREATOR',
    title = 'LIVE BROADCAST',
    sessionCode = 'askme',
    filename = 'askme_live_qr_card.png',
}) => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas resolution
        const width = 600;
        const height = 720;
        canvas.width = width;
        canvas.height = height;

        // Fetch QR image as Blob to avoid CORS canvas taint
        let qrImgElement = null;
        let processQrUrl = qrUrl;
        if (processQrUrl && processQrUrl.includes('api.qrserver.com') && !processQrUrl.includes('ecc=')) {
            processQrUrl += '&ecc=H&margin=2';
        }

        if (processQrUrl) {
            try {
                const res = await fetch(processQrUrl);
                const blob = await res.blob();
                const objectUrl = URL.createObjectURL(blob);
                qrImgElement = await new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => resolve({ img, objectUrl });
                    img.onerror = () => resolve(null);
                    img.src = objectUrl;
                });
            } catch (e) {
                console.warn('QR image fetch notice:', e);
            }
        }

        // Helper function for rounded rectangles
        const drawRoundedRect = (x, y, w, h, radius, fillStyle, strokeStyle, strokeWidth = 0) => {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();

            if (fillStyle) {
                ctx.fillStyle = fillStyle;
                ctx.fill();
            }
            if (strokeStyle && strokeWidth > 0) {
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = strokeWidth;
                ctx.stroke();
            }
        };

        // 1. Draw Outer Card Background
        const padding = 20;
        const cardX = padding;
        const cardY = padding;
        const cardW = width - padding * 2;
        const cardH = height - padding * 2;

        drawRoundedRect(cardX, cardY, cardW, cardH, 36, '#0B0C14', '#EB1000', 3);

        // 2. Draw Top Bar Header
        // Red dot
        ctx.beginPath();
        ctx.arc(55, 75, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#EB1000';
        ctx.fill();

        // Support Creator Name Text
        const headerName = creatorName || title || 'CREATOR';
        const nameText = `SUPPORT ${headerName.toUpperCase()}`;
        ctx.font = '900 20px "Outfit", "Inter", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Truncate nameText if too long to fit next to LIVE badge
        let maxTextWidth = 350;
        let displayTitle = nameText;
        if (ctx.measureText(displayTitle).width > maxTextWidth) {
            while (displayTitle.length > 5 && ctx.measureText(displayTitle + '...').width > maxTextWidth) {
                displayTitle = displayTitle.slice(0, -1);
            }
            displayTitle += '...';
        }
        ctx.fillText(displayTitle, 72, 75);

        // LIVE Badge
        const badgeW = 74;
        const badgeH = 30;
        const badgeX = cardX + cardW - 35 - badgeW;
        const badgeY = 60;
        drawRoundedRect(badgeX, badgeY, badgeW, badgeH, 10, '#EB1000', null, 0);

        ctx.font = '900 13px "Outfit", "Inter", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LIVE', badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);

        // Header Divider Line
        ctx.beginPath();
        ctx.moveTo(cardX + 25, 115);
        ctx.lineTo(cardX + cardW - 25, 115);
        ctx.strokeStyle = '#1E1F30';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Draw Center QR Code Frame
        const qrBoxSize = 380;
        const qrBoxX = (width - qrBoxSize) / 2;
        const qrBoxY = 145;

        // White background box with rounded corners and glowing border
        drawRoundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 36, '#FFFFFF', '#EB1000', 2);

        // Draw QR Image inside
        if (qrImgElement?.img) {
            const qrPadding = 20;
            ctx.drawImage(
                qrImgElement.img,
                qrBoxX + qrPadding,
                qrBoxY + qrPadding,
                qrBoxSize - qrPadding * 2,
                qrBoxSize - qrPadding * 2
            );
            if (qrImgElement.objectUrl) {
                URL.revokeObjectURL(qrImgElement.objectUrl);
            }
        }

        // Fetch AskMe Logo Image (/logo.png)
        let logoImgElement = null;
        try {
            const logoRes = await fetch('/logo.png');
            const logoBlob = await logoRes.blob();
            const logoObjectUrl = URL.createObjectURL(logoBlob);
            logoImgElement = await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve({ img, logoObjectUrl });
                img.onerror = () => resolve(null);
                img.src = logoObjectUrl;
            });
        } catch (e) {
            console.warn('AskMe logo image fetch notice:', e);
        }

        // Draw Center Logo Overlay Box inside QR Code
        const logoBoxSize = 44;
        const logoX = (width - logoBoxSize) / 2;
        const logoY = qrBoxY + (qrBoxSize - logoBoxSize) / 2;

        // White pill box with rounded corners and red border matching screenshot
        drawRoundedRect(logoX, logoY, logoBoxSize, logoBoxSize, 12, '#FFFFFF', '#EB1000', 2);

        // Draw AskMe Red Logo Image inside white pill
        if (logoImgElement?.img) {
            const logoPadding = 6;
            ctx.drawImage(
                logoImgElement.img,
                logoX + logoPadding,
                logoY + logoPadding,
                logoBoxSize - logoPadding * 2,
                logoBoxSize - logoPadding * 2
            );
            if (logoImgElement.logoObjectUrl) {
                URL.revokeObjectURL(logoImgElement.logoObjectUrl);
            }
        } else {
            // Fallback font icon if image unavailable
            ctx.font = '900 28px "Outfit", "Inter", sans-serif';
            ctx.fillStyle = '#EB1000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('A', width / 2, logoY + logoBoxSize / 2 + 1);
        }

        // 4. Draw Bottom Text Section
        // Heart + Scan & Send Message
        const bottomTextY = 575;
        ctx.font = '900 26px "Outfit", "Inter", sans-serif';
        ctx.fillStyle = '#00F5D4';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️  Scan & Send Message', width / 2, bottomTextY);

        // Subtext: Instant UPI • Paid Q&A On Screen
        ctx.font = '700 16px "Outfit", "Inter", sans-serif';
        ctx.fillStyle = '#8B8B96';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Instant UPI • Paid Q&A On Screen', width / 2, bottomTextY + 38);

        // 5. Trigger Browser Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename || `askme_live_qr_${sessionCode || 'card'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    } catch (err) {
        console.error('Error generating branded QR card:', err);
        return false;
    }
};
