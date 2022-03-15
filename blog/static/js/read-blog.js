const postButton = document.querySelector(".post");
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
        if (comment.author === data.user_requesting) {
            commentBlock.classList.add("user-comment")
        }
        let h6 = document.createElement("h6")
        h6.style.width = "100%"
        h6.style.textAlign = "end"
        h6.classList.add("text-muted")
        h6.innerText = `${comment.author} | ${comment.posted_on}`

        commentBlock.innerText = comment.content
        commentBlock.appendChild(h6)
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
