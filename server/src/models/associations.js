import User from './User.js';
import Language from './Language.js';
import UserLanguage from './UserLanguage.js';

// Define associations
User.belongsToMany(Language, { through: UserLanguage, foreignKey: 'userId' });
Language.belongsToMany(User, { through: UserLanguage, foreignKey: 'languageId' });

User.hasMany(UserLanguage, { foreignKey: 'userId' });
UserLanguage.belongsTo(User, { foreignKey: 'userId' });

Language.hasMany(UserLanguage, { foreignKey: 'languageId' });
UserLanguage.belongsTo(Language, { foreignKey: 'languageId' });

export { User, Language, UserLanguage };
