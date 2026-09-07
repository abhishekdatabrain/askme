const donationSessionRepository = require('../repositories/donationSessionRepository');
const { generateQrDataUrl } = require('../../utils/qrCode');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { NotFoundError } = require('../../errors/AppError');
const env = require('../../config/env');

class LiveSessionAdminService {
  async getLiveSessions(query) {
    const { page, limit, offset } = parsePagination(query);
    const { status, filter } = query;
    const targetStatus = (status || filter || '').toLowerCase().trim();

    const where = {};
    if (targetStatus && targetStatus !== 'all') {
      if (targetStatus === 'suspended') where.status = 'disabled';
      else if (targetStatus === 'active') where.status = 'active';
      else if (targetStatus === 'closed') where.status = 'closed';
    }

    const { count, rows } = await donationSessionRepository.findAndCountAllSessions({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const sessions = await Promise.all(
      rows.map(async (s) => {
        const creator = s.creator || {};
        const durationMinutes = s.started_at
          ? Math.max(1, Math.floor((new Date() - new Date(s.started_at)) / (1000 * 60)))
          : 0;
        const durationFormatted = s.status === 'active'
          ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
          : 'Ended';

        const computedQrStatus = s.status === 'disabled' || s.status === 'suspended'
          ? 'Suspended'
          : (s.status === 'active' ? 'Active' : 'Closed');

        const cleanUsername = String(creator.username || creator.full_name || 'creator').toLowerCase().replace(/^@+|\s+/g, '');
        const paymentLink = `${env.FRONTEND_URL}/pay/${s.session_code || s.id}`;
        const overlayUrl = `${env.FRONTEND_URL}/overlay/${cleanUsername}`;

        const qrImageUrl = await generateQrDataUrl(paymentLink);

        return {
          id: `SESS-${s.id}`,
          rawId: s.id,
          creator: creator.full_name || `Creator #${s.creator_id}`,
          handle: `@${cleanUsername}`,
          category: s.category || s.title || 'Live Stream',
          duration: durationFormatted,
          viewers: 0,
          totalDonations: parseFloat(s.total_amount || 0),
          questionsCount: s.total_donations || 0,
          qrStatus: computedQrStatus,
          platform: 'youtube',
          streamUrl: paymentLink,
          overlayUrl: overlayUrl,
          qrImageUrl: qrImageUrl,
          isSuspicious: computedQrStatus === 'Suspended',
          sessionStatus: computedQrStatus,
        };
      })
    );

    const pagination = buildPaginationMeta(count, page, limit);

    return {
      sessions,
      pagination,
      total: sessions.length,
      totalCount: count,
    };
  }

  async disableLiveSession(id) {
    const session = await donationSessionRepository.findById(id);
    if (!session) {
      throw new NotFoundError('Live session not found');
    }

    const newStatus = session.status === 'disabled' || session.status === 'suspended' ? 'active' : 'disabled';
    await session.update({ status: newStatus });

    return {
      id,
      qrStatus: newStatus === 'disabled' ? 'Suspended' : 'Active',
    };
  }
}

module.exports = new LiveSessionAdminService();
