// Location Debug Test
// Add this to your ReportIssueModal temporarily to test location capture

import React, { useState } from 'react';
import { useGeolocation } from '../hooks';

const LocationDebugTest = () => {
    const { location, getCurrentPosition, loading, error } = useGeolocation();
    const [testResult, setTestResult] = useState(null);

    const testLocationCapture = async () => {
        console.log('🧪 Starting location test...');
        try {
            const position = await getCurrentPosition();
            console.log('✅ Location captured:', position);
            setTestResult(position);
        } catch (err) {
            console.error('❌ Location test failed:', err);
            setTestResult({ error: err.message });
        }
    };

    const testDatabaseInsert = async () => {
        if (!testResult || testResult.error) {
            alert('Please capture location first');
            return;
        }

        const testIssue = {
            title: 'Location Test Issue',
            description: 'Testing location capture and database insertion',
            category: 'roads',
            location: testResult,
            address: `Test Location: ${testResult.latitude}, ${testResult.longitude}`,
            photos: [],
            reporterName: 'Location Test',
            isAnonymous: true
        };

        console.log('🧪 Testing database insert with location:', testIssue);

        try {
            // You would call your database service here
            // const result = await databaseService.createIssue(testIssue);
            console.log('✅ Would insert:', testIssue);
            alert('Location test successful! Check console for details.');
        } catch (err) {
            console.error('❌ Database test failed:', err);
            alert('Database test failed: ' + err.message);
        }
    };

    return (
        <div style={{ 
            border: '2px solid #007bff', 
            padding: '20px', 
            margin: '20px', 
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
        }}>
            <h3>🧪 Location Debug Test</h3>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Current Location:</strong> {location ? 
                    `${location.latitude}, ${location.longitude}` : 
                    'Not captured'
                }
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Error:</strong> {error || 'None'}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Test Result:</strong> {testResult ? 
                    (testResult.error ? 
                        `Error: ${testResult.error}` : 
                        `Success: ${testResult.latitude}, ${testResult.longitude}`
                    ) : 
                    'Not tested'
                }
            </div>
            
            <button 
                onClick={testLocationCapture}
                disabled={loading}
                style={{ 
                    marginRight: '10px', 
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {loading ? 'Getting Location...' : 'Test Location Capture'}
            </button>
            
            <button 
                onClick={testDatabaseInsert}
                disabled={!testResult || testResult.error}
                style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Test Database Insert
            </button>
        </div>
    );
};

export default LocationDebugTest;
