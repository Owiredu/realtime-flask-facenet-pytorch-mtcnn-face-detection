var tabIdTileObj = {
  video: "Video Surveillance",
  gallery: "Gallery",
  tagging: "Tag a Person",
  registration: "Registration",
  records: "Records",
  settings: "Settings"
};

function switchMainTabs(evt, tabId) {
    /**
     * Switches between the main page tabs and closes the menu
     */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabId).style.display = "block";
    evt.currentTarget.className += " active";

    document.querySelector("#main_tabs_title").textContent = tabIdTileObj[tabId];
    closeNav();
}


function openNav() {
  document.getElementById("mainSidepanel").style.width = "250px";
}

function closeNav() {
  document.getElementById("mainSidepanel").style.width = "0";
}


// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();