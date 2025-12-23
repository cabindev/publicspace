
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://latplvqjbpclasvvtpeu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHBsdnFqYnBjbGFzdnZ0cGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTM0MjcsImV4cCI6MjA4MTY4OTQyN30.Vg11JNWrQt8Q3vMY7oM3Y8iRAJv7AWc4bgkU3Jv7j-A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReports() {
    console.log('Checking reports...');
    const { data, error } = await supabase
        .from('reports')
        .select('id, title, status, created_at');

    if (error) {
        console.error('Error fetching reports:', error.message);
        return;
    }

    console.log(`Total reports found: ${data.length}`);
    const statusCounts = data.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
    }, {});

    console.log('Status distribution:', statusCounts);

    if (data.length > 0) {
        console.log('Sample reports:', data.slice(0, 3));
    }
}

checkReports();
