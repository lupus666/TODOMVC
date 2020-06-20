
window.addEventListener('load', load);

function load() {
    document.querySelector("input.input-todo").addEventListener("focus", onFocus);
    document.querySelector("input.input-todo").addEventListener("blur", onBlur);

}


/***** Control Input ******/

function onFocus() {
    // console.log(this);
    this.parentElement.querySelector("label.input-label").classList.add("input-label-focused")
}

function onBlur() {
    if (this.value !== ""){

    }else{
        this.parentElement.querySelector("label.input-label").classList.remove("input-label-focused")
    }

}

/***** Control Input ******/