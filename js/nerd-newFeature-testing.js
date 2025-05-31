// The JS code is hardcoded - there is limited amount of command and files, so it seems that hardcoding things will be a better option.
// No offence! Just avoiding overengineering!

let currentSessionHistory = Array();

const terminal = document.querySelector('#terminal');
let inputSpan = document.querySelector(`span[contenteditable="true"]`);

let currentWorkingDirectory = "root";

let possibleDirectories = [
    'root', 
    'skills', 
];

let autoCompleteFromHistory = 0;

let filesFromRoot = ["about.txt", "skills", "contact.txt", "resume.txt", "projects.txt"];
let filesFromSkills = ["language.txt", "framework.txt", "current-learning.txt"];

// Directory Structure:
// about.txt
// skills [language.txt; ai-experience.txt; current-learning.txt; ]
// contact.txt
// resume.txt
// projects.txt

// Valid Commands [blue-print; different-cases; ]
// pwd (no more argument is allowed);
// cat [Path]+;  // where [Path] = ([Directory]/)*[FileName];
    // cat about.txt
    // cat ./skills/ai-experience.txt;
// cd ([Directory]/)*[Directory];  // or just cd [Path];
    // cd Directory/;
    // cd ..;
    // cd;
    // cd ./Directory/;
// ls [flags]* (/[Directory])*;
    // ls
    // ls -a
    // ls -l skills/
// history (no matter the other arguments!); 
// clear (no matter the other arguments!); 
// help

let validCommands = [
    "help",
    "pwd",
    "cat",
    "ls",
    "history",
    "cd",
    "clear",
];

terminal.addEventListener('click', () => {
    inputSpan.focus();
});

terminal.addEventListener('keydown', (keyValue) => {

    if(keyValue.key == 'Enter') {

        // preventing to add "Enter" to the text
        keyValue.preventDefault();
        
        // removing focus from previous span and making it un-editable
        inputSpan.blur();
        inputSpan.contentEditable = "false";

        // document.querySelectorAll(`span[contenteditable="true"]`).forEach(span => span.contentEditable = "false");

        // updation in content (output) -- implementation in progress!
        // pre-process input
        let unprocessedContent = inputSpan.innerText.trim();
        let contentInputSpan = inputSpan.innerText.toLowerCase();
        contentInputSpan = contentInputSpan.trim();

        if(contentInputSpan !== 'history') {
            currentSessionHistory.push(contentInputSpan);
        }
        autoCompleteFromHistory = 0;

        // Preprocessing (string to array)
        let contentArray = preprocessingStringToArray(contentInputSpan);

        // main programs goes here
        if(contentArray[0] === "clear") {
            terminal.textContent = "";

        } else if(contentInputSpan === '') {
            // Keep it empty!.

        } else if(validCommands.includes(contentArray[0])) {

            let currentExecutingCommand = contentArray[0];
            let generatedOutputText = "";

            if(currentExecutingCommand === "pwd") {
                generatedOutputText = handleCommandPrintWorkingDirectory(contentArray);
            } else if(currentExecutingCommand === "ls") {
                generatedOutputText = handleCommandListDirectory(contentArray);
            } else if(currentExecutingCommand === "cd") {
                generatedOutputText = handleCommandChangingDirectory(contentArray);
            } else if(currentExecutingCommand === "cat") {
                generatedOutputText = handleCommandReadingTextFile(contentArray);
            } else if(currentExecutingCommand === "history") {
                generatedOutputText = handlecommandHistory();
            } else if(currentExecutingCommand === "help") {
                generatedOutputText = handleCommandHelp();
            }

            // Displaying Generated Output
            if(generatedOutputText !== "") {
                const newOutput = document.createElement("span");
                newOutput.className = "output";
                newOutput.innerHTML = generatedOutputText;
                terminal.appendChild(newOutput);
            }
            
        } else {
            const newOutput = document.createElement("span");
            newOutput.className = "output";
            newOutput.innerHTML = `
            zsh: command not found: ${contentArray[0]}
            `;
            terminal.appendChild(newOutput);
        }
        
        // adding new child for next input
        const newDiv = document.createElement("div");
        newDiv.className = "hidden"
        newDiv.innerHTML = `
            <div class="root"> ${currentWorkingDirectory} </div>
            <div class="tick"> $ </div>
            <span contenteditable="true" spellcheck="false" class="input"></span>
        `;
        terminal.appendChild(newDiv);


        // moving the eventListener to the next input shell
        inputSpan = terminal.querySelector(`span[contenteditable="true"]`);

        inputSpan.focus();

        // adding event listener to the newest shell
        terminal.addEventListener('click', () => {
            inputSpan.focus();
        });
    }
    else if(keyValue.key === "ArrowUp" || keyValue.key === "ArrowDown") {

        let totalLength = currentSessionHistory.length;

        if(totalLength > 0) {
            if(keyValue.key === "ArrowUp") {
                autoCompleteFromHistory = Math.min(autoCompleteFromHistory+1, totalLength);
            } else if(keyValue.key === "ArrowDown") {
                autoCompleteFromHistory = Math.max(1, autoCompleteFromHistory-1);
            }
            inputSpan.focus()
            
            inputSpan.innerText = currentSessionHistory[totalLength - autoCompleteFromHistory];
        }
    }
});

// INPUT: String
// OUTPUT: Array
function preprocessingStringToArray(queryString) {
    let queryArray = Array()

    let tmpString = "";
    for(let x of queryString) {
        if(x !== " ") {
            tmpString += x;
        }
        else {
            queryArray.push(tmpString);
            tmpString = "";
        }
    }

    queryArray.push(tmpString);

    return queryArray;
}

// Capturing Comamnd in Functions.
// pwd (no more argument is allowed);
function handleCommandPrintWorkingDirectory(contentArray) {
    if(contentArray.length > 1) {
        return "pwd: too many arguments";
    }
    else {
        if(currentWorkingDirectory === "root") {
            return "/root";
        } else if(currentWorkingDirectory === "skills") {
            return "/root/skills";
        }
    }
    return "";
}

// cat [Path]+;  // where [Path] = ([Directory]/)*[FileName];
    // cat about.txt
    // cat ./skills/ai-experience.txt;
function handleCommandReadingTextFile(contentArray) {

    if(contentArray.length == 1) {
        return "";
    }

    let res = "";
    if(currentWorkingDirectory === 'root') {
        for(let i=1; i<contentArray.length; ++i) {
            let ans = subHandleCommandReadingTextFileRoot(contentArray[i]);
            if(ans === null) {
                res += `cat: ${contentArray[i]}: No such file or directory`;
                break;
            }
            else {
                res += ans;
            }
        }
    } else if(currentWorkingDirectory === 'skills') {
        for(let i=1; i<contentArray.length; ++i) {
            let ans = subHandleCommandReadingTextFileSkills(contentArray[i]);
            if(ans === null) {
                res += `cat: ${contentArray[i]}: No such file or directory`;
                break;
            }
            else {
                res += ans;
            }
        }
    }
    return res;
}

function subHandleCommandReadingTextFileRoot(file) {
    if(file === "about.txt" || file === "./about.txt") {
        return aboutTXT();
    } else if(file === "contact.txt" || file === "./contact.txt") {
        return contactTXT();
    } else if(file === "resume.txt" || file === "./resume.txt") {
        return resumeTXT();
    } else if(file === "projects.txt" || file === "projects.txt") {
        return projectsTXT();
    } else if(file === "skills/language.txt" || file === "./skills/language.txt") {
        return languageTXT();
    } else if(file === "skills/ai_experience.txt" || file === "./skills/ai_experience.txt") {
        return ai_experienceTXT();
    } else {
        return null;
    }
}

function subHandleCommandReadingTextFileSkills(file) {

    if(file === "language.txt" || file === "./language.txt") {
        return languageTXT();
    } else if(file === "ai_experience.txt" || file === "./ai_experience.txt") {
        return ai_experienceTXT();
    } else {
        return null;
    }
}

// cd ([Directory]/)*[Directory];  // or just cd [Path];
    // cd Directory/;
    // cd ..;
    // cd;
    // cd ./Directory/;
function handleCommandChangingDirectory(contentArray) {

    if(contentArray.length === 1) {
        currentWorkingDirectory = "root";
    } else if(contentArray.length > 2) {
        return `cd: too many arguments`;
    } else if(currentWorkingDirectory === "root" &&  (contentArray[1] === "skills" || contentArray[1] === "./skills" || contentArray[1] === "./skills/")) {
        currentWorkingDirectory = "skills";
    } else if(currentWorkingDirectory === "skills" && contentArray[1] === "..") {
        currentWorkingDirectory = "root";
    } else if(currentWorkingDirectory === "root" && contentArray[1] === "..") {
        // There's nothing to do here!
    }  else if(true) {
        if(currentWorkingDirectory === "root" && 
            (
                (contentArray[1] === 'about.txt' || contentArray[1] === './about.txt') ||
                (contentArray[1] === 'contact.txt' || contentArray[1] === './contact.txt') ||
                (contentArray[1] === 'resume.txt' || contentArray[1] === './resume.txt') ||
                (contentArray[1] === 'projects.txt' || contentArray[1] === './projects.txt')
            )
        ) {
            return `cd: not a directory: ${contentArray[1]}`;
        } else if(currentWorkingDirectory === "skills" && 
            (
                (contentArray[1] === 'language.txt' || contentArray[1] === './language.txt') ||
                (contentArray[1] === 'ai_experience.txt' || contentArray[1] === './ai_experience.txt') 
            )
        ) {
            return `cd: not a directory: ${contentArray[1]}`;
        } else {
            return `cd: no such file or directory: ${contentArray[1]}`;
        }
    }
    return "";
}

// ls [flags]* (/[Directory])*;
    // ls
    // ls -a
    // ls -l skills/
function handleCommandListDirectory(contentArray) {
    
    // Removing flag
    let afterSkippingTheIndex = 1;
    while(afterSkippingTheIndex < contentArray.length && contentArray[afterSkippingTheIndex][0] === '-') {
        afterSkippingTheIndex += 1;
    }

    let res = "";
    if(contentArray.length === 1 || contentArray.length === afterSkippingTheIndex) {
        return subHandleCommandListDirectory("");
    } else {
        for(let iterator=afterSkippingTheIndex; iterator<contentArray.length; ++iterator) {
            let ans = subHandleCommandListDirectory(contentArray[iterator]);
            if(ans == null) {
                res += `ls: ${contentArray[iterator]}: No such file or directory`;
                res += `<br>`;
                break;
            }
            else {
                res += ans;
                res += `<br>`;
            }
        }
    }
    return res;
}

function subHandleCommandListDirectory(folderToCheck) {
    let res = "";
    if(currentWorkingDirectory === "root" && (folderToCheck === "" || folderToCheck === ".")) {
        res = `
            <div style="padding-right: 15px; display: inline;">about.txt</div> 
            <div style="padding-right: 15px; display: inline;">contact.txt</div> 
            <div style="padding-right: 15px; display: inline;">resume.txt</div> 
            <div style="padding-right: 15px; display: inline;">skills</div> 
            <div style="padding-right: 15px; display: inline;">projects.txt</div>
        `;
    } else if(currentWorkingDirectory === "root" && (folderToCheck === "./skills/" || folderToCheck === "./skills" || folderToCheck === "skills/" || folderToCheck === "skills")) {
        res = `
            <div style="padding-right: 15px; display: inline;">ai_experience.txt</div> 
            <div style="padding-right: 15px; display: inline;">language.txt</div> 
        `;
    } else if(currentWorkingDirectory === "skills" && (folderToCheck === "" || folderToCheck === ".")) {
        res = `
            <div style="padding-right: 15px; display: inline;">ai_experience.txt</div> 
            <div style="padding-right: 15px; display: inline;">language.txt</div> 
        `;
    } else {
        return null;
    }
    return res;
}

// history (no matter the other arguments!); 
function handlecommandHistory() {
    res = "";
    iterator = 1;
    for(let x of currentSessionHistory) {
        res += `
        <div style="margin-left: 10px;">
            <table>
                <tr> ${iterator} </tr>
                <tr> ${x} </tr>
            <table>
        </div>
        `;
        iterator += 1;
    }
    return res;
}

// clear (no matter the other arguments!); 
function handleCommandClear() {
    // Already implemented
    return "";
}

// help
function handleCommandHelp() {
    return `
    <div style="margin-left: 10px;">
        <table>
            <tr>
                <td> 
                    <strong> pwd </strong>
                </td>
                <td> 
                    - Print the current working directory.
                </td>
            </tr>
            <tr>
                <td> 
                    <strong> ls FILENAME </strong>
                </td>
                <td> 
                    - List files and directories.
                </td>
            </tr>
            <tr>
                <td> 
                    <strong> cd[path] </strong>
                </td>
                <td> 
                    - Change directory.
                </td>
            </tr>
            <tr>
                <td> 
                    <strong> cat [file] </strong>
                </td>
                <td> 
                    - Display the contents of a file.
                </td>
            </tr>
            <tr>
                <td> 
                    <strong> history </strong>
                </td>
                <td> 
                    - Show previously entered commands.
                </td>
            </tr>
            <tr>
                <td> 
                    <strong> clear </strong>
                </td>
                <td> 
                    - Clear the terminal screen.
                </td>
            </tr>
            <tr>
                <td> 
                    <strong> help </strong>
                </td>
                <td> 
                    - Show this help message.
                </td>
            </tr>
        </table>
    </div>
    `;
}

// Defining File CONTENT
// Files: [about.txt; contact.txt; resume.txt; projects.txt; skills/language.txt; skills/current_learning.txt; ]
function aboutTXT() {
    return `
    <div style="padding-left: 10px">
        Hi, I'm Adarsh — a software developer passionate about building intuitive and impactful digital experiences.
        <br><br>

        My work primarily focuses on:<br>
        - Web development<br>
        - AI and machine learning experimentation<br><br>

        I'm a firm believer in continuous learning and enjoy solving real-world problems with code.<br>
        This terminal portfolio is a small demonstration of my curiosity and love for minimal design.<br><br>

        Type 'cd skills' to learn what I'm good at, or 'cat contact.txt' to get in touch!<br>
    </div>
    `;
}

function resumeTXT() {
    return `
        <div> <a href="/data/adarsh_resume_updated.pdf" target="_blank" style="text-decoration: underline; "> Resume </a> </div>
    `;
}

function contactTXT() {
    return `
    <div style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
        <div><a target="_blank" href="https://github.com/adarshvishwakarma12/" style="text-decoration: underline; ">Github</a></div>
        <div><a target="_blank" href="https://linkedin.com/in/adarshvishwakarma12/" style="text-decoration: underline; ">LinkedIn</a></div>
    </div>
    `;
}

function projectsTXT() {
    return `
   <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; padding-left: 10px">
        <div><a target="_blank" href="https://github.com/AdarshVishwakarma12/crm-software" style="text-decoration: underline; ">CRM Software</a></div>
        <div><a target="_blank" href="https://github.com/AdarshVishwakarma12/Blog-Application" style="text-decoration: underline; ">Blog Application</a></div>
        <div><a target="_blank" href="https://www.kaggle.com/code/adarshvishwakarma12/gtsrb-german-traffic-sign-recognition-benchmark" style="text-decoration: underline; ">German Traffic Sign Recognition BenchMark</a></div>
        <div><a target="_blank" href="https://github.com/AdarshVishwakarma12/machine-learning-algorithms" style="text-decoration: underline; ">K-Means Algorithm</a></div>
        <div><a target="_blank" href="https://github.com/AdarshVishwakarma12/machine-learning-algorithms" style="text-decoration: underline; ">Regression Tree Algorithm</a></div>
        <div><a target="_blank" href="https://www.kaggle.com/code/adarshvishwakarma12/digit-recognizer" style="text-decoration: underline; ">Digit Recognizer</a></div>
        <div><a target="_blank" href="https://github.com/AdarshVishwakarma12/GAME" style="text-decoration: underline; ">Tic-Tac-Toe Gate</a></div>
    </div>
    `;
}

function languageTXT() {
    return `
    <div style="margin-left: 10px;">
        <table>
            <tr>
                <td>+</td>
                <td>Python</td>
            <tr>
                <td>+</td>
                <td>Java</td>
            </tr>
            <tr>
                <td>+</td>
                <td>C++</td>
            </tr>
        </table>
    </div>
    `;
}

function ai_experienceTXT() {
    return `
    <div style="margin-left: 10px;">
        <table>
            <tr>
                <td>+</td>
                <td>Sklearn</td>
            <tr>
                <td>+</td>
                <td>Pytorch</td>
            </tr>
        </table>
    </div>
    `;
}