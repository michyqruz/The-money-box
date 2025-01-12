// Select the advertisement container and close button
const topAd = document.getElementById("top-ad");
const closeAdButton = document.getElementById("close-ad");

// Function to show the advertisement with animation
function showAd() {
  topAd.classList.remove("hidden");
  topAd.classList.add("visible");
}

// Function to hide the advertisement with animation
function hideAd() {
  topAd.classList.remove("visible");
  topAd.classList.add("hidden");
}

// Show the ad after a short delay (e.g., 1 second)
setTimeout(showAd, 1000);

// Add event listener to close the ad when the button is clicked
closeAdButton.addEventListener("click", hideAd);
