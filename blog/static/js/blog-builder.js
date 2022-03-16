let imageSearchResults = {};
let imageSources = [];
let currentImagePage = 0;
let selectedImageId = null;
let headerImage = null;
let currentModal = null;
let modal = null;
const contentOptions = {
  1: `<div class="row row-cols-lg-2 row-cols-md-1 row-cols-1 row pd-5 m-3 justify-content-center content-holder">
        <div class="col editing">
            <p class="py-2" style="height: 100%;" contenteditable="true" spellcheck="false"  placeholder="Enter text here..."></p>
        </div>
        <div style="display:flex; align-items:center; justify-content:center;" class="col add-image-field editing">
            <img style="max-width: 100%; max-height: fit-content;" src="/static/images/placeholder-image.png" alt="">
            <h3 class="h4">Click to add image</h3>
        </div>
    </div>`,
  2: `
    <div class="row row-cols-lg-2 row-cols-md-1 row-cols-1 row pd-5 m-3 justify-content-center content-holder">
        <div style="display:flex; align-items:center; justify-content:center;" class="col add-image-field editing">
            <img style="max-width: 100%; max-height: fit-content;" src="/static/images/placeholder-image.png" alt="">
            <h3 class="h4">Click to add image</h3>
        </div>
        <div class="col editing">
            <p class="py-2" contenteditable="true" spellcheck="false" placeholder="Enter text here..."></p>
        </div> 
    </div>
    `,
  3: `
    <div class="row pd-5 m-3 justify-content-start content-holder">
        <div class="col editing">
            <p class="py-2" contenteditable="true" spellcheck="false" placeholder="Enter text here..."></p>
        </div>
    </div>
    `,
  4: `
    <div class="row row-cols-lg-2 row-cols-md-1 row-cols-1 row pd-5 m-3 justify-content-center content-holder">
        <div style="display:flex; align-items:center; justify-content:center;" class="col add-image-field editing">
            <img style="max-width: 100%; max-height: fit-content;" src="/static/images/placeholder-image.png" alt="">
            <h3 class="h4">Click to add image</h3>
        </div>
        <div style="display:flex; align-items:center; justify-content:center;" class="col add-image-field editing">
            <img style="max-width: 100%; max-height: fit-content;" src="/static/images/placeholder-image.png" alt="">
            <h3 class="h4">Click to add image</h3>
        </div>
    </div>
    `,
};

addEventListener("load", main);

function main() {
  initListeners();
}

function initListeners() {
  document.addEventListener("click", () => {
    document.querySelector(".context-menu").style.display = "none";
  });
  document.addEventListener("contextmenu", (e) => {
    document.querySelector(".context-menu").style.display = "none";
  });
  window.addEventListener("resize", (e) => {
    document.querySelector(".context-menu").style.display = "none";
    document.querySelectorAll(".text-editor").forEach(editor => {
      const textField = editor;
      showTextEditor(textField.previousElementSibling)
    })
  });
  document.querySelectorAll(".add-content").forEach((button) => {
    const buttonClass = button.parentElement.classList[0];
    const typeOfContent = buttonClass.substring(
      buttonClass.indexOf("-") + 1,
      buttonClass.lastIndexOf("-")
    );
    if (typeOfContent === "header") {
      button.addEventListener("click", showAddImageModal);
    } else {
      button.addEventListener("click", showAddContentModal);
    }
  });
}

function showAddImageModal(e) {
  const parentContainer = e.target.parentElement;
  if (currentModal !== null && modal !== null) {
    currentModal.remove();
  }
  currentModal = document.createElement("div");
  currentModal.innerHTML = `
    <div class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Choose Image to Add</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ${listImageOptions()}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">Add Image</button>
        </div>
      </div>
    </div>
  </div>
    `;
  bindAddImageButton(parentContainer, currentModal);
  document.body.append(currentModal);

  const imageFrames = currentModal.querySelectorAll(".image-viewer .col");
  imageFrames.forEach((frame) => {
    frame.innerHTML = "";
  });
  displayImages(imageFrames);
  bindImages(imageFrames);

  modal = new bootstrap.Modal(currentModal.querySelector(".modal"));
  modal.show();

  currentModal
    .querySelector(".modal-footer button")
    .addEventListener("click", (el) => {
      el.stopPropagation();
      if (selectedImageId) {
        if (parentContainer.classList.contains("add-header-section")) {
          const image = new Image();
          image.style.objectFit = "fill";
          image.style.width = "100%";
          image.style.transform = "translate(0, -25%)";
          image.src = imageSources[parseInt(selectedImageId)][0];
          image.addEventListener("click", showAddImageModal);
          headerImage = imageSources[parseInt(selectedImageId)][2];
          e.target.replaceWith(image);
        } else {
          e.target.setAttribute(
            "src",
            imageSources[parseInt(selectedImageId)][0]
          );
          e.target.classList.add("image-added");
          if (e.target.nextElementSibling) {
            e.target.nextElementSibling.remove();
          }
        }
        modal.hide();
        currentModal.remove();
      }
    });
}

function showAddContentModal(e) {
  const parentContainer = e.target.parentElement;
  if (currentModal !== null && modal !== null) {
    currentModal.remove();
  }
  currentModal = document.createElement("div");
  currentModal.innerHTML = `<div class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Choose Content Type to Add</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ${listContentOptions()}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">Add Content</button>
        </div>
      </div>
    </div>
  </div>`;

  bindAddContentButton(parentContainer, currentModal);
  document.body.append(currentModal);

  modal = new bootstrap.Modal(currentModal.querySelector(".modal"));
  modal.show();
}

function listImageOptions() {
  return `
    <div class="input-group mb-3">
        <span class="input-group-text" id="basic-addon1">Press enter to query</span>
        <input type="text" class="form-control" placeholder="Search images to display" aria-label="Username" aria-describedby="basic-addon1">
    </div>
    <div class="image-viewer row">
        <div class="col"></div>
        <div class="col"></div>
        <div class="col"></div>
    </div>
    <div class="image-viewer row">
        <div class="col"></div>
        <div class="col"></div>
        <div class="col"></div>
    </div>
    <div class="image-viewer row">
        <div class="col"></div>
        <div class="col"></div>
        <div class="col"></div>
    </div>
    <div class="row justify-content-end paginator">
        <div class="btn-group" role="group" aria-label="">
            <div class="col">
                <button type="button" class="btn btn-secondary back"><</button>
                <button type="button" class="btn btn-secondary next">></button>
            </div>  
        </div>
    </div>
    `;
}
function bindAddImageButton(parent, currentModal) {
  const imageFrames = currentModal.querySelectorAll(".image-viewer .col");
  imageFrames.forEach((frame) => {
    frame.style.display = "none";
  });
  currentModal.querySelector(".paginator").style.display = "none";

  const searchEngine = currentModal.querySelector(".input-group input");
  searchEngine.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loadImages(searchEngine.value, imageFrames);
      imageSearchResults = {};
      currentImagePage = 0;
      imageSources = [];
      selectedImageId = null;
    }
  });

  const paginators = currentModal.querySelectorAll(".paginator button");
  paginators.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      let button = el;

      if (button.classList.contains("back")) {
        if (currentImagePage > 0) {
          currentImagePage--;
        }
      } else if (button.classList.contains("next")) {
        if (
          currentImagePage * 9 < imageSources.length &&
          (currentImagePage + 1) * 9 < imageSources.length
        ) {
          currentImagePage++;
        }
      }
      displayImages(imageFrames);
    });
  });
}
function displayImages(imageFrames) {
  if (imageSources.length) {
    imageFrames.forEach((frame) => {
      frame.innerHTML = "";
      frame.style.display = "block";
      frame.style.backgroundImage = "";
      frame.id = "";
      frame.style.cursor = "";
      let currSelected = document.querySelector(".selected-image");
      if (currSelected) {
        currSelected.classList.remove("selected-image");
      }
    });
    currentModal.querySelector(".paginator").style.display = "block";

    let startIndex = currentImagePage * 9;
    let endIndex = startIndex + 9;

    for (let i = startIndex; i < endIndex; i++) {
      let src = imageSources[i];
      if (!src) {
        break;
      }
      let image = src[1];
      const frame = imageFrames[i % 9];
      frame.style.backgroundImage = "url(" + image + ")";
      frame.id = i;
      frame.style.cursor = "pointer";
      if (frame.id === selectedImageId) {
        frame.classList.add("selected-image");
      }
    }
  }
}
function extractImageSource(images) {
  for (let result of images.results) {
    imageSources.push([
      result.urls.regular,
      result.urls.thumb,
      result.urls.small,
    ]);
  }
}
function bindImages(frames) {
  // add event listener for all images so user can select
  frames.forEach((frame) => {
    frame.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.style.backgroundImage !== "") {
        let currSelected = document.querySelector(".selected-image");
        if (currSelected) {
          currSelected.classList.remove("selected-image");
        }
        selectedImageId = e.target.id;
        e.target.classList.add("selected-image");
      }
    });
  });
}
function loadImages(query, imageFrames) {
  url = `/blog/searchimage/${query}/`;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        clearImageFrames(imageFrames);
        return response.json();
      } else {
        clearImageFrames(imageFrames);
        imageFrames[4].style.display = "block";
        imageFrames[4].innerHTML = `
        <div class="alert alert-danger" role="alert">
        there was an error in your request
        </div>`;
      }
    })
    .then((data) => {
      imageSearchResults = data;

      if (Object.keys(imageSearchResults).length > 0) {
        extractImageSource(imageSearchResults);
        displayImages(imageFrames);
        bindImages(imageFrames);
      } else {
        clearImageFrames(imageFrames);
        imageFrames[4].style.display = "block";
        imageFrames[4].innerHTML = `
        <div class="alert alert-info" role="alert">
        sorry, no results matched your query
        </div>`;
      }
    })
    .catch(() => {
      imageSearchResults = {};
    });
}

function clearImageFrames(frames) {
  frames.forEach((frame) => {
    frame.innerHTML = "";
    frame.style.display = "none";
  });
}

function listContentOptions() {
  return `
    <div class="row row-cols-2 justify-content-center">
        <div class="col">
        <div class="form-check">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" value=1 checked>
            <label class="form-check-label" for="flexRadioDefault1">
                Text + Image
                <div>
                    <img></img>
                </div>
            </label>
        </div>
        </div>
        <div class="col">
        <div class="form-check">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" value=2>
            <label class="form-check-label" for="flexRadioDefault2">
                Image + Text
                <div>
                    <img></img>
                </div>
            </label>
        </div>
        </div>
        <div class="col">
        <div class="form-check">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3" value=3>
            <label class="form-check-label" for="flexRadioDefault3">
                All Text
                <div>
                    <img></img>
                </div>
            </label>
        </div>
        </div>
        <div class="col">
        <div class="form-check">
            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault4" value=4>
            <label class="form-check-label" for="flexRadioDefault4">
                Dual Image
                <div>
                    <img></img>
                </div>
            </label>
        </div>
        </div>
    </div>
    `;
}
function bindAddContentButton(parent, currentModal) {
  const addContentButton = currentModal.querySelector(".modal-footer > button");
  const options = currentModal.querySelectorAll(
    ".modal-body .form-check input"
  );
  addContentButton.addEventListener("click", (e) => {
    e.stopPropagation();
    for (let option of options) {
      if (option.checked) {
        // parse from content options to display content template
        const newDocument = new DOMParser().parseFromString(
          contentOptions[option.value],
          "text/html"
        );
        const newElement = newDocument.body.firstElementChild;
        const imageFields = newElement.querySelectorAll(".add-image-field");
        const textField = newElement.querySelector("p");
        newElement.addEventListener("contextmenu", showDeleteContextMenu);
        parent.replaceWith(newDocument.body.firstChild);
        modal.hide();
        currentModal.remove();
        addNewContentButton();
        if (imageFields) {
          imageFields.forEach((field) => {
            field.addEventListener("click", showAddImageModal);
          });
        }
      }
    }
  });
}

function addNewContentButton() {
  const section = document.createElement("div");
  const addContentButton = document.createElement("button");
  addContentButton.innerText = "+ click to add content";

  section.classList.add("add-content-section");
  addContentButton.classList.add("add-content");

  addContentButton.addEventListener("click", showAddContentModal);
  section.appendChild(addContentButton);

  document.querySelector(".blog").appendChild(section);
}

document.querySelector(".save-button").addEventListener("click", (e) => {
  e.currentTarget.style.display = "none"
  if (cleanBlog()) {
    const url = "/blog/save/";
    const blogContent = document.querySelector(".blog").innerHTML;
    const title = document.querySelector(".blog .display-1").innerText;
    const thumbnail = headerImage;
    let req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(
      JSON.stringify({
        content: blogContent,
        title: title,
        thumbnail: thumbnail,
      })
    );
    req.addEventListener("load", (ev) => {
      const res = JSON.parse(req.response);
      if (res.success) {
        window.location.replace("/blog/explore/");
      }
    });
  } else {
    e.currentTarget.style.display = "block"
    showErrorModal();
  }
});

function showErrorModal() {
  if (currentModal !== null && modal !== null) {
    currentModal.remove();
  }
  currentModal = document.createElement("div");
  currentModal.innerHTML = `<div class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Error Posting</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${listErrors()}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary">Return</button>
          </div>
        </div>
      </div>
    </div>`;

  currentModal
    .querySelector(".modal-footer button")
    .addEventListener("click", () => {
      modal.hide();
      currentModal.remove();
    });

  document.body.append(currentModal);

  modal = new bootstrap.Modal(currentModal.querySelector(".modal"));
  modal.show();
}

function listErrors() {
  let DOMString = "";
  for (let error of errors) {
    DOMString += `
    <div class="alert alert-danger" role="alert">
      ${error}
    </div>
    `;
  }
  return DOMString;
}

function showDeleteContextMenu(e) {
  {
    e.preventDefault();
    e.stopPropagation();
    const parent = e.currentTarget;
    const contextMenu = document.querySelector(".context-menu");
    contextMenu.style.display = "block";
    contextMenu.style.top = `${
      e.clientY +
      (document.documentElement.scrollTop
        ? document.documentElement.scrollTop
        : document.body.scrollTop)
    }px`;
    contextMenu.style.left = `${
      e.clientX +
      (document.documentElement.scrollLeft
        ? document.documentElement.scrollLeft
        : document.body.scrollLeft)
    }px`;
    document.querySelector(".context-menu").addEventListener("click", () => {
      parent.remove();
    });
  }
}
