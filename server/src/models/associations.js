import User from './User.js';
import Language from './Language.js';
import UserLanguage from './UserLanguage.js';
import Category from './Category.js';
import Vocabulary from './Vocabulary.js';
import UserVocabulary from './UserVocabulary.js';

// Define associations
User.belongsToMany(Language, { through: UserLanguage, foreignKey: 'userId' });
Language.belongsToMany(User, { through: UserLanguage, foreignKey: 'languageId' });

User.hasMany(UserLanguage, { foreignKey: 'userId' });
UserLanguage.belongsTo(User, { foreignKey: 'userId' });

Language.hasMany(UserLanguage, { foreignKey: 'languageId' });
UserLanguage.belongsTo(Language, { foreignKey: 'languageId' });

// Vocabulary Associations
Language.hasMany(Vocabulary, { foreignKey: 'languageId' });
Vocabulary.belongsTo(Language, { foreignKey: 'languageId' });

Category.hasMany(Vocabulary, { foreignKey: 'categoryId' });
Vocabulary.belongsTo(Category, { foreignKey: 'categoryId' });

// User Vocabulary Progress
User.belongsToMany(Vocabulary, { through: UserVocabulary, foreignKey: 'userId' });
Vocabulary.belongsToMany(User, { through: UserVocabulary, foreignKey: 'vocabularyId' });

User.hasMany(UserVocabulary, { foreignKey: 'userId' });
UserVocabulary.belongsTo(User, { foreignKey: 'userId' });

Vocabulary.hasMany(UserVocabulary, { foreignKey: 'vocabularyId' });
UserVocabulary.belongsTo(Vocabulary, { foreignKey: 'vocabularyId' });

export { User, Language, UserLanguage, Category, Vocabulary, UserVocabulary };
