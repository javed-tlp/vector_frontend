import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

export const HubSpotIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState([]); 

    const handleConnectClick = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/authorize`, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'HubSpot Authorization', 'width=600, height=600');

            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) {
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 200);
        } catch (e) {
            setIsLoading(false);
            alert('An error occurred during authorization.');
        }
    };

    const handleWindowClosed = async () => {
        try {
            console.log("OAuth window closed. Starting credential retrieval...");
    
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
    
            console.log("Sending request to retrieve credentials...");
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/credentials`, formData);
    
            console.log("Received response from credentials endpoint:", response.data);
            const credentials = response.data;
    
            if (credentials) {
                console.log("Credentials retrieved successfully:", credentials);
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type: 'HubSpot' }));
                console.log("Fetching HubSpot items...");
                await loadHubSpotItems(credentials);
            } else {
                console.warn("No credentials found in the response.");
            }
    
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            if (e.response) {
                console.error("Error response:", e.response.status, e.response.data);
            } else if (e.request) {
                console.error("Error request:", e.request);
            } else {
                console.error("Error message:", e.message);
            }
            alert('An error occurred while retrieving credentials.');
        }
    };
    


    const loadHubSpotItems = async (credentials) => {
        try {
            const response = await axios.post(`http://localhost:8000/integrations/hubspot/get_hubspot_items`, {
                credentials: credentials
            });
            setItems(response.data); 
        } catch (e) {
            alert('Error loading HubSpot items.');
        }
    };

    useEffect(() => {
        setIsConnected(integrationParams?.credentials ? true : false);
    }, [integrationParams]);

    return (
        <Box sx={{ mt: 2 }}>
          
            <Button
                onClick={isConnected ? () => {} : handleConnectClick} 
                disabled={isLoading}
            >
                {isConnected ? 'HubSpot Connected' : isLoading ? <CircularProgress size={20} /> : 'Connect to HubSpot'}
            </Button>

            
            {items.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <h3>HubSpot Items:</h3>
                    <ul>
                        {items.map((item) => (
                            <li key={item.id}>{item.name}</li>  
                        ))}
                    </ul>
                </Box>
            )}
        </Box>
    );
};
