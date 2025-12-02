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
    UPDATE: (vid) => `/vocabulary/${vid}`,
    DELETE: (vid) => `/vocabulary/${vid}`,
  },
  USER_VOCABULARY: {
    GET_BY_USER: (uid) => `/user-vocabulary/${uid}`,
    UPDATE_PROGRESS: (uid) => `/user-vocabulary/${uid}/progress`,
  },
  SENTENCES: {
    BASE: (uid) => `/sentences/${uid}`,
    GENERATE: (uid) => `/sentences/${uid}/generate`,
    UPDATE_PROGRESS: (uid) => `/sentences/${uid}/progress`,
  },
  PING: '/ping',
};

