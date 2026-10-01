/**
 * Utility to generate and download the exact branded Live QR Code image.
 */
export const downloadBrandedQrCard = async ({
    qrUrl,
    paymentLink,
    creatorName = 'CREATOR',
    title = 'LIVE BROADCAST',
    sessionCode = 'askme',
    filename = 'askme_live_qr.png',
}) => {
    try {
        // 1. Determine pure payment link data
        let targetData = paymentLink || qrUrl || 'https://askme.live';
        if (typeof targetData === 'string' && targetData.includes('data=')) {
            try {
                const urlObj = new URL(targetData.includes('://') ? targetData : `https://${targetData}`);
                const extracted = urlObj.searchParams.get('data');
                if (extracted) targetData = decodeURIComponent(extracted);
            } catch (e) {
                // keep targetData fallback
            }
        }

        // 2. Dynamic import qr-code-styling
        const { default: QRCodeStyling } = await import('qr-code-styling');

        const qrSize = 600;
        const qrCodeInstance = new QRCodeStyling({
            width: qrSize,
            height: qrSize,
            type: 'canvas',
            data: targetData,
            margin: 1,
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: 'H',
            },
            dotsOptions: {
                color: '#000000',
                type: 'square',
            },
            backgroundOptions: {
                color: '#FFFFFF',
            },
            cornersSquareOptions: {
                color: '#000000',
                type: 'extra-rounded',
            },
            cornersDotOptions: {
                color: '#EB1000',
                type: 'extra-rounded',
            },
        });

        // 3. Render QR to temporary hidden canvas
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);
        qrCodeInstance.append(tempDiv);

        await new Promise((r) => setTimeout(r, 150));
        const renderedCanvas = tempDiv.querySelector('canvas');

        // 4. Create master canvas (680 x 680)
        const canvas = document.createElement('canvas');
        const width = 680;
        const height = 680;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Helper for rounded rect
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

        // Draw Outer Card Frame (White Card with Red Border)
        drawRoundedRect(10, 10, width - 20, height - 20, 48, '#FFFFFF', '#EB1000', 4);

        // Draw QR Canvas in center
        if (renderedCanvas) {
            const marginX = (width - 600) / 2;
            const marginY = (height - 600) / 2;
            ctx.drawImage(renderedCanvas, marginX, marginY, 600, 600);
        }

        // Clean up tempDiv
        if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
        }

        // 5. Draw Center Black Badge with Red Outline + Flame Logo + AskMe Text
        const badgeSize = 130;
        const badgeX = (width - badgeSize) / 2;
        const badgeY = (height - badgeSize) / 2;

        drawRoundedRect(badgeX, badgeY, badgeSize, badgeSize, 24, '#000000', '#EB1000', 3.5);

        // Load Flame Logo Image
        try {
            const flameImg = await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = '/flame-logo.png';
            });

            if (flameImg) {
                const imgW = 60;
                const imgH = 60;
                const imgX = badgeX + (badgeSize - imgW) / 2;
                const imgY = badgeY + 14;
                ctx.drawImage(flameImg, imgX, imgY, imgW, imgH);
            }
        } catch (e) {
            console.warn('Flame logo image notice:', e);
        }

        // Draw "AskMe" Text inside badge
        ctx.font = '900 20px "Outfit", "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const textY = badgeY + 82;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Ask', badgeX + badgeSize / 2 - 14, textY);

        ctx.fillStyle = '#EB1000';
        ctx.fillText('Me', badgeX + badgeSize / 2 + 14, textY);

        // 6. Trigger Browser Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename || `askme_live_qr_${sessionCode || 'code'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    } catch (err) {
        console.error('Error generating branded QR card:', err);
        return false;
    }
};
