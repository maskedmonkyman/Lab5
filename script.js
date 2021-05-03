// script.js

const imageInput     = document.getElementById("image-input");
const canvas         = document.getElementById("user-image");
const topTextField   = document.getElementById("text-top");
const botTextField   = document.getElementById("text-bottom");
const voiceSelector  = document.getElementById("voice-selection");
const clearButton    = document.querySelector("[type='reset']");
const readTextButton = document.querySelector("[type='button']");
const generateButton = document.querySelector("[type='submit']");
const volumeSlider   = document.querySelector("[type='range']");
const volumeIcon     = document.querySelector("[alt='Volume Level 3']")

const URL = window.URL || window.webkitURL;
const img = new Image(); // used to load image from <input> and draw to canvas
const context = canvas.getContext('2d');

var imgURL = null;
let voices = window.speechSynthesis.getVoices();

clearButton.disabled = true;
readTextButton.disabled = true;
generateButton.disabled = false;

if (voices.length > 0)
{
    voiceSelector.remove(voiceSelector.selectedIndex);
    voiceSelector.disabled = false;
}

for(let i = 0; i < voices.length; i++)
{
    let option = document.createElement('option');
    option.textContent = voices[i].name + "(" + voices[i].lang + ")";

    if (voices[i].default)
        option.textContent += " -- defualt";

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    option.setAttribute("name", i);
    voiceSelector.appendChild(option);
}

function speakText(text)
{
    let voiceIndex = Number(voiceSelector.selectedOptions[0].getAttribute("name"))
    let utterTop = new SpeechSynthesisUtterance(text);
    utterTop.volume = volumeSlider.value/volumeSlider.max;
    utterTop.voice = voices[voiceIndex];
    window.speechSynthesis.speak(utterTop); 
}

readTextButton.addEventListener("click", () => {
    speakText("top text is. " + topTextField.value);
    speakText("botom text is. " + botTextField.value);
});

imageInput.addEventListener("change", () => {
    if (!imgURL)
    imgURL = URL.createObjectURL(imageInput.files[0]);
    else
    {
        URL.revokeObjectURL(imgURL);
        imgURL = URL.createObjectURL(imageInput.files[0]);
    }

    canvas.alt = imageInput.files[0].name;
    img.src = imgURL;
}, false);

clearButton.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    clearButton.disabled = true;
    readTextButton.disabled = true;
    generateButton.disabled = false;
    URL.revokeObjectURL(imgURL);
    imgURL = null;
});

function drawMessuredText(text, pad, drawOnTop)
{
    let measurement = context.measureText(text);
    let ypos = measurement.actualBoundingBoxDescent + measurement.actualBoundingBoxAscent + pad;
    let xpos = canvas.width/2 - measurement.width/2;

    if (!drawOnTop)
        ypos = canvas.height - pad;

    context.fillText(text, xpos, ypos);
}

generateButton.onclick = () => {
    context.font = '50px sans-serif';
    context.fillStyle = "white";
    drawMessuredText(topTextField.value, 15, true);
    drawMessuredText(botTextField.value, 15, false);
    generateButton.disabled = true;
    clearButton.disabled = false;
    readTextButton.disabled = false;
    return false;
}

volumeSlider.addEventListener("input", () => {
    if (volumeSlider.value >= 67)
        volumeIcon.src = "icons/volume-level-3.svg"
    else if (volumeSlider.value >= 34)
        volumeIcon.src = "icons/volume-level-2.svg"
    else if (volumeSlider.value >= 1)
        volumeIcon.src = "icons/volume-level-1.svg"
    else
        volumeIcon.src = "icons/volume-level-0.svg"

})

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
    context.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
