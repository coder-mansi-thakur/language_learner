import User from './User.js';
import Language from './Language.js';
import UserLanguage from './UserLanguage.js';
import Category from './Category.js';
import Vocabulary from './Vocabulary.js';
import UserVocabulary from './UserVocabulary.js';
import Habit from './Habit.js';
import HabitLog from './HabitLog.js';
import Sentence from './Sentence.js';

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

// User Created Vocabulary
User.hasMany(Vocabulary, { foreignKey: 'createdBy', as: 'createdVocabulary' });
Vocabulary.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User Vocabulary Progress
User.belongsToMany(Vocabulary, { through: UserVocabulary, foreignKey: 'userId' });
Vocabulary.belongsToMany(User, { through: UserVocabulary, foreignKey: 'vocabularyId' });

User.hasMany(UserVocabulary, { foreignKey: 'userId' });
UserVocabulary.belongsTo(User, { foreignKey: 'userId' });

Vocabulary.hasMany(UserVocabulary, { foreignKey: 'vocabularyId' });
UserVocabulary.belongsTo(Vocabulary, { foreignKey: 'vocabularyId' });

// Habit Associations
User.hasMany(Habit, { foreignKey: 'userId' });
Habit.belongsTo(User, { foreignKey: 'userId' });

Habit.hasMany(HabitLog, { foreignKey: 'habitId' });
HabitLog.belongsTo(Habit, { foreignKey: 'habitId' });

// Sentence Associations
User.hasMany(Sentence, { foreignKey: 'userId' });
Sentence.belongsTo(User, { foreignKey: 'userId' });

Language.hasMany(Sentence, { foreignKey: 'languageId' });
Sentence.belongsTo(Language, { foreignKey: 'languageId' });

export { User, Language, UserLanguage, Category, Vocabulary, UserVocabulary, Habit, HabitLog, Sentence };

