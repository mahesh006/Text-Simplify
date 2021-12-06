
const captureButton = document.querySelector('#captureScreenshot');
const insightsButton = document.querySelector('#videocaption');
const popup = document.querySelector('.popup-content');
const resultpopup = document.querySelector('.popup-result');
const startAgainButton = document.querySelector('#startAgain');
const summary = document.querySelector('#summary');
const checkButton = document.querySelector('#check');
const addImageButton = document.querySelector('#addImage');
const mainText = document.querySelector('.main-text');
const screenshotListPreview = document.querySelector('.screenshot-list');
const loader = document.querySelector('.loader');
const videos = document.getElementById('videos');
const youtubesearch = document.getElementById('youtube_icon');
const youtubesubtitle = document.getElementById('youtube_icon_subtitle');
const extractedtexttag = document.getElementById('extractedtext');
const caption = document.getElementById('caption');
const subtitles = document.getElementById('vid_subtitles');


const dashboard = document.getElementById('dashboard');

let finalImage;
let ssList = [];
let currentTabURL;
let globalScreenshots = [];




var ctx = document.getElementById("myChart");
let myChart = (positivevalue, negativevalue, neutralvalue) => {
    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Positive', 'Negative', 'Neutral'],
          datasets: [{
            data: [positivevalue, negativevalue, neutralvalue],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 205, 86, 1)',
            ],
            borderWidth: 1
          }]
        },
        options: {
             //cutoutPercentage: 40,
          responsive: false,
      
        }
      });
}


const updateSummary = async (summaryText) => {    
    summary.innerHTML = `${summaryText}`  
};


const Extractedtext = async (extractedtext) => {    
    extractedtexttag.innerHTML = `${extractedtext}`   
};

const video = async (links) => {
    console.log(links);
    var obj = JSON.parse(JSON.stringify(links));
    console.log(obj);
    let key;
    let value;
    for (var x=Object.keys(obj),i=0;i<x.length,key=x[i],value=obj[key];i++){
        videos.insertAdjacentHTML(
            'afterbegin',
            `<div class="col-sm-6">
            <div class="card">
              <div class="card-body">
              <iframe id="myFrame" src="" frameborder="0" width="100%"
              allow=" accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <a href="#" class="btn btn-primary" id="button">Go somewhere</a>
              </div>
            </div>
          </div>`
        );
        
                
        document.getElementById("myFrame").src = value; 
        document.getElementById("button").innerHTML = key;       
    }   
        
};



const getGlobalScreenshots = () => {
    chrome.storage.local.get('globalScreenshots', (result) => {
        if (result.globalScreenshots?.length > 0) {
            globalScreenshots = result.globalScreenshots;
            ssList = result.globalScreenshots;

            changeDisplay(captureButton, 'none');
            changeDisplay(addImageButton, 'none');
            changeDisplay(insightsButton, 'none');
            closePreviewFn();
            addScreenshots();
        }
    });
    return;
};


chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTabURL = tabs[0].url;
    getGlobalScreenshots();
});


const addImageBtn = `<li><img
src="../../icons/plus.png"
class="add-image"
width="32px"
height="32px"
title="Add Screenshot"
/>
<li/>
`;

const magnifyingGlass = `<img
src="../../icons/magnifying-glass.svg"
width="16px"
height="16px"
class="btnIcon"
/>`;

const captureScreenshot = () => {
    changeDisplay(insightsButton, 'none');
    chrome.tabs.captureVisibleTab((ssUrl) => {
        const html = `
  <p class="crop-text">Crop and select the desired area. </p>
  <div class="preview-wrapper">
    <img src=${ssUrl} class="screenshot-preview" />
    <img
        src="../../icons/close.png"
          width="28px"
          height="28px"
          class="close-preview"
          title="close"
    />
    <img
          src="../../icons/cropimage.png"
          width="28px"
        height="28px"
        class="crop-icon"
        title="crop"
    />
  </div>`;

        finalImage = ssUrl;

        //Show Preview
        changeDisplay(captureButton);
        changeDisplay(addImageButton, 'block');
        addImageButton.disabled = true;

        ssList.length + 1 > 1
            ? (checkButton.innerHTML = ` ${magnifyingGlass} Analyse Screenshots`)
            : (checkButton.innerHTML = ` ${magnifyingGlass} Analyse Screenshot`);

        popup.removeChild(mainText);

        popup.insertAdjacentHTML('afterbegin', html);
        const cropButton = document.querySelector('.crop-icon');

        //Crop Image
        cropButton.addEventListener('click', () => {
            const previewImage = document.querySelector('.screenshot-preview');
            const cropper = new Cropper(previewImage, {
                autoCropArea: 0.5,
                zoomOnWheel: false
            });

            cropButton.src = '../../icons/tick.png';
            cropButton.title = 'Confirm Crop';

            cropButton.addEventListener('click', () => {
                finalImage = cropper
                    .getCroppedCanvas()
                    .toDataURL('image/png', 1);
                previewImage.src = finalImage;

                addImageButton.disabled = false;
                // changeDisplay(addImageButton);
                cropButton.src = '../../icons/cropimage.png';

                cropper.destroy();
            });
        });

        //Close Preview
        const closePreviewBtn = document.querySelector('.close-preview');
        closePreviewBtn.addEventListener('click', () => {
            closePreviewFn();
            if (ssList.length > 0) {
                addScreenshots();
            }
        });
    });
};


captureButton.addEventListener('click', captureScreenshot);



// Example POST method implementation:
async function postData(url = '', data) {
    screenshotListPreview.innerHTML = '';
    mainText.textContent = '';
    loading(true);


    try {
         // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); 
        //const responseData = await response.json();// parses JSON response into native JavaScript objects
        //const { data } = responseData;
        
        //console.log(data)
        
    }
    catch(err) {
        console.log(err)
        document.getElementsByClassName('error404').display = 'block';
    }   
}
  
  



//Send Image/s to backend
checkButton.addEventListener('click', () => {
    const finalExists = ssList.find((ss) => ss === finalImage);
    if (!finalExists) ssList.push(finalImage);
    //analysePhotos(ssList);
    console.log(ssList)
    postData('http:localhost:5000/', ssList )
    .then(data => {
        loading(false);
        changeDisplay(popup, 'none');
        changeDisplay(resultpopup, 'block');
        deleteAllScreenshots();
        //myChart(4, 94.8, 1.2);
        
      console.log(data);
      //console.log(data.data);
      //console.log(data[0]);
      //console.log(data[0][0]);
      if (data) {       // JSON data parsed by `data.json()` call
        
        //console.log(data[3].sentiment_data.classPredictions[0]);
        //console.log(data[3].sentiment_data.classPredictions[0].class);
        let neutralvalue = data[3].sentiment_data.classPredictions[0].score*100;
        let positivevalue = data[3].sentiment_data.classPredictions[1].score*100;
        let negativevalue = data[3].sentiment_data.classPredictions[2].score*100;
        

        //console.log(data[0].data);
        //console.log(data[0][0]);
        let summaryText = data[0].data;
        let extractedtext = data[1].original;
        let links = data[2].youtube_links;
        //englishSummary = summaryText;
        updateSummary(summaryText);
        Extractedtext(extractedtext);        
        video(links);
        myChart(positivevalue, negativevalue, neutralvalue);

        //console.log(summaryText.length)
    } 
    });
});



async function youtube_video_analysis(url = '', data) {
    document.getElementById('youtube_seach').style.display = 'none';
    document.getElementById('hide').style.display = 'none';
    loading(true);
    //console.log('value');
    //console.log(currentTabURL);

    try {
        // Default options are marked with *
       const response = await fetch(url, {
           method: 'POST', // *GET, POST, PUT, DELETE, etc.
           mode: 'cors', // no-cors, *cors, same-origin
           cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
           credentials: 'same-origin', // include, *same-origin, omit
           headers: {
           'Content-Type': 'application/json'
           // 'Content-Type': 'application/x-www-form-urlencoded',
           },
           redirect: 'follow', // manual, *follow, error
           referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
           body: JSON.stringify(data) // body data type must match "Content-Type" header
       });
       return response.json(); 
       //const responseData = await response.json();// parses JSON response into native JavaScript objects
       //const { data } = responseData;
       
       //console.log(data)
       
   }
   catch(err) {
       console.log(err)
       //document.getElementsByClassName('error404').style.display = 'block';
   } 
    
};

youtubesearch.addEventListener('click', () => {
    youtube_video_analysis('http:localhost:5000/video', currentTabURL)
    .then(data => {
        loading(false);       
        changeDisplay(popup, 'none');
        document.getElementById('youtube_seach').style.display = 'block';
        document.getElementById('hide').style.display = 'block';
        //console.log(data);
        
        if (data) {       // JSON data parsed by `data.json()` call
          //  console.log(data);
            caption.innerHTML = 'Caption: ' + data.caption;
        } 
    });

});

async function youtube_video_subtitle(url = '', data) {
    document.getElementById('youtube_subtitle').style.display = 'none';
    document.getElementById('hides').style.display = 'none';
    loading(true);
    //console.log('value');
    //console.log(currentTabURL);

    try {
        // Default options are marked with *
       const response = await fetch(url, {
           method: 'POST', // *GET, POST, PUT, DELETE, etc.
           mode: 'cors', // no-cors, *cors, same-origin
           cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
           credentials: 'same-origin', // include, *same-origin, omit
           headers: {
           'Content-Type': 'application/json'
           // 'Content-Type': 'application/x-www-form-urlencoded',
           },
           redirect: 'follow', // manual, *follow, error
           referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
           body: JSON.stringify(data) // body data type must match "Content-Type" header
       });
       return response.json(); 
       //const responseData = await response.json();// parses JSON response into native JavaScript objects
       //const { data } = responseData;
       
       //console.log(data)
       
   }
   catch(err) {
       console.log(err)
       //document.getElementsByClassName('error404').style.display = 'block';
   } 
    
};

youtubesubtitle.addEventListener('click', () => {
    var video_id = currentTabURL.split("v=")[1].substring(0, 11)
    console.log(video_id)
    youtube_video_subtitle('http:localhost:5000/videosummary', video_id)
    .then(data => {
        loading(false);       
        changeDisplay(popup, 'none');
        document.getElementById('youtube_subtitle').style.display = 'block';
        document.getElementById('hides').style.display = 'block';
        //console.log(data);
        
        if (data) {       // JSON data parsed by `data.json()` call
          //  console.log(data);
            subtitles.innerHTML = 'Summary: ' + data.videodata;
        } 
    });

});



//Close Preview
const closePreviewFn = () => {
    const previewWrapper = document.querySelector('.preview-wrapper');
    const cropText = document.querySelector('.crop-text');

    changeDisplay(addImageButton, 'none');
    if (previewWrapper && cropText) {
        popup.removeChild(previewWrapper);
        popup.removeChild(cropText);
    }

    if (ssList.length < 1) {
        backToInitialScreen();
    }

    popup.insertAdjacentElement('afterbegin', mainText);
};

//To Capture Image Screen
const captureButtonScreen = () => {
    screenshotListPreview.innerHTML = '';
    checkButton.style.display = 'none';
    mainText.textContent = 'Go to the desired area & capture screenshot';
    changeDisplay(captureButton);
};

//Back to Initial Screen
const backToInitialScreen = () => {
    screenshotListPreview.innerHTML = '';
    changeDisplay(checkButton, 'none');
    mainText.textContent = 'Select a way to get insights';
    changeDisplay(captureButton);
    
    changeDisplay(insightsButton);
    changeDisplay(popup, 'block');
    changeDisplay(resultpopup, 'none');
};

const deleteAllScreenshots = () => {
    ssList.length = 0;
    globalScreenshots.length = 0;
    chrome.storage.local.remove('globalScreenshots', function () {
        const error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
            return;
        }
    });
};





// Add more screenshots
const addScreenshots = () => {
    changeDisplay(checkButton);

    const deleteBtnHTML = `<img src="../../icons/bin.png" width="22px" height="22px" id="deleteScreenshots" title="Delete all screenshots"/>`;

    mainText.innerHTML = `Captured Screenshots ${deleteBtnHTML}`;

    const deleteAllScreenshotsButton =
        document.getElementById('deleteScreenshots');
    deleteAllScreenshotsButton.addEventListener('click', () => {
        deleteAllScreenshots();
        backToInitialScreen();
    });

    screenshotListPreview.innerHTML = '';
    ssList.forEach((ss, key) => {
        const listItem = document.createElement('li');
        listItem.className = `image-${key}`;
        listItem.innerHTML = `<img src=${ss} width="52px" height="52px"/>`;
        screenshotListPreview.appendChild(listItem);
    });

    ssList.length < 8 &&
        screenshotListPreview.insertAdjacentHTML('beforeend', addImageBtn);
    const addScreenshot = document.querySelector('.add-image');

    addScreenshot.addEventListener('click', captureButtonScreen);
};

// Add Image Button - Gives list of images with plus and Analyse Button
addImageButton.addEventListener('click', () => {
    ssList.push(finalImage);
    globalScreenshots = ssList;
    chrome.storage.local.set({ globalScreenshots }, () => {
        console.log(
            'Screenshot set for analysis of content on different websites.'
        );
    });

    changeDisplay(addImageButton, 'none');
    closePreviewFn();
    addScreenshots();
});

// @Func: Change display property of element
export const changeDisplay = (element, type) => {
    if (type) {
        element.style.display = type;
        return;
    }
    element.style.display =
        element.style.display === 'none'
            ? 'block'
            : element.style.display === 'block'
            ? 'none'
            : 'none';
    return;
};


const videosearch = () => {
    changeDisplay(popup, 'none');

    document.getElementById('youtube_seach').style.display = 'block';
    document.getElementById('youtube_subtitle').style.display = 'block';
    document.getElementById('hide').style.display = 'block';
    document.getElementById('hides').style.display = 'block';

    
    //console.log('working')
}



startAgainButton.addEventListener('click', backToInitialScreen);
insightsButton.addEventListener('click', videosearch);
dashboard.addEventListener('click', function(activeTab)
{
  var newURL = "http:localhost:5000/dashboard";
  chrome.tabs.create({ url: newURL , active: false});
});


// Loading Function

export const loading = (status) => {
    if (status) {
        changeDisplay(loader, 'block');
        changeDisplay(checkButton);
        return;
    }

    changeDisplay(loader, 'none');
    closePreviewFn();
    return;
};



