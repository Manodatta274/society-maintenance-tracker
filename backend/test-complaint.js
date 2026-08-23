async function testComplaint() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'alice@society.com', password: 'Resident@123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;
        console.log("Logged in successfully.");

        const form = new FormData();
        form.append('category', 'Plumbing');
        form.append('description', 'Water leakage in the bathroom');

        const res = await fetch('http://localhost:5000/api/complaints', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: form
        });
        
        const data = await res.json();
        console.log("Complaint submission response:", JSON.stringify({ status: res.status, data }, null, 2));
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testComplaint();
