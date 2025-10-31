document.addEventListener('DOMContentLoaded', () => {
    const quotes = [
        "“Because every river deserves to shine.”",
        "“Clean water, clear future.”",
        "“A drop saved is a life saved.”",
        "“Don't let our rivers dry. Let's save them, you and I.”"
    ];

    let quoteIndex = 0;
    const quoteElement = document.getElementById('quote');

    setInterval(() => {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        quoteElement.style.animation = 'none';
        void quoteElement.offsetWidth;
        quoteElement.style.animation = 'slideInUp 1s ease-out forwards';
        quoteElement.textContent = quotes[quoteIndex];
    }, 5000);

    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(ctaButton.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });

    const csvFileInput = document.getElementById('csvFileInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const resultsSection = document.getElementById('results-section');
    const qualityScoreElement = document.getElementById('qualityScore');
    const qualityMessageElement = document.getElementById('qualityMessage');
    const precautionsElement = document.getElementById('precautions');
    const scoreCircle = document.querySelector('.score-circle');

    analyzeButton.addEventListener('click', () => {
        const file = csvFileInput.files[0];
        if (!file) {
            alert("Please upload a CSV file first.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const csvData = event.target.result;
                const { score, message, color, precautions } = analyzeWaterData(csvData);

                resultsSection.style.display = 'block';
                qualityScoreElement.textContent = score;
                qualityMessageElement.textContent = message;
                scoreCircle.style.borderColor = color;
                precautionsElement.innerHTML = `<h4>Precautionary Steps:</h4><ul>${precautions.map(p => `<li>${p}</li>`).join('')}</ul>`;

                resultsSection.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                alert(`Error processing file: ${error.message}`);
                resultsSection.style.display = 'none';
            }
        };
        reader.readAsText(file);
    });

    function analyzeWaterData(csv) {
        const lines = csv.trim().split('\n');
        const header = lines[0].toLowerCase().split(',').map(h => h.trim());
        const data = lines.slice(1);

        const turbidityIndex = header.indexOf('turbidity');
        const purityIndex = header.indexOf('purity');
        const wastageIndex = header.indexOf('wastage_level');

        if (turbidityIndex === -1 || purityIndex === -1 || wastageIndex === -1) {
            throw new Error("CSV must contain 'turbidity', 'purity', and 'wastage_level' columns.");
        }

        let totalTurbidity = 0, totalPurity = 0, totalWastage = 0;
        data.forEach(line => {
            const values = line.split(',');
            totalTurbidity += parseFloat(values[turbidityIndex]);
            totalPurity += parseFloat(values[purityIndex]);
            totalWastage += parseFloat(values[wastageIndex]);
        });

        const avgTurbidity = totalTurbidity / data.length;
        const avgPurity = totalPurity / data.length;
        const avgWastage = totalWastage / data.length;

        let score = 10;
        if (avgTurbidity > 10) score -= 4;
        else if (avgTurbidity > 5) score -= 2;

        if (avgPurity < 70) score -= 3;
        else if (avgPurity < 85) score -= 1;

        if (avgWastage > 60) score -= 3;
        else if (avgWastage > 30) score -= 1;

        score = Math.max(1, Math.round(score));

        let message, color, precautions = [];
        if (score >= 8) {
            message = "Water quality is Excellent! Keep up the great work.";
            color = '#2ecc71';
            precautions = [
                "Continue monitoring regularly.",
                "Promote sustainable waste disposal near rivers.",
                "Encourage community participation in river cleaning drives."
            ];
        } else if (score >= 5) {
            message = "Water quality is Good, but improvements are needed.";
            color = '#f39c12';
            precautions = [
                "Reduce industrial and domestic discharge into rivers.",
                "Plant more trees along riverbanks to reduce erosion.",
                "Increase water treatment awareness programs."
            ];
        } else {
            message = "Warning: Poor water quality. Immediate action required!";
            color = '#e74c3c';
            precautions = [
                "Implement immediate cleanup and filtration measures.",
                "Stop untreated waste dumping.",
                "Introduce strict pollution control policies.",
                "Educate local communities on proper waste management."
            ];
        }

        return { score, message, color, precautions };
    }
});
