import { DataTypes, Model } from "sequelize";
import { default_prefix } from "../../../config.json";
import sequelize from "..";

class Guilds extends Model {
  static associate() {}
}

Guilds.init(
  {
    guild_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    prefix: {
      type: DataTypes.STRING,
      defaultValue: default_prefix,
    },
  },
  {
    paranoid: true,
    timestamps: true,
    sequelize: sequelize,
    modelName: "Guilds",
  }
);

export default Guilds;
