const blog = document.querySelector(".blog");
let errors = [];

function cleanBlog() {
  errors = [];
  stageForSaving(blog);
  if (errors.length === 0) {
    const headerImage = blog.querySelector(".add-header-section");
    removeRootEditables(blog.children);
    removeEditingBorders(blog.querySelectorAll(".editing"));
    cleanContentHolders(blog.querySelectorAll(".content-holder"));
    blog.querySelectorAll(".add-content-section").forEach((node) => node.remove());
    headerImage.classList.remove("add-header-section")
    headerImage.firstElementChild.removeEventListener("click", showAddImageModal)
    return true
  }
  return false
}

function cleanContentHolders(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    for (let child of node.children) {
      const actualContent = child.firstElementChild;
      if (actualContent.nodeName === "P") {
        actualContent.removeAttribute("contenteditable");
        actualContent.removeAttribute("placeholder");
      }
      if (actualContent.nodeName === "IMG") {
        child.classList.remove("add-image-field");
        actualContent.classList.remove("image-added");
        child.removeEventListener("click", showAddImageModal);
        actualContent.style.cursor = "auto";
      }
    }
  }
}

function stageForSaving(blog) {
  const h1 = blog.querySelector(".display-1");
  if (h1.innerText.length === 0) {
    errors.push("Missing blog title");
  }
  const contentHolders = blog.querySelectorAll(".content-holder")
  if (contentHolders.length === 0) {
      errors.push("Missing blog content")
  } else {
    trimContent(contentHolders);
  }
  const headerImage = blog.querySelector(".add-header-section");
  if (headerImage.firstElementChild.nodeName !== "IMG") {
    errors.push("Missing blog header image");
  }
}
function trimContent(nodes) {
  const incompleteContent = [];
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let thisNodeComplete = true;
    for (let child of node.children) {
      const actualContent = child.firstElementChild;
      if (
        actualContent.nodeName === "P" &&
        actualContent.innerText.length === 0
      ) {
        thisNodeComplete = false;
      }
      if (
        actualContent.nodeName === "IMG" &&
        !actualContent.classList.contains("image-added")
      ) {
        thisNodeComplete = false;
      }
    }
    if (!thisNodeComplete) {
      incompleteContent.push(i);
    }
  }
  if (incompleteContent.length !== 0) {
    errors.push("Complete or Delete incomplete content sections");
  }
}

function removeRootEditables(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].removeAttribute("contenteditable");
    nodes[i].removeAttribute("placeholder");
  }
}

function removeEditingBorders(queryList) {
  queryList.forEach((node) => {
    node.classList.remove("editing");
  });
}
