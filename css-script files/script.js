function taskConstructor (taskTitle) {
    this.taskTitle = taskTitle;
    this.tasksToDoArray = [];
    this.addATask = function (description,date) {
        const aTask = {
            description:description,
            date:date 
        };
        this.tasksToDoArray.push(aTask);
    }
    this.editATask = function (taskIndex,description,date) {
        this.tasksToDoArray[taskIndex].description = description;
        this.tasksToDoArray[taskIndex].date = date;
    }
    this.deleteATask = function (taskIndex) {
        this.tasksToDoArray.splice(taskIndex,1);
    }
}

taskConstructor.prototype.latestTask = function () {
    return {lastInputtedTask:this.tasksToDoArray[(this.tasksToDoArray.length - 1)],lastInputtedIndex:this.tasksToDoArray.length};
}

const allTasksArray = [
    new taskConstructor('Work Tasks'),
    new taskConstructor('Personal Tasks')
];

//function to create, read, update/edit and delete task

const crudTask = (() => {

    //adding a fresh new task in to do app in existing task type
    function createTask (taskTitle,description,date) {
        //const objectIndex = objectSearch(taskTitle);
        allTasksArray[objectSearch(taskTitle)].addATask(description,date);
        return allTasksArray[objectSearch(taskTitle)].latestTask();
    }
    
    //function to update or edit task
    function editTask (taskTitle,taskIndex,description,date) {
        //const objectIndex = objectSearch(taskTitle);
        allTasksArray[objectSearch(taskTitle)].editATask(taskIndex,description,date);
        return allTasksArray[objectSearch(taskTitle)].tasksToDoArray[taskIndex];
    }

    //function to delete a created task
    function removeCreatedTask (taskTitle,taskIndex) {
        //const objectIndex = objectSearch(taskTitle);
        allTasksArray[objectSearch(taskTitle)].deleteATask(taskIndex);
        return allTasksArray[objectSearch(taskTitle)];
    }

    //adding a new task type (object) in allTasksArray
    function addingNewTaskType (nameOfTaskType) {
        const titlesArray = allTasksArray.map(task => task.taskTitle);
        const isItInTaskArray = titlesArray.includes(nameOfTaskType);
        if (isItInTaskArray) {
            return "Sorry we can't insert tasks with the same name.";
        }
        allTasksArray.push(new taskConstructor(nameOfTaskType));
        return allTasksArray[allTasksArray.length - 1];
    }

    //editing or renaming the new task type which was added
    function renamingAddedTaskType (oldNameOfTaskType,newNameOfTaskType) {
        const objectIndex = objectSearch(oldNameOfTaskType);
        const objProperties = [...allTasksArray[objectIndex]?.tasksToDoArray];
        newNameOfTaskType  = addingNewTaskType(newNameOfTaskType);
        if (typeof newNameOfTaskType === 'string') {
            return newNameOfTaskType;
        }
        allTasksArray.pop();
        allTasksArray.splice(objectIndex,1,newNameOfTaskType);
        allTasksArray[objectIndex].tasksToDoArray.push(objProperties);
        return allTasksArray[objectIndex];
    }

    //removing the added task type not default
    function deleteAddedTaskType (nameOfTaskType) {
        const indexDeleted = objectSearch(nameOfTaskType);
        allTasksArray.splice(indexDeleted,1);
        return indexDeleted;
    }

    //searching for the object's index according to it's name/task title
    function objectSearch (taskTitle) {
        const regex = /\S/g;
        taskTitle = taskTitle.match(regex).join('');
        for (i = 0; i < allTasksArray.length; i++) {
            const task = allTasksArray[i].taskTitle.match(regex).join('');
            if (task === taskTitle) {
                return i;
            }
        }
    }

    return {createTask,editTask,removeCreatedTask,addingNewTaskType,renamingAddedTaskType,deleteAddedTaskType,objectSearch};
})()




//UI

const userInterface = (() => {

//------> To remove other task section //sections: menuContent, workTasksSection, personalTasksSections
    let allSections = document.querySelectorAll('section');
    let menuList = document.getElementById('menuContentList').querySelectorAll('li');
    let addTaskBtns = document.querySelectorAll('.addTask');
    const didTasks = [];
    let activeSection,allEmojiButtons,allAddedTasks;

    (function startPage () {
        addTaskBtns[0].addEventListener('click',toAddATask);
        activeSection = 0;
    })()

    function showMenuContent () {
        if (document.querySelector('aside').classList.contains('hidden_menu')) {
            document.querySelector('aside').classList.remove('hidden_menu');
            document.addEventListener('mousedown',activateUIElts);
            for(let i = 0; i < menuList.length - 1; i++) {
                menuList[i].addEventListener('mousedown',taskTypeLoadingSection);
            }
            menuList[menuList.length - 1].addEventListener('mouseover',removingDocListenerToAddOtherTypeTask);
            disactivateUIElts();
        }
    }

    //remove document event listener when user might need to add a new task type so as to avoid behaviours caused by activating UI elts
    function removingDocListenerToAddOtherTypeTask () {
        document.removeEventListener('mousedown',activateUIElts);
        menuList[menuList.length - 1].removeEventListener('mouseover',removingDocListenerToAddOtherTypeTask);
        menuList[menuList.length - 1].addEventListener('mouseout',addingBackDocListenerInAddingOtherTypeTask);
        //'+' button(span) on other task type 
        menuList[menuList.length - 1].children[1].addEventListener('mousedown',taskTypeLoadingSection);
    }

    function addingBackDocListenerInAddingOtherTypeTask () {
        document.addEventListener('mousedown',activateUIElts);
        menuList[menuList.length - 1].removeEventListener('mouseout',addingBackDocListenerInAddingOtherTypeTask);
        menuList[menuList.length - 1].addEventListener('mouseover',removingDocListenerToAddOtherTypeTask);
    }

    //function to be fired when user is entering the other task type, it's changing the whole page blur
    function insertingOtherTaskTypeUI () {
        const otherTaskTypeForm = document.createElement('form');
        UIDOMFormOtherTaskType(otherTaskTypeForm);
        otherTaskTypeForm.addEventListener('mouseover',removingDocListenerToAddOtherTypeTask);
        //otherTaskTypeForm.addEventListener('mouseout',addingBackDocListenerInAddingOtherTypeTask);
        otherTaskTypeForm.querySelector('#buttons').addEventListener('click',toAddNewTaskTypeOrDismiss);
    }

    //form to help manipulation of adding,renaming and deleting other addedTaskType
    function UIDOMFormOtherTaskType(otherTaskTypeForm) {
        disactivateUIElts(true);
        otherTaskTypeForm.setAttribute('id','otherTaskTypeForm');
        otherTaskTypeForm.innerHTML =
         `
            <h3>Task Type Name</h3>
            <input type="text" name="TaskTypeName" placeholder="Enter the name of your task type" id="inputAnotherTypeOfTask">
            <div id="buttons">
                <input type="button" name="SubmitBtn" value="Submit">
                <input type="reset" name="resetBtn" value="Dismiss">
            </div>
        `;
        document.querySelector('main').append(otherTaskTypeForm);
    }

    function activeUIEltsAfterAddingNewTaskType () {
        document.getElementById('menuContentList').classList.remove('no-events');
        document.getElementById('menuContent').classList.remove('blur');
        closePopOutDiv(document.getElementById('otherTaskTypeForm')); 
        menuList =  document.getElementById('menuContentList').querySelectorAll('li');
        allSections = document.querySelectorAll('section');
        document.getElementById('addTaskListItem').value = menuList.length;
        showMenuContent();
    }

    function activateUIElts (e) {
        if (e?.target.matches('#menuContent') && (innerWidth > 600)) {
            return 0;
        }
        document.querySelector('aside').classList.add('hidden_menu');
        allSections.forEach(section => {
            section.classList.remove('blur')
        });
        document.querySelector('header').classList.remove('blur');
        document.getElementById('navIcon').classList.remove('no-events');
        document.getElementById('menuContentList').classList.remove('no-events');
        document.getElementById('menuContent').classList.remove('blur');
        document.removeEventListener('mousedown',activateUIElts);
        menuList[menuList.length - 1].removeEventListener('mouseover',removingDocListenerToAddOtherTypeTask);
        if (document.getElementById('otherTaskTypeForm')) {
            closePopOutDiv(document.getElementById('otherTaskTypeForm'));          
        }
    }

    //disactivate UI elts when pop out msg or aside bar are on the show
    function disactivateUIElts (bool = false) {
        allSections.forEach(section => {
            section.classList.add('blur');
        });
        document.querySelector('header').classList.add('blur');
        document.getElementById('navIcon').classList.add('no-events');
        if (bool) {
            document.getElementById('menuContentList').classList.add('no-events');
            document.getElementById('menuContent').classList.add('blur');
        }
    }

    //to show the currently selected page
    function taskTypeLoadingSection (e) {
        if (e.target.parentElement.value < menuList.length) {
            for (let i = 0; i < allSections.length; i++) {
                if (i === e.target.parentElement.value) {
                    activeSection = i;
                    allSections[i].classList.remove('hidden');
                    addTaskBtns[i].addEventListener('click',toAddATask);
                }
                else {
                    allSections[i].classList.add('hidden');
                    addTaskBtns[i].removeEventListener('click',toAddATask);
                }
            }
        }
        else {
            insertingOtherTaskTypeUI();
        }
    }

    //to add new task type or dismiss to add it
    function toAddNewTaskTypeOrDismiss (e) {
        switch(e.target.value) {
            case 'Dismiss':
                closePopOutDiv(document.getElementById('otherTaskTypeForm'));
            break;
            case 'Submit':
                toAddAnotherTaskType();
            break;
        }
    }

    //to add new task type
    function toAddAnotherTaskType () {
        
        //first list item is created
        if (!document.getElementById('inputAnotherTypeOfTask').value) {
            alert("Enter the name of your task type please!");
            return 0;
        }
        const newTaskType = crudTask.addingNewTaskType(document.getElementById('inputAnotherTypeOfTask').value);
        if (typeof newTaskType === 'string') {
            alert(newTaskType);
            return 0;
        }
        if (!crudTask.objectSearch(document.getElementById('inputAnotherTypeOfTask').value)) {
            alert('Unexpected error while trying to add the new task please try again!')
            return 0;
        }
        const li = document.createElement('li');
        li.className = 'addedTaskType';
        li.value = crudTask.objectSearch(newTaskType.taskTitle);
        li.innerHTML = 
            `
                <span class="task">${newTaskType.taskTitle}</span><span class="taskCount">0</span>
                <div class="otherTaskTypeBtnsDiv">
                    <select class="addedTaskSelectManipulation">
                        <option value="none">Manipulate Task</option>
                        <option value="Rename">Rename Task</option>
                        <option value="Delete">Delete Task</option>
                    </select>            
                </div>
            `;
        document.getElementById('menuContentList').insertBefore(li,menuList[menuList.length - 1]);
        document.querySelectorAll('.otherTaskTypeBtnsDiv').forEach(taskTypeBtnsDiv => {
            taskTypeBtnsDiv.addEventListener('mousedown',removeDocListenerForAddedTaskManipulation);
        })
        document.querySelectorAll('.otherTaskTypeBtnsDiv').forEach(taskTypeBtnsDiv => {
            taskTypeBtnsDiv.querySelectorAll('select').forEach(select => {
                select.addEventListener('change',addedTaskTypeDOMManipulation);
            })
        })

        activeUIEltsAfterAddingNewTaskType();

        //second section is created
        const section = document.createElement('section');
        section.className = 'tasks hidden';
        section.innerHTML = 
            `
            <h2>${newTaskType.taskTitle}</h2>
            <form id="form">
                <textarea placeholder="Enter your task here"></textarea>
                <input type="date" name="deadlineDate">
                <input type="submit" value="+" class="addTask">
            </form>
            <div></div>
            `
        document.querySelector('main').append(section);
        allSections = document.querySelectorAll('section');
        addTaskBtns = document.querySelectorAll('.addTask');
    }

    //removing docListener to help user rename or delete an addedTaskType #manipulate the addedTaskType
    function removeDocListenerForAddedTaskManipulation (e) {
        document.removeEventListener('mousedown',activateUIElts);
        document.querySelectorAll('.otherTaskTypeBtnsDiv').forEach(taskTypeBtnsDiv => {
            taskTypeBtnsDiv.addEventListener('mouseout',addDocListenerForAddedTaskManipulation);
        })
       
        document.querySelectorAll('.otherTaskTypeBtnsDiv').forEach(taskTypeBtnsDiv => {
            taskTypeBtnsDiv.removeEventListener('mouseover',removeDocListenerForAddedTaskManipulation);
        })

        if (!e.target.parentElement.parentElement.matches('#menuContentList')) {
            e.target.parentElement.parentElement.removeEventListener('mousedown',taskTypeLoadingSection);
        }
    }

    //adding back the docListner the opposite of the above function
    function addDocListenerForAddedTaskManipulation (e) {
        document.addEventListener('mousedown',activateUIElts);
        document.querySelectorAll('.otherTaskTypeBtnsDiv').forEach(taskTypeBtnsDiv => {
            taskTypeBtnsDiv.addEventListener('mouseover',removeDocListenerForAddedTaskManipulation);
        })

        document.querySelectorAll('.otherTaskTypeBtnsDiv').forEach(taskTypeBtnsDiv => {
            taskTypeBtnsDiv.removeEventListener('mouseout',addDocListenerForAddedTaskManipulation);
        })

        if (!e.target.parentElement.parentElement.matches('#menuContentList')) {
            e.target.parentElement.parentElement.addEventListener('mousedown',taskTypeLoadingSection);
        }
    }


    //to manipulate by changing an addedTaskType name or deleting it
    function addedTaskTypeDOMManipulation (e) {
        addDocListenerForAddedTaskManipulation(e);
        //example if addedTaskType is Lonely Lion, This is the DOM traversal from rename/delete addedTaskType buttons towards the innerText of 'Lonely Lion'
        const taskTypeTitle = e.target.parentElement.previousElementSibling.previousElementSibling.innerText;
        switch(e.target.value) {
            case 'Rename':
                renamingAddedTaskType(taskTypeTitle);
            break;
            case 'Delete':
                const index = crudTask.objectSearch(taskTypeTitle);
                deleteOrDismissAddedTaskType(index,taskTypeTitle);
            break;
        }
     //back to the inital select
     e.target.innerHTML = 
            `   <option value="none">Manipulate Task</option>
                <option value="Rename">Rename Task</option>
                <option value="Delete">Delete Task</option>
            `
    }

    function renamingAddedTaskType(taskTypeTitle) {
        const otherTaskTypeForm = document.createElement('form');
        const h3Oldname = document.createElement('h3');
        UIDOMFormOtherTaskType(otherTaskTypeForm);
        h3Oldname.innerHTML = 
            `
            <span>Old Name: </span><br><span> ${taskTypeTitle}</span>
            `
        otherTaskTypeForm.insertAdjacentElement('afterbegin',h3Oldname);
        otherTaskTypeForm.addEventListener('mouseover',removeDocListenerForAddedTaskManipulation);
        otherTaskTypeForm.querySelector('#buttons').addEventListener('click',renameOrDismiss);
    }
    function renameOrDismiss (e) {
        switch(e.target.value) {
            case 'Submit':
                if(!document.getElementById('inputAnotherTypeOfTask').value) {
                    alert('Enter the name of your task type please!');
                    return 0;
                }
                const renamedTask = crudTask.renamingAddedTaskType(e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.children[2].innerText,document.getElementById('inputAnotherTypeOfTask').value);
                if (typeof renamedTask === 'string') {
                    alert(renamedTask);
                    return;
                }
                const index = crudTask.objectSearch(renamedTask.taskTitle);
                allSections[index].children[0].innerText = renamedTask.taskTitle;
                menuList[index].children[0].innerText = renamedTask.taskTitle;
                activeUIEltsAfterAddingNewTaskType();
            break;
            case 'Dismiss':
                closePopOutDiv(document.getElementById('otherTaskTypeForm'));
            break;
        }
    }

    //function to delete or dismiss an already added task
    function deleteOrDismissAddedTaskType (index,taskTitle) {
        const deleteAddedTaskDiv = document.createElement('div');
        deleteAddedTaskDiv.setAttribute('id','ifSureToDelete');
        deleteAddedTaskDiv.innerHTML = deleteForm();
        deleteAddedTaskDiv.children[0].children[0].innerText = `Are you sure you want to delete task: `;   
        deleteAddedTaskDiv.children[0].children[1].innerText =  taskTitle;
        deleteAddedTaskDiv.children[1].innerText = ` ${index + 1}`;
        deleteAddedTaskDiv.children[2].remove();
        document.querySelector('main').append(deleteAddedTaskDiv);
        disactivateUIElts(true);
        deleteAddedTaskDiv.querySelector('div').addEventListener('click',finalChoiceToDeleteOrDismissAddedTaskType);
        deleteAddedTaskDiv.addEventListener('mousemove',removeDocListenerForAddedTaskManipulation);
    }

    function finalChoiceToDeleteOrDismissAddedTaskType (e) {
        switch(e.target.value) {
            case 'Yes':
                deleteAddedTaskType(e.target.parentElement.previousElementSibling.previousElementSibling.children[1].innerText);
            break;
            case 'No':
                closePopOutDiv(document.getElementById('ifSureToDelete'));
            break;
        }
    }

    function deleteAddedTaskType (taskTitle) {
        const deletedIndex = crudTask.deleteAddedTaskType(taskTitle);
        for (let i = deletedIndex + 1; i < menuList.length - 1 ; i++) {
            menuList[i].value -= 1; 
        }
        menuList[deletedIndex].remove();
        menuList = document.getElementById('menuContentList').querySelectorAll('li');
        menuList[menuList.length - 1].value = menuList.length;
        allSections[deletedIndex].remove();
        allSections = document.querySelectorAll('section');
        addTaskBtns = document.querySelectorAll('.addTask');
        allAddedTasks = document.querySelectorAll('.theTask');
        closePopOutDiv(document.getElementById('ifSureToDelete'));
        // console.log(menuList);
        // console.log(allSections);
        // console.log(addTaskBtns);
        // console.log(allAddedTasks);
    }

    //to add a task
    function toAddATask (e) {
        e.preventDefault();
        if (!e.target.previousElementSibling.previousElementSibling.value) {
            window.alert("Sorry we can't add an empty task.");
            return;
        }
        if (!e.target.previousElementSibling.value) {
            window.alert("Insert the date to accompilish the taken task please.");
            return;
        }
        const createdTask = crudTask.createTask(allSections[activeSection].children[0].innerText,
            e.target.previousElementSibling.previousElementSibling.value, e.target.previousElementSibling.value)

        e.target.previousElementSibling.previousElementSibling.value = '';
        e.target.previousElementSibling.value = '';

        menuList[activeSection].children[1].innerText = createdTask.lastInputtedIndex;

        const divTaskContainer = allSections[activeSection].querySelector('div');

        if (divTaskContainer.id !== `${allTasksArray[activeSection].taskTitle}`) {
            divTaskContainer.setAttribute('id',`${allTasksArray[activeSection].taskTitle}`);
        }
        divTaskContainer.innerHTML += theTaskToDoDOMManipulation(createdTask.lastInputtedIndex,createdTask.lastInputtedTask.description,createdTask.lastInputtedTask.date);
        allAddedTasks = document.querySelectorAll('.theTask');
        allEmojiButtons = document.querySelectorAll('.emojiButton');
        allEmojiButtons.forEach(emojiButton => {
            emojiButton.addEventListener('click',aTaskManipulation);
        })
    }

    //function to add task to DOM, update DOM task, helps to check the DOM task we're working with ... 
    function theTaskToDoDOMManipulation(index,description,date) {
        return `<article class="theTask">                
                    <div class="taskToDoContainer">
                        <p>${index}</p>
                        <p class="taskTodo">. ${description}</p>
                    </div>
                    <p class="taskDate">Task is to be complited on:<br> ${date}</p>
                    <div class="emojis">
                        <button value = "Task Did" class="emojiButton">✅ Task Did</button>
                        <button value = "Delete Task" class="emojiButton">🗑️ Delete Task</button>
                        <button value = "Edit Task" class="emojiButton">🔃 Edit Task</button>
                    </div>
                </article> 
            `;
    }

    //function to track a theTask class (article) which is equivalent to the key passed /**Each article (theTask) has a unique key */
    function toTrackToDoTask(index) {
        for (let i = 0; i < allAddedTasks.length; i++) {
            if (allAddedTasks[i].children[0].children[0].innerText == index && allAddedTasks[i].parentElement.parentElement === allSections[activeSection]) {
                return allAddedTasks[i];
            }
        }
    }

    function toTrackToDoTaskIndex(index) {
        for (let i = 0; i < allAddedTasks.length; i++) {
            if (parseInt(allAddedTasks[i].children[0].children[0].innerText) == parseInt(index) && allAddedTasks[i].parentElement.parentElement === allSections[activeSection]) {
                return i;
            }
        }
    }

    //function to manipulate the already existing task
    function aTaskManipulation (e) {
        //the nbr which appears first in theTask class article check the returned value from ==> (theTaskToDoDOMManipulation)
        const index = parseInt(e.target.parentElement.previousElementSibling.previousElementSibling.children[0].innerText);
        if (didTasks.length && e.target.value !== 'Task Did') {
            let isIndexDid;
            for (let i = 0; i < didTasks.length; i++) {
                if ((didTasks[i].innerText == allAddedTasks[toTrackToDoTaskIndex(index)].children[0].children[1].innerText) && (allAddedTasks[toTrackToDoTaskIndex(index)].children[0].children[1].classList.contains('taskDid'))) {
                    isIndexDid = true;
                    break;
                }
            }
            if (isIndexDid) {
                window.alert("Sorry this task is marked did! We can't make changes on it.");
                return;
            }
        }
        switch(e.target.value) {
            case 'Task Did':
                toMarkDidTask(index);        
            break;
            case 'Delete Task':
                toDeleteOrIgnoreTask(index,allTasksArray[activeSection].tasksToDoArray[index-1].description,allTasksArray[activeSection].tasksToDoArray[index-1].date);        
            break;
            case 'Edit Task':
                //theTask class DOM Traversal
                toEditOrUpdateTask(index,allTasksArray[activeSection].tasksToDoArray[index-1].description,allTasksArray[activeSection].tasksToDoArray[index-1].date);
            break;
        }
    }

    function toEditOrUpdateTask (taskIndex,taskToDo,dateToAccomplish) {
        const editTaskDiv = document.createElement('div');
        editTaskDiv.setAttribute('id','taskEdition');
        editTaskDiv.innerHTML = `
            <form>
                <h2><span>Task number</span> <span>${taskIndex}</span></h2>
                <textarea>${taskToDo}</textarea>
                <input type="date" name="deadlineDate" value="${dateToAccomplish}">
                <div>
                    <input type="submit" value="Update Task">
                    <input type="button" value="Close Update">
                </div>
            </form>
        `;
        document.querySelector('main').append(editTaskDiv);
        editTaskDiv.querySelector('div').addEventListener('click',finalChoiceEitherEditOrUpdate);
        disactivateUIElts();
    }

    function finalChoiceEitherEditOrUpdate(e) {
        e.preventDefault();
        switch (e.target.value) {
            case 'Close Update':
                closePopOutDiv(document.getElementById('taskEdition'));
            break;
            case 'Update Task':
              const changes = crudTask.editTask(allSections[activeSection].children[0].innerText,
                    parseInt(e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.children[1].innerText)-1,
                    e.target.parentElement.previousElementSibling.previousElementSibling.value,e.target.parentElement.previousElementSibling.value);
                    //the passed arg is the index(key), each of the single task has it's unique one.
              //const theTaskIndex = toTrackToDoTask(e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.children[1].innerText);
              const theTask = toTrackToDoTask(e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.children[1].innerText);
              //if (allAddedTasks[theTaskIndex].parentElement.parentElement === allSections[activeSection]) {
                theTask.children[0].children[1].innerText = `. ${changes.description}`;
                theTask.children[1].innerText = `Task is to be complited on:\n ${changes.date}`;
              //}
                closePopOutDiv(document.getElementById('taskEdition'));  
            break;
        }
    }

    function closePopOutDiv(popOutDiv) {
        popOutDiv.remove();
        activateUIElts();
    }


    function toDeleteOrIgnoreTask (taskIndex,taskToDo,dateToAccomplish) {
        const deleteTaskDiv = document.createElement('div');
        deleteTaskDiv.setAttribute('id','ifSureToDelete');
        deleteTaskDiv.innerHTML = deleteForm();
        deleteTaskDiv.children[0].children[1].innerText = ` ${taskIndex}`;
        deleteTaskDiv.children[1].innerText = taskToDo;
        deleteTaskDiv.children[2].innerText = dateToAccomplish;
        document.querySelector('main').append(deleteTaskDiv);
        deleteTaskDiv.querySelector('div').addEventListener('click',finalChoiceEitherDeleteOrIgnore);
        disactivateUIElts();
    }

    function finalChoiceEitherDeleteOrIgnore (e) {
        e.preventDefault();
        switch(e.target.value) {
            case 'Yes':
                const taskToDelete = crudTask.removeCreatedTask(allSections[activeSection].children[0].innerText, parseInt(e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.children[1].innerText)-1);
                //the passed arg is the index(key), each of the single task has it's unique one.         
                const theTaskIndex = toTrackToDoTaskIndex(e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.children[1].textContent);
                if (allAddedTasks[theTaskIndex].parentElement.parentElement === allSections[activeSection]) {
                    const objectIndex = crudTask.objectSearch(allSections[activeSection].children[0].innerText);
                    menuList[activeSection].children[1].innerText = allTasksArray[objectIndex].tasksToDoArray.length;
                    for (let i = theTaskIndex + 1; i < allAddedTasks.length; i++) {
                        if (allAddedTasks[i].parentElement.parentElement === allSections[activeSection]) {
                        allAddedTasks[i].children[0].children[0].innerText = parseInt(allAddedTasks[i].children[0].children[0].innerText)-1;
                        }
                    }
                }
                allAddedTasks[theTaskIndex].remove();
                allAddedTasks = document.querySelectorAll('.theTask');
                closePopOutDiv(document.getElementById('ifSureToDelete'));  
            break;
            case 'No':
                closePopOutDiv(document.getElementById('ifSureToDelete'));       
            break;
        }
    }

    function deleteForm () {
        return `
            <h2><span>Are you sure you want to delete task</span><span></span>?</h2>
            <p></p>
            <p></p>
            <div id="buttonsToDelete">
                <input type="button" value="Yes">
                <input type="button" value="No">
            </div>
        `
    }

    function toMarkDidTask(taskIndex) {
        const theTask = toTrackToDoTask(taskIndex);
        if (theTask.children[0].children[1].classList.contains('taskDid')) {
            theTask.children[0].children[1].classList.remove('taskDid');
            const theTaskIndexToBeDeleted = didTasks.indexOf(theTask);
            didTasks.splice(theTaskIndexToBeDeleted,1);
        }
        else {
            theTask.children[0].children[1].classList.add('taskDid');
            didTasks.push(theTask.children[0].children[1]);
        }
        allAddedTasks = document.querySelectorAll('.theTask');
    }

    return{showMenuContent};
})()

document.getElementById('navIcon').addEventListener('mouseover',userInterface.showMenuContent);
