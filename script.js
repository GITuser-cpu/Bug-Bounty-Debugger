const analyzeBtn = document.getElementById('analyze-btn');
const codeInput = document.getElementById('code-input');
const resultsDiv = document.getElementById('results');

// WebSocket connection
const socket = new WebSocket(`ws://${window.location.host}`);

socket.onopen = () => {
    console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
    const { requestId, analysis, error } = JSON.parse(event.data);
    if (error) {
        resultsDiv.innerHTML += `<div class="error">Error: ${error}</div>`;
    } else {
        resultsDiv.innerHTML += `<div class="success">Analysis Result: ${JSON.stringify(analysis)}</div>`;
    }
};

analyzeBtn.addEventListener('click', () => {
    const code = codeInput.value;
    const requestId = Date.now(); // Unique request ID

    socket.send(JSON.stringify({ code, requestId }));
});
