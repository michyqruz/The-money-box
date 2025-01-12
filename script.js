// Select the advertisement container and close button
const topAd = document.getElementById("top-ad");
const closeAdButton = document.getElementById("close-ad");

// Add event listener to close the ad when the button is clicked
closeAdButton.addEventListener("click", () => {
  topAd.style.display = "none"; // Hide the ad
});
