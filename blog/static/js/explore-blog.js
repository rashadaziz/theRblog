addEventListener("load", main);

const allBlogs = [];
const loadMore = document.querySelector(".save-button")

function main() {
  displayBlogs(getBlogs());
    loadMore.style.display = "none"
  loadMore.addEventListener("click", () => {
      displayBlogs(getBlogs())
  })
}

async function getBlogs() {
  const loading = document.createElement("div");
  loading.classList.add("lds-facebook");
  loading.innerHTML = "<div></div><div></div><div></div>";
  document.querySelector(".container").appendChild(loading);

  const url = "/blog/get/all";
  let content = null;

  await fetch(url)
    .then((response) => {
        console.log(response)
      return response.json();
    })
    .then((data) => {
      loading.remove();
      loadMore.style.display = "inline-block"
      content = data;
    });

  return content;
}

function displayBlogs(data) {
  data.then((blogs) => {
    let row = document.querySelectorAll(".row");

    if (row.length !== 0) {
      row = row[row.length - 1];
    } else {
      row = document.createElement("div");
      row.classList.add(
        "row",
        "row-cols-lg-4",
        "row-cols-md-3",
        "row-cols-sm-2",
        "row-cols-1",
        "justify-content-center",
        "py-3"
      );
    }
    for (let i = blogs.blogs.length-1; i > -1; i--) {
      if (row.children.length % 4 === 0) {
        row = document.createElement("div");
        row.classList.add(
          "row",
          "row-cols-lg-4",
          "row-cols-md-3",
          "row-cols-sm-2",
          "row-cols-1",
          "justify-content-center",
          "py-3"
        );
      }
      let blog = blogs.blogs[i];
      if (
        !allBlogs.find((el) => blog.id === el.id && blog.author === el.author)
      ) {
        let card = document.createElement("a");
        card.classList.add("blog-card");

        let thumbnail = document.createElement("div");
        thumbnail.classList.add("thumbnail");
        thumbnail.style.backgroundImage = "url(" + blog.thumbnail + ")";
        card.appendChild(thumbnail);

        let title = document.createElement("h3");
        title.classList.add("h3", "title");
        title.innerText = blog.title;
        card.appendChild(title);

        let footer = document.createElement("h6");
        footer.classList.add("h6", "text-muted");
        footer.innerText = `${blog.author} | ${blog.published_on}`;
        card.appendChild(footer);

        row.appendChild(card);
        document.querySelector(".container").appendChild(row);

        allBlogs.push(blog);
      }
    }
  });
}
