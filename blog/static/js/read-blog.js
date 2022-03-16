const postButton = document.querySelector(".post");
const signIn = document.querySelector(".user-authenticate")

const editComments = document.querySelectorAll(".edit-comment")
const removeComments = document.querySelectorAll(".remove-comment")

let currentModal = null;
let modal = null

// comment_id, comment_author, blog_id, blog_author

removeComments.forEach(comment => {
  comment.addEventListener("click", showConfirmationModal)
})

function showConfirmationModal(e) {
  if (currentModal !== null && modal !== null) {
    currentModal.remove();
  }
  const postlink = e.currentTarget.getAttribute("postlink")
  currentModal = document.createElement("div");
  currentModal.innerHTML = `<div class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirmation</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <h5 class="h5">Are you sure you want to delete this comment?</h5>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">Yes</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
        </div>
      </div>
    </div>
  </div>`;

  currentModal.querySelector(".btn-primary").addEventListener("click", (ev) => {
    removeCommentFunc(ev, postlink)
    modal.hide()
  })

  document.body.append(currentModal);

  modal = new bootstrap.Modal(currentModal.querySelector(".modal"));
  modal.show();
}

function removeCommentFunc(e, postlink) { 
  e.stopPropagation()
  const url = postlink
  let req = new XMLHttpRequest();
  req.open("POST", url, true);
  req.send()
  req.addEventListener("load", (ev) => {
    const res = JSON.parse(req.response);
    if (res.success) {
      redisplayAllComments();
      currentModal.remove()
    }
  });
}

editComments.forEach(comment => {
  comment.addEventListener("click", editCommentFunc)
}) 

function editCommentFunc(e) {
  e.stopPropagation()
  const comment = e.currentTarget
  const postLink = comment.getAttribute("postlink")
  let parent = comment.parentElement.parentElement.parentElement
  parent.classList.remove("comment-block", "user-comment")
  parent.classList.add("post-comment")
  const h6 = parent.querySelector("h6").cloneNode(true)
  parent.querySelector("h6").remove()
  
  let textEditor = document.createElement("p")
  const originalText = parent.innerText
  textEditor.classList.add("py-2")
  textEditor.style.height = "100%"
  textEditor.setAttribute("contenteditable", "true")
  textEditor.setAttribute("spellcheck", "false")
  textEditor.innerText = parent.innerText
  parent.innerText = ""

  parent.appendChild(textEditor)
  
  let editComment = document.createElement("button")
  editComment.classList.add("btn", "btn-secondary", "btn-sm")
  editComment.style.width = "60%"
  editComment.style.display= "flex"
  editComment.style.justifyContent = "center"
  editComment.style.alignItems = "center"
  editComment.style.padding = "10px"
  editComment.innerHTML= '<h6 class="h6" style="margin-bottom:0">Edit Comment</h6>'

  let cancel = document.createElement("a")
  cancel.innerText = "cancel"
  cancel.style.cursor = "pointer"
  cancel.style.textDecoration = "underline"
  cancel.classList.add("text-muted")

  let buttonContainer = document.createElement("div")
  buttonContainer.style.display = "flex"
  buttonContainer.style.justifyContent = "space-evenly"
  buttonContainer.style.alignItems = "center"
  buttonContainer.style.width = "20%"

  buttonContainer.appendChild(editComment)
  buttonContainer.appendChild(cancel)

  cancel.addEventListener("click", (evt) => {
    evt.stopPropagation()
    buttonContainer.remove()
    parent.innerText = originalText
    textEditor.remove()
    parent.classList.remove("post-comment")
    parent.classList.add("comment-block", "user-comment")
    parent.appendChild(h6)
    h6.querySelector(".edit-comment").addEventListener("click", editCommentFunc)
    h6.querySelector(".remove-comment").addEventListener("click", showConfirmationModal)
  })

  editComment.addEventListener("click", (ev) => {
    postEditComment(ev, postLink, textEditor.innerText)
  })

  parent.appendChild(buttonContainer)
}

function postEditComment(e, url, content) {
  e.stopPropagation()
  e.currentTarget.disabled = true
  let req = new XMLHttpRequest();
  req.open("POST", url, true);
  req.setRequestHeader("Content-type", "application/json");
  req.send(
    JSON.stringify({
      content: content,
    })
  );
  req.addEventListener("load", (ev) => {
    const res = JSON.parse(req.response);
    if (res.success) {
      redisplayAllComments();
    }
  });
} 

if (signIn) {
  signIn.addEventListener("click", () => {
    window.location.href = `/blog/authenticate${window.location.href.substring(window.location.href.indexOf("read") + 4)}`
  })
} 

if (postButton) {
  postButton.addEventListener("click", () => {
    const url =
      "/blog/comment/post" +
      window.location.href.substring(window.location.href.indexOf("read") + 4);
    const content = postButton.previousElementSibling.innerText;
    if (content.trim().length) {
      postButton.previousElementSibling.innerHTML = "";
      let req = new XMLHttpRequest();
      req.open("POST", url, true);
      req.setRequestHeader("Content-type", "application/json");
      req.send(
        JSON.stringify({
          content: content,
        })
      );
      req.addEventListener("load", (ev) => {
        const res = JSON.parse(req.response);
        if (res.success) {
          redisplayAllComments();
        }
      });
    }
  });
}

function redisplayAllComments() {
  const url =
    "/blog/comment/get" +
    window.location.href.substring(window.location.href.indexOf("read") + 4);
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
    cleanCommentSection()
    let commentSection = document.querySelector(".comment-section")
      for (let comment of data.comments) {
        let commentBlock = document.createElement("div")
        commentBlock.classList.add("comment-block")
        let h6 = document.createElement("h6")
        h6.style.width = "100%"
        h6.style.textAlign = "end"
        h6.classList.add("text-muted")
        h6.innerText = `${comment.author} | ${comment.posted_on}`

        commentBlock.innerText = comment.content
        commentBlock.appendChild(h6)
        
        if (comment.author === data.user_requesting) {
            commentBlock.classList.add("user-comment")
            let editSlashRemove = document.createElement("div")
            editSlashRemove.style.marginTop = "10px"
            editSlashRemove.innerHTML = `
            <a class="edit-comment" postlink="/blog/comment/edit/${comment.comment_id}/${comment.author}/${comment.part_of[0]}/${comment.part_of[1]}/">edit</a>
            <span>&nbsp;|&nbsp;</span>
            <a class="remove-comment" postlink="/blog/comment/remove/${comment.comment_id}/${comment.author}/${comment.part_of[0]}/${comment.part_of[1]}/">remove</a>
            `
            h6.appendChild(editSlashRemove)
            editSlashRemove.querySelector(".edit-comment").addEventListener("click", editCommentFunc)
            editSlashRemove.querySelector(".remove-comment").addEventListener("click", showConfirmationModal)
        }

        commentSection.insertBefore(commentBlock, commentSection.firstElementChild)
      }


      var element = commentSection.firstElementChild;
      var headerOffset = 250;
      var elementPosition = element.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
           top: offsetPosition,
           behavior: "smooth"
      });
    
    });
}

function cleanCommentSection() {
    const commentSection = document.querySelector(".comment-section").children
    for (let i=commentSection.length-2; i>=0; i--) {
        commentSection[i].remove()
    }
}
