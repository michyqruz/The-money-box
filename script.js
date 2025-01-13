// Select the advertisement content and close button
const adContent = document.getElementById("ad-content");
const closeAdButton = document.getElementById("close-ad");

// Function to slide in the ad content
function slideInAd() {
  adContent.classList.remove("hidden-content");
  adContent.classList.add("visible-content");
}

// Function to slide out the ad content when closed
function slideOutAd() {
  adContent.classList.remove("visible-content");
  adContent.classList.add("hidden-content");
}

// Trigger the ad content slide-in after 1 second
setTimeout(slideInAd, 1000);

// Add event listener to close the ad when the button is clicked
closeAdButton.addEventListener("click", slideOutAd);

