const terminal = document.querySelector('#terminal');
let inputSpan = document.querySelector(`span[contenteditable="true"]`);

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

        // updation in content (output) -- implementation in progress!
        // pre-process input
        let contentInputSpan = inputSpan.innerText.toLowerCase();
        contentInputSpan = contentInputSpan.trim();

        // DUBUG
        console.log(contentInputSpan);

        // main programs goes here
        if(contentInputSpan === "clear") {
            terminal.textContent = "";
        }
        else if(contentInputSpan === '') {

        } 
        else {
            const newOutput = document.createElement("span");
            newOutput.className = "output";
            newOutput.innerHTML = `
            '${inputSpan.innerText}' is not recognized as an internal or external command, operable program or batch file.
            <div style="padding-top: 15px;"></div>
            `;
            terminal.appendChild(newOutput);
        }
        
        // adding new child for next input
        const newDiv = document.createElement("div");
        newDiv.className = "hidden"
        newDiv.innerHTML = `
            <div class="root"> root </div>
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
});