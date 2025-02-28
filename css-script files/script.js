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
        const objectIndex = objectSearch(taskTitle);
        allTasksArray[objectIndex].addATask(description,date);
        return allTasksArray[objectIndex].latestTask();
    }
    
    //function to update or edit task
    function editTask (taskTitle,taskIndex,description,date) {
        const objectIndex = objectSearch(taskTitle);
        allTasksArray[objectIndex].editATask(taskIndex,description,date);
        return allTasksArray[objectIndex].tasksToDoArray[taskIndex];
    }

//--->/*Function to mark a task done*/

    //function to delete a created task
    function removeCreatedTask (taskTitle,taskIndex) {
        const objectIndex = objectSearch(taskTitle);
        allTasksArray[objectIndex].deleteATask(taskIndex);
        return allTasksArray[objectIndex];
    }

    //adding a new task type (object) in allTasksArray
    function addingNewTaskType (nameOfTaskType) {
        allTasksArray.push(new taskConstructor(nameOfTaskType));
        return allTasksArray;
    }

    //removing the added task type not default
    function deleteAddedTaskType (nameOfTaskType) {
        const addedTaskType = objectSearch (nameOfTaskType);
        const deleted = allTasksArray[addedTaskType].splice(addedTaskType,1);
        return `Task ${deleted} Deleted SuccesFully`;
    }


    //searching for the object's index according to it's name/task title
    function objectSearch (taskTitle) {
        for (i = 0; i < allTasksArray.length; i++) {
            if (allTasksArray[i].taskTitle === taskTitle) {
                return i;
            }
        }
    }

    return {createTask,editTask,removeCreatedTask,addingNewTaskType,deleteAddedTaskType,objectSearch};
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
            menuList.forEach(listItem=> {
                listItem.addEventListener('mousedown',taskTypeLoadingSection);
            })
            disactivateUIElts();
        }
    }

    function activateUIElts () {
        document.querySelector('aside').classList.add('hidden_menu');
        allSections.forEach(section => {
            section.classList.remove('blur')
        });
        document.querySelector('header').classList.remove('blur');
        document.getElementById('navIcon').classList.remove('no-events');
        document.removeEventListener('mousedown',activateUIElts);
    }

    //disactivate UI elts when pop out msg or aside bar are on the show
    function disactivateUIElts () {
        allSections.forEach(section => {
            section.classList.add('blur');
        });
        document.querySelector('header').classList.add('blur');
        document.getElementById('navIcon').classList.add('no-events');
    }

    //to show the currently selected page
    function taskTypeLoadingSection (e) {
        for (let i = 0; i < menuList.length; i++) {
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
            e.target.previousElementSibling.previousElementSibling.value, e.target.previousElementSibling.value);
            e.target.previousElementSibling.previousElementSibling.value = '';
            e.target.previousElementSibling.value = '';

            menuList[activeSection].children[1].innerText = createdTask.lastInputtedIndex;

            const divTaskContainer = allSections[activeSection].querySelector('div');

            if (!divTaskContainer.matches(`#${allTasksArray[activeSection].taskTitle}`)) {
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
            if (allAddedTasks[i].children[0].children[0].innerText == index && allAddedTasks[i].parentElement.parentElement === allSections[activeSection]) {
                return i;
            }
        }
    }

    //function to manipulate the already existing task
    function aTaskManipulation (e) {
        //the nbr which appears first in theTask class article check the returned value from ==> (theTaskToDoDOMManipulation)
        const index = parseInt(e.target.parentElement.previousElementSibling.previousElementSibling.children[0].innerText);
        if (didTasks.length && e.target.value !== 'Task Did') {
            let  isIndexDid;
            if (allAddedTasks[toTrackToDoTaskIndex(index)].parentElement.parentElement === allSections[activeSection]) {
                isIndexDid = didTasks.includes(allAddedTasks[toTrackToDoTaskIndex(index)]);
                console.log(didTasks);
            }

            console.log(allAddedTasks);


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
        deleteTaskDiv.innerHTML = `
            <h2><span>Are you sure you want to delete task</span><span>${taskIndex}</span>?</h2>
            <p>${taskToDo}</p>
            <p>${dateToAccomplish}</p>
            <div id="buttonsToDelete">
                <input type="button" value="Yes">
                <input type="button" value="No">
            </div>
        `;
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
                const theTaskIndex = toTrackToDoTaskIndex(e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.children[1].innerText);
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

    function toMarkDidTask(taskIndex) {
        const theTask = toTrackToDoTask(taskIndex);
        if (theTask.children[0].children[1].classList.contains('taskDid')) {
            theTask.children[0].children[1].classList.remove('taskDid');
            const theTaskIndexToBeDeleted = didTasks.indexOf(theTask);
            didTasks.splice(theTaskIndexToBeDeleted,1);
        }
        else {
            theTask.children[0].children[1].classList.add('taskDid');
            didTasks.push(theTask);
        }
        allAddedTasks = document.querySelectorAll('.theTask');
        console.log(didTasks);
        console.log(allAddedTasks);
    }

    return{showMenuContent};
})()

document.getElementById('navIcon').addEventListener('click',userInterface.showMenuContent);
