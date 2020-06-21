/**
 *
 * @author: 1751358 李澎生
 *
 */
window.addEventListener('load', load);

function $(str) {
    return document.querySelector(str);
}

function $All(str) {
    return document.querySelectorAll(str);
}

let months = ["Jan .", "Feb .", "Mar .", "Apr .", "May .", "Jun .", "Jul .", "Aug .", "Sept .", "Oct .", "Nov .", "Dec ."];
let data = {"filter": "ALL"};

function load() {
    updateTime();
    setInterval(updateTime, 60000);

    $("input.input-todo").addEventListener("focus", onFocus);
    $("input.input-todo").addEventListener("blur", onBlur);
    $(".input-deadline").valueAsDate = new Date();

    $All(".tool-list li a").forEach(element => {
        element.addEventListener("click", filter);
    });

    $(".clear-complete").addEventListener("click", clear);

    $(".input-todo").addEventListener("keyup", add);

    $(".toggle-all").addEventListener("change", completeAll);

    init()
}

/* Update Time */
function updateTime() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();

    $(".day").innerHTML = day < 10 ? "0" + day.toString() : day.toString();
    $(".month").innerHTML = months[month].toString();
    $(".year").innerHTML = year.toString();

    $(".clock").innerHTML = (hour < 10 ? "0" + hour.toString() : hour.toString()) +
        ":" + (minute < 10 ? "0" + minute.toString() : minute.toString());
}

/* Control Input Label */
function onFocus() {
    // console.log(this);
    this.parentElement.querySelector("label.input-label").classList.add("input-label-focused")
}

/* Control Input Label */
function onBlur() {
    if (this.value !== "") {

    } else {
        this.parentElement.querySelector("label.input-label").classList.remove("input-label-focused")
    }

}

/* Change Filter */
function filter() {
    $All(".tool-list li a").forEach(element => {
        element.classList.remove("selected")
    });

    this.classList.add("selected");

    update()
}

/* Add TodoItems*/
function add(event) {
    if (event.key !== "Enter") return null;

    let text = $(".input-todo").value;
    if (text === '') return null;
    $(".input-todo").value = "";

    let currentDate = $(".input-deadline").value;
    console.log(currentDate);
    if (data[currentDate] === undefined)
        data[currentDate] = [[], []];

    let msg = data[currentDate][0];
    data[currentDate][0] = msg.concat([text]);
    let status = data[currentDate][1];
    data[currentDate][1] = status.concat([false]);

    addTodo(currentDate, text);

    flush()
}

function addTodo(currentDate, text, completed=false) {
    let template = document.getElementById(currentDate);
    let info = $("#info-template").cloneNode(true);
    if (!template) {

        template = $("#template").cloneNode(true);
        template.id = currentDate;
        template.querySelector(".item-deadline").innerHTML = currentDate;
        template.classList.remove("none");
    }

    info.id = '';

    info.querySelector(".todo-label").innerHTML = text;

    info.querySelector(".delete").addEventListener("click", function () {
        let parent = info.parentNode;
        let index = findInParent(parent, info);
        data[currentDate][0].splice(index, 1);
        data[currentDate][1].splice(index, 1);

        parent.removeChild(info);
        if (parent.childElementCount <= 1) {
            $(".item-box").removeChild(parent.parentNode.parentNode);
            delete data[currentDate]
        }

        flush();
    });

    if (completed){
        info.querySelector(".toggle").checked = true;
        info.querySelector(".todo-label").classList.add("label-completed");
    }

    info.querySelector(".toggle").addEventListener("change", function () {
        if (this.checked) {
            info.querySelector(".todo-label").classList.add("label-completed");
            let count = parseInt($(".todo-count").innerHTML.split(' ')[1]);
            count -= 1;
            $(".todo-count").innerHTML = " " + count.toString() + "  todo";
        } else {
            info.querySelector(".todo-label").classList.remove("label-completed");
            let count = parseInt($(".todo-count").innerHTML.split(' ')[1]);
            count += 1;
            $(".todo-count").innerHTML = " " + count.toString() + "  todo";
        }

        let index = findInParent(info.parentNode, info);
        console.log(index);
        data[currentDate][1][index] = this.checked;

        flush()

    });

    info.querySelector(".todo-label").addEventListener("dbclick", function () {


        flush()
    });


    info.classList.remove("none");

    template.querySelector(".item-list").insertBefore(info, template.querySelector(".item-list").firstChild);
    $(".item-box").appendChild(template);

    if (!completed){
        let count = parseInt($(".todo-count").innerHTML.split(' ')[1]);
        count += 1;
        $(".todo-count").innerHTML = " " + count.toString() + "  todo";
    }
}

/* Update Item List */
function update() {
    let filter = $(".tool-list li a.selected").innerHTML;
    data.filter = filter;
    flush();

    switch (filter) {
        case "ALL":
            $All(".box").forEach(box => {
                if(box.id !== "template"){
                    box.classList.remove("none");
                    box.querySelectorAll(".item-info").forEach(info => {
                        if(info.id !== "info-template"){
                            info.classList.remove("none");
                        }
                    });
                }
            });
            break;
        case "ONGOING":
            $All(".box").forEach(box => {
                if(box.id !== "template"){
                    // box.classList.remove("none");
                    let infos = box.querySelectorAll(".item-info");
                    let count = infos.length - 1;
                    infos.forEach(info => {
                        if(info.id !== "info-template"){
                            if (info.querySelector(".toggle").checked){
                                info.classList.add("none");
                                count -= 1;
                            } else {
                                info.classList.remove("none");
                            }
                        }
                    });
                    if (count <= 0){
                        box.classList.add("none")
                    } else {
                        box.classList.remove("none")
                    }
                }
            });
            break;
        case "COMPLETED":
            $All(".box").forEach(box => {
                if(box.id !== "template"){
                    // box.classList.remove("none");
                    let infos = box.querySelectorAll(".item-info");
                    let count = infos.length - 1;
                    infos.forEach(info => {
                        if(info.id !== "info-template"){
                            if (info.querySelector(".toggle").checked){
                                info.classList.remove("none");
                            } else {
                                info.classList.add("none");
                                count -= 1;
                            }
                        }
                    });
                    if (count <= 0){
                        box.classList.add("none")
                    } else {
                        box.classList.remove("none")
                    }
                }
            });
            break;
    }
}

/* Complete All*/
function completeAll() {
    let checked = this.checked;
    let infos = $All(".item-info").forEach(element => {
        if (element.id !== "info-template") {
            element.querySelector(".toggle").checked = checked;
            if (checked) {
                element.querySelector(".todo-label").classList.add("label-completed")
            } else {
                element.querySelector(".todo-label").classList.remove("label-completed")
            }
        }
    });

    for (let key in data) {
        if (key !== 'filter') {
            for (let i = 0; i < data[key][1].length; ++i){
                data[key][1][i] = checked;
            }
        }
    }

    if (checked) {
        $(".todo-count").innerHTML = " 0" + "  todo"
    } else {
        let count = $All(".item-info").length - $All(".box").length;
        console.log(count);
        $(".todo-count").innerHTML = " " + count.toString() + "  todo"
    }

    flush();
}

/* Clear Completed Item */
function clear() {
    let items = $All(".item-info").forEach(element => {
        if (element.querySelector(".todo-label").classList.contains("label-completed")) {
            if (element.id !== "info-template")
                element.parentNode.removeChild(element);
        }
    });

    let block = $All(".box").forEach(element => {
        if (element.querySelector(".item-list").childElementCount <= 1) {
            if (element.id !== "template") {
                $(".item-box").removeChild(element);
            }
        }
    });

    for (let key in data) {
        if (key !== 'filter') {
            for (let i = 0; i < data[key][1].length; ++i) {

                if (data[key][1][i]) {

                    data[key][0].splice(i, 1);
                    data[key][1].splice(i, 1);
                    --i;
                }
            }
        }
    }

    flush();
}

/* flush Data*/
function flush() {
    window.localStorage.setItem("TODO", JSON.stringify(data))
}

function init() {
    if(window.localStorage.getItem("TODO")){
        data = JSON.parse(window.localStorage.getItem("TODO"));
        let filter = data.filter;

        $All(".tool-list li a").forEach(element => {
            element.classList.remove("selected")
        });

        $("." + filter.toLowerCase()).classList.add("selected");

        for (let dataKey in data) {
            if (dataKey !== "filter"){
                let list = data[dataKey];
                let length = list[0].length;
                for (let i = 0; i < length; ++i){
                    addTodo(dataKey, list[0][i], list[1][i]);
                }
            }
        }

        update()
    }

}

function findInParent(parent, child) {
    let childrenList = parent.children;
    let i = 0;
    for (; i < parent.childElementCount; ++i) {
        if (child.isEqualNode(childrenList[i])) {
            break;
        }
    }

    return i >= parent.childElementCount ? -1 : (parent.childElementCount - i - 2);
}