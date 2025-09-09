let voicesData = {};

window.onload = async () => {
    try {
        const response = await fetch('/api/voices');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Something went wrong');
        }
        voicesData = await response.json();
        const languageSelect = document.getElementById('languageSelect');
        for (const langCode in voicesData) {
            const option = document.createElement('option');
            option.value = langCode;
            option.textContent = langCode;
            languageSelect.appendChild(option);
        }
        
        // Set default language to en-US
        if (voicesData['en-US']) {
            languageSelect.value = 'en-US';
        }

        languageSelect.onchange = () => {
            const selectedLang = languageSelect.value;
            const voiceSelect = document.getElementById('voiceSelect');
            voiceSelect.innerHTML = '';
            if (voicesData[selectedLang]) {
                voicesData[selectedLang].forEach(voice => {
                    const option = document.createElement('option');
                    option.value = voice.name;
                    option.textContent = `${voice.name} (${voice.gender})`;
                    voiceSelect.appendChild(option);
                });
            }
        };
        languageSelect.onchange(); // Trigger once to populate voices

        document.getElementById('personName').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                getQuotes();
            }
        });

    } catch (e) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = e.message;
    }
};

async function getQuotes() {
    const personName = document.getElementById('personName').value;
    const quotesList = document.getElementById('quotesList');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    quotesList.innerHTML = '';
    error.innerHTML = '';
    loading.style.display = 'block';

    try {
        const response = await fetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: personName })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Something went wrong');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'quote-card';

                const content = document.createElement('div');
                content.className = 'quote-content';

                const quote = document.createElement('p');
                quote.className = 'quote-text';
                quote.textContent = `"${item.quote}"`;

                const context = document.createElement('p');
                context.className = 'quote-context';
                context.textContent = item.context;

                const playButton = document.createElement('button');
                playButton.className = 'play-button';
                playButton.textContent = 'Play';
                playButton.onclick = () => playQuote(item.quote);

                content.appendChild(quote);
                content.appendChild(context);
                card.appendChild(content);
                card.appendChild(playButton);
                quotesList.appendChild(card);
            });
        }
    } catch (e) {
        error.textContent = e.message;
    } finally {
        loading.style.display = 'none';
    }
}

async function playQuote(text) {
    try {
        const languageCode = document.getElementById('languageSelect').value;
        const voiceName = document.getElementById('voiceSelect').value;
        const response = await fetch('/api/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language_code: languageCode, voice_name: voiceName })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Something went wrong');
        }
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    } catch (e) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = e.message;
    }
}
