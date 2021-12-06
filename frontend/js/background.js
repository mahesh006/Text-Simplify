

chrome.runtime.onMessage.addListener((req, sender, res) => {
    
    console.log(word)
    if (req.message === 'checkURL') {
        console.log(req.URL);
    }

    res({ message: 'checked' });
});

