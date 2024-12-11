import { useState, useEffect } from 'react';
import { Box, Autocomplete, TextField, CircularProgress } from '@mui/material';
import { AirtableIntegration } from './integrations/airtable';
import { NotionIntegration } from './integrations/notion';
import { HubSpotIntegration } from './integrations/hubspot';  // Ensure this path is correct
import { DataForm } from './data-form';

const integrationMapping = {
    'Notion': NotionIntegration,
    'Airtable': AirtableIntegration,
    'HubSpot': HubSpotIntegration,  // Added HubSpot to the mapping
};

export const IntegrationForm = () => {
    const [integrationParams, setIntegrationParams] = useState({});
    const [user, setUser] = useState('TestUser');
    const [org, setOrg] = useState('TestOrg');
    const [currType, setCurrType] = useState(null);
    const CurrIntegration = currType ? integrationMapping[currType] : null;

    useEffect(() => {
        if (currType) {
            setIntegrationParams({});
        }
    }, [currType]);

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' sx={{ width: '100%' }}>
            <Box display='flex' flexDirection='column'>
                <TextField
                    label="User"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    sx={{ mt: 2 }}
                />
                <TextField
                    label="Organization"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    sx={{ mt: 2 }}
                />
                <Autocomplete
                    id="integration-type"
                    options={Object.keys(integrationMapping)}
                    sx={{ width: 300, mt: 2 }}
                    renderInput={(params) => <TextField {...params} label="Integration Type" />}
                    onChange={(e, value) => {
                        setCurrType(value);
                    }}
                />
            </Box>

            {currType && (
                <Box sx={{ mt: 2 }}>
                    {CurrIntegration ? (
                        <CurrIntegration 
                            user={user} 
                            org={org} 
                            integrationParams={integrationParams} 
                            setIntegrationParams={setIntegrationParams} 
                        />
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <CircularProgress size={24} />
                        </Box>
                    )}
                </Box>
            )}

            {integrationParams?.credentials && (
                <Box sx={{ mt: 2 }}>
                    <DataForm 
                        integrationType={integrationParams?.type} 
                        credentials={integrationParams?.credentials} 
                    />
                </Box>
            )}
        </Box>
    );
};
