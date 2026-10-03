/**
 * Utility to generate and download the exact branded Live QR Code image
 * matching the SessionQRCode style.
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

        const qrSize = 520;
        const qrCodeInstance = new QRCodeStyling({
            width: qrSize,
            height: qrSize,
            type: 'canvas',
            data: targetData,
            image: '/logo.png',
            qrOptions: {
                errorCorrectionLevel: 'H',
            },
            dotsOptions: {
                type: 'rounded',
                color: '#ff5555',
            },
            cornersSquareOptions: {
                type: 'extra-rounded',
                color: '#ff5555',
            },
            cornersDotOptions: {
                type: 'square',
                color: '#ffffff',
            },
            backgroundOptions: {
                color: '#000000',
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                hideBackgroundDots: true,
                imageSize: 0.27,
                margin: 0,
            },
        });

        // 3. Render QR to temporary hidden div
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);
        qrCodeInstance.append(tempDiv);

        // Wait for canvas rendering and logo image load
        await new Promise((r) => setTimeout(r, 400));
        const renderedCanvas = tempDiv.querySelector('canvas');

        // 4. Create master canvas (600 x 660)
        const canvas = document.createElement('canvas');
        const width = 600;
        const height = 660;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fill Solid Black Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw High-Res QR Canvas in center
        if (renderedCanvas) {
            const marginX = (width - qrSize) / 2;
            const marginY = 25;
            ctx.drawImage(renderedCanvas, marginX, marginY, qrSize, qrSize);
        }

        // Clean up tempDiv
        if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
        }

        // 5. Draw Bottom Branding Text ("Ask-me.live")
        const textY = 595;
        ctx.font = '800 38px Arial, Helvetica, sans-serif';
        ctx.textBaseline = 'middle';

        // Measure text parts to center horizontally
        const part1 = 'Ask-me';
        const part2 = '.live';
        const part1Width = ctx.measureText(part1).width;
        const part2Width = ctx.measureText(part2).width;
        const totalWidth = part1Width + part2Width;

        const startX = (width - totalWidth) / 2;

        // Draw "Ask-me" in White
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText(part1, startX, textY);

        // Draw ".live" in Red (#FF3B3B)
        ctx.fillStyle = '#FF3B3B';
        ctx.fillText(part2, startX + part1Width, textY);

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
