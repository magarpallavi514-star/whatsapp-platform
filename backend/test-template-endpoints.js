#!/usr/bin/env node

/**
 * Test: Check if Template Endpoints Exist
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const testTemplateEndpoints = async () => {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const apiKey = process.env.INTEGRATION_API_KEY || 'test-api-key';

    console.log('🧪 Testing Template Endpoints\n');
    console.log('=' .repeat(60));
    
    const endpoints = [
      { method: 'GET', path: '/api/integrations/templates', desc: 'Fetch all templates' },
      { method: 'POST', path: '/api/integrations/templates/send', desc: 'Send template message' }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n${endpoint.method} ${endpoint.path}`);
      console.log(`Description: ${endpoint.desc}`);
      
      const url = `${baseUrl}${endpoint.path}`;
      
      try {
        const response = await fetch(url, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`Status: ${response.status}`);
        
        if (response.status === 404) {
          console.log(`❌ Endpoint NOT FOUND - Needs to be created`);
        } else if (response.status === 400 || response.status === 200) {
          console.log(`✅ Endpoint EXISTS`);
        } else {
          console.log(`⚠️  Unexpected status`);
        }
      } catch (error) {
        console.log(`❌ Connection error: ${error.message}`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('\n📋 Summary:');
    console.log('If endpoints are NOT FOUND (404), follow these steps:\n');
    console.log('1. Add 5 functions to backend/src/controllers/integrationsController.js');
    console.log('2. Add 5 routes to backend/src/routes/integrationsRoutes.js');
    console.log('3. See TEMPLATES-BRIEF.md for copy-paste code');
    console.log('4. Restart the backend server');
    console.log('5. Run this test again');

  } catch (error) {
    console.error('Test Error:', error.message);
  }
};

testTemplateEndpoints();
