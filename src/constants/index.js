// Application constants for CivicTrack

export const ISSUE_CATEGORIES = {
    ROADS: 'roads',
    LIGHTING: 'lighting',
    WATER_SUPPLY: 'water_supply',
    CLEANLINESS: 'cleanliness',
    PUBLIC_SAFETY: 'public_safety',
    OBSTRUCTIONS: 'obstructions'
};

export const ISSUE_CATEGORY_LABELS = {
    [ISSUE_CATEGORIES.ROADS]: 'Roads (potholes, obstructions)',
    [ISSUE_CATEGORIES.LIGHTING]: 'Lighting (broken or flickering lights)',
    [ISSUE_CATEGORIES.WATER_SUPPLY]: 'Water Supply (leaks, low pressure)',
    [ISSUE_CATEGORIES.CLEANLINESS]: 'Cleanliness (overflowing bins, garbage)',
    [ISSUE_CATEGORIES.PUBLIC_SAFETY]: 'Public Safety (open manholes, exposed wiring)',
    [ISSUE_CATEGORIES.OBSTRUCTIONS]: 'Obstructions (fallen trees, debris)'
};

export const ISSUE_STATUS = {
    REPORTED: 'reported',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
};

export const ISSUE_STATUS_LABELS = {
    [ISSUE_STATUS.REPORTED]: 'Reported',
    [ISSUE_STATUS.IN_PROGRESS]: 'In Progress',
    [ISSUE_STATUS.RESOLVED]: 'Resolved',
    [ISSUE_STATUS.REJECTED]: 'Rejected'
};

export const DISTANCE_FILTERS = {
    ONE_KM: 1,
    THREE_KM: 3,
    FIVE_KM: 5
};

export const MAX_PHOTOS_PER_REPORT = 3;

export const DEFAULT_MAP_CENTER = [28.6139, 77.2090]; // Delhi coordinates as default
export const DEFAULT_MAP_ZOOM = 13;
export const VISIBILITY_RADIUS_KM = 5;

export const USER_ROLES = {
    CITIZEN: 'citizen',
    ADMIN: 'admin'
};

export const REPORT_FLAGS = {
    SPAM: 'spam',
    INAPPROPRIATE: 'inappropriate',
    FAKE: 'fake'
};

export const AUTO_HIDE_THRESHOLD = 3; // Number of flags before auto-hiding