const axios = require('axios');
const image = require('./')

// Convert Google Drive view links to direct download links
const convertGoogleDriveLink = (viewLink) => {
    const fileIdMatch = viewLink.match(/\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    }
    return viewLink;
};

const API_URL = 'http://localhost:5001/api';

// Staff members data
const staffMembers = [
    {
        name: 'Shikekar Chandra Agarwal',
        position: 'Director',
        image: '/assets/director.jpeg'
    },
    {
        name: 'Aninda Kumar Das',
        position: 'Principal',
        image: '/assets/principal.jpeg'
    },
    {
        name: 'Arjun Kumar Mandal',
        position: 'Vice Principal',
        image: '/assets/vice_principal.jpeg'
    },
];

async function loginAndGetToken() {
    try {
        console.log('🔐 Logging in as admin...');
        const response = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });

        if (response.data.success) {
            console.log('✅ Login successful!');
            return response.data.token;
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        console.error('❌ Login error:', error.response?.data || error.message);
        throw error;
    }
}

async function clearExistingStaff(token) {
    try {
        console.log('\n🗑️  Fetching existing staff...');
        const response = await axios.get(`${API_URL}/staff`);

        if (response.data.success && response.data.data.length > 0) {
            console.log(`Found ${response.data.data.length} existing staff members. Deleting...`);

            for (const staff of response.data.data) {
                try {
                    await axios.delete(`${API_URL}/staff/${staff._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`   ✓ Deleted: ${staff.name}`);
                } catch (err) {
                    console.log(`   ✗ Failed to delete: ${staff.name}`);
                }
            }
            console.log('✅ Cleared all existing staff');
        } else {
            console.log('No existing staff to clear');
        }
    } catch (error) {
        console.error('⚠️  Error clearing staff:', error.response?.data || error.message);
    }
}

async function addStaffMembers(token) {
    console.log('\n📝 Adding new staff members...\n');

    for (const staff of staffMembers) {
        try {
            const response = await axios.post(`${API_URL}/staff`, staff, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                console.log(`✅ Added: ${staff.name} (${staff.position})`);
            }
        } catch (error) {
            console.error(`❌ Failed to add ${staff.name}:`, error.response?.data || error.message);
        }
    }
}

async function main() {
    console.log('🚀 Starting staff data update...\n');

    try {
        // 1. Login and get token
        const token = await loginAndGetToken();

        // 2. Clear existing staff
        await clearExistingStaff(token);

        // 3. Add new staff members
        await addStaffMembers(token);

        console.log('\n✅ Staff data update completed successfully!');
        console.log('\n📸 Image URLs:');
        staffMembers.forEach(staff => {
            console.log(`   ${staff.name}: ${staff.image}`);
        });

    } catch (error) {
        console.error('\n❌ Script failed:', error.message);
        process.exit(1);
    }
}

main();
