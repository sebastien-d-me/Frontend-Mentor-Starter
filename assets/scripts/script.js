/** API **/
/* URL  */
const url = window.location.href.substring(0, window.location.href.lastIndexOf("/")) + "/";

/* Difficulty */
async function getDifficulty() {
    const response = await fetch(`${url}/assets/data/difficulty/difficulty.json`);
    const difficultyList = await response.json();
    return difficultyList;
}

/* Challenges */
async function getChallenges(difficulty) {
    const response = await fetch(`${url}/assets/data/challenges/${difficulty}.json`);
    const challengesList = await response.json();
    return challengesList;
}


/** Form **/
/* Elements */
const challengeDifficulty = document.getElementById("challenge-difficulty");
const challengeName = document.getElementById("challenge-name");
const challengeLinkURL = document.getElementById("challenge-link-url");
const githubProfil = document.getElementById("author-github-profil");
const githubRepository = document.getElementById("author-github-repository");
const btnDownload = document.getElementById("btn-download");

/* Load the difficulty options */
getDifficulty().then((difficultyList) => {
    // Reset the option of the difficulty select
    challengeDifficulty.options.length = 0;

    // Load the difficulty
    difficultyList.forEach(difficulty => {
        // Add the options
        challengeDifficulty.insertAdjacentHTML("beforeend", `<option>${difficulty.name}</option>`);
    });

    // Initiate the newbie challenge 
    changeDifficulty("newbie");
});

/* Difficulty Change */
function changeDifficulty(difficulty) {
    // Reset the options of the challenge select
    challengeName.options.length = 0;

    // Load the challenges options related to the chosen difficulty
    getChallenges(difficulty).then((challengesList) => {
        // Add the options
        challengesList[difficulty].forEach(challenge => {           
            const optionValue = (challenge.title).toLowerCase().split(" ").join("-");
            challengeName.insertAdjacentHTML("beforeend", `<option data-difficulty="${difficulty}" data-link="${challenge.link}" value="${optionValue}">${challenge.title}</option>`);
        });

        // Change the challenge
        updateChallenge();
    });
}

/* Challenge Change */
function updateChallenge() {
    const option = challengeName.options[challengeName.selectedIndex];
    const newChallengeURL = option.getAttribute("data-link");
    challengeLinkURL.setAttribute("value", newChallengeURL);

    // Challenges infos
    const optionDifficulty = option.getAttribute("data-difficulty");
    const optionTitle = option.text;
    const optionValue = option.value;
    challengeName.setAttribute("data-name", option.text);

    // Author infos
    const authorInfos = [githubProfil.value, githubRepository.value];

    // Change the solution title
    updateSolutionTitle(optionTitle);

    // Change the repository URL
    updateRepositoryURL(optionDifficulty, optionValue, authorInfos);

    // Refresh the verification of the form
    verifyForm();
}

/* Verify the form */
function verifyForm() {
    // Elements
    let inputData = [];
    const input_solution_URL = document.getElementById("challenge-solution-url").value;
    const input_FM_profil = document.getElementById("author-fm-profil").value;
    const input_GH_profil = document.getElementById("author-github-profil").value;
    const input_GH_repository = document.getElementById("author-github-repository").value;

    // Put the data in the array
    inputData.push(input_solution_URL);
    inputData.push(input_FM_profil);
    inputData.push(input_GH_profil);
    inputData.push(input_GH_repository);

    // Verification
    if(inputData.includes("") === false) {
        btnDownload.removeAttribute("disabled");
    } else {
        btnDownload.setAttribute("disabled", true);
    }
}


/** Solution **/
/* Elements */
const solutionTitle = document.getElementById("solution-title");
const solutionRepositoryURL = document.getElementById("solution-repository-url");
const solutionLiveSitURL = document.getElementById("solution-live-site-url");
const templateRepositoryURL = "https://github.com/{github-profil}/{github-repository}/tree/main/{challenge-difficulty}/{challenge-name}";
const templateLiveSiteURL = "https://{github-profil}.github.io/{github-repository}/{challenge-difficulty}/{challenge-name}";

/* Update the solution title */
function updateSolutionTitle(title) {
    solutionTitle.setAttribute("value", title);
}

/* Update the repository URL */
let newRepositoryURL;
let newLiveSiteURL;

function updateRepositoryURL(difficulty, title, authorInfos) {
    // Authors infos
    if(authorInfos[0] === "") {
        authorInfos[0] = "{github-profil}";
    }
    if(authorInfos[1] === "") {
        authorInfos[1] = "{github-repository}";
    }

    // Repository URL
    newRepositoryURL = templateRepositoryURL.replace("{challenge-difficulty}", difficulty);
    newRepositoryURL = newRepositoryURL.replace("{challenge-name}", title);    
    newRepositoryURL = newRepositoryURL.replace("{github-profil}", authorInfos[0]);
    newRepositoryURL = newRepositoryURL.replace("{github-repository}", authorInfos[1]);
    solutionRepositoryURL.setAttribute("value", newRepositoryURL);

    // Solution Live Site URL
    newLiveSiteURL = templateLiveSiteURL.replace("{challenge-difficulty}", difficulty);
    newLiveSiteURL = newLiveSiteURL.replace("{challenge-name}", title);    
    newLiveSiteURL = newLiveSiteURL.replace("{github-profil}", authorInfos[0]);
    newLiveSiteURL = newLiveSiteURL.replace("{github-repository}", authorInfos[1]);
    solutionLiveSitURL.setAttribute("value", newLiveSiteURL);
}


/** Zip **/
/* Fetch files */
const fetchData = (file) => fetch(file).then((res) => res.blob());

/* Generate the ZIP */
async function generateZip() {
    if(btnDownload.hasAttribute("disabled") === false) {
        const zip = new JSZip();
        // Form values
        const difficulty = document.getElementById("challenge-difficulty").value;
        const title = document.getElementById("challenge-name").getAttribute("data-name");
        const titleKebabCase = document.getElementById("challenge-name").value;
        const challenge_URL = document.getElementById("challenge-link-url").value;
        const solution_URL = document.getElementById("challenge-solution-url").value;
        const FM_profil = document.getElementById("author-fm-profil").value;
        const GH_profil = document.getElementById("author-github-profil").value;
        const GH_repository = document.getElementById("author-github-repository").value;
        const live_site_URL = `https://${GH_profil}.github.io/${GH_repository}/${difficulty}/${titleKebabCase}`;

        // Add the folders
        zip.folder(difficulty);
        const titleFolder = zip.folder(`${difficulty}/${titleKebabCase}`);
        const assetsFolder = titleFolder.folder(`assets`);
        assetsFolder.folder(`fonts`);
        assetsFolder.folder(`images`);
        const faviconFolder = assetsFolder.folder(`images/favicon`);
        const scriptsFolder = assetsFolder.folder(`scripts`);
        const stylesFolder = assetsFolder.folder(`styles`);
        titleFolder.folder(`design`);    

        // Add the index.html
        await fetch(`${url}/starter_files/base/index.html`).then(response => response.text()).then((indexFile) => {
            indexFile = indexFile.replace("{challenge-title}", title);
            indexFile = indexFile.replaceAll("{frontend-mentor-profil}", FM_profil);
            titleFolder.file("index.html", indexFile);
        });

        // Add the favicon
        const favicon = fetchData("starter_files/base/assets/images/favicon/favicon-32x32.png");
        faviconFolder.file("favicon-32x32.png", favicon, {base64: true});

        // Add the script
        await fetch(`${url}/starter_files/base/assets/scripts/script.js`).then(response => response.text()).then((scriptFile) => {
            scriptsFolder.file("script.js", scriptFile);
        });

        // Add the style
        await fetch(`${url}/starter_files/base/assets/styles/style.css`).then(response => response.text()).then((styleFile) => {
            stylesFolder.file("style.css", styleFile);
        });

        // Add the README.md
        await fetch(`${url}/starter_files/base/README.md`).then(response => response.text()).then((readmeFile) => {
            readmeFile = readmeFile.replaceAll("{challenge-title}", title);
            readmeFile = readmeFile.replace("{challenge-url}", challenge_URL);
            readmeFile = readmeFile.replace("{solution-url}", solution_URL);
            readmeFile = readmeFile.replace("{live-site-url}", live_site_URL);
            readmeFile = readmeFile.replaceAll("{frontend-mentor-profil}", FM_profil);
            titleFolder.file("README.md", readmeFile);
        });

        // Save the ZIP
        zip.generateAsync({type:"blob"}).then(function(ZIP_Content) {
            saveAs(ZIP_Content, "Challenge_Starter.zip");
        });
    }
}


/** Footer **/
/* Elements */
const footerCopyright = document.getElementById("footer-copyright");

/* Copyright year */
const currentYear = new Date().getFullYear();
footerCopyright.setAttribute("current-year", ` ${currentYear}`);