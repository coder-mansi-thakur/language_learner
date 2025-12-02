export const ENDPOINTS = {
  LANGUAGES: {
    GET_ALL: '/languages',
    GET_BY_CODE: (code) => `/languages/${code}`,
  },
  USERS: {
    GET_PROFILE: (uid) => `/users/${uid}`,
    START_LEARNING: (uid) => `/users/${uid}/languages`,
    SYNC: '/users/sync',
  },
  CATEGORIES: {
    BASE: '/categories',
  },
  VOCABULARY: {
    BASE: '/vocabulary',
    BULK_CREATE: '/vocabulary/bulk',
  },
  USER_VOCABULARY: {
    GET_BY_USER: (uid) => `/user-vocabulary/${uid}`,
    UPDATE_PROGRESS: (uid) => `/user-vocabulary/${uid}/progress`,
  },
  PING: '/ping',
};
