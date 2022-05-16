// status fields and start button in UI
var phraseDiv;
var resultDiv;

// subscription key and region for speech services.

var authorizationToken;
var SpeechSDK;
var synthesizer;

var phrase = "all good men must come to the aid"
var queryString = null;

var audioType = "audio/mpeg";
var serverSrc = "/text-to-speech";
var saveSrc = "/insert-text-to-speech";


document.getElementById('serverAudioFile').disabled = true;
document.getElementById('downloadfile').disabled = true;
document.getElementById('playimg').disabled = true;
document.getElementById('phraseDiv').focus();
document.getElementById('phraseDiv').value = "";


function saveAudio() {
    phrase = document.getElementById('phraseDiv').value.trim();

    fetch(`/insert-text-to-speech?phrase=${phrase}`).then(response => {
        if (response.ok) {
            alert("Saved..!!");
        } else {
            alert("Duplicate Name");
        }
    })
}

function deleteUser() {
    phrase = document.getElementById('audiofiles').value.trim();
    fetch(`/deleteUser?phrase=${phrase}`).then(response => {
        if (response.ok) {
            alert("Deleted..!!");
            window.location.reload();
        } else {
            alert("Failed to delete");
        }
    })
}



function getAllText() {

    fetch(`/getAllNames`).then(response => {
        if (response.ok) {

            response.json().then(value => {
                //alert(JSON.parse(value))
                let data = JSON.stringify(value.names);
                let arrdata = JSON.parse(data);

                var select = document.getElementById("audiofiles");

                if (arrdata.length > 0) {
                    for (const val of arrdata) {
                        var option = document.createElement("option");
                        option.value = val;
                        option.text = val;
                        select.appendChild(option);
                    }

                    document.getElementById("audiofiles").selectedIndex = 0;
                    document.getElementById('downloadfile').disabled = false;
                    document.getElementById('playimg').disabled = false;
                }

            });
        } else {
            alert("Failed to get all files..!!");
        }
    })
}

// update src URL query string for Express.js server
function updateSrc() {
    // input values
    phrase = document.getElementById('phraseDiv').value.trim();
    if (phrase.length != 0) {
        // server control - by file
        var serverAudioFileControl = document.getElementById('serverAudioFile');
        const fileQueryString = `file=true&phrase=${phrase}`;
        serverAudioFileControl.src = `${serverSrc}?${fileQueryString}`;
        serverAudioFileControl.type = "audio/mpeg";
        serverAudioFileControl.disabled = false;
    }

}

function DisplayError(error) {

    //window.alert(JSON.stringify(error));
}


// Initialization
document.addEventListener("DOMContentLoaded", function() {

    var clientAudioAzureControl = document.getElementById("clientAudioAzure");
    var resultDiv = document.getElementById("resultDiv");

    resourceKey = document.getElementById('resourceKey').value;
    resourceRegion = document.getElementById('resourceRegion').value;
    phrase = document.getElementById('phraseDiv').value;
    if (!!window.SpeechSDK) {
        SpeechSDK = window.SpeechSDK;
        clientAudioAzure.disabled = false;

        document.getElementById('content').style.display = 'block';
    }

});

function downloadFromDb() {
    phrase = document.getElementById('audiofiles').value.trim();
    fetch(`/downloadFromDb?phrase=${phrase}`).then((res) => res.json())
        .then((data) => {
            buffdata = JSON.stringify(data.content.data);
            const blob = new Blob([buffdata], {
                type: "audio/mpeg"
            });
            const url = window.URL.createObjectURL(blob);
            a = document.createElement('a');
            a.href = url;
            a.download = phrase + '.mp3';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        });

}

function play() {

    phrase = document.getElementById('audiofiles').value.trim();
    if (phrase.length > 0) {
        fetch(`/play?phrase=${phrase}`).then(res => {
            res.json().then(endpoint => {
                var audio = new Audio(endpoint.fileurl);
                audio.play();

            });
        });
    }
}

function godownload() {
    phrase = document.getElementById('audiofiles').value.trim();

    if (phrase.length == 0) {
        alert("Please Select File");
    }

    fetch(`/getSpeechFile?phrase=${phrase}`).then(resp => {
        if (!resp.ok) {
            alert("Failed to download audio file");
        }
        return resp.blob();
    }).then(myblob => {
        const url = window.URL.createObjectURL(myblob);
        a = document.createElement('a');
        a.href = url;
        a.download = phrase + '.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);

    });
}