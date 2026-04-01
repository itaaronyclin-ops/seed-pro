async function callAPI(action, args = []) {
    const API_URL = 'https://script.google.com/macros/s/AKfycbz4kiWGCG96zZHAJgc-wOAaCxOkS7WXf5IriAEKk0StXYFNVlME7x2SjaSva3Rp8obX/exec';
    
    // First, let's try the GET method used by the workshop client
    const url = `${API_URL}?action=${action}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("GET Method Success:", data);
        return data;
    } catch (e) {
        console.error('GET Method Error:', e);
    }
}
callAPI('getWorkshopState');
