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
let color = ["#fa4834", "#e98f36", "#afcd50", "#87a7d6"];

function load() {
    updateTime();
    setInterval(updateTime, 1000);

    $(".todo-logo").addEventListener("click", function () {
        console.log("click");
        let link = document.head.querySelector("link");
        console.log(link);
        let href = link.href;
        if (href.search("/style.css") > 0){
            link.href = "./css/style-dark.css";
        }else{
            link.href = "./css/style.css";
        }
    });

    $("input.input-todo").addEventListener("focus", onFocus);
    $("input.input-todo").addEventListener("blur", onBlur);
    $(".input-deadline").valueAsDate = new Date();

    $All(".tool-list li a").forEach(element => {
        element.addEventListener("click", filter);
    });

    $(".clear-complete").addEventListener("click", clear);

    $(".input-todo").addEventListener("keyup", add);

    $(".toggle-all").addEventListener("change", completeAll);

    init();

    let viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'initial-scale=2,maximum-scale=1,user-scalable=no, width=device-width';
    document.head.appendChild(viewport);

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

    $(".toggle-all").checked = false;

    flush()
}

/* Add TodoItems*/
function addTodo(currentDate, text, completed=false) {
    let template = document.getElementById(currentDate);
    let info = $("#info-template").cloneNode(true);
    if (!template) {

        template = $("#template").cloneNode(true);
        template.id = currentDate;
        template.querySelector(".item-deadline").innerHTML = currentDate;
        template.classList.remove("none");
    }

    if (IsPC()){
        template.addEventListener("mousedown", dragHandler.start_box, false);
    } else {
        template.addEventListener("touchstart", TouchHandler_box.start, false);
    }

    let left = diff(currentDate) < 0 ? 0 : diff(currentDate);
    if (left <= 3){
        template.querySelector(".item-deadline").style.backgroundColor = color[left];
        info.querySelector(".toggle").classList.add("toggle" + left)

    }

    info.id = '';

    info.querySelector(".todo-label").innerHTML = text;

    info.querySelector(".delete").addEventListener("click", function () {
        let parent = info.parentNode;
        let index = findInParent(parent, info);
        data[currentDate][0].splice(index, 1);
        data[currentDate][1].splice(index, 1);

        let count = parseInt($(".todo-count").innerHTML.split(' ')[1]);
        count -= 1;
        $(".todo-count").innerHTML = " " + count.toString() + "  todo";

        parent.removeChild(info);
        if (parent.childElementCount <= 1) {
            $(".item-box").removeChild(parent.parentNode.parentNode);
            delete data[currentDate]
        }

        flush();
    });

    info.querySelector(".edit-button").addEventListener("click", function () {
        info.classList.add("editing");

        let edit =document.createElement("input");
        edit.setAttribute("type", "text");
        edit.setAttribute("class", "edit");
        edit.setAttribute("value", this.parentNode.querySelector(".todo-label").innerHTML);

        function editFinish(){
            info.removeChild(edit);
            info.classList.remove("editing");
        }

        edit.addEventListener("blur", function () {
            info.querySelector(".todo-label") .innerHTML = this.value;

            flush();

            editFinish();
        });

        edit.addEventListener("keyup", function (event) {
            if (event.key === "Enter"){
                info.querySelector(".todo-label") .innerHTML = this.value;

                flush();
                editFinish();

            } else if (event.key === "Esc"){
                editFinish();
            }
        }, false);

        info.appendChild(edit);
        edit.focus()
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
            if (count <= 0){
                $(".toggle-all").checked = this.checked;
            }
        } else {
            info.querySelector(".todo-label").classList.remove("label-completed");
            let count = parseInt($(".todo-count").innerHTML.split(' ')[1]);
            count += 1;
            $(".todo-count").innerHTML = " " + count.toString() + "  todo";
            $(".toggle-all").checked = this.checked;
        }

        let index = findInParent(info.parentNode, info);
        console.log(index);
        data[currentDate][1][index] = this.checked;

        flush()

    });

    /* Refer to the code of TodoMVC */
    info.querySelector(".todo-label").addEventListener("dblclick", function () {
        console.log("dblclick");
        info.classList.add("editing");

        let edit =document.createElement("input");
        edit.setAttribute("type", "text");
        edit.setAttribute("class", "edit");
        edit.setAttribute("value", this.innerHTML);

        function editFinish(){
            info.removeChild(edit);
            info.classList.remove("editing");
        }

        edit.addEventListener("blur", function () {
            info.querySelector(".todo-label") .innerHTML = this.value;

            flush();

            editFinish();
        });

        edit.addEventListener("keyup", function (event) {
            if (event.key === "Enter"){
                info.querySelector(".todo-label") .innerHTML = this.value;

                flush();
                editFinish();

            } else if (event.key === "Esc"){
                editFinish();
            }
        }, false);

        info.appendChild(edit);
        edit.focus()
    });


    if (IsPC()){
        info.addEventListener("mousedown", dragHandler.start, false);
    }else{
        info.addEventListener("touchstart", TouchHandler.start, false);
    }


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
        case "ON":
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

    $(".toggle-all").checked = false;

    flush();
}

/* flush Data*/
function flush() {
    window.localStorage.setItem("TODO", JSON.stringify(data))
}

/* Init With LocalStorage */
function init() {
    if(window.localStorage.getItem("TODO")){
        data = JSON.parse(window.localStorage.getItem("TODO"));
        let filter = data.filter;

        $All(".tool-list li a").forEach(element => {
            element.classList.remove("selected")
        });

        $("." + filter.toLowerCase()).classList.add("selected");

        let all = true;
        for (let dataKey in data) {
            if (dataKey !== "filter"){
                let list = data[dataKey];
                let length = list[0].length;
                for (let i = 0; i < length; ++i){
                    addTodo(dataKey, list[0][i], list[1][i]);
                    if (all){
                        all = list[1][i]
                    }
                }
            }
        }

        $(".toggle-all").checked = all;

        update()
    }

}

/* Return Index Of the child in parent  */
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

/* Calculate Day */
function diff(date) {
    let deadline = new Date(Date.parse(date));
    let today = new Date();
    deadline = deadline.getTime();
    today = today.getTime();

    return parseInt((deadline - today) / 1000 / 3600 / 24);
}

/* Calculate Position Y*/
function getPosY (element){
    let actualTop = element.offsetTop;
    let current = element.offsetParent;
    while (current !== null){
        actualTop += (current.offsetTop + current.clientTop);
        current = current.offsetParent;
    }
    let elementScrollTop;
    if (document.compatMode === "BackCompat"){
        elementScrollTop=document.body.scrollTop;
    } else {
        elementScrollTop=document.documentElement.scrollTop;
    }
    return actualTop - elementScrollTop;
}

/* PC or mobile*/
/**
 * @return {boolean}
 */
function IsPC() {
    let userAgentInfo = navigator.userAgent;
    let Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    let flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

/* Drag Manager*/
let posX;
let posy;
let drag;
let drag_box;
let dragObj;
let dragObj_box;
let originX;
let originY;

dragHandler = {
    start: function(event) {
        event.stopPropagation();

        drag = true;
        posX = event.x;
        posy = event.y;

        originY = getPosY(this);

        dragObj = this;
        this.style.zIndex = "3";
        // console.log(posX, posy);
        this.addEventListener("mousemove", dragHandler.move, false);
        this.addEventListener("mouseup", dragHandler.end, false);
        this.addEventListener("mouseleave", dragHandler.end, false);
    },
    start_box: function(event) {
        event.stopPropagation();
        drag = true;
        posX = event.x;
        posy = event.y;

        originY = getPosY(this);

        dragObj = this;
        this.style.zIndex = "3";
        // console.log(posX, posy);
        this.addEventListener("mousemove", dragHandler.move_box, false);
        this.addEventListener("mouseup", dragHandler.end_box, false);
        this.addEventListener("mouseleave", dragHandler.end_box, false);
    },
    move: function(event) {
        event.stopPropagation();
        if (drag){
            // console.log(this);
            let offsetX = event.x - posX;
            let offsetY = event.y - posy;
            // console.log(this.left);
            let left = parseFloat(this.style.left || 0) + offsetX;
            let top = parseFloat(this.style.top || 0) + offsetY;

            let eles = document.elementsFromPoint(event.x, event.y);
            let diff = 0;
            for(let x of eles){
                if (x.classList.contains("item-info") && x !== dragObj){
                    let newY = getPosY(x);
                    if(newY + x.clientHeight / 2 <= event.y && newY > originY){
                        diff = newY - originY;
                        originY = newY;

                        dragObj.parentNode.insertBefore(x, dragObj);

                        /* Change in data */
                        let currentDate1 = x.parentNode.parentNode.parentNode.id;
                        let currentDate2 = dragObj.parentNode.parentNode.parentNode.id;
                        let index1 = findInParent(x.parentNode, x);
                        let index2 = findInParent(dragObj.parentNode, dragObj);
                        console.log(currentDate2, currentDate1, index2, index1);

                        let msg = data[currentDate1][0][index1];
                        let completed = data[currentDate2][1][index1];

                        data[currentDate1][0].splice(index1, 1);
                        data[currentDate1][1].splice(index1, 1);

                        data[currentDate2][0].splice(index2, 0, msg);
                        data[currentDate2][1].splice(index2, 0, completed);

                        break;
                    }
                    if(newY + x.clientHeight / 2 >= event.y && newY < originY){
                        diff = newY - originY;
                        originY = newY;

                        dragObj.parentNode.insertBefore(dragObj, x);

                        let currentDate2 = x.parentNode.parentNode.parentNode.id;
                        let currentDate1 = dragObj.parentNode.parentNode.parentNode.id;
                        let index2 = findInParent(x.parentNode, x);
                        let index1 = findInParent(dragObj.parentNode, dragObj);
                        console.log(currentDate2, currentDate1, index2, index1);
                        let msg = data[currentDate1][0][index1];
                        let completed = data[currentDate2][1][index1];

                        data[currentDate1][0].splice(index1, 1);
                        data[currentDate1][1].splice(index1, 1);

                        data[currentDate2][0].splice(index2, 0, msg);
                        data[currentDate2][1].splice(index2, 0, completed);
                        break;
                    }
                }
            }
            flush();

            this.style.left = left + "px";
            this.style.top = top - diff + "px";

            posX = event.x;
            posy = event.y;
        }
    },
    move_box: function(event) {
        event.stopPropagation();
        if (drag){
            // console.log(this);
            let offsetX = event.x - posX;
            let offsetY = event.y - posy;
            // console.log(this.left);
            let left = parseFloat(this.style.left || 0) + offsetX;
            let top = parseFloat(this.style.top || 0) + offsetY;

            let eles = document.elementsFromPoint(event.x, event.y);
            let diff = 0;
            for(let x of eles){
                if (x.classList.contains("box") && x !== dragObj){
                    let newY = getPosY(x);
                    if(newY + x.clientHeight / 2 <= event.y && newY > originY){
                        diff = newY - originY;
                        originY = newY;

                        dragObj.parentNode.insertBefore(x, dragObj);

                        /* Change in data */
                        // let currentDate1 = x.parentNode.parentNode.parentNode.id;
                        // let currentDate2 = dragObj.parentNode.parentNode.parentNode.id;
                        // let index1 = findInParent(x.parentNode, x);
                        // let index2 = findInParent(dragObj.parentNode, dragObj);
                        // console.log(currentDate2, currentDate1, index2, index1);
                        //
                        // let msg = data[currentDate1][0][index1];
                        // let completed = data[currentDate2][1][index1];
                        //
                        // data[currentDate1][0].splice(index1, 1);
                        // data[currentDate1][1].splice(index1, 1);
                        //
                        // data[currentDate2][0].splice(index2, 0, msg);
                        // data[currentDate2][1].splice(index2, 0, completed);

                        break;
                    }
                    if(newY + x.clientHeight / 2 >= event.y && newY < originY){
                        diff = newY - originY;
                        originY = newY;

                        dragObj.parentNode.insertBefore(dragObj, x);

                        // let currentDate2 = x.parentNode.parentNode.parentNode.id;
                        // let currentDate1 = dragObj.parentNode.parentNode.parentNode.id;
                        // let index2 = findInParent(x.parentNode, x);
                        // let index1 = findInParent(dragObj.parentNode, dragObj);
                        // console.log(currentDate2, currentDate1, index2, index1);
                        // let msg = data[currentDate1][0][index1];
                        // let completed = data[currentDate2][1][index1];
                        //
                        // data[currentDate1][0].splice(index1, 1);
                        // data[currentDate1][1].splice(index1, 1);
                        //
                        // data[currentDate2][0].splice(index2, 0, msg);
                        // data[currentDate2][1].splice(index2, 0, completed);
                        break;
                    }
                }
            }
            flush();

            this.style.left = left + "px";
            this.style.top = top - diff + "px";

            posX = event.x;
            posy = event.y;
        }
    },
    end: function(event) {
        event.stopPropagation();
        drag = false;
        this.style.zIndex = "2";

        this.removeEventListener('mouseup', dragHandler.end, false);
        this.removeEventListener('mousemove', dragHandler.move, false);
        dragObj = null;

        let eles = document.elementsFromPoint(event.x, event.y);
        let inside = false;
        for (let x of eles){
            if (x.classList.contains("box")){
                inside = true;
            }
        }
        if (inside){
            this.style.top = "0";
            this.style.left = "0";
        }else{
            this.querySelector(".delete").click();
        }
    },
    end_box: function(event) {
        event.stopPropagation();
        drag = false;
        this.style.zIndex = "2";

        this.removeEventListener('mouseup', dragHandler.end, false);
        this.removeEventListener('mousemove', dragHandler.move, false);
        dragObj = null;

        // let eles = document.elementsFromPoint(event.x, event.y);
        let inside = true;
        // for (let x of eles){
        //     if (x.classList.contains("box")){
        //         inside = true;
        //     }
        // }
        if (inside){
            this.style.top = "0";
            this.style.left = "0";
        }else{
            this.querySelector(".delete").click();
        }
    },
};

TouchHandler = {
    start: function(event) {
        // console.log(event.type + "1");
        event.stopPropagation();
        drag = true;
        posX = event.touches[0].clientX;
        posy = event.touches[0].clientY;

        originY = getPosY(this);

        dragObj = this;
        this.style.zIndex = "3";
        // console.log(posX, posy);
        this.addEventListener("touchmove", TouchHandler.move, false);
        this.addEventListener("touchend", TouchHandler.end, false);
        this.addEventListener("touchcancel", TouchHandler.end, false);
    },
    move: function(event) {
        event.stopPropagation();
        event.preventDefault();
        if (drag){
            // console.log("move");
            let offsetX = event.touches[0].clientX - posX;
            let offsetY = event.touches[0].clientY - posy;
            // console.log(this.left);
            let left = parseFloat(this.style.left || 0) + offsetX;
            let top = parseFloat(this.style.top || 0) + offsetY;

            let eles = document.elementsFromPoint(event.touches[0].clientX, event.touches[0].clientY);
            let diff = 0;
            for(let x of eles){
                if (x.classList.contains("item-info") && x !== dragObj &&
                    x.parentNode.parentNode.parentNode.id === dragObj.parentNode.parentNode.parentNode.id){
                    console.log(x.parentNode.parentNode.parentNode.id);
                    console.log(dragObj.parentNode.parentNode.parentNode.id);
                    let newY = getPosY(x);
                    if(newY + x.clientHeight / 2 <= event.touches[0].clientY && newY > originY){
                        diff = newY - originY;
                        originY = newY;

                        dragObj.parentNode.insertBefore(x, dragObj);

                        /* Change in data */
                        let currentDate1 = x.parentNode.parentNode.parentNode.id;
                        let currentDate2 = dragObj.parentNode.parentNode.parentNode.id;
                        let index1 = findInParent(x.parentNode, x);
                        let index2 = findInParent(dragObj.parentNode, dragObj);
                        console.log(currentDate2, currentDate1, index2, index1);

                        let msg = data[currentDate1][0][index1];
                        let completed = data[currentDate2][1][index1];

                        data[currentDate1][0].splice(index1, 1);
                        data[currentDate1][1].splice(index1, 1);

                        data[currentDate2][0].splice(index2, 0, msg);
                        data[currentDate2][1].splice(index2, 0, completed);

                        break;
                    }
                    if(newY + x.clientHeight / 2 >= event.touches[0].clientY && newY < originY){
                        diff = newY - originY;
                        originY = newY;

                        dragObj.parentNode.insertBefore(dragObj, x);

                        let currentDate2 = x.parentNode.parentNode.parentNode.id;
                        let currentDate1 = dragObj.parentNode.parentNode.parentNode.id;
                        let index2 = findInParent(x.parentNode, x);
                        let index1 = findInParent(dragObj.parentNode, dragObj);
                        console.log(currentDate2, currentDate1, index2, index1);
                        let msg = data[currentDate1][0][index1];
                        let completed = data[currentDate2][1][index1];

                        data[currentDate1][0].splice(index1, 1);
                        data[currentDate1][1].splice(index1, 1);

                        data[currentDate2][0].splice(index2, 0, msg);
                        data[currentDate2][1].splice(index2, 0, completed);
                        break;
                    }
                }
            }
            flush();

            this.style.left = left + "px";
            this.style.top = top - diff + "px";

            posX = event.touches[0].clientX;
            posy = event.touches[0].clientY;
        }
    },
    end: function(event) {
        event.stopPropagation();
        console.log(event.type);
        drag = false;
        this.style.zIndex = "2";

        let eles = document.elementsFromPoint(posX, posy);
        let inside = false;
        for (let x of eles){
            if (x.classList.contains("box")){
                inside = true;
            }
        }
        if (inside){
            this.style.top = "0";
            this.style.left = "0";
        }else{
            this.querySelector(".delete").click();
        }


        this.removeEventListener('touchend', TouchHandler.end, false);
        this.removeEventListener('touchmove', TouchHandler.move, false);
        this.removeEventListener("touchcancel", TouchHandler.end, false);
        dragObj = null;


    },
};

TouchHandler_box = {
    start: function(event) {
        // console.log(event.type + "2");
        event.stopPropagation();
        drag_box = true;
        posX = event.touches[0].clientX;
        posy = event.touches[0].clientY;

        originY = getPosY(this);

        dragObj_box = this;
        this.style.zIndex = "3";
        // console.log(posX, posy);
        this.addEventListener("touchmove", TouchHandler_box.move, false);
        this.addEventListener("touchend", TouchHandler_box.end, false);
        this.addEventListener("touchcancel", TouchHandler_box.end, false);
    },
    move: function(event) {
        event.stopPropagation();
        event.preventDefault();
        if (drag_box){
            // console.log("move");
            let offsetX = event.touches[0].clientX - posX;
            let offsetY = event.touches[0].clientY - posy;
            // console.log(this.left);
            let left = parseFloat(this.style.left || 0) + offsetX;
            let top = parseFloat(this.style.top || 0) + offsetY;

            let eles = document.elementsFromPoint(event.touches[0].clientX, event.touches[0].clientY);
            let diff = 0;
            for(let x of eles){
                if (x.classList.contains("box") && x !== dragObj_box){
                    let newY = getPosY(x);
                    if(newY + x.clientHeight / 2 <= event.touches[0].clientY && newY > originY){
                        diff = newY - originY;
                        originY = newY;

                        dragObj_box.parentNode.insertBefore(x, dragObj_box);

                        /* Change in data */
                        // let currentDate1 = x.parentNode.parentNode.parentNode.id;
                        // let currentDate2 = dragObj.parentNode.parentNode.parentNode.id;
                        // let index1 = findInParent(x.parentNode, x);
                        // let index2 = findInParent(dragObj.parentNode, dragObj);
                        // console.log(currentDate2, currentDate1, index2, index1);
                        //
                        // let msg = data[currentDate1][0][index1];
                        // let completed = data[currentDate2][1][index1];
                        //
                        // data[currentDate1][0].splice(index1, 1);
                        // data[currentDate1][1].splice(index1, 1);
                        //
                        // data[currentDate2][0].splice(index2, 0, msg);
                        // data[currentDate2][1].splice(index2, 0, completed);

                        break;
                    }
                    if(newY + x.clientHeight / 2 >= event.touches[0].clientY && newY < originY){
                        diff = newY - originY;
                        originY = newY;

                        dragObj_box.parentNode.insertBefore(dragObj_box, x);

                        // let currentDate2 = x.parentNode.parentNode.parentNode.id;
                        // let currentDate1 = dragObj.parentNode.parentNode.parentNode.id;
                        // let index2 = findInParent(x.parentNode, x);
                        // let index1 = findInParent(dragObj.parentNode, dragObj);
                        // console.log(currentDate2, currentDate1, index2, index1);
                        // let msg = data[currentDate1][0][index1];
                        // let completed = data[currentDate2][1][index1];
                        //
                        // data[currentDate1][0].splice(index1, 1);
                        // data[currentDate1][1].splice(index1, 1);
                        //
                        // data[currentDate2][0].splice(index2, 0, msg);
                        // data[currentDate2][1].splice(index2, 0, completed);
                        break;
                    }
                }
            }
            // flush();

            this.style.left = left + "px";
            this.style.top = top - diff + "px";

            posX = event.touches[0].clientX;
            posy = event.touches[0].clientY;
        }
    },
    end: function(event) {
        event.stopPropagation();
        console.log(event.type);
        drag_box = false;
        this.style.zIndex = "2";

        let eles = document.elementsFromPoint(posX, posy);
        let inside = true;
        // for (let x of eles){
        //     if (x.classList.contains("box")){
        //         inside = true;
        //     }
        // }
        if (inside){
            this.style.top = "0";
            this.style.left = "0";
        }else{
            // this.querySelector(".delete").click();
        }


        this.removeEventListener('touchend', TouchHandler_box.end, false);
        this.removeEventListener('touchmove', TouchHandler_box.move, false);
        this.removeEventListener("touchcancel", TouchHandler_box.end, false);
        dragObj_box = null;

    },
};