// Mock data service for CivicTrack
import { ISSUE_CATEGORIES, ISSUE_STATUS } from '../constants';
import { generateId } from '../utils';

// Sample issues for demonstration
export const sampleIssues = [{
        id: generateId(),
        title: "Large pothole on Main Street",
        description: "Deep pothole causing vehicle damage near the intersection of Main St and Oak Ave. Several cars have been damaged this week.",
        category: ISSUE_CATEGORIES.ROADS,
        status: ISSUE_STATUS.REPORTED,
        location: { lat: 28.6129, lng: 77.2295 },
        address: "Main Street, Near Oak Avenue",
        photos: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
        ],
        reporterName: "Anonymous",
        isAnonymous: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        statusHistory: [{
            status: ISSUE_STATUS.REPORTED,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            note: "Issue reported by citizen"
        }],
        flags: [],
        flagCount: 0,
        comments: []
    },
    {
        id: generateId(),
        title: "Street light not working",
        description: "Street light has been out for over a week on Elm Street. Very dark at night and unsafe for pedestrians.",
        category: ISSUE_CATEGORIES.LIGHTING,
        status: ISSUE_STATUS.IN_PROGRESS,
        location: { lat: 28.6140, lng: 77.2070 },
        address: "Elm Street, Block 15",
        photos: [
            "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400"
        ],
        reporterName: "John Smith",
        isAnonymous: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        statusHistory: [{
                status: ISSUE_STATUS.REPORTED,
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                note: "Issue reported by citizen"
            },
            {
                status: ISSUE_STATUS.IN_PROGRESS,
                timestamp: new Date(Date.now() - 43200000).toISOString(),
                note: "Work order assigned to maintenance team"
            }
        ],
        flags: [],
        flagCount: 0,
        comments: [{
            id: generateId(),
            author: "City Official",
            text: "Work order has been created. Expected completion in 2-3 business days.",
            timestamp: new Date(Date.now() - 43200000).toISOString()
        }]
    },
    {
        id: generateId(),
        title: "Water leak in park",
        description: "Continuous water leak near the playground area. Water is pooling and creating muddy conditions.",
        category: ISSUE_CATEGORIES.WATER_SUPPLY,
        status: ISSUE_STATUS.RESOLVED,
        location: { lat: 28.6159, lng: 77.2010 },
        address: "Central Park, Playground Area",
        photos: [],
        reporterName: "Sarah Johnson",
        isAnonymous: false,
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        statusHistory: [{
                status: ISSUE_STATUS.REPORTED,
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                note: "Issue reported by citizen"
            },
            {
                status: ISSUE_STATUS.IN_PROGRESS,
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                note: "Plumbing team dispatched"
            },
            {
                status: ISSUE_STATUS.RESOLVED,
                timestamp: new Date(Date.now() - 21600000).toISOString(),
                note: "Leak repaired and area cleaned"
            }
        ],
        flags: [],
        flagCount: 0,
        comments: [{
            id: generateId(),
            author: "City Official",
            text: "Issue has been resolved. Thank you for reporting!",
            timestamp: new Date(Date.now() - 21600000).toISOString()
        }]
    },
    {
        id: generateId(),
        title: "Overflowing garbage bin",
        description: "Garbage bin near bus stop is overflowing. Waste is scattered around the area attracting pests.",
        category: ISSUE_CATEGORIES.CLEANLINESS,
        status: ISSUE_STATUS.REPORTED,
        location: { lat: 28.6100, lng: 77.2150 },
        address: "Bus Stop, Pine Street",
        photos: [
            "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400"
        ],
        reporterName: "Anonymous",
        isAnonymous: true,
        createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
        statusHistory: [{
            status: ISSUE_STATUS.REPORTED,
            timestamp: new Date(Date.now() - 43200000).toISOString(),
            note: "Issue reported by citizen"
        }],
        flags: [],
        flagCount: 0,
        comments: []
    },
    {
        id: generateId(),
        title: "Open manhole cover",
        description: "Dangerous open manhole without any warning signs. Poses serious safety risk to pedestrians and vehicles.",
        category: ISSUE_CATEGORIES.PUBLIC_SAFETY,
        status: ISSUE_STATUS.IN_PROGRESS,
        location: { lat: 28.6180, lng: 77.2250 },
        address: "Market Road, Near Shopping Complex",
        photos: [
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400"
        ],
        reporterName: "Mike Wilson",
        isAnonymous: false,
        createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        updatedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        statusHistory: [{
                status: ISSUE_STATUS.REPORTED,
                timestamp: new Date(Date.now() - 21600000).toISOString(),
                note: "Urgent safety issue reported"
            },
            {
                status: ISSUE_STATUS.IN_PROGRESS,
                timestamp: new Date(Date.now() - 10800000).toISOString(),
                note: "Emergency team dispatched immediately"
            }
        ],
        flags: [],
        flagCount: 0,
        comments: [{
            id: generateId(),
            author: "Emergency Response Team",
            text: "Team is on site. Temporary barriers have been placed. Permanent fix in progress.",
            timestamp: new Date(Date.now() - 10800000).toISOString()
        }]
    }
];

// Mock API functions
export const mockAPI = {
    // Get all issues
    getIssues: () => {
        return Promise.resolve(sampleIssues);
    },

    // Get issue by ID
    getIssue: (id) => {
        const issue = sampleIssues.find(issue => issue.id === id);
        return Promise.resolve(issue);
    },

    // Create new issue
    createIssue: (issueData) => {
        const newIssue = {
            ...issueData,
            id: generateId(),
            status: ISSUE_STATUS.REPORTED,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            statusHistory: [{
                status: ISSUE_STATUS.REPORTED,
                timestamp: new Date().toISOString(),
                note: 'Issue reported'
            }],
            flags: [],
            flagCount: 0,
            comments: []
        };

        sampleIssues.unshift(newIssue);
        return Promise.resolve(newIssue);
    },

    // Update issue
    updateIssue: (id, updates) => {
        const index = sampleIssues.findIndex(issue => issue.id === id);
        if (index !== -1) {
            sampleIssues[index] = {
                ...sampleIssues[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            return Promise.resolve(sampleIssues[index]);
        }
        return Promise.reject(new Error('Issue not found'));
    },

    // Delete issue
    deleteIssue: (id) => {
        const index = sampleIssues.findIndex(issue => issue.id === id);
        if (index !== -1) {
            const deleted = sampleIssues.splice(index, 1)[0];
            return Promise.resolve(deleted);
        }
        return Promise.reject(new Error('Issue not found'));
    },

    // Flag issue
    flagIssue: (id, flag) => {
        const issue = sampleIssues.find(issue => issue.id === id);
        if (issue) {
            issue.flags.push(flag);
            issue.flagCount = issue.flags.length;
            issue.updatedAt = new Date().toISOString();
            return Promise.resolve(issue);
        }
        return Promise.reject(new Error('Issue not found'));
    }
};

// Initialize sample data in the app context
export const initializeSampleData = (actions) => {
    actions.setIssues(sampleIssues);
};