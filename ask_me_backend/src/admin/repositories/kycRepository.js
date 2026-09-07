const { KycVerification, KycDocument, Creator, CreatorProfile, CreatorBankAccount } = require('../../models');
const { Op } = require('sequelize');

class KycRepository {
  async findAndCountAllKyc({ where = {}, limit = 10, offset = 0, order = [['id', 'DESC']] }) {
    return await KycVerification.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'full_name', 'email', 'mobile', 'username', 'country', 'profile_image'],
          required: false,
          include: [
            { model: CreatorProfile, as: 'profile', required: false },
            { model: CreatorBankAccount, as: 'bankAccounts', required: false },
          ],
        },
        {
          model: KycDocument,
          as: 'documents',
          required: false,
        },
      ],
      distinct: true,
    });
  }

  async findByCreatorId(creatorId, { transaction, lock } = {}) {
    const isNum = !isNaN(creatorId) && Number.isInteger(Number(creatorId));
    const whereConditions = isNum
      ? { [Op.or]: [{ creator_id: Number(creatorId) }, { id: Number(creatorId) }] }
      : { creator_id: creatorId };

    // PostgreSQL does NOT allow FOR UPDATE (lock) on queries containing outer joins (include required: false)
    if (lock) {
      const kycRecord = await KycVerification.findOne({
        where: whereConditions,
        transaction,
        lock,
      });

      if (kycRecord) {
        const documents = await KycDocument.findAll({
          where: { kyc_id: kycRecord.id },
          transaction,
        });
        kycRecord.setDataValue('documents', documents);
      }

      return kycRecord;
    }

    return await KycVerification.findOne({
      where: whereConditions,
      include: [{ model: KycDocument, as: 'documents', required: false }],
      transaction,
    });
  }

  async updateKycStatus(creatorId, updateData, { transaction } = {}) {
    const isNum = !isNaN(creatorId) && Number.isInteger(Number(creatorId));
    const whereClause = isNum
      ? { [Op.or]: [{ creator_id: Number(creatorId) }, { id: Number(creatorId) }] }
      : { creator_id: creatorId };

    return await KycVerification.update(updateData, {
      where: whereClause,
      transaction,
    });
  }

  async updateDocumentsStatus(kycId, updateData, { transaction } = {}) {
    return await KycDocument.update(updateData, {
      where: { kyc_id: kycId },
      transaction,
    });
  }

  async updateProfileKyc(creatorId, updateData, { transaction } = {}) {
    return await CreatorProfile.update(updateData, {
      where: { creator_id: creatorId },
      transaction,
    });
  }

  async updateBankAccountStatus(creatorId, updateData, { transaction } = {}) {
    return await CreatorBankAccount.update(updateData, {
      where: { creator_id: creatorId },
      transaction,
    });
  }

  async countPending() {
    return await KycVerification.count({ where: { status: 'pending' } });
  }
}

module.exports = new KycRepository();
