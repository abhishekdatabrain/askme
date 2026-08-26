const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const KycDocument = sequelize.define(
  "kyc_documents",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    kyc_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    document_type: {
      type: DataTypes.ENUM(
        "government_id",
        "pan_card",
        "passport",
        "driving_license",
        "address_proof",
        "other"
      ),
      allowNull: false,
    },

    document_number: {
      type: DataTypes.STRING(100),
    },

    file_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    verification_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },

    rejection_reason: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "kyc_documents",
    timestamps: true,
    underscored: true,
  }
);

KycDocument.sync({ alter: true }).catch((err) => {
    console.warn('KycDocumentModel sync alter notice:', err.message);
});

module.exports = KycDocument;